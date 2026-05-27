package com.example.demo.entity.enums;

/**
 * Trạng thái vòng đời của một đơn hàng.
 * Luồng hợp lệ:
 *   PENDING → SHIPPING → DELIVERED
 *   PENDING → CANCELLED
 *   SHIPPING → CANCELLED
 *   PENDING → PAID (sau khi thanh toán VNPAY thành công)
 *   PENDING → FAILED (sau khi thanh toán VNPAY thất bại)
 */
public enum OrderStatus {
    UNCONFIRMED, // Vừa đặt hàng, chờ click link xác nhận trong email
    PENDING,    // Chờ xử lý (hoặc chờ thanh toán)
    SHIPPING,   // Đang giao hàng
    DELIVERED,  // Đã giao hàng thành công
    CANCELLED,  // Bị huỷ (do admin, user, hoặc hết hạn)
    
    // Các trạng thái mở rộng cho thanh toán VNPay
    PAID,       // Đã thanh toán thành công qua VNPAY
    FAILED      // Thanh toán thất bại qua VNPAY
}
