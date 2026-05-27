package com.example.demo.dto;

import com.example.demo.entity.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về thông tin đầy đủ của một đơn hàng cho client.
 */
public class OrderResponse {

    private Long id;
    private String username;
    private OrderStatus status;
    private Double totalAmount;
    private LocalDateTime orderDate;

    // Thông tin giao hàng
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String note;
    private String paymentMethod;
    private String paymentUrl;

    private List<OrderDetailDto> items;

    public OrderResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public String getShippingName() { return shippingName; }
    public void setShippingName(String shippingName) { this.shippingName = shippingName; }

    public String getShippingPhone() { return shippingPhone; }
    public void setShippingPhone(String shippingPhone) { this.shippingPhone = shippingPhone; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }

    public List<OrderDetailDto> getItems() { return items; }
    public void setItems(List<OrderDetailDto> items) { this.items = items; }
}
