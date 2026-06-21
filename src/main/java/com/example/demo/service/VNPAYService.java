package com.example.demo.service;

import com.example.demo.config.VNPAYConfig;
import com.example.demo.entity.Order;
import com.example.demo.entity.PaymentTransaction;
import com.example.demo.entity.enums.OrderStatus;
import com.example.demo.entity.enums.PaymentMethod;
import com.example.demo.entity.enums.PaymentStatus;
import com.example.demo.entity.enums.NotificationType;
import com.example.demo.entity.enums.NotificationPriority;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.OrderRepository;
import com.example.demo.repository.PaymentTransactionRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Service xử lý tích hợp cổng thanh toán VNPAY.
 * - Tạo URL thanh toán có chữ ký HMAC-SHA512
 * - Xác thực chữ ký IPN callback từ VNPAY
 * - Cập nhật trạng thái đơn hàng sau thanh toán
 */
@Service
public class VNPAYService {

    private static final Logger log = LoggerFactory.getLogger(VNPAYService.class);

    private final VNPAYConfig vnpayConfig;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public VNPAYService(VNPAYConfig vnpayConfig, 
                        OrderRepository orderRepository,
                        PaymentTransactionRepository paymentTransactionRepository,
                        InventoryService inventoryService,
                        NotificationService notificationService,
                        EmailService emailService) {
        this.vnpayConfig = vnpayConfig;
        this.orderRepository = orderRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
        this.inventoryService = inventoryService;
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    // -----------------------------------------------------------------------
    // Tạo URL thanh toán VNPAY
    // -----------------------------------------------------------------------

    /**
     * Tạo URL redirect đến trang thanh toán VNPAY cho đơn hàng.
     *
     * @param orderId ID đơn hàng cần thanh toán
     * @param request HttpServletRequest để lấy địa chỉ IP của khách
     * @return URL đầy đủ để redirect sang VNPAY
     */
    public String createPaymentUrl(Long orderId, HttpServletRequest request) {
        Order order = orderRepository.findByIdWithDetails(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        String txnRef = String.valueOf(orderId); // Mã tham chiếu = Order ID

        // Khởi tạo bản ghi PaymentTransaction ở trạng thái PENDING
        // Để tránh tạo trùng lặp nếu người dùng bấm link thanh toán nhiều lần
        PaymentTransaction transaction = paymentTransactionRepository.findByVnpTxnRef(txnRef).orElse(null);
        if (transaction == null) {
            transaction = new PaymentTransaction();
            transaction.setTransactionCode(UUID.randomUUID().toString());
            transaction.setVnpTxnRef(txnRef);
            transaction.setAmount(order.getTotalAmount());
            transaction.setPaymentMethod(PaymentMethod.VNPAY);
            transaction.setPaymentStatus(PaymentStatus.PENDING);
            transaction.setOrder(order);
            transaction.setUser(order.getUser());
            paymentTransactionRepository.save(transaction);
        }

        TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(tz);
        String createDate = sdf.format(new Date());

        // Lấy IP khách hàng
        String ipAddr = getClientIp(request);

        // VNPAY yêu cầu số tiền * 100 (đơn vị: đồng, không có phần thập phân)
        long amount = Math.round(order.getTotalAmount() * 100);

        // Xây dựng map tham số (phải dùng TreeMap để tự sắp xếp theo key alphabet)
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version",    vnpayConfig.getVersion());
        vnpParams.put("vnp_Command",    vnpayConfig.getCommand());
        vnpParams.put("vnp_TmnCode",    vnpayConfig.getTmnCode());
        vnpParams.put("vnp_Amount",     String.valueOf(amount));
        vnpParams.put("vnp_CurrCode",   vnpayConfig.getCurrCode());
        vnpParams.put("vnp_TxnRef",     txnRef);
        vnpParams.put("vnp_OrderInfo",  "Thanh toan don hang #" + orderId);
        vnpParams.put("vnp_OrderType",  "other");
        vnpParams.put("vnp_Locale",     vnpayConfig.getLocale());
        vnpParams.put("vnp_ReturnUrl",  vnpayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr",     ipAddr);
        vnpParams.put("vnp_CreateDate", createDate);

        // Tạo chuỗi hash data và query string
        StringBuilder hashData   = new StringBuilder();
        StringBuilder queryStr   = new StringBuilder();

        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            String encodedKey   = URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII);
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);

            hashData.append(encodedKey).append('=').append(encodedValue).append('&');
            queryStr.append(encodedKey).append('=').append(encodedValue).append('&');
        }

        // Xoá dấu '&' cuối
        hashData.deleteCharAt(hashData.length() - 1);
        queryStr.deleteCharAt(queryStr.length() - 1);

        // Tính chữ ký HMAC-SHA512
        String secureHash = hmacSha512(vnpayConfig.getHashSecret(), hashData.toString());

        return vnpayConfig.getPayUrl() + "?" + queryStr + "&vnp_SecureHash=" + secureHash;
    }

    // -----------------------------------------------------------------------
    // Xử lý IPN callback từ VNPAY
    // -----------------------------------------------------------------------

    /**
     * Xác thực và xử lý kết quả IPN từ VNPAY.
     *
     * @param params toàn bộ query params từ VNPAY gửi về
     * @return Map chứa RspCode và Message để trả lại VNPAY
     */
    @Transactional
    public Map<String, String> processIpnCallback(Map<String, String> params) {
        Map<String, String> result = new HashMap<>();

        // 1. Sao chép map để tránh UnsupportedOperationException trên Map không cho sửa (immutable)
        Map<String, String> mutableParams = new HashMap<>(params);
        String receivedHash = mutableParams.remove("vnp_SecureHash");
        mutableParams.remove("vnp_SecureHashType"); // Loại bỏ nếu có

        // 2. Tính lại chữ ký từ các tham số còn lại (đã sắp xếp)
        Map<String, String> sortedParams = new TreeMap<>(mutableParams);
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                hashData.append(URLEncoder.encode(entry.getKey(),   StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII))
                        .append('&');
            }
        }
        if (hashData.length() > 0) {
            hashData.deleteCharAt(hashData.length() - 1);
        }

        String calculatedHash = hmacSha512(vnpayConfig.getHashSecret(), hashData.toString());

        // 3. So sánh chữ ký (case-insensitive)
        if (!calculatedHash.equalsIgnoreCase(receivedHash)) {
            log.warn("VNPAY IPN: Invalid signature. received={}, calculated={}", receivedHash, calculatedHash);
            result.put("RspCode", "97");
            result.put("Message", "Invalid signature");
            return result;
        }

        // 4. Lấy thông tin đơn hàng
        String txnRef       = mutableParams.get("vnp_TxnRef");
        String responseCode = mutableParams.get("vnp_ResponseCode");
        String vnpAmount    = mutableParams.get("vnp_Amount");

        Long orderId;
        try {
            orderId = Long.parseLong(txnRef);
        } catch (NumberFormatException e) {
            log.error("VNPAY IPN: Invalid txnRef format: {}", txnRef);
            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return result;
        }

        // Sử dụng khóa dòng bi quan (PESSIMISTIC_WRITE) để khóa và load đơn hàng kèm theo chi tiết
        Order order = orderRepository.findByIdWithDetailsForUpdate(orderId).orElse(null);
        if (order == null) {
            log.error("VNPAY IPN: Order not found for id={}", orderId);
            result.put("RspCode", "01");
            result.put("Message", "Order not found");
            return result;
        }

        // 5. Kiểm tra số tiền khớp với đơn hàng
        long expectedAmount = Math.round(order.getTotalAmount() * 100);
        try {
            long receivedAmount = Long.parseLong(vnpAmount);
            if (receivedAmount != expectedAmount) {
                log.warn("VNPAY IPN: Amount mismatch for order {}. expected={}, received={}", orderId, expectedAmount, receivedAmount);
                result.put("RspCode", "04");
                result.put("Message", "Invalid amount");
                return result;
            }
        } catch (NumberFormatException e) {
            log.error("VNPAY IPN: Invalid amount format: {}", vnpAmount);
            result.put("RspCode", "04");
            result.put("Message", "Invalid amount");
            return result;
        }

        // 6. Tránh xử lý lại nếu đơn hàng đã được cập nhật trước đó
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.FAILED) {
            log.info("VNPAY IPN: Order {} already processed with status {}", orderId, order.getStatus());
            result.put("RspCode", "02");
            result.put("Message", "Order already confirmed");
            return result;
        }

        // 7. Cập nhật trạng thái giao dịch và đơn hàng
        PaymentTransaction transaction = paymentTransactionRepository.findByVnpTxnRef(txnRef).orElse(null);
        if (transaction == null) {
            transaction = new PaymentTransaction();
            transaction.setTransactionCode(UUID.randomUUID().toString());
            transaction.setVnpTxnRef(txnRef);
            transaction.setAmount(order.getTotalAmount());
            transaction.setPaymentMethod(PaymentMethod.VNPAY);
            transaction.setOrder(order);
            transaction.setUser(order.getUser());
        }

        transaction.setVnpTransactionNo(mutableParams.get("vnp_TransactionNo"));
        transaction.setBankCode(mutableParams.get("vnp_BankCode"));
        transaction.setResponseCode(responseCode);
        transaction.setRawResponse(mutableParams.toString());

        if ("00".equals(responseCode)) {
            order.setStatus(OrderStatus.PAID);
            transaction.setPaymentStatus(PaymentStatus.SUCCESS);
            log.info("VNPAY IPN: Order {} payment SUCCESS", orderId);

            // Bắt đầu trừ kho vật lý thực tế (Hoãn trừ kho từ bước checkout sang đây)
            order.getOrderDetails().forEach(detail ->
                    inventoryService.exportStock(
                            detail.getProduct().getId(),
                            detail.getQuantity(),
                            "Xuất kho cho đơn hàng VNPay đã thanh toán thành công #" + order.getId()
                    )
            );

            // Đẩy notification realtime báo cho khách hàng
            try {
                notificationService.sendToUser(
                    order.getUser().getId(),
                    "Thanh toán thành công đơn hàng #" + order.getId(),
                    "Đơn hàng của bạn đã được thanh toán trực tuyến thành công qua VNPay.",
                    NotificationType.ORDER_CONFIRMED,
                    NotificationPriority.HIGH,
                    "/orders/" + order.getId()
                );
            } catch (Exception e) {
                log.error("Failed to push customer order notification: {}", e.getMessage());
            }

            // Đẩy notification realtime báo cho Admin
            try {
                notificationService.sendToAdmins(
                    "Đơn hàng mới đã thanh toán #" + order.getId(),
                    "Đơn hàng #" + order.getId() + " vừa được thanh toán thành công qua VNPay trị giá " + 
                    new java.text.DecimalFormat("#,###").format(order.getTotalAmount()) + "đ",
                    NotificationType.ORDER_CREATED,
                    NotificationPriority.HIGH,
                    "/admin/orders"
                );
            } catch (Exception e) {
                log.error("Failed to push admin order notification: {}", e.getMessage());
            }

            // Gửi email hóa đơn bán hàng thành công
            emailService.sendOrderConfirmation(order);

        } else {
            order.setStatus(OrderStatus.FAILED);
            transaction.setPaymentStatus(PaymentStatus.FAILED);
            log.warn("VNPAY IPN: Order {} payment FAILED. responseCode={}", orderId, responseCode);
        }

        orderRepository.save(order);
        paymentTransactionRepository.save(transaction);

        result.put("RspCode", "00");
        result.put("Message", "Confirm success");
        return result;
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /**
     * Tính HMAC-SHA512 của dữ liệu với key bí mật.
     */
    public String hmacSha512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC-SHA512", e);
        }
    }

    /**
     * Lấy địa chỉ IP thực của client, hỗ trợ cả proxy/load-balancer.
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Nếu có nhiều IP (qua nhiều proxy), lấy IP đầu tiên
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
