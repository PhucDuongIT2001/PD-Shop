package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.security.jwt.JwtUtils;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class RestAuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private com.example.demo.service.EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> loginRequest) {
        String usernameOrEmail = loginRequest.get("usernameOrEmail");
        String password = loginRequest.get("password");

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usernameOrEmail, password));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userService.findByUsername(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "roles", user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList())
            ));

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(Map.of("message", "Sai tài khoản hoặc mật khẩu"));
        } catch (DisabledException e) {
            return ResponseEntity.status(403).body(Map.of("message", "Tài khoản chưa được kích hoạt. Vui lòng kiểm tra email."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Lỗi máy chủ nội bộ: " + e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody com.example.demo.dto.UserRegistrationDto registrationDto) {
        try {
            User user = userService.registerNewUser(registrationDto);
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "userId", user.getId(), "email", user.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otp = request.get("otp");
            userService.verifyAccount(email, otp);
            return ResponseEntity.ok(Map.of("message", "Tài khoản đã được kích hoạt thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            userService.resendVerificationOtp(email);
            return ResponseEntity.ok(Map.of("message", "Mã xác thực mới đã được gửi!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email không được để trống"));
            }
            
            java.util.Optional<User> userOpt = userService.findByEmail(email);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                String token = userService.createPasswordResetTokenForUser(user);
                
                String origin = httpRequest.getHeader("Origin");
                if (origin == null || origin.isEmpty()) {
                    origin = "http://localhost:5173";
                }
                String resetUrl = origin + "/reset-password?token=" + token;
                
                emailService.sendPasswordResetEmail(email, resetUrl);
            } else {
                // Thêm độ trễ nhân tạo để tránh tấn công timing (timing attacks)
                Thread.sleep(150);
            }
            
            return ResponseEntity.ok(Map.of("message", "Yêu cầu khôi phục mật khẩu đã được xử lý. Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu qua thư."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Có lỗi xảy ra trong quá trình xử lý yêu cầu"));
        }
    }

    @GetMapping("/validate-reset-token")
    public ResponseEntity<?> validateResetToken(@RequestParam String token) {
        try {
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã xác thực không được để trống"));
            }
            
            String validationResult = userService.validatePasswordResetToken(token);
            if (validationResult != null) {
                if (validationResult.equals("invalidToken")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng trước đó"));
                } else if (validationResult.equals("expired")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Liên kết đặt lại mật khẩu đã hết hạn"));
                }
            }
            return ResponseEntity.ok(Map.of("message", "Token hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || token.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mã token khôi phục không hợp lệ"));
            }
            if (newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu mới không được để trống"));
            }
            
            // Password strength validation regex
            // Tối thiểu 8 ký tự, 1 viết hoa, 1 số, 1 ký tự đặc biệt
            String passwordPattern = "^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\",./<>?~`|]).{8,}$";
            if (!newPassword.matches(passwordPattern)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải có tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 số và 1 ký tự đặc biệt"));
            }
            
            String validationResult = userService.validatePasswordResetToken(token);
            if (validationResult != null) {
                if (validationResult.equals("invalidToken")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng trước đó"));
                } else if (validationResult.equals("expired")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Liên kết đặt lại mật khẩu đã hết hạn"));
                }
            }
            
            userService.changeUserPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mật khẩu đã được khôi phục thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        try {
            User user = userService.findByUsername(authentication.getName())
                    .orElseGet(() -> userService.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found")));

            Map<String, Object> response = new HashMap<>();
            response.put("user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail(),
                    "roles", user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toList())
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", "User not found"));
        }
    }
}
