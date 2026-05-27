package com.example.demo.controller;

import com.example.demo.dto.ProductReviewsResponse;
import com.example.demo.dto.ReviewRequest;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * API đánh giá sản phẩm (client-facing).
 *
 * POST /api/products/{productId}/reviews  — Gửi đánh giá (yêu cầu đăng nhập & đã mua hàng)
 * GET  /api/products/{productId}/reviews  — Xem danh sách đánh giá + điểm trung bình (public)
 */
@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    /**
     * Gửi đánh giá cho sản phẩm.
     * Yêu cầu: đã đăng nhập, đã có đơn hàng DELIVERED chứa sản phẩm, chưa đánh giá trước đó.
     */
    @PostMapping
    public ResponseEntity<ReviewResponse> submitReview(
            @PathVariable Long productId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {

        ReviewResponse response = reviewService.submitReview(productId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lấy danh sách đánh giá và điểm trung bình của sản phẩm.
     * Không yêu cầu đăng nhập.
     */
    @GetMapping
    public ResponseEntity<ProductReviewsResponse> getProductReviews(
            @PathVariable Long productId) {

        ProductReviewsResponse response = reviewService.getProductReviews(productId);
        return ResponseEntity.ok(response);
    }
}
