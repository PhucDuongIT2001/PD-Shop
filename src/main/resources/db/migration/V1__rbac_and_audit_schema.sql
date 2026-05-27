-- ============================================================
-- V1__rbac_and_audit_schema.sql
-- RBAC + Audit Log Schema Migration
-- Compatible with: MySQL 8.0+
-- ============================================================
--
-- DESIGN DECISIONS:
--
-- 1. No FK from audit_logs.admin_id to users.id intentionally.
--    Audit records must survive user deletion. We store admin_username
--    as a denormalized string for readability without JOIN.
--
-- 2. role_permissions and user_roles use composite PKs (no surrogate key)
--    because the join tables have no additional columns. Clean and efficient.
--
-- 3. Indexes on audit_logs are tuned for the most common dashboard queries:
--    - Filter by admin, action, date range
--    - Composite (entity_type, entity_id) for entity history lookup
--
-- 4. TEXT for old_value / new_value — avoids silent truncation of large JSON
--    payloads. MySQL TEXT stores up to 65KB which is sufficient.
--
-- 5. permissions.name is VARCHAR(100) with UNIQUE constraint — the application
--    maps this 1:1 to PermissionEnum values.
-- ============================================================

-- ── 1. Permissions table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS permissions (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT pk_permissions    PRIMARY KEY (id),
    CONSTRAINT uq_permissions_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Roles table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS roles (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    CONSTRAINT pk_roles    PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Role ↔ Permission join table ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    CONSTRAINT pk_role_permissions PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role       FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. Users table (add description column if upgrading from basic schema) ───

CREATE TABLE IF NOT EXISTS users (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    username    VARCHAR(100) NOT NULL,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    provider    VARCHAR(50),
    provider_id VARCHAR(255),
    enabled     TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME,
    CONSTRAINT pk_users       PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 5. User ↔ Role join table ────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    CONSTRAINT pk_user_roles PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. Audit Logs table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS audit_logs (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    admin_id       BIGINT,
    admin_username VARCHAR(100),
    action         VARCHAR(100) NOT NULL,
    entity_type    VARCHAR(100),
    entity_id      BIGINT,
    old_value      TEXT,
    new_value      TEXT,
    ip_address     VARCHAR(50),
    user_agent     VARCHAR(512),
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_audit_logs PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance indexes for dashboard queries
CREATE INDEX idx_audit_admin_id   ON audit_logs (admin_id);
CREATE INDEX idx_audit_action     ON audit_logs (action);
CREATE INDEX idx_audit_created_at ON audit_logs (created_at);
CREATE INDEX idx_audit_entity     ON audit_logs (entity_type, entity_id);

-- ============================================================
-- V2__rbac_seed_data.sql
-- Default roles and permissions seed data
-- Run this AFTER V1 schema migration.
-- ============================================================

-- ── Permissions ──────────────────────────────────────────────────────────────

INSERT IGNORE INTO permissions (name, description) VALUES
('PRODUCT_VIEW',     'View products in admin panel'),
('PRODUCT_CREATE',   'Create new products'),
('PRODUCT_UPDATE',   'Update existing products'),
('PRODUCT_DELETE',   'Delete products permanently'),
('ORDER_VIEW',       'View all orders'),
('ORDER_UPDATE',     'Update order status'),
('ORDER_DELETE',     'Delete orders'),
('INVENTORY_VIEW',   'View inventory levels'),
('INVENTORY_UPDATE', 'Update stock / receive goods'),
('REVENUE_VIEW',     'View revenue figures'),
('REPORT_VIEW',      'View analytics reports'),
('VOUCHER_VIEW',     'View vouchers'),
('VOUCHER_CREATE',   'Create vouchers'),
('VOUCHER_APPROVE',  'Approve / reject vouchers'),
('PROMOTION_MANAGE', 'Manage promotions'),
('USER_VIEW',        'View user accounts'),
('USER_MANAGE',      'Create / update / disable users'),
('ROLE_MANAGE',      'Assign roles to users'),
('AUDIT_LOG_VIEW',   'View audit logs'),
('SYSTEM_CONFIG',    'Modify system configuration');

-- ── Roles ────────────────────────────────────────────────────────────────────

INSERT IGNORE INTO roles (name, description) VALUES
('USER',    'Regular customer — no admin permissions'),
('STAFF',   'Warehouse / operations staff'),
('MANAGER', 'Store manager'),
('ADMIN',   'System administrator — full access');

-- ── Role → Permission assignments ────────────────────────────────────────────
-- Using subqueries to avoid hardcoded IDs (safe for any auto_increment state)

-- STAFF permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'STAFF'
  AND p.name IN ('PRODUCT_VIEW','PRODUCT_UPDATE','ORDER_VIEW','ORDER_UPDATE',
                 'INVENTORY_VIEW','INVENTORY_UPDATE');

-- MANAGER permissions (superset of STAFF)
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'MANAGER'
  AND p.name IN ('PRODUCT_VIEW','PRODUCT_CREATE','PRODUCT_UPDATE',
                 'ORDER_VIEW','ORDER_UPDATE',
                 'INVENTORY_VIEW','INVENTORY_UPDATE',
                 'REVENUE_VIEW','REPORT_VIEW',
                 'VOUCHER_VIEW','VOUCHER_CREATE','VOUCHER_APPROVE',
                 'PROMOTION_MANAGE','USER_VIEW');

-- ADMIN gets ALL permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN';

-- ── Default admin user (password: admin123 — BCrypt encoded) ─────────────────
-- IMPORTANT: Change this password immediately in production!

INSERT IGNORE INTO users (username, email, password, enabled, created_at)
VALUES ('admin', 'admin@pdshop.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Oxyz',
        1, NOW());

INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';
