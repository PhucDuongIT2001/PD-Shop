package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String slug;
    private Double price;

    @Column(name = "base_price")
    private Double basePrice;

    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    private String thumbnail;

    @Column(name = "warranty_period")
    private Integer warrantyPeriod;

    @Column(name = "is_new")
    private String isNew;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "full_specifications", columnDefinition = "TEXT")
    private String fullSpecifications;

    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL)
    private List<ProductVariant> variants;

    public Product() {
    }

    public Product(Integer id, String name, String slug, Double price, Double basePrice, Integer stockQuantity, String thumbnail, Integer warrantyPeriod, String isNew, String shortDescription, String fullSpecifications, String status, LocalDateTime createdAt, Category category, List<ProductVariant> variants) {
        this.id = id;
        this.name = name;
        this.slug = slug;
        this.price = price;
        this.basePrice = basePrice;
        this.stockQuantity = stockQuantity;
        this.thumbnail = thumbnail;
        this.warrantyPeriod = warrantyPeriod;
        this.isNew = isNew;
        this.shortDescription = shortDescription;
        this.fullSpecifications = fullSpecifications;
        this.status = status;
        this.createdAt = createdAt;
        this.category = category;
        this.variants = variants;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public Integer getWarrantyPeriod() {
        return warrantyPeriod;
    }

    public void setWarrantyPeriod(Integer warrantyPeriod) {
        this.warrantyPeriod = warrantyPeriod;
    }

    public String getIsNew() {
        return isNew;
    }

    public void setIsNew(String isNew) {
        this.isNew = isNew;
    }

    public String getShortDescription() {
        return shortDescription;
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = shortDescription;
    }

    public String getFullSpecifications() {
        return fullSpecifications;
    }

    public void setFullSpecifications(String fullSpecifications) {
        this.fullSpecifications = fullSpecifications;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public List<ProductVariant> getVariants() {
        return variants;
    }

    public void setVariants(List<ProductVariant> variants) {
        this.variants = variants;
    }
}
