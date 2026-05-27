package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Request body cho API checkout từ giỏ hàng.
 * Client chỉ cần gửi thông tin giao hàng; danh sách sản phẩm
 * được lấy trực tiếp từ Cart của user đang đăng nhập.
 */
public class CheckoutRequest {

    @NotBlank(message = "Tên người nhận không được để trống")
    @Size(max = 150)
    private String shippingName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9+\\-\\s]{7,20}$", message = "Số điện thoại không hợp lệ")
    private String shippingPhone;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(max = 500)
    private String shippingAddress;

    @Size(max = 500)
    private String note;

    private String paymentMethod;

    public CheckoutRequest() {}

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
}
