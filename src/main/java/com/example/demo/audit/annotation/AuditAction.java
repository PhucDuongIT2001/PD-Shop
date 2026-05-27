package com.example.demo.audit.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Marks a service or controller method for automatic audit logging.
 *
 * Usage:
 * <pre>
 *   {@literal @}AuditAction(action = "UPDATE_PRODUCT_PRICE", entityType = "Product")
 *   public Product updatePrice(Long id, BigDecimal newPrice) { ... }
 * </pre>
 *
 * The AOP aspect ({@link com.example.demo.audit.aspect.AuditAspect}) intercepts
 * methods annotated with this and persists an {@link com.example.demo.entity.AuditLog}.
 *
 * Design decision — why annotation + AOP over manual logging:
 *   - Zero boilerplate in business logic (no service knows about audit)
 *   - Single responsibility: audit concern is fully isolated in the aspect
 *   - Easy to add/remove auditing without touching business code
 *   - Consistent log format across the entire codebase
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditAction {

    /**
     * Human-readable action label stored in audit_logs.action.
     * Use SCREAMING_SNAKE_CASE. Example: "UPDATE_PRODUCT_PRICE", "DELETE_ORDER".
     */
    String action();

    /**
     * The domain entity type being affected.
     * Example: "Product", "Order", "User", "Voucher".
     * Defaults to empty string (aspect will attempt to infer from method context).
     */
    String entityType() default "";
}
