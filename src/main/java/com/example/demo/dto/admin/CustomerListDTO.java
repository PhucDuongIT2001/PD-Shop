package com.example.demo.dto.admin;

import com.example.demo.entity.User;

import java.time.LocalDateTime;

public class CustomerListDTO {
    private Long id;
    private String username;
    private String email;
    private boolean enabled;
    private LocalDateTime createdAt;
    private int orderCount;
    private double totalSpent;

    public CustomerListDTO(User user, int orderCount, double totalSpent) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.enabled = user.isEnabled();
        this.createdAt = user.getCreatedAt();
        this.orderCount = orderCount;
        this.totalSpent = totalSpent;
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
    public int getOrderCount() { return orderCount; }
    public void setOrderCount(int orderCount) { this.orderCount = orderCount; }
    public double getTotalSpent() { return totalSpent; }
    public void setTotalSpent(double totalSpent) { this.totalSpent = totalSpent; }
}