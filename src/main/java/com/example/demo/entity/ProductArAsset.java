package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "product_ar_assets")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductArAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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
}
