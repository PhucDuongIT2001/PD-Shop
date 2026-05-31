package com.example.demo.service;

import com.example.demo.dto.ar.RoomLayoutDto;
import com.example.demo.dto.ar.RoomLayoutRequestDto;
import org.springframework.security.core.Authentication;
import java.util.List;

public interface RoomLayoutService {
    RoomLayoutDto saveRoomLayout(RoomLayoutRequestDto request, Authentication authentication);
    List<RoomLayoutDto> getUserRoomLayouts(Authentication authentication);
    RoomLayoutDto getRoomLayoutById(Long id, Authentication authentication);
    void deleteRoomLayout(Long id, Authentication authentication);
}
