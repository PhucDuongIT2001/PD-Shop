package com.example.demo.security.details;

import com.example.demo.entity.Permission;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * Custom UserDetails that exposes BOTH role-level and permission-level authorities.
 *
 * Authority strategy:
 *   - "ROLE_ADMIN"        → enables hasRole("ADMIN") checks
 *   - "PRODUCT_DELETE"    → enables hasAuthority("PRODUCT_DELETE") checks
 *
 * This dual-authority approach is the foundation of fine-grained RBAC.
 * Spring Security's @PreAuthorize can then use either:
 *   @PreAuthorize("hasRole('ADMIN')")                    — coarse-grained
 *   @PreAuthorize("hasAuthority('PRODUCT_DELETE')")      — fine-grained
 *   @PreAuthorize("hasAnyAuthority('ORDER_VIEW','ORDER_UPDATE')")
 */
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    /**
     * Builds the authority set by merging:
     *   1. Role authorities  → "ROLE_ADMIN", "ROLE_MANAGER", etc.
     *   2. Permission authorities → "PRODUCT_DELETE", "REVENUE_VIEW", etc.
     *
     * Using a Set prevents duplicate authorities when multiple roles share
     * the same permission (e.g., both ADMIN and MANAGER have ORDER_VIEW).
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();

        for (Role role : user.getRoles()) {
            // 1. Add the role itself (ROLE_ prefix is Spring Security convention)
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));

            // 2. Add each permission granted to this role
            for (Permission permission : role.getPermissions()) {
                authorities.add(new SimpleGrantedAuthority(permission.getName()));
            }
        }

        return authorities;
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    @Override
    public String getUsername() { return user.getUsername(); }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return user.isEnabled(); }

    public User getUser() { return user; }

    public Long getId() { return user.getId(); }
}
