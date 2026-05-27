package com.example.demo.dto;

/**
 * DTO đại diện cho một dòng sản phẩm trong đơn hàng.
 */
public class OrderDetailDto {

    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Integer quantity;
    private Double price;       // Giá tại thời điểm đặt hàng
    private Double lineTotal;   // price * quantity

    public OrderDetailDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductThumbnail() { return productThumbnail; }
    public void setProductThumbnail(String productThumbnail) { this.productThumbnail = productThumbnail; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getLineTotal() { return lineTotal; }
    public void setLineTotal(Double lineTotal) { this.lineTotal = lineTotal; }
}
