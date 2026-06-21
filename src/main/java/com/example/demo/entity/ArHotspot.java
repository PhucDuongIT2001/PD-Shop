package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "ar_hotspots")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ArHotspot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ar_asset_id", nullable = false)
    @JsonIgnore
    private ProductArAsset arAsset;

    private String name; // ví dụ: "camera", "screen"
    private String position; // "0.2 0.3 -0.1"
    private String normal; // "-1 0 0"
    
    @Column(name = "label_text")
    private String labelText; // "Camera 48MP"

    public ArHotspot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public ProductArAsset getArAsset() { return arAsset; }
    public void setArAsset(ProductArAsset arAsset) { this.arAsset = arAsset; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public String getNormal() { return normal; }
    public void setNormal(String normal) { this.normal = normal; }

    public String getLabelText() { return labelText; }
    public void setLabelText(String labelText) { this.labelText = labelText; }
}
