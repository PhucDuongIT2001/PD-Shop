package com.example.demo.service;

import com.example.demo.dto.ProductReviewsResponse;
import com.example.demo.dto.ReviewRequest;
import com.example.demo.dto.ReviewResponse;
import com.example.demo.entity.Product;
import com.example.demo.entity.Review;
import com.example.demo.entity.User;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.details.CustomUserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    /**
     * Gửi đánh giá cho một sản phẩm.
     * Yêu cầu: user đã có đơn hàng DELIVERED chứa sản phẩm đó và chưa đánh giá trước đây.
     */
    @Transactional
    public ReviewResponse submitReview(Long productId,
                                       ReviewRequest request,
                                       Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        // Kiểm tra sản phẩm tồn tại
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy sản phẩm với id: " + productId));

        // Kiểm tra user đã mua hàng chưa
        boolean hasPurchased = reviewRepository.hasUserPurchasedProduct(userId, productId);
        if (!hasPurchased) {
            throw new AccessDeniedException(
                    "Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao thành công.");
        }

        // Kiểm tra đã đánh giá chưa
        if (reviewRepository.existsByUserIdAndProductId(userId, productId)) {
            throw new IllegalStateException(
                    "Bạn đã đánh giá sản phẩm này rồi.");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại."));

        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUser(user);
        review.setProduct(product);

        Review saved = reviewRepository.save(review);
        return toResponse(saved);
    }

    /**
     * Lấy danh sách đánh giá của một sản phẩm và tính điểm trung bình.
     */
    @Transactional(readOnly = true)
    public ProductReviewsResponse getProductReviews(Long productId) {
        // Đảm bảo sản phẩm tồn tại
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException(
                    "Không tìm thấy sản phẩm với id: " + productId);
        }

        List<Review> reviews = reviewRepository.findByProductIdWithUser(productId);

        List<ReviewResponse> reviewResponses = reviews.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        double average = reviewRepository.findAverageRatingByProductId(productId)
                .orElse(0.0);

        // Làm tròn 1 chữ số thập phân
        double roundedAverage = Math.round(average * 10.0) / 10.0;

        long total = reviewRepository.countByProductId(productId);

        return new ProductReviewsResponse(productId, roundedAverage, total, reviewResponses);
    }

    // --- Helper ---

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt(),
                review.getUser().getUsername()
        );
    }
}
