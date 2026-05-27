package com.example.demo.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Objects;

public class OrderRequest {

    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    public OrderRequest(List<OrderItemRequest> items) {
        this.items = items;
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
        return Objects.equals(items, that.items);
    }

    @Override
    public int hashCode() {
        return Objects.hash(items);
    }

    @Override
    public String toString() {
        return "OrderRequest{" +
                "items=" + items +
                '}';
    }
}
