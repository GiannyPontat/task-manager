package com.taskmanager.dto;

import com.taskmanager.entity.ActivityType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ActivityResponse {
    private Long id;
    private String authorName;
    private String authorInitials;
    private ActivityType type;
    private String detail;
    private LocalDateTime createdAt;
}
