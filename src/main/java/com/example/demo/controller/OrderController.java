package com.example.demo.controller;

import com.example.demo.dto.CheckoutRequest;
import com.example.demo.dto.OrderResponse;
import com.example.demo.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

/**
 * REST API cho module đơn hàng (phía khách hàng).
 *
 * POST  /api/orders/checkout          – Đặt hàng từ giỏ hàng hiện tại
 * GET   /api/orders/my                – Lịch sử đơn hàng của user đang đăng nhập
 * GET   /api/orders/{id}              – Chi tiết một đơn hàng (chủ sở hữu hoặc ADMIN)
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final com.example.demo.service.VNPAYService vnpayService;
    private final com.example.demo.service.EmailService emailService;

    public OrderController(OrderService orderService,
                           com.example.demo.service.VNPAYService vnpayService,
                           com.example.demo.service.EmailService emailService) {
        this.orderService = orderService;
        this.vnpayService = vnpayService;
        this.emailService = emailService;
    }

    /**
     * Xác nhận đơn hàng 2 bước.
     */
    @PostMapping("/confirm")
    public ResponseEntity<OrderResponse> confirmOrder(
            @RequestParam String token,
            jakarta.servlet.http.HttpServletRequest request) {
        OrderResponse order = orderService.confirmOrder(token);
        
        // Nếu là đơn hàng VNPAY, sinh URL thanh toán VNPay và gán vào OrderResponse để frontend redirect
        if ("VNPAY".equals(order.getPaymentMethod())) {
            String paymentUrl = vnpayService.createPaymentUrl(order.getId(), request);
            order.setPaymentUrl(paymentUrl);
        }
        
        return ResponseEntity.ok(order);
    }

    /**
     * Checkout: tạo đơn hàng từ giỏ hàng của user đang đăng nhập.
     * Body: {@link CheckoutRequest} – thông tin giao hàng.
     */
    @PostMapping("/checkout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> checkout(
            @Valid @RequestBody CheckoutRequest request,
            Principal principal,
            HttpServletRequest httpRequest) {
        OrderResponse order = orderService.checkout(principal.getName(), request, httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    /**
     * Lấy danh sách đơn hàng của user đang đăng nhập.
     */
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderResponse>> getMyOrders(Principal principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getName()));
    }

    /**
     * Chi tiết đơn hàng – chỉ chủ sở hữu hoặc ADMIN mới được xem.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Long id,
            Principal principal) {
        OrderResponse order = orderService.getOrderById(id);
        // Kiểm tra quyền: chỉ chủ đơn hoặc ADMIN
        boolean isOwner = order.getUsername().equals(principal.getName());
        if (!isOwner) {
            // Spring Security sẽ xử lý ADMIN qua @PreAuthorize ở method level nếu cần;
            // ở đây trả 403 nếu không phải chủ đơn và không có role ADMIN
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(order);
    }

    /**
     * Tra cứu đơn hàng public bằng ID và số điện thoại
     */
    @GetMapping("/track")
    public ResponseEntity<OrderResponse> trackOrder(
            @RequestParam Long id,
            @RequestParam String phone) {
        OrderResponse order = orderService.trackOrder(id, phone);
        return ResponseEntity.ok(order);
    }
}
