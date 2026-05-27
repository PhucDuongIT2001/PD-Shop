package com.example.demo.dto;

import java.util.List;

/**
 * Trả về danh sách đánh giá của một sản phẩm kèm điểm trung bình.
 */
public class ProductReviewsResponse {

    private Long productId;
    private double averageRating;
    private long totalReviews;
    private List<ReviewResponse> reviews;

    public ProductReviewsResponse() {}

    public ProductReviewsResponse(Long productId, double averageRating,
                                  long totalReviews, List<ReviewResponse> reviews) {
        this.productId = productId;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.reviews = reviews;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }

    public List<ReviewResponse> getReviews() { return reviews; }
    public void setReviews(List<ReviewResponse> reviews) { this.reviews = reviews; }
}
