package com.example.demo.dto.ar;

public class RoomLayoutItemDto {
    private Long id;
    private Long productId;
    private String productName;
    private String productThumbnail;
    private Double productPrice;
    private String modelGlbUrl;
    private String modelUsdzUrl;
    private Double posX;
    private Double posY;
    private Double posZ;
    private Double rotY;

    public RoomLayoutItemDto() {}

    public RoomLayoutItemDto(Long id, Long productId, String productName, String productThumbnail, 
                             Double productPrice, String modelGlbUrl, String modelUsdzUrl, 
                             Double posX, Double posY, Double posZ, Double rotY) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productThumbnail = productThumbnail;
        this.productPrice = productPrice;
        this.modelGlbUrl = modelGlbUrl;
        this.modelUsdzUrl = modelUsdzUrl;
        this.posX = posX;
        this.posY = posY;
        this.posZ = posZ;
        this.rotY = rotY;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductThumbnail() { return productThumbnail; }
    public void setProductThumbnail(String productThumbnail) { this.productThumbnail = productThumbnail; }

    public Double getProductPrice() { return productPrice; }
    public void setProductPrice(Double productPrice) { this.productPrice = productPrice; }

    public String getModelGlbUrl() { return modelGlbUrl; }
    public void setModelGlbUrl(String modelGlbUrl) { this.modelGlbUrl = modelGlbUrl; }

    public String getModelUsdzUrl() { return modelUsdzUrl; }
    public void setModelUsdzUrl(String modelUsdzUrl) { this.modelUsdzUrl = modelUsdzUrl; }

    public Double getPosX() { return posX; }
    public void setPosX(Double posX) { this.posX = posX; }

    public Double getPosY() { return posY; }
    public void setPosY(Double posY) { this.posY = posY; }

    public Double getPosZ() { return posZ; }
    public void setPosZ(Double posZ) { this.posZ = posZ; }

    public Double getRotY() { return rotY; }
    public void setRotY(Double rotY) { this.rotY = rotY; }
}
