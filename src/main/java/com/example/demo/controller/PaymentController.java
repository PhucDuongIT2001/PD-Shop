package com.example.demo.controller;

import com.example.demo.entity.Order;
import com.example.demo.entity.PaymentTransaction;
import com.example.demo.security.details.CustomUserDetails;
import com.example.demo.service.EmailService;
import com.example.demo.service.OrderService;
import com.example.demo.service.PaymentTransactionService;
import com.example.demo.service.VNPAYService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller xử lý các API liên quan đến thanh toán VNPAY.
 *
 * Luồng:
 *  1. Frontend gọi POST /api/payment/vnpay/create?orderId={id}
 *     → Backend trả về { "paymentUrl": "https://sandbox.vnpayment.vn/..." }
 *  2. Frontend redirect người dùng đến paymentUrl
 *  3. Sau khi giao dịch, VNPAY gọi GET /api/payment/vnpay/ipn (IPN URL)
 *     → Backend xác thực chữ ký, cập nhật trạng thái đơn hàng
 *  4. VNPAY redirect người dùng về GET /api/payment/vnpay/return (Return URL)
 *     → Backend trả kết quả để frontend hiển thị
 */
@RestController
@RequestMapping("/api/payment/vnpay")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final VNPAYService vnpayService;
    private final OrderService orderService;
    private final EmailService emailService;
    private final PaymentTransactionService paymentTransactionService;

    public PaymentController(VNPAYService vnpayService, 
                             OrderService orderService, 
                             EmailService emailService,
                             PaymentTransactionService paymentTransactionService) {
        this.vnpayService = vnpayService;
        this.orderService = orderService;
        this.emailService = emailService;
        this.paymentTransactionService = paymentTransactionService;
    }

    // -----------------------------------------------------------------------
    // 1. Tạo URL thanh toán
    // -----------------------------------------------------------------------

    /**
     * Tạo URL thanh toán VNPAY cho đơn hàng.
     * Yêu cầu người dùng đã đăng nhập (JWT).
     *
     * @param orderId ID đơn hàng cần thanh toán
     * @param request HttpServletRequest để lấy IP khách
     * @return JSON { "paymentUrl": "..." }
     */
    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> createPayment(
            @RequestParam Long orderId,
            HttpServletRequest request) {

        log.info("Creating VNPAY payment URL for orderId={}", orderId);
        String paymentUrl = vnpayService.createPaymentUrl(orderId, request);
        
        Order order = orderService.getOrderEntityById(orderId);
                
        emailService.sendVnpayPaymentEmail(order, paymentUrl);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Link thanh toán đã được gửi vào email của bạn!");
        return ResponseEntity.ok(response);
    }

    // -----------------------------------------------------------------------
    // 2. IPN URL – VNPAY gọi server-to-server để thông báo kết quả
    // -----------------------------------------------------------------------

    /**
     * Nhận kết quả IPN (Instant Payment Notification) từ VNPAY.
     * Endpoint này KHÔNG yêu cầu xác thực (VNPAY gọi trực tiếp từ server của họ).
     * Bảo mật được đảm bảo bằng chữ ký HMAC-SHA512.
     *
     * VNPAY yêu cầu response phải là JSON: { "RspCode": "00", "Message": "Confirm success" }
     *
     * @param params toàn bộ query parameters VNPAY gửi về
     * @return JSON kết quả xác nhận cho VNPAY
     */
    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> ipnCallback(
            @RequestParam Map<String, String> params) {

        log.info("Received VNPAY IPN callback. txnRef={}, responseCode={}",
                params.get("vnp_TxnRef"), params.get("vnp_ResponseCode"));

        Map<String, String> result = vnpayService.processIpnCallback(params);
        return ResponseEntity.ok(result);
    }

    // -----------------------------------------------------------------------
    // 3. Return URL – VNPAY redirect người dùng về sau khi thanh toán
    // -----------------------------------------------------------------------

    /**
     * Nhận redirect từ VNPAY sau khi người dùng hoàn tất giao dịch.
     * Trả về thông tin kết quả để frontend hiển thị trang thành công/thất bại.
     *
     * @param params toàn bộ query parameters VNPAY gửi về
     * @return JSON kết quả giao dịch
     */
    @GetMapping("/return")
    public ResponseEntity<Map<String, Object>> paymentReturn(
            @RequestParam Map<String, String> params) {

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef       = params.get("vnp_TxnRef");
        String amountStr    = params.get("vnp_Amount");
        String orderInfo    = params.get("vnp_OrderInfo");
        String transactionNo = params.get("vnp_TransactionNo");

        boolean success = "00".equals(responseCode);

        // VNPAY returns amount * 100, we divide it by 100 to show the correct currency value
        double actualAmount = 0.0;
        if (amountStr != null) {
            try {
                actualAmount = Double.parseDouble(amountStr) / 100.0;
            } catch (NumberFormatException e) {
                log.error("Failed to parse VNPAY amount: {}", amountStr);
            }
        }

        log.info("VNPAY Return URL: orderId={}, responseCode={}, success={}",
                txnRef, responseCode, success);

        // Gọi processIpnCallback để đảm bảo nghiệp vụ cập nhật trạng thái / trừ kho được thực thi an toàn và đồng bộ
        try {
            vnpayService.processIpnCallback(new HashMap<>(params));
        } catch (Exception e) {
            log.error("Error processing transaction inside paymentReturn: {}", e.getMessage());
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success",       success);
        result.put("orderId",       txnRef);
        result.put("responseCode",  responseCode);
        result.put("amount",        String.format("%.0f", actualAmount));
        result.put("orderInfo",     orderInfo);
        result.put("transactionNo", transactionNo);
        result.put("message",       success ? "Thanh toán thành công" : "Thanh toán thất bại");

        return ResponseEntity.ok(result);
    }

    // -----------------------------------------------------------------------
    // 4. Lấy lịch sử giao dịch cá nhân (Customer)
    // -----------------------------------------------------------------------
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<PaymentTransaction>> getMyTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(paymentTransactionService.getMyTransactions(userDetails.getId(), pageable));
    }

    // -----------------------------------------------------------------------
    // 5. Lấy toàn bộ lịch sử giao dịch (Admin)
    // -----------------------------------------------------------------------
    @GetMapping("/admin/transactions")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Page<PaymentTransaction>> getAllTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(paymentTransactionService.getAllTransactions(pageable));
    }
}
