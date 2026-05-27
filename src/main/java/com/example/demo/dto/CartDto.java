package com.example.demo.dto;

import java.util.List;

public class CartDto {
    private Long id;
    private List<CartItemDto> items;
    private Double subtotal;
    private Double total;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }

    public Double getTotal() { return total; }
    public void setTotal(Double total) { this.total = total; }
}
