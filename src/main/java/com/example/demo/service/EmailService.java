package com.example.demo.service;

import com.example.demo.entity.Order;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username:noreply@pdshop.com}")
    private String fromEmail;

    @Value("${pdshop.app.frontendUrl:http://localhost:5173}")
    private String frontendUrl;

    public EmailService(JavaMailSender javaMailSender, TemplateEngine templateEngine) {
        this.javaMailSender = javaMailSender;
        this.templateEngine = templateEngine;
    }

    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            logger.info("Bắt đầu gửi email xác nhận cho đơn hàng #{}", order.getId());

            // In link xác nhận ra console để lập trình viên test trong chế độ development
            String confirmationLink = frontendUrl + "/confirm-order?token=" + order.getConfirmationToken();
            logger.warn("\n==========================================================================" +
                        "\n[DEVELOPMENT ONLY] ĐƯỜNG LINK XÁC NHẬN ĐƠN HÀNG #" + order.getId() + ":" +
                        "\n" + confirmationLink +
                        "\n==========================================================================");

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            // Thiết lập Context cho Thymeleaf
            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("baseUrl", "http://localhost:8080");
            context.setVariable("frontendUrl", frontendUrl);
            context.setVariable("confirmationLink", confirmationLink);

            // Render template thành HTML string
            String html = templateEngine.process("emails/order-confirmation", context);

            helper.setFrom(fromEmail, "PD Shop");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Xác nhận đơn hàng #" + order.getId() + " - PD Shop");
            helper.setText(html, true); // true = isHtml

            javaMailSender.send(message);
            logger.info("Đã gửi email xác nhận thành công cho đơn hàng #{}", order.getId());

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.error("Lỗi khi gửi email xác nhận cho đơn hàng #{}: {}", order.getId(), e.getMessage());
        }
    }

    @Async
    public void sendVnpayPaymentEmail(Order order, String paymentUrl) {
        try {
            logger.info("Bắt đầu gửi email link thanh toán VNPAY cho đơn hàng #{}", order.getId());

            logger.warn("\n==========================================================================" +
                        "\n[DEVELOPMENT ONLY] LINK THANH TOÁN VNPAY CHO ĐƠN HÀNG #" + order.getId() + ":" +
                        "\n" + paymentUrl +
                        "\n==========================================================================");

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name());

            Context context = new Context();
            context.setVariable("order", order);
            context.setVariable("paymentUrl", paymentUrl);
            context.setVariable("baseUrl", "http://localhost:8080");

            String html = templateEngine.process("emails/vnpay-payment-link", context);

            helper.setFrom(fromEmail, "PD Shop");
            helper.setTo(order.getUser().getEmail());
            helper.setSubject("Yêu cầu thanh toán VNPAY cho đơn hàng #" + order.getId() + " - PD Shop");
            helper.setText(html, true);

            javaMailSender.send(message);
            logger.info("Đã gửi email link thanh toán VNPAY thành công cho đơn hàng #{}", order.getId());

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            logger.error("Lỗi khi gửi email link thanh toán VNPAY cho đơn hàng #{}: {}", order.getId(), e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetUrl) {
        try {
            logger.info("Bắt đầu gửi email khôi phục mật khẩu cho: {}", toEmail);

            logger.warn("\n==========================================================================" +
                        "\n[DEVELOPMENT ONLY] LINK KHÔI PHỤC MẬT KHẨU CHO: " + toEmail + ":" +
                        "\n" + resetUrl +
                        "\n==========================================================================");

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("resetUrl", resetUrl);

            String html = templateEngine.process("emails/password-reset", context);

            helper.setFrom(fromEmail, "PD Shop Support");
            helper.setTo(toEmail);
            helper.setSubject("Yêu cầu khôi phục mật khẩu - PD Shop");
            helper.setText(html, true);

            javaMailSender.send(message);
            logger.info("Đã gửi email khôi phục mật khẩu thành công cho: {}", toEmail);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email khôi phục mật khẩu cho {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendOtpVerificationEmail(String toEmail, String otp) {
        try {
            logger.info("Bắt đầu gửi email mã xác nhận OTP cho: {}", toEmail);

            logger.warn("\n==========================================================================" +
                        "\n[DEVELOPMENT ONLY] MÃ OTP XÁC MINH CHO: " + toEmail + ":" +
                        "\n" + otp +
                        "\n==========================================================================");

            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            Context context = new Context();
            context.setVariable("otp", otp);

            String html = templateEngine.process("emails/otp-verification", context);

            helper.setFrom(fromEmail, "PD Shop Support");
            helper.setTo(toEmail);
            helper.setSubject("Mã xác minh tài khoản của bạn - PD Shop");
            helper.setText(html, true);

            javaMailSender.send(message);
            logger.info("Đã gửi email mã OTP thành công cho: {}", toEmail);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email mã OTP cho {}: {}", toEmail, e.getMessage());
        }
    }
}
