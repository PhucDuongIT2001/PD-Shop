package com.example.demo.controller.admin;

import com.example.demo.audit.AuditLogService;
import com.example.demo.dto.audit.AuditLogResponse;
import com.example.demo.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * REST API for the Audit Log dashboard.
 *
 * Access control:
 *   - Only users with AUDIT_LOG_VIEW permission (i.e., ADMIN role) can access.
 *   - No write/delete endpoints — audit logs are append-only.
 *
 * Endpoint: GET /api/admin/audit-logs
 * Supports: pagination, filter by adminId, action, entityType, date range.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasAuthority('AUDIT_LOG_VIEW')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    /**
     * Search audit logs with optional filters.
     *
     * @param adminId    filter by the admin who performed the action
     * @param action     filter by action type (e.g., "UPDATE_PRODUCT_PRICE")
     * @param entityType filter by entity type (e.g., "Product", "Order")
     * @param from       start date (inclusive), format: yyyy-MM-dd
     * @param to         end date (inclusive), format: yyyy-MM-dd
     * @param page       zero-based page index (default: 0)
     * @param size       page size (default: 20, max: 100)
     */
    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> search(
            @RequestParam(required = false) Long adminId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Cap page size to prevent abuse
        int safeSize = Math.min(size, 100);

        Pageable pageable = PageRequest.of(page, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        LocalDateTime fromDt = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDt   = to   != null ? to.atTime(23, 59, 59) : null;

        Page<AuditLog> logs = auditLogService.search(adminId, action, entityType, fromDt, toDt, pageable);

        return ResponseEntity.ok(logs.map(this::toResponse));
    }

    /**
     * Get a single audit log entry by ID.
     * Useful for viewing full old/new JSON payloads in the dashboard.
     */
    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getById(@PathVariable Long id) {
        return auditLogService.search(null, null, null, null, null,
                PageRequest.of(0, 1))
            .stream()
            .filter(l -> l.getId().equals(id))
            .findFirst()
            .map(l -> ResponseEntity.ok(toResponse(l)))
            .orElse(ResponseEntity.notFound().build());
    }

    // ── Mapper (inline — no MapStruct needed for a simple flat DTO) ──────────

    private AuditLogResponse toResponse(AuditLog log) {
        AuditLogResponse dto = new AuditLogResponse();
        dto.setId(log.getId());
        dto.setAdminId(log.getAdminId());
        dto.setAdminUsername(log.getAdminUsername());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setIpAddress(log.getIpAddress());
        dto.setUserAgent(log.getUserAgent());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
