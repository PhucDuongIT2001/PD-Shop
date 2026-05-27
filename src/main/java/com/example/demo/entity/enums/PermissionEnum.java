package com.example.demo.entity.enums;

/**
 * Centralized permission constants for RBAC.
 * Using enum ensures compile-time safety and prevents typos in @PreAuthorize annotations.
 *
 * Naming convention: DOMAIN_ACTION
 * - DOMAIN: the resource being protected (PRODUCT, ORDER, USER, etc.)
 * - ACTION: the operation (VIEW, CREATE, UPDATE, DELETE, APPROVE, MANAGE)
 */
public enum PermissionEnum {

    // ── Product permissions ──────────────────────────────────────────────────
    PRODUCT_VIEW,
    PRODUCT_CREATE,
    PRODUCT_UPDATE,
    PRODUCT_DELETE,

    // ── Order permissions ────────────────────────────────────────────────────
    ORDER_VIEW,
    ORDER_UPDATE,
    ORDER_DELETE,

    // ── Inventory permissions ────────────────────────────────────────────────
    INVENTORY_VIEW,
    INVENTORY_UPDATE,

    // ── Revenue / Analytics permissions ─────────────────────────────────────
    REVENUE_VIEW,
    REPORT_VIEW,

    // ── Voucher / Promotion permissions ─────────────────────────────────────
    VOUCHER_VIEW,
    VOUCHER_CREATE,
    VOUCHER_APPROVE,
    PROMOTION_MANAGE,

    // ── User / Account management ────────────────────────────────────────────
    USER_VIEW,
    USER_MANAGE,

    // ── Role / Permission management (ADMIN only) ────────────────────────────
    ROLE_MANAGE,

    // ── Audit log access ─────────────────────────────────────────────────────
    AUDIT_LOG_VIEW,

    // ── System configuration (ADMIN only) ───────────────────────────────────
    SYSTEM_CONFIG;

    /** Convenience method — returns the string used as a Spring Security authority. */
    public String authority() {
        return this.name();
    }
}
