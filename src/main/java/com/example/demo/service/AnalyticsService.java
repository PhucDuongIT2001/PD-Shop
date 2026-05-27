package com.example.demo.service;

import com.example.demo.dto.admin.analytics.LowStockProductResponse;
import com.example.demo.dto.admin.analytics.RevenueResponse;
import com.example.demo.dto.admin.analytics.TopSellingProductResponse;
import com.example.demo.dto.admin.analytics.OverviewStatsResponse;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AnalyticsService(OrderRepository orderRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // -----------------------------------------------------------------------
    // 0. Tổng quan (Overview Stats)
    // -----------------------------------------------------------------------
    public OverviewStatsResponse getOverviewStats() {
        // Tổng doanh thu từ tất cả đơn hàng đã thanh toán (có thể lọc theo tháng nếu cần, đây lấy All-time hoặc 30 ngày)
        // Tạm lấy All-time cho đơn giản
        Double totalRevenue = orderRepository.sumRevenueByDateRange(LocalDateTime.of(2000, 1, 1, 0, 0), LocalDateTime.now());
        if (totalRevenue == null) totalRevenue = 0.0;
        
        // Đơn hàng mới (ví dụ trong 30 ngày qua)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Long newOrders = orderRepository.countPaidOrdersByDateRange(thirtyDaysAgo, LocalDateTime.now());
        if (newOrders == null) newOrders = 0L;

        Long totalCustomers = userRepository.count();
        Long totalProducts = productRepository.count();

        return new OverviewStatsResponse(totalRevenue, newOrders, totalCustomers, totalProducts);
    }

    // -----------------------------------------------------------------------
    // 1. Tổng doanh thu theo khoảng thời gian
    // -----------------------------------------------------------------------

    /**
     * Tính tổng doanh thu từ các đơn hàng đã thanh toán thành công
     * (trạng thái DELIVERED hoặc PAID) trong khoảng [fromDate, toDate].
     *
     * @param fromDate ngày bắt đầu (inclusive)
     * @param toDate   ngày kết thúc (inclusive)
     * @return {@link RevenueResponse} chứa tổng doanh thu và số đơn hàng
     */
    public RevenueResponse getRevenue(LocalDate fromDate, LocalDate toDate) {
        LocalDateTime from = fromDate.atStartOfDay();
        LocalDateTime to   = toDate.atTime(LocalTime.MAX);

        Double totalRevenue = orderRepository.sumRevenueByDateRange(from, to);
        Long   totalOrders  = orderRepository.countPaidOrdersByDateRange(from, to);

        return new RevenueResponse(fromDate, toDate,
                totalRevenue != null ? totalRevenue : 0.0,
                totalOrders  != null ? totalOrders  : 0L);
    }

    // -----------------------------------------------------------------------
    // 2. Top 5 sản phẩm bán chạy nhất
    // -----------------------------------------------------------------------

    /**
     * Trả về top 5 sản phẩm có sold_quantity cao nhất.
     * Dữ liệu lấy từ trường {@code sold_quantity} trong bảng {@code products}.
     *
     * @return danh sách tối đa 5 {@link TopSellingProductResponse}
     */
    public List<TopSellingProductResponse> getTop5SellingProducts() {
        List<Object[]> rows = productRepository.findTop5BySoldQuantity(
                PageRequest.of(0, 5));

        return rows.stream()
                .map(row -> new TopSellingProductResponse(
                        toLong(row[0]),          // id
                        (String) row[1],         // name
                        (String) row[2],         // sku
                        (String) row[3],         // thumbnail
                        toLong(row[4]),          // soldQuantity
                        toDouble(row[5])         // price
                ))
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // 3. Sản phẩm sắp hết hàng tồn kho
    // -----------------------------------------------------------------------

    /**
     * Trả về danh sách sản phẩm có {@code quantity <= low_stock_threshold}
     * để cảnh báo Admin cần nhập thêm hàng.
     *
     * @return danh sách {@link LowStockProductResponse} sắp xếp theo quantity tăng dần
     */
    public List<LowStockProductResponse> getLowStockProducts() {
        List<Object[]> rows = productRepository.findLowStockProducts();

        return rows.stream()
                .map(row -> new LowStockProductResponse(
                        toLong(row[0]),          // id
                        (String) row[1],         // name
                        (String) row[2],         // sku
                        (String) row[3],         // thumbnail
                        toInt(row[4]),           // quantity
                        toInt(row[5])            // lowStockThreshold
                ))
                .collect(Collectors.toList());
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private Long toLong(Object value) {
        if (value == null) return 0L;
        if (value instanceof Long)    return (Long) value;
        if (value instanceof Integer) return ((Integer) value).longValue();
        if (value instanceof Number)  return ((Number) value).longValue();
        return 0L;
    }

    private Integer toInt(Object value) {
        if (value == null) return 0;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number)  return ((Number) value).intValue();
        return 0;
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Number) return ((Number) value).doubleValue();
        return 0.0;
    }
}
