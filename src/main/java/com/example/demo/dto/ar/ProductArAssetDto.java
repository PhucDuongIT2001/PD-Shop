package com.example.demo.dto.ar;

/**
 * Response DTO returned to clients (mobile / web AR viewers).
 * Contains all information needed to render a 3D model via WebXR,
 * model-viewer, AR Quick Look (iOS) or Scene Viewer (Android).
 */
public class ProductArAssetDto {

    private Long id;
    private Long productId;
    private String productName;

    /** Product sale price (VND). Used by the AR Room Planner cost estimator. */
    private Double productPrice;

    /** Product thumbnail image URL. Used by the AR Room Planner sidebar. */
    private String productThumbnail;

    /** URL to the .glb / .gltf file used by Android Scene Viewer and model-viewer. */
    private String modelGlbUrl;

    /** URL to the .usdz file used by iOS / iPadOS AR Quick Look. */
    private String modelUsdzUrl;

    /**
     * AR rendering type hint, e.g. "scene-viewer", "quick-look", "webxr".
     * Clients can use this to decide which viewer to launch.
     */
    private String arType;

    /**
     * Uniform scale factor applied when placing the model in AR space.
     * 1.0 = real-world size.
     */
    private Double scaleFactor;

    private String environmentMapUrl;
    private String availableColors;
    private java.util.List<ArHotspotDto> hotspots;

    public ProductArAssetDto() {}

    public ProductArAssetDto(Long id, Long productId, String productName,
                             Double productPrice, String productThumbnail,
                             String modelGlbUrl, String modelUsdzUrl,
                             String arType, Double scaleFactor,
                             String environmentMapUrl, String availableColors,
                             java.util.List<ArHotspotDto> hotspots) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productThumbnail = productThumbnail;
        this.modelGlbUrl = modelGlbUrl;
        this.modelUsdzUrl = modelUsdzUrl;
        this.arType = arType;
        this.scaleFactor = scaleFactor;
        this.environmentMapUrl = environmentMapUrl;
        this.availableColors = availableColors;
        this.hotspots = hotspots;
    }



    // --- Getters & Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public String getProductThumbnail() { return productThumbnail; }
    public void setProductThumbnail(String productThumbnail) { this.productThumbnail = productThumbnail; }

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
