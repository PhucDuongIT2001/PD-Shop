package com.example.demo.dto.admin.analytics;

/**
 * DTO cảnh báo sản phẩm sắp hết hàng tồn kho.
 */
public class LowStockProductResponse {

    private Long productId;
    private String productName;
    private String sku;
    private String thumbnail;
    private Integer currentQuantity;
    private Integer lowStockThreshold;
    private Integer shortage; // số lượng cần nhập thêm để đạt ngưỡng

    public LowStockProductResponse() {}

    public LowStockProductResponse(Long productId, String productName, String sku,
                                   String thumbnail, Integer currentQuantity,
                                   Integer lowStockThreshold) {
        this.productId = productId;
        this.productName = productName;
        this.sku = sku;
        this.thumbnail = thumbnail;
        this.currentQuantity = currentQuantity;
        this.lowStockThreshold = lowStockThreshold;
        this.shortage = Math.max(0, lowStockThreshold - currentQuantity);
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public Integer getCurrentQuantity() { return currentQuantity; }
    public void setCurrentQuantity(Integer currentQuantity) { this.currentQuantity = currentQuantity; }

    public Integer getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(Integer lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }

    public Integer getShortage() { return shortage; }
    public void setShortage(Integer shortage) { this.shortage = shortage; }
}
