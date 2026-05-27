package com.example.demo.audit;

import com.example.demo.entity.AuditLog;
import com.example.demo.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Service responsible for persisting audit log entries.
 *
 * Key design decisions:
 *
 * 1. REQUIRES_NEW propagation — audit logs must be saved even if the
 *    calling transaction rolls back. Example: a failed product update
 *    should still be logged as an attempted action.
 *
 * 2. @Async — audit logging is fire-and-forget. It must never slow down
 *    the main request thread. Uses Spring's task executor thread pool.
 *    NOTE: @Async + REQUIRES_NEW means the log runs in a separate thread
 *    AND a separate transaction — fully decoupled from the business operation.
 *
 * 3. No delete method — audit logs are immutable by design.
 *    If you need to purge old logs, do it via a scheduled DB job with
 *    proper archival, not via application code.
 */
@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Persists an audit log entry asynchronously in a new transaction.
     * Called by {@link com.example.demo.audit.aspect.AuditAspect}.
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(Long adminId, String adminUsername, String action,
                    String entityType, Long entityId,
                    String oldValue, String newValue,
                    String ipAddress, String userAgent) {

        AuditLog entry = AuditLog.of(
            adminId, adminUsername, action,
            entityType, entityId,
            oldValue, newValue,
            ipAddress, userAgent
        );
        auditLogRepository.save(entry);
    }

    /**
     * Dashboard query — supports all filter combinations.
     * Read-only transaction for performance (no dirty checking overhead).
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> search(Long adminId, String action, String entityType,
                                  LocalDateTime from, LocalDateTime to,
                                  Pageable pageable) {
        return auditLogRepository.search(adminId, action, entityType, from, to, pageable);
    }
}
