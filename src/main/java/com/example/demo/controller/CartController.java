package com.example.demo.controller;

import com.example.demo.dto.CartDto;
import com.example.demo.dto.CartRequest;
import com.example.demo.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * REST API cho giỏ hàng.
 *
 * GET    /api/cart                        – Lấy giỏ hàng hiện tại
 * POST   /api/cart/items                  – Thêm sản phẩm vào giỏ
 * PUT    /api/cart/items/{itemId}         – Cập nhật số lượng
 * DELETE /api/cart/items/{itemId}         – Xoá item khỏi giỏ
 * PATCH  /api/cart/items/{itemId}/save-for-later – Chuyển đổi "lưu để sau"
 */
@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDto> getCart(Principal principal) {
        return ResponseEntity.ok(cartService.getCart(principal.getName()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDto> addItem(
            @Valid @RequestBody CartRequest request,
            Principal principal) {
        return ResponseEntity.ok(cartService.addItem(principal.getName(), request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartDto> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam Integer quantity,
            Principal principal) {
        return ResponseEntity.ok(cartService.updateQuantity(principal.getName(), itemId, quantity));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartDto> removeItem(
            @PathVariable Long itemId,
            Principal principal) {
        return ResponseEntity.ok(cartService.removeItem(principal.getName(), itemId));
    }

    @PatchMapping("/items/{itemId}/save-for-later")
    public ResponseEntity<CartDto> toggleSaveForLater(
            @PathVariable Long itemId,
            Principal principal) {
        return ResponseEntity.ok(cartService.toggleSaveForLater(principal.getName(), itemId));
    }
}
