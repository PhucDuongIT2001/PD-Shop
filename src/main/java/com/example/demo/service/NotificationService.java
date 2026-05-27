package com.example.demo.service;

import com.example.demo.entity.Notification;
import com.example.demo.entity.User;
import com.example.demo.entity.enums.NotificationPriority;
import com.example.demo.entity.enums.NotificationType;
import com.example.demo.repository.NotificationRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Active SSE connections managed by userId
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Subscribes a user to their live real-time notification stream.
     */
    public SseEmitter subscribe(Long userId) {
        // Create emitter with 30-minute timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);

        emitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        // Send initialization / connect message
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECT")
                    .data("Successfully connected to live notification stream."));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
    }

    /**
     * Sends a real-time notification to a specific user and saves it to the database.
     */
    @Transactional
    public void sendToUser(Long userId, String title, String message, NotificationType type, NotificationPriority priority, String redirectUrl) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = new Notification(title, message, type, priority, user, redirectUrl);
        Notification saved = notificationRepository.save(notification);

        pushRealtime(userId, saved);
    }

    /**
     * Sends a real-time notification to all ADMINS and saves it for each.
     */
    @Transactional
    public void sendToAdmins(String title, String message, NotificationType type, NotificationPriority priority, String redirectUrl) {
        List<User> admins = userRepository.findByRoleName("ROLE_ADMIN");
        for (User admin : admins) {
            Notification notification = new Notification(title, message, type, priority, admin, redirectUrl);
            Notification saved = notificationRepository.save(notification);
            pushRealtime(admin.getId(), saved);
        }
    }

    /**
     * Broadcasts a real-time notification to all online clients (user is null).
     */
    @Transactional
    public void broadcast(String title, String message, NotificationType type, NotificationPriority priority, String redirectUrl) {
        Notification notification = new Notification(title, message, type, priority, null, redirectUrl);
        Notification saved = notificationRepository.save(notification);

        // Push to everyone currently online
        for (Long userId : emitters.keySet()) {
            pushRealtime(userId, saved);
        }
    }

    private void pushRealtime(Long userId, Notification notification) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters == null || userEmitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();

        // Create simplified representation for pushing
        Map<String, Object> data = Map.of(
                "id", notification.getId(),
                "title", notification.getTitle(),
                "message", notification.getMessage(),
                "type", notification.getType().name(),
                "priority", notification.getPriority().name(),
                "isRead", notification.isRead(),
                "createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : java.time.LocalDateTime.now().toString(),
                "redirectUrl", notification.getRedirectUrl() != null ? notification.getRedirectUrl() : ""
        );

        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NOTIFICATION")
                        .data(data));
            } catch (IOException e) {
                deadEmitters.add(emitter);
            }
        }

        // Clean up disconnected emitters
        for (SseEmitter dead : deadEmitters) {
            removeEmitter(userId, dead);
        }
    }

    // --- REST operations ---

    @Transactional(readOnly = true)
    public Page<Notification> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserOrBroadcast(userId, pageable);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countUnread(userId);
    }

    @Transactional
    public void markAsRead(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null && (notification.getUser() == null || notification.getUser().getId().equals(userId))) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void deleteNotification(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null && (notification.getUser() == null || notification.getUser().getId().equals(userId))) {
            notificationRepository.delete(notification);
        }
    }
}
