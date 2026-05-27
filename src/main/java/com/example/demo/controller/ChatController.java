package com.example.demo.controller;

import com.example.demo.entity.ChatMessage;
import com.example.demo.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@PreAuthorize("isAuthenticated()")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    /**
     * Lấy lịch sử chat của user đang đăng nhập.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ChatMessage>> getChatHistory(Principal principal) {
        List<ChatMessage> history = chatService.getChatHistory(principal.getName());
        return ResponseEntity.ok(history);
    }

    /**
     * Gửi tin nhắn mới của user và nhận phản hồi từ AI.
     * Body payload: {"message": "Tư vấn laptop"}
     */
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestBody Map<String, String> payload,
            Principal principal) {
        
        String userMessage = payload.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        ChatMessage botMessage = chatService.sendMessage(principal.getName(), userMessage.trim());
        return ResponseEntity.ok(botMessage);
    }
}
