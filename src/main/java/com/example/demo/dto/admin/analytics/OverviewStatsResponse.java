package com.example.demo.dto.admin.analytics;

public class OverviewStatsResponse {
    private Double totalRevenue;
    private Long newOrders;
    private Long totalCustomers;
    private Long totalProducts;

    public OverviewStatsResponse() {}

    public OverviewStatsResponse(Double totalRevenue, Long newOrders, Long totalCustomers, Long totalProducts) {
        this.totalRevenue = totalRevenue;
        this.newOrders = newOrders;
        this.totalCustomers = totalCustomers;
        this.totalProducts = totalProducts;
    }

    public Double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getNewOrders() {
        return newOrders;
    }

    public void setNewOrders(Long newOrders) {
        this.newOrders = newOrders;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
}
