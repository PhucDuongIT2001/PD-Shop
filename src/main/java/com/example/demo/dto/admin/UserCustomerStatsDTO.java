package com.example.demo.dto.admin;

import com.example.demo.entity.User;
import java.time.LocalDateTime;

public class UserCustomerStatsDTO {
    private Long id;
    private String username;
    private String email;
    private boolean enabled;
    private LocalDateTime createdAt;
    private Long orderCount;
    private Double totalSpent;

    // Constructor cho JPQL Projection
    public UserCustomerStatsDTO(Long id, String username, String email, boolean enabled, LocalDateTime createdAt, Long orderCount, Double totalSpent) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.orderCount = orderCount;
        this.totalSpent = totalSpent;
    }

    public UserCustomerStatsDTO() {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Long getOrderCount() { return orderCount; }
    public void setOrderCount(Long orderCount) { this.orderCount = orderCount; }

    public Double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(Double totalSpent) { this.totalSpent = totalSpent; }
}