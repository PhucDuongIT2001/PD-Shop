package com.example.demo.dto.admin.analytics;

import java.time.LocalDate;

/**
 * DTO trả về kết quả tính tổng doanh thu theo khoảng thời gian.
 */
public class RevenueResponse {

    private LocalDate fromDate;
    private LocalDate toDate;
    private Double totalRevenue;
    private Long totalOrders;

    public RevenueResponse() {}

    public RevenueResponse(LocalDate fromDate, LocalDate toDate, Double totalRevenue, Long totalOrders) {
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.totalRevenue = totalRevenue != null ? totalRevenue : 0.0;
        this.totalOrders = totalOrders != null ? totalOrders : 0L;
    }

    public LocalDate getFromDate() { return fromDate; }
    public void setFromDate(LocalDate fromDate) { this.fromDate = fromDate; }

    public LocalDate getToDate() { return toDate; }
    public void setToDate(LocalDate toDate) { this.toDate = toDate; }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }

    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
}
