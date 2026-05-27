package com.example.demo.controller.admin;

import com.example.demo.dto.admin.analytics.LowStockProductResponse;
import com.example.demo.dto.admin.analytics.RevenueResponse;
import com.example.demo.dto.admin.analytics.TopSellingProductResponse;
import com.example.demo.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller cung cấp các API thống kê (Analytics) dành riêng cho ADMIN.
 *
 * Base URL: /api/admin/analytics
 *
 * Tất cả endpoint đều yêu cầu role ADMIN (bảo vệ bởi @PreAuthorize + JWT).
 */
@RestController
@RequestMapping("/api/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AnalyticsService analyticsService;

    public AdminDashboardController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    // -----------------------------------------------------------------------
    // 0. Tổng quan Dashboard
    // -----------------------------------------------------------------------
    @GetMapping("/overview")
    public ResponseEntity<com.example.demo.dto.admin.analytics.OverviewStatsResponse> getOverviewStats() {
        return ResponseEntity.ok(analyticsService.getOverviewStats());
    }

    // -----------------------------------------------------------------------
    // 1. Tổng doanh thu theo khoảng thời gian
    // -----------------------------------------------------------------------

    /**
     * GET /api/admin/analytics/revenue?from=2024-01-01&to=2024-12-31
     *
     * Tính tổng doanh thu từ các đơn hàng đã thanh toán thành công
     * (trạng thái DELIVERED hoặc PAID) trong khoảng thời gian chỉ định.
     *
     * @param from ngày bắt đầu (ISO date, ví dụ: 2024-01-01) — mặc định đầu tháng hiện tại
     * @param to   ngày kết thúc (ISO date, ví dụ: 2024-12-31) — mặc định hôm nay
     * @return {@link RevenueResponse} chứa tổng doanh thu và số đơn hàng
     */
    @GetMapping("/revenue")
    public ResponseEntity<RevenueResponse> getRevenue(
            @RequestParam(value = "from", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,

            @RequestParam(value = "to", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        // Giá trị mặc định nếu không truyền tham số
        LocalDate fromDate = (from != null) ? from : LocalDate.now().withDayOfMonth(1);
        LocalDate toDate   = (to   != null) ? to   : LocalDate.now();

        if (fromDate.isAfter(toDate)) {
            return ResponseEntity.badRequest().build();
        }

        RevenueResponse response = analyticsService.getRevenue(fromDate, toDate);
        return ResponseEntity.ok(response);
    }

    // -----------------------------------------------------------------------
    // 2. Top 5 sản phẩm bán chạy nhất
    // -----------------------------------------------------------------------

    /**
     * GET /api/admin/analytics/top-selling-products
     *
     * Trả về top 5 sản phẩm có tổng sold_quantity cao nhất.
     *
     * @return danh sách tối đa 5 {@link TopSellingProductResponse}
     */
    @GetMapping("/top-selling-products")
    public ResponseEntity<List<TopSellingProductResponse>> getTopSellingProducts() {
        List<TopSellingProductResponse> result = analyticsService.getTop5SellingProducts();
        return ResponseEntity.ok(result);
    }

    // -----------------------------------------------------------------------
    // 3. Sản phẩm sắp hết hàng tồn kho
    // -----------------------------------------------------------------------

    /**
     * GET /api/admin/analytics/low-stock
     *
     * Trả về danh sách sản phẩm có quantity &lt;= low_stock_threshold,
     * sắp xếp theo quantity tăng dần để Admin ưu tiên nhập hàng.
     *
     * @return danh sách {@link LowStockProductResponse}
     */
    @GetMapping("/low-stock")
    public ResponseEntity<List<LowStockProductResponse>> getLowStockProducts() {
        List<LowStockProductResponse> result = analyticsService.getLowStockProducts();
        return ResponseEntity.ok(result);
    }
}
