package com.example.demo.audit.aspect;

import com.example.demo.audit.AuditLogService;
import com.example.demo.audit.annotation.AuditAction;
import com.example.demo.security.details.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * AOP Aspect that intercepts all methods annotated with {@link AuditAction}
 * and persists an audit record via {@link AuditLogService}.
 *
 * Why AOP over manual logging:
 * - Business logic stays clean — no audit code mixed in with domain logic
 * - Single point of control for all auditable operations
 * - Adding audit to a new method requires ONE annotation, not service injection
 *
 * Thread safety: This aspect is a Spring singleton. All state is read from
 * Spring's SecurityContextHolder (ThreadLocal) and the HTTP request,
 * both of which are thread-local — so it is inherently thread-safe.
 *
 * Failure isolation: If audit logging fails, the exception is caught and
 * logged but NOT re-thrown — the business operation succeeds regardless.
 * Audit failure must never break the user-facing request.
 */
@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    public AuditAspect(AuditLogService auditLogService, ObjectMapper objectMapper) {
        this.auditLogService = auditLogService;
        this.objectMapper = objectMapper;
    }

    /**
     * Around advice — wraps any method annotated with @AuditAction.
     * Captures the return value (new state) and the first argument (entity ID or entity).
     */
    @Around("@annotation(auditAction)")
    public Object auditMethod(ProceedingJoinPoint pjp, AuditAction auditAction) throws Throwable {
        // Resolve the authenticated user BEFORE the method executes
        Long adminId = null;
        String adminUsername = "SYSTEM";

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof CustomUserDetails userDetails) {
            adminId = userDetails.getId();
            adminUsername = userDetails.getUsername();
        }

        // Resolve HTTP request metadata
        String ipAddress = resolveClientIp();
        String userAgent = resolveUserAgent();

        // Capture old state from first argument if available (typically the entity ID)
        String oldValue = null;
        Object[] args = pjp.getArgs();
        if (args != null && args.length > 0 && args[0] != null) {
            oldValue = safeSerialize(args[0]);
        }

        // Execute the actual business method
        Object result = pjp.proceed();

        // Capture new state from the return value
        String newValue = safeSerialize(result);

        // Resolve entityId: if first arg is a Long, treat it as the entity ID
        Long entityId = null;
        if (args != null && args.length > 0 && args[0] instanceof Long id) {
            entityId = id;
        }

        // Fire-and-forget audit log (async + REQUIRES_NEW transaction)
        try {
            auditLogService.log(
                adminId, adminUsername,
                auditAction.action(),
                auditAction.entityType(),
                entityId,
                oldValue, newValue,
                ipAddress, userAgent
            );
        } catch (Exception e) {
            // NEVER let audit failure break the business operation
            log.error("Audit log failed for action={} user={}: {}",
                auditAction.action(), adminUsername, e.getMessage());
        }

        return result;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private String resolveClientIp() {
        try {
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "N/A";
            HttpServletRequest request = attrs.getRequest();
            String xff = request.getHeader("X-Forwarded-For");
            if (xff != null && !xff.isBlank()) {
                return xff.split(",")[0].trim(); // First IP in the chain
            }
            return request.getRemoteAddr();
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String resolveUserAgent() {
        try {
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs == null) return "N/A";
            String ua = attrs.getRequest().getHeader("User-Agent");
            if (ua != null && ua.length() > 512) {
                return ua.substring(0, 512); // Truncate to match DB column length
            }
            return ua != null ? ua : "N/A";
        } catch (Exception e) {
            return "N/A";
        }
    }

    private String safeSerialize(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
