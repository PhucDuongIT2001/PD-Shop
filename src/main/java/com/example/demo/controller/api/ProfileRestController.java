package com.example.demo.controller.api;

import com.example.demo.entity.Profile;
import com.example.demo.entity.User;
import com.example.demo.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@PreAuthorize("isAuthenticated()")
public class ProfileRestController {

    private final UserService userService;

    public ProfileRestController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(Principal principal) {
        User user = userService.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        
        Profile profile = user.getProfile();
        if (profile != null) {
            response.put("fullName", profile.getFullName());
            response.put("phone", profile.getPhone());
            response.put("address", profile.getAddress());
        }

        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Principal principal) {
        try {
            userService.updateUserProfile(
                    principal.getName(),
                    request.get("phone"),
                    request.get("address"),
                    request.get("fullName")
            );
            return ResponseEntity.ok(Map.of("message", "Cập nhật hồ sơ thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request, Principal principal) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            userService.changeUserPasswordWithOldPassword(principal.getName(), oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi đổi mật khẩu"));
        }
    }
}
