package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "product_ar_assets")
public class ProductArAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(name = "model_glb_url")
    private String modelGlbUrl;

    @Column(name = "model_usdz_url")
    private String modelUsdzUrl;

    @Column(name = "ar_type")
    private String arType;

    @Column(name = "scale_factor")
    private Double scaleFactor;

    @Column(name = "environment_map_url")
    private String environmentMapUrl;

    @Column(name = "available_colors")
    private String availableColors;

    @OneToMany(mappedBy = "arAsset", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ArHotspot> hotspots;

    public ProductArAsset() {}
    public ProductArAsset(Long id, Product product, String modelGlbUrl, String modelUsdzUrl, String arType, Double scaleFactor) {
        this.id = id;
        this.product = product;
        this.modelGlbUrl = modelGlbUrl;
        this.modelUsdzUrl = modelUsdzUrl;
        this.arType = arType;
        this.scaleFactor = scaleFactor;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public String getModelGlbUrl() { return modelGlbUrl; }
    public void setModelGlbUrl(String modelGlbUrl) { this.modelGlbUrl = modelGlbUrl; }

    public String getModelUsdzUrl() { return modelUsdzUrl; }
    public void setModelUsdzUrl(String modelUsdzUrl) { this.modelUsdzUrl = modelUsdzUrl; }

    public String getArType() { return arType; }
    public void setArType(String arType) { this.arType = arType; }

    public Double getScaleFactor() { return scaleFactor; }
    public void setScaleFactor(Double scaleFactor) { this.scaleFactor = scaleFactor; }

    public String getEnvironmentMapUrl() { return environmentMapUrl; }
    public void setEnvironmentMapUrl(String environmentMapUrl) { this.environmentMapUrl = environmentMapUrl; }

    public String getAvailableColors() { return availableColors; }
    public void setAvailableColors(String availableColors) { this.availableColors = availableColors; }

    public java.util.List<ArHotspot> getHotspots() { return hotspots; }
    public void setHotspots(java.util.List<ArHotspot> hotspots) { this.hotspots = hotspots; }
}
