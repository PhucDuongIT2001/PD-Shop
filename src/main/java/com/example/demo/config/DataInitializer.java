package com.example.demo.config;

import com.example.demo.entity.Category;
import com.example.demo.entity.Permission;
import com.example.demo.entity.Product;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.PermissionEnum;
import com.example.demo.entity.enums.ProductStatus;
import com.example.demo.repository.CategoryRepository;
import com.example.demo.repository.PermissionRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.RoleRepository;
import com.example.demo.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import java.util.Set;

/**
 * Seeds the database with default roles, permissions, and demo users.
 *
 * Permission matrix:
 * ┌─────────────────────┬──────┬───────┬─────────┬───────┐
 * │ Permission          │ USER │ STAFF │ MANAGER │ ADMIN │
 * ├─────────────────────┼──────┼───────┼─────────┼───────┤
 * │ PRODUCT_VIEW        │      │  ✓    │    ✓    │   ✓   │
 * │ PRODUCT_CREATE      │      │       │    ✓    │   ✓   │
 * │ PRODUCT_UPDATE      │      │  ✓    │    ✓    │   ✓   │
 * │ PRODUCT_DELETE      │      │       │         │   ✓   │
 * │ ORDER_VIEW          │      │  ✓    │    ✓    │   ✓   │
 * │ ORDER_UPDATE        │      │  ✓    │    ✓    │   ✓   │
 * │ ORDER_DELETE        │      │       │         │   ✓   │
 * │ INVENTORY_VIEW      │      │  ✓    │    ✓    │   ✓   │
 * │ INVENTORY_UPDATE    │      │  ✓    │    ✓    │   ✓   │
 * │ REVENUE_VIEW        │      │       │    ✓    │   ✓   │
 * │ REPORT_VIEW         │      │       │    ✓    │   ✓   │
 * │ VOUCHER_VIEW        │      │       │    ✓    │   ✓   │
 * │ VOUCHER_CREATE      │      │       │    ✓    │   ✓   │
 * │ VOUCHER_APPROVE     │      │       │    ✓    │   ✓   │
 * │ PROMOTION_MANAGE    │      │       │    ✓    │   ✓   │
 * │ USER_VIEW           │      │       │    ✓    │   ✓   │
 * │ USER_MANAGE         │      │       │         │   ✓   │
 * │ ROLE_MANAGE         │      │       │         │   ✓   │
 * │ AUDIT_LOG_VIEW      │      │       │         │   ✓   │
 * │ SYSTEM_CONFIG       │      │       │         │   ✓   │
 * └─────────────────────┴──────┴───────┴─────────┴───────┘
 *
 * Only runs in 'dev' profile to prevent accidental seeding in production.
 * In production, use Flyway migrations (V2__seed_rbac.sql) instead.
 */
@Component
@Profile("dev")
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired private RoleRepository roleRepository;
    @Autowired private PermissionRepository permissionRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(String... args) {
        // Ensure chat_messages.message_text is TEXT (since Hibernate auto-ddl update creates String as VARCHAR(255))
        try {
            logger.info("  Checking and altering chat_messages.message_text to TEXT...");
            jdbcTemplate.execute("ALTER TABLE chat_messages MODIFY COLUMN message_text TEXT NOT NULL;");
            logger.info("  Successfully altered chat_messages.message_text to TEXT.");
        } catch (Exception e) {
            logger.warn("  Could not alter chat_messages.message_text: {} (It might already be TEXT)", e.getMessage());
        }

        logger.info("=== Starting RBAC data initialization ===");

        // Step 1: Seed all permissions
        Map<PermissionEnum, Permission> perms = seedPermissions();

        // Step 2: Seed roles with their permission sets
        Role userRole    = seedRole("USER",    "Regular customer",
            perms /* no permissions — USER role has no admin permissions */);

        Role staffRole   = seedRole("STAFF",   "Warehouse / operations staff",
            perms,
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_UPDATE,
            PermissionEnum.ORDER_VIEW,
            PermissionEnum.ORDER_UPDATE,
            PermissionEnum.INVENTORY_VIEW,
            PermissionEnum.INVENTORY_UPDATE
        );

        Role managerRole = seedRole("MANAGER", "Store manager",
            perms,
            PermissionEnum.PRODUCT_VIEW,
            PermissionEnum.PRODUCT_CREATE,
            PermissionEnum.PRODUCT_UPDATE,
            PermissionEnum.ORDER_VIEW,
            PermissionEnum.ORDER_UPDATE,
            PermissionEnum.INVENTORY_VIEW,
            PermissionEnum.INVENTORY_UPDATE,
            PermissionEnum.REVENUE_VIEW,
            PermissionEnum.REPORT_VIEW,
            PermissionEnum.VOUCHER_VIEW,
            PermissionEnum.VOUCHER_CREATE,
            PermissionEnum.VOUCHER_APPROVE,
            PermissionEnum.PROMOTION_MANAGE,
            PermissionEnum.USER_VIEW
        );

        Role adminRole   = seedRole("ADMIN",   "System administrator — full access",
            perms,
            PermissionEnum.values() /* all permissions */
        );

        // Step 3: Seed demo users
        seedUser("admin",   "admin@pdshop.com",   "admin123",   Set.of(adminRole));
        seedUser("manager", "manager@pdshop.com", "manager123", Set.of(managerRole));
        seedUser("staff",   "staff@pdshop.com",   "staff123",   Set.of(staffRole));
        seedUser("customer","customer@pdshop.com","customer123", Set.of(userRole));

        // Step 4: Seed sample catalog data
        seedCatalog();

        logger.info("=== RBAC data initialization complete ===");
    }

    // ── Permission seeding ───────────────────────────────────────────────────

    private Map<PermissionEnum, Permission> seedPermissions() {
        Map<PermissionEnum, Permission> map = new EnumMap<>(PermissionEnum.class);

        Map<PermissionEnum, String> descriptions = Map.ofEntries(
            Map.entry(PermissionEnum.PRODUCT_VIEW,     "View products in admin panel"),
            Map.entry(PermissionEnum.PRODUCT_CREATE,   "Create new products"),
            Map.entry(PermissionEnum.PRODUCT_UPDATE,   "Update existing products"),
            Map.entry(PermissionEnum.PRODUCT_DELETE,   "Delete products permanently"),
            Map.entry(PermissionEnum.ORDER_VIEW,       "View all orders"),
            Map.entry(PermissionEnum.ORDER_UPDATE,     "Update order status"),
            Map.entry(PermissionEnum.ORDER_DELETE,     "Delete orders"),
            Map.entry(PermissionEnum.INVENTORY_VIEW,   "View inventory levels"),
            Map.entry(PermissionEnum.INVENTORY_UPDATE, "Update stock / receive goods"),
            Map.entry(PermissionEnum.REVENUE_VIEW,     "View revenue figures"),
            Map.entry(PermissionEnum.REPORT_VIEW,      "View analytics reports"),
            Map.entry(PermissionEnum.VOUCHER_VIEW,     "View vouchers"),
            Map.entry(PermissionEnum.VOUCHER_CREATE,   "Create vouchers"),
            Map.entry(PermissionEnum.VOUCHER_APPROVE,  "Approve / reject vouchers"),
            Map.entry(PermissionEnum.PROMOTION_MANAGE, "Manage promotions"),
            Map.entry(PermissionEnum.USER_VIEW,        "View user accounts"),
            Map.entry(PermissionEnum.USER_MANAGE,      "Create / update / disable users"),
            Map.entry(PermissionEnum.ROLE_MANAGE,      "Assign roles to users"),
            Map.entry(PermissionEnum.AUDIT_LOG_VIEW,   "View audit logs"),
            Map.entry(PermissionEnum.SYSTEM_CONFIG,    "Modify system configuration")
        );

        for (PermissionEnum pe : PermissionEnum.values()) {
            Permission perm = permissionRepository.findByName(pe.name()).orElseGet(() -> {
                logger.info("  Creating permission: {}", pe.name());
                return permissionRepository.save(
                    new Permission(pe, descriptions.getOrDefault(pe, pe.name()))
                );
            });
            map.put(pe, perm);
        }
        return map;
    }

    // ── Role seeding ─────────────────────────────────────────────────────────

    /** Overload for USER role (no permissions). */
    private Role seedRole(String name, String description,
                          Map<PermissionEnum, Permission> allPerms) {
        return roleRepository.findByName(name).orElseGet(() -> {
            logger.info("  Creating role: {}", name);
            Role role = new Role(name, description);
            return roleRepository.save(role);
        });
    }

    private Role seedRole(String name, String description,
                          Map<PermissionEnum, Permission> allPerms,
                          PermissionEnum... grantedPerms) {
        Role role = roleRepository.findByName(name).orElseGet(() -> {
            logger.info("  Creating role: {}", name);
            return new Role(name, description);
        });

        // Always sync permissions to ensure DB matches code
        role.getPermissions().clear();
        Arrays.stream(grantedPerms)
            .map(allPerms::get)
            .forEach(role::addPermission);

        return roleRepository.save(role);
    }

    // ── User seeding ─────────────────────────────────────────────────────────

    private void seedUser(String username, String email, String password, Set<Role> roles) {
        userRepository.findByUsername(username).ifPresentOrElse(
            user -> {
                // Only reset password and enabled — do NOT touch roles to avoid Hibernate collection issues
                logger.info("  Resetting password for seeded user: {}", username);
                user.setPassword(passwordEncoder.encode(password));
                user.setEnabled(true);
                userRepository.save(user);
            },
            () -> {
                logger.info("  Creating user: {}", username);
                User user = new User();
                user.setUsername(username);
                user.setEmail(email);
                user.setPassword(passwordEncoder.encode(password));
                user.setRoles(new java.util.HashSet<>(roles));
                user.setEnabled(true);
                userRepository.save(user);
            }
        );
    }

    // ── Catalog seeding ──────────────────────────────────────────────────────

    private void seedCatalog() {
        if (categoryRepository.count() == 0) {
            seedCategory("Điện thoại", "dien-thoai");
            seedCategory("Laptop", "laptop");
        }

        if (productRepository.count() == 0) {
            categoryRepository.findBySlug("dien-thoai").ifPresent(cat -> {
                Product p = new Product();
                p.setName("iPhone 17 Pro Max");
                p.setSlug("iphone-17-pro-max");
                p.setSku("IP17PM-001");
                p.setPrice(35990000.0);
                p.setQuantity(100);
                p.setCategory(cat);
                p.setStatus(ProductStatus.ACTIVE);
                p.setThumbnail("iphone17.jpg");
                p.setDescription("The latest and greatest iPhone.");
                productRepository.save(p);
            });

            categoryRepository.findBySlug("laptop").ifPresent(cat -> {
                Product p = new Product();
                p.setName("MacBook Pro M5");
                p.setSlug("macbook-pro-m5");
                p.setSku("MBP-M5-001");
                p.setPrice(55990000.0);
                p.setQuantity(50);
                p.setCategory(cat);
                p.setStatus(ProductStatus.ACTIVE);
                p.setThumbnail("macbookm5.jpg");
                p.setDescription("The most powerful MacBook Pro ever.");
                productRepository.save(p);
            });
        }
    }

    private void seedCategory(String name, String slug) {
        if (categoryRepository.findBySlug(slug).isEmpty()) {
            Category c = new Category();
            c.setName(name);
            c.setSlug(slug);
            categoryRepository.save(c);
        }
    }
}
