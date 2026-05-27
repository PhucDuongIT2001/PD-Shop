package com.example.demo.controller;

import com.example.demo.dto.UserDto;

import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')") // Secure the entire controller for ADMIN only
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public List<UserDto> getAllUsers() {
        return userService.findAll().stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return userService.findById(id)
                .map(user -> ResponseEntity.ok(new UserDto(user)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUserByAdmin(@RequestBody java.util.Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            String email = (String) request.get("email");
            String password = (String) request.get("password");
            String phone = (String) request.get("phone");
            String fullName = (String) request.get("fullName");
            
            // Safe roles extract
            java.util.List<?> rawRoles = (java.util.List<?>) request.get("roles");
            java.util.Set<String> roles = new java.util.HashSet<>();
            if (rawRoles != null) {
                for (Object r : rawRoles) {
                    roles.add(r.toString());
                }
            } else {
                roles.add("CUSTOMER");
            }

            com.example.demo.entity.User user = userService.createUserByAdmin(username, email, password, phone, fullName, roles);
            return ResponseEntity.ok(new UserDto(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> adminUpdateUser(@PathVariable Long id, @RequestBody java.util.Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            String phone = (String) request.get("phone");
            String fullName = (String) request.get("fullName");
            
            java.util.List<?> rawRoles = (java.util.List<?>) request.get("roles");
            java.util.Set<String> roles = new java.util.HashSet<>();
            if (rawRoles != null) {
                for (Object r : rawRoles) {
                    roles.add(r.toString());
                }
            }

            userService.adminUpdateUser(id, email, phone, fullName, roles);
            return ResponseEntity.ok(java.util.Map.of("message", "Cập nhật người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        try {
            userService.toggleUserStatus(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Thay đổi trạng thái thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        // Check if user exists before deleting
        return userService.findById(id)
                .<ResponseEntity<Void>>map(user -> {
                    userService.deleteById(id);
                    return ResponseEntity.noContent().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
