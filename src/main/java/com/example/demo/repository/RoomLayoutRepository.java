package com.example.demo.repository;

import com.example.demo.entity.RoomLayout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomLayoutRepository extends JpaRepository<RoomLayout, Long> {
    List<RoomLayout> findByUserIdOrderByCreatedAtDesc(Long userId);
}
