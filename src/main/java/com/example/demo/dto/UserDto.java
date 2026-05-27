package com.example.demo.dto;

import java.util.Set;
import java.util.stream.Collectors;
import com.example.demo.entity.User;
import com.example.demo.entity.Role;
import com.example.demo.entity.enums.OrderStatus;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private Set<String> roles;
    private Boolean enabled;
    private String fullName;
    private String phone;
    private Integer orderCount;
    private Double totalSpent;

    public UserDto(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.roles = user.getRoles().stream()
                         .map(Role::getName)
                         .collect(Collectors.toSet());
        this.enabled = user.getEnabled();
        if (user.getProfile() != null) {
            this.fullName = user.getProfile().getFullName();
            this.phone = user.getProfile().getPhone();
        } else {
            this.fullName = "";
            this.phone = "";
        }
        this.orderCount = user.getOrders() != null ? user.getOrders().size() : 0;
        this.totalSpent = user.getOrders() != null ? user.getOrders().stream()
                .filter(o -> o.getStatus() == OrderStatus.PAID || o.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0.0)
                .sum() : 0.0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }
    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getOrderCount() { return orderCount; }
    public void setOrderCount(Integer orderCount) { this.orderCount = orderCount; }
    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
}

