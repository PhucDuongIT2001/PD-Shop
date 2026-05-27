package com.example.demo.dto;

import com.example.demo.entity.enums.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProductRequestDTO {

    private Long id; // Important for updates

    @NotBlank(message = "Product name is required")
    @Size(min = 3, max = 255, message = "Product name must be between 3 and 255 characters")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be non-negative")
    private Double price;

    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity;

    private String sku;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private Long brandId;

    private ProductStatus status;

    public ProductRequestDTO() {
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
    public ProductStatus getStatus() { return status; }
    public void setStatus(ProductStatus status) { this.status = status; }

    // AR fields
    private String modelGlbUrl;
    private String modelUsdzUrl;
    private String arType;
    private Double scaleFactor;

    public String getModelGlbUrl() { return modelGlbUrl; }
    public void setModelGlbUrl(String modelGlbUrl) { this.modelGlbUrl = modelGlbUrl; }
    public String getModelUsdzUrl() { return modelUsdzUrl; }
    public void setModelUsdzUrl(String modelUsdzUrl) { this.modelUsdzUrl = modelUsdzUrl; }
    public String getArType() { return arType; }
    public void setArType(String arType) { this.arType = arType; }
    public Double getScaleFactor() { return scaleFactor; }
    public void setScaleFactor(Double scaleFactor) { this.scaleFactor = scaleFactor; }
}
