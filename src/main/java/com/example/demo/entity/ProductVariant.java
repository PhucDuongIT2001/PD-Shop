package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "product_variants")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ProductVariant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    @JsonIgnore
    private Product product;

    private String name; // e.g., Size, Color
    private String value; // e.g., XL, Blue
    private Double priceAdjustment;

    public ProductVariant() {}

    public ProductVariant(Long id, Product product, String name, String value, Double priceAdjustment) {
        this.id = id;
        this.product = product;
        this.name = name;
        this.value = value;
        this.priceAdjustment = priceAdjustment;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public Double getPriceAdjustment() { return priceAdjustment; }
    public void setPriceAdjustment(Double priceAdjustment) { this.priceAdjustment = priceAdjustment; }
}
