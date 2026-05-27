package com.example.demo.dto;

public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private Double price;
    private Double basePrice;
    private Integer stockQuantity;
    private Integer soldQuantity;
    private String thumbnail;
    private String description;
    private String shortDescription;
    private Integer warrantyPeriod;
    private String isNew;
    private String status;
    private String categoryName;
    private Long categoryId;
    private Long brandId;
    private String brandName;

    public ProductDto() {}

    public ProductDto(Long id, String name, String slug, String sku,
                      Double price, Double basePrice,
                      Integer stockQuantity, Integer soldQuantity,
                      String thumbnail, String description, String shortDescription,
                      Integer warrantyPeriod, String isNew,
                      String status, String categoryName, Long categoryId,
                      Long brandId, String brandName) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.sku = sku;
        this.price = price;
        this.basePrice = basePrice;
        this.stockQuantity = stockQuantity;
        this.soldQuantity = soldQuantity;
        this.thumbnail = thumbnail;
        this.description = description;
        this.shortDescription = shortDescription;
        this.warrantyPeriod = warrantyPeriod;
        this.isNew = isNew;
        this.status = status;
        this.categoryName = categoryName;
        this.categoryId = categoryId;
        this.brandId = brandId;
        this.brandName = brandName;
    }

    // ── Getters & Setters ──────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public Integer getSoldQuantity() { return soldQuantity; }
    public void setSoldQuantity(Integer soldQuantity) { this.soldQuantity = soldQuantity; }

    public String getThumbnail() { return thumbnail; }
    public void setThumbnail(String thumbnail) { this.thumbnail = thumbnail; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String shortDescription) { this.shortDescription = shortDescription; }

    public Integer getWarrantyPeriod() { return warrantyPeriod; }
    public void setWarrantyPeriod(Integer warrantyPeriod) { this.warrantyPeriod = warrantyPeriod; }

    public String getIsNew() { return isNew; }
    public void setIsNew(String isNew) { this.isNew = isNew; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }

    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
}
