package com.taskmanager.service;

import com.taskmanager.dto.NotificationResponse;
import com.taskmanager.entity.Notification;
import com.taskmanager.entity.User;
import com.taskmanager.repository.NotificationRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User recipient, String message, Long taskId) {
        notificationRepository.save(Notification.builder()
                .recipient(recipient)
                .message(message)
                .read(false)
                .taskId(taskId)
                .build());
    }

    public List<NotificationResponse> getNotifications(User user) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public long countUnread(User user) {
        return notificationRepository.countByRecipientIdAndReadFalse(user.getId());
    }

    public NotificationResponse markAsRead(User user, Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found: " + id));
        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.setId(n.getId());
        r.setMessage(n.getMessage());
        r.setRead(n.isRead());
        r.setCreatedAt(n.getCreatedAt());
        r.setTaskId(n.getTaskId());
        return r;
    }
}
