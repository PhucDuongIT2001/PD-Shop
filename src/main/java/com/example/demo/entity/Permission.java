package com.example.demo.entity;

import com.example.demo.entity.enums.PermissionEnum;
import jakarta.persistence.*;
import java.util.Objects;

/**
 * Represents a granular permission that can be assigned to roles.
 * Stored as the string name of {@link PermissionEnum} in the DB column `name`.
 *
 * Spring Security reads these as GrantedAuthority strings, so the value
 * must match exactly what is used in @PreAuthorize("hasAuthority('...')").
 */
@Entity
@Table(name = "permissions", indexes = {
    @Index(name = "idx_permissions_name", columnList = "name", unique = true)
})
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The canonical permission name — maps 1:1 to {@link PermissionEnum}.
     * Stored as VARCHAR so DB is readable without enum knowledge.
     */
    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    public Permission() {}

    public Permission(PermissionEnum perm, String description) {
        this.name = perm.name();
        this.description = description;
    }

    // ── Getters / Setters ────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // ── equals / hashCode on name (natural key) ──────────────────────────────

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Permission that = (Permission) o;
        return Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() { return Objects.hash(name); }

    @Override
    public String toString() {
        return "Permission{name='" + name + "'}";
    }
}
