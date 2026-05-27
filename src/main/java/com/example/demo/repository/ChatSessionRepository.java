package com.example.demo.repository;

import com.example.demo.entity.ChatSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    Optional<ChatSession> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
}
