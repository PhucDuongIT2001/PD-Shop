package com.example.demo.dto.admin.analytics;

/**
 * DTO trả về thông tin top sản phẩm bán chạy nhất.
 */
public class TopSellingProductResponse {

    private Long productId;
    private String productName;
    private String sku;
    private String thumbnail;
    private Long totalSold;
    private Double price;

    public TopSellingProductResponse() {}

    public TopSellingProductResponse(Long productId, String productName, String sku,
                                     String thumbnail, Long totalSold, Double price) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.thumbnail = thumbnail;
        this.totalSold = totalSold != null ? totalSold : 0L;
        this.price = price;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public Long getTotalSold() { return totalSold; }
    public void setTotalSold(Long totalSold) { this.totalSold = totalSold; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
}
