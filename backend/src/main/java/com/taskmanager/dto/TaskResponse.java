package com.taskmanager.dto;

import com.taskmanager.entity.Priority;
import com.taskmanager.entity.TaskStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class TaskResponse {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Priority priority;
    private LocalDateTime createdAt;
    private Long columnId;
    private LocalDate dueDate;
    private String assignedMember;
}
