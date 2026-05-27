package com.example.demo.dto;

public class CartItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Double price;
    private Integer quantity;
    private Integer stockQuantity;
    private boolean saveForLater;
    private Double itemTotal;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductThumbnail() { return productThumbnail; }
    public void setProductThumbnail(String productThumbnail) { this.productThumbnail = productThumbnail; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public boolean isSaveForLater() { return saveForLater; }
    public void setSaveForLater(boolean saveForLater) { this.saveForLater = saveForLater; }

    public Double getItemTotal() { return itemTotal; }
    public void setItemTotal(Double itemTotal) { this.itemTotal = itemTotal; }
}
