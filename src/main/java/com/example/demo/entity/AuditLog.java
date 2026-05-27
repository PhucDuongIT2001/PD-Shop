package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Immutable audit record. Never update or delete audit logs — append-only.
 *
 * Indexed columns are chosen for the most common dashboard queries:
 *   - filter by admin  → admin_id
 *   - filter by action → action
 *   - filter by date   → created_at
 *   - filter by entity → entity_type + entity_id
 */
@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_admin_id",    columnList = "admin_id"),
    @Index(name = "idx_audit_action",      columnList = "action"),
    @Index(name = "idx_audit_created_at",  columnList = "created_at"),
    @Index(name = "idx_audit_entity",      columnList = "entity_type, entity_id")
})
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who performed the action. Nullable to support system-generated events.
     * Stored as user_id (no FK constraint intentionally — audit logs must survive
     * user deletion. We keep the reference but don't cascade.)
     */
    @Column(name = "admin_id")
    private Long adminId;

    @Column(name = "admin_username", length = 100)
    private String adminUsername;

    /**
     * The action label — maps to {@link com.example.demo.audit.annotation.AuditAction#action()}.
     * Example: "UPDATE_PRODUCT_PRICE", "DELETE_ORDER", "APPROVE_VOUCHER"
     */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /** The type of entity affected. Example: "Product", "Order", "User" */
    @Column(name = "entity_type", length = 100)
    private String entityType;

    /** The primary key of the affected entity. */
    @Column(name = "entity_id")
    private Long entityId;

    /**
     * Serialized JSON of the old state (before the operation).
     * TEXT allows storing large payloads without truncation.
     */
    @Column(name = "old_value", columnDefinition = "TEXT")
    private String oldValue;

    /** Serialized JSON of the new state (after the operation). */
    @Column(name = "new_value", columnDefinition = "TEXT")
    private String newValue;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 512)
    private String userAgent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public AuditLog() {}

    // ── Builder-style static factory ─────────────────────────────────────────

    public static AuditLog of(Long adminId, String adminUsername, String action,
                               String entityType, Long entityId,
                               String oldValue, String newValue,
                               String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.adminId = adminId;
        log.adminUsername = adminUsername;
        log.action = action;
        log.entityType = entityType;
        log.entityId = entityId;
        log.oldValue = oldValue;
        log.newValue = newValue;
        log.ipAddress = ipAddress;
        log.userAgent = userAgent;
        return log;
    }

    // ── Getters (no setters — treat as immutable after construction) ─────────

    public Long getId() { return id; }
    public Long getAdminId() { return adminId; }
    public String getAdminUsername() { return adminUsername; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters needed by JPA proxy / Jackson
    public void setId(Long id) { this.id = id; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }
    public void setAdminUsername(String adminUsername) { this.adminUsername = adminUsername; }
    public void setAction(String action) { this.action = action; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public void setOldValue(String oldValue) { this.oldValue = oldValue; }
    public void setNewValue(String newValue) { this.newValue = newValue; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public void setUserAgent(String userAgent) { this.userAgent = userAgent; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
