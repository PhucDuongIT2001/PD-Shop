-- ============================================================
-- V2__seed_test_users.sql
-- Seed test data for STAFF and CUSTOMER roles for automation testing
-- ============================================================

-- 1. Insert STAFF user (password: admin123)
INSERT IGNORE INTO users (username, email, password, enabled, created_at)
VALUES ('staff', 'staff@pdshop.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Oxyz',
        1, NOW());

-- 2. Insert CUSTOMER user (password: admin123)
INSERT IGNORE INTO users (username, email, password, enabled, created_at)
VALUES ('customer', 'customer@pdshop.com',
        '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Oxyz',
        1, NOW());

-- 3. Assign STAFF role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'staff' AND r.name = 'STAFF';

-- 4. Assign CUSTOMER role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'customer' AND r.name = 'USER';

-- 5. Update phuduong password
UPDATE users SET password = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Oxyz' WHERE username = 'phuduong';
