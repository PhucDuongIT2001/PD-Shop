package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "session_id")
    private ChatSession chatSession;

    @Column(name = "sender_type")
    private String senderType;

    @Column(name = "message_text")
    private String messageText;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
