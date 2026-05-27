package com.example.demo.repository;

import com.example.demo.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository for audit logs.
 *
 * All queries are read-only from the dashboard perspective.
 * No delete methods are exposed — audit logs are append-only by design.
 *
 * The JPQL query uses a single @Query to avoid N+1 and supports
 * optional filter parameters via COALESCE / IS NULL pattern.
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Flexible search supporting all dashboard filter combinations.
     * Any null parameter is treated as "no filter" (matches all).
     *
     * Performance note: created_at and admin_id are indexed.
     * For very high-volume systems (>10M rows), consider partitioning
     * the audit_logs table by month.
     */
    @Query("""
        SELECT a FROM AuditLog a
        WHERE (:adminId    IS NULL OR a.adminId    = :adminId)
          AND (:action     IS NULL OR a.action     = :action)
          AND (:entityType IS NULL OR a.entityType = :entityType)
          AND (:from       IS NULL OR a.createdAt >= :from)
          AND (:to         IS NULL OR a.createdAt <= :to)
        ORDER BY a.createdAt DESC
        """)
    Page<AuditLog> search(
        @Param("adminId")    Long adminId,
        @Param("action")     String action,
        @Param("entityType") String entityType,
        @Param("from")       LocalDateTime from,
        @Param("to")         LocalDateTime to,
        Pageable pageable
    );
}
