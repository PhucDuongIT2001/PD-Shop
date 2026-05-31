package com.example.demo.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "room_layout_items")
public class RoomLayoutItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_layout_id", nullable = false)
    private RoomLayout roomLayout;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "pos_x", nullable = false)
    private Double posX = 0.0;

    @Column(name = "pos_y", nullable = false)
    private Double posY = 0.0;

    @Column(name = "pos_z", nullable = false)
    private Double posZ = 0.0;

    @Column(name = "rot_y", nullable = false)
    private Double rotY = 0.0;

    public RoomLayoutItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RoomLayout getRoomLayout() { return roomLayout; }
    public void setRoomLayout(RoomLayout roomLayout) { this.roomLayout = roomLayout; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Double getPosX() { return posX; }
    public void setPosX(Double posX) { this.posX = posX; }

    public Double getPosY() { return posY; }
    public void setPosY(Double posY) { this.posY = posY; }

    public Double getPosZ() { return posZ; }
    public void setPosZ(Double posZ) { this.posZ = posZ; }

    public Double getRotY() { return rotY; }
    public void setRotY(Double rotY) { this.rotY = rotY; }
}
