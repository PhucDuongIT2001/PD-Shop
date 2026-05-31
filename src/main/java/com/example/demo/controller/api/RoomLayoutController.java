package com.example.demo.controller.api;

import com.example.demo.dto.ar.RoomLayoutDto;
import com.example.demo.dto.ar.RoomLayoutRequestDto;
import com.example.demo.service.RoomLayoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ar-layouts")
public class RoomLayoutController {

    private final RoomLayoutService roomLayoutService;

    public RoomLayoutController(RoomLayoutService roomLayoutService) {
        this.roomLayoutService = roomLayoutService;
    }

    /**
     * POST /api/ar-layouts
     * Save / create a new room layout configuration.
     */
    @PostMapping
    public ResponseEntity<RoomLayoutDto> saveRoomLayout(
            @Valid @RequestBody RoomLayoutRequestDto request,
            Authentication authentication) {
        RoomLayoutDto saved = roomLayoutService.saveRoomLayout(request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/ar-layouts
     * Retrieve all saved room layouts belonging to the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<RoomLayoutDto>> getUserRoomLayouts(Authentication authentication) {
        List<RoomLayoutDto> layouts = roomLayoutService.getUserRoomLayouts(authentication);
        return ResponseEntity.ok(layouts);
    }

    /**
     * GET /api/ar-layouts/{id}
     * Retrieve a specific saved room layout by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomLayoutDto> getRoomLayoutById(
            @PathVariable Long id,
            Authentication authentication) {
        RoomLayoutDto layout = roomLayoutService.getRoomLayoutById(id, authentication);
        return ResponseEntity.ok(layout);
    }

    /**
     * DELETE /api/ar-layouts/{id}
     * Delete a specific saved room layout by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomLayout(
            @PathVariable Long id,
            Authentication authentication) {
        roomLayoutService.deleteRoomLayout(id, authentication);
        return ResponseEntity.noContent().build();
    }
}
