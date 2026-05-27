package com.example.demo.entity;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

/**
 * Represents a role in the RBAC model.
 *
 * Role hierarchy (enforced by permission assignment, not inheritance):
 *   USER < STAFF < MANAGER < ADMIN
 *
 * Roles are stored with the ROLE_ prefix convention so Spring Security's
 * hasRole("ADMIN") maps to the authority "ROLE_ADMIN".
 * However, fine-grained access is controlled via Permission authorities.
 */
@Entity
@Table(name = "roles", indexes = {
    @Index(name = "idx_roles_name", columnList = "name", unique = true)
})
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Stored as "ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_USER".
     * Spring Security's hasRole() strips the ROLE_ prefix automatically.
     */
    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    /**
     * The set of fine-grained permissions granted to this role.
     *
     * FetchType.EAGER is intentional here: permissions are always needed
     * when building the security context. The set is small (< 30 rows per role)
     * so the cost is negligible. Avoid LAZY here to prevent
     * LazyInitializationException outside a transaction.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions = new HashSet<>();

    public Role() {}

    public Role(String name) {
        this.name = name;
    }

    public Role(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Set<Permission> getPermissions() { return permissions; }
    public void setPermissions(Set<Permission> permissions) { this.permissions = permissions; }

    public void addPermission(Permission permission) {
        this.permissions.add(permission);
    }

    // ── equals / hashCode on name (natural key) ──────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return Objects.equals(name, role.name);
    }

    @Override
    public int hashCode() { return Objects.hash(name); }

    @Override
    public String toString() {
        return "Role{name='" + name + "'}";
    }
}
