package com.example.demo.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình tham số tích hợp cổng thanh toán VNPAY.
 * Các giá trị được đọc từ application.yml với prefix "vnpay".
 */
@Configuration
@ConfigurationProperties(prefix = "vnpay")
public class VNPAYConfig {

    /** Mã website tại hệ thống VNPAY (Terminal ID). */
    private String tmnCode;

    /** Chuỗi bí mật dùng để tạo chữ ký HMAC-SHA512. */
    private String hashSecret;

    /** URL cổng thanh toán VNPAY (sandbox hoặc production). */
    private String payUrl;

    /** URL backend nhận kết quả IPN từ VNPAY. */
    private String ipnUrl;

    /** URL frontend để redirect sau khi thanh toán xong. */
    private String returnUrl;

    /** Phiên bản API VNPAY (mặc định "2.1.0"). */
    private String version = "2.1.0";

    /** Lệnh thanh toán (mặc định "pay"). */
    private String command = "pay";

    /** Loại tiền tệ (mặc định "VND"). */
    private String currCode = "VND";

    /** Ngôn ngữ hiển thị trang VNPAY (mặc định "vn"). */
    private String locale = "vn";

    // --- Getters & Setters ---

    public String getTmnCode() { return tmnCode; }
    public void setTmnCode(String tmnCode) { this.tmnCode = tmnCode; }

    public String getHashSecret() { return hashSecret; }
    public void setHashSecret(String hashSecret) { this.hashSecret = hashSecret; }

    public String getPayUrl() { return payUrl; }
    public void setPayUrl(String payUrl) { this.payUrl = payUrl; }

    public String getIpnUrl() { return ipnUrl; }
    public void setIpnUrl(String ipnUrl) { this.ipnUrl = ipnUrl; }

    public String getReturnUrl() { return returnUrl; }
    public void setReturnUrl(String returnUrl) { this.returnUrl = returnUrl; }

    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }

    public String getCurrCode() { return currCode; }
    public void setCurrCode(String currCode) { this.currCode = currCode; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
}
