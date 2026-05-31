package com.example.demo.dto.ar;

import java.time.LocalDateTime;
import java.util.List;

public class RoomLayoutDto {
    private Long id;
    private String name;
    private Long userId;
    private String username;
    private List<RoomLayoutItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoomLayoutDto() {}

    public RoomLayoutDto(Long id, String name, Long userId, String username, 
                         List<RoomLayoutItemDto> items, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.userId = userId;
        this.username = username;
        this.items = items;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public List<RoomLayoutItemDto> getItems() { return items; }
    public void setItems(List<RoomLayoutItemDto> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
