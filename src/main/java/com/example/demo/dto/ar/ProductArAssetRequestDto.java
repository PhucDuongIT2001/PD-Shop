package com.example.demo.dto.ar;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO used by Admin to create or update an AR asset for a product.
 * At least one of modelGlbUrl or modelUsdzUrl must be provided (validated in service).
 */
public class ProductArAssetRequestDto {

    /**
     * Public URL (or relative path) to the .glb / .gltf 3D model file.
     * Required for Android Scene Viewer and model-viewer web component.
     */
    @Size(max = 2048, message = "GLB URL must not exceed 2048 characters")
    private String modelGlbUrl;

    /**
     * Public URL (or relative path) to the .usdz 3D model file.
     * Required for iOS / iPadOS AR Quick Look.
     */
    @Size(max = 2048, message = "USDZ URL must not exceed 2048 characters")
    private String modelUsdzUrl;

    /**
     * AR viewer type hint: "scene-viewer" | "quick-look" | "webxr" | "auto".
     * Defaults to "auto" when not specified.
     */
    @Size(max = 64, message = "AR type must not exceed 64 characters")
    private String arType;

    /**
     * Uniform scale factor for AR placement. Must be > 0.
     * Defaults to 1.0 (real-world size) when not specified.
     */
    @DecimalMin(value = "0.0001", message = "Scale factor must be greater than 0")
    private Double scaleFactor;

    private String environmentMapUrl;
    private String availableColors;
    private java.util.List<ArHotspotDto> hotspots;

    public ProductArAssetRequestDto() {}

    // --- Getters & Setters ---

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

    public java.util.List<ArHotspotDto> getHotspots() { return hotspots; }
    public void setHotspots(java.util.List<ArHotspotDto> hotspots) { this.hotspots = hotspots; }
}
