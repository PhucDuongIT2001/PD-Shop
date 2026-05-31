package com.example.demo.dto.ar;

import java.util.List;

public class RoomLayoutRequestDto {
    private String name;
    private List<ItemRequest> items;

    public RoomLayoutRequestDto() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public List<ItemRequest> getItems() { return items; }
    public void setItems(List<ItemRequest> items) { this.items = items; }

    public static class ItemRequest {
        private Long productId;
        private Double posX;
        private Double posY;
        private Double posZ;
        private Double rotY;

        public ItemRequest() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Double getPosX() { return posX; }
        public void setPosX(Double posX) { this.posX = posX; }

        public Double getPosY() { return posY; }
        public void setPosY(Double posY) { this.posY = posY; }

        public Double getPosZ() { return posZ; }
        public void setPosZ(Double posZ) { this.posZ = posZ; }

        public Double getRotY() { return rotY; }
        public void setRotY(Double rotY) { this.rotY = rotY; }
    }
}
