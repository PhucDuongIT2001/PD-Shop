package com.example.demo.dto;

import java.util.List;
import java.util.Objects;

public class OrderRequest {
    private Long userId;
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public OrderRequest(Long userId, List<OrderItemRequest> items) {
        this.userId = userId;
        this.items = items;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderRequest that = (OrderRequest) o;
        return Objects.equals(userId, that.userId) && Objects.equals(items, that.items);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, items);
    }

    @Override
    public String toString() {
        return "OrderRequest{" +
                "userId=" + userId +
                ", items=" + items +
                '}';
    }
}
