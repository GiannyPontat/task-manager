package com.taskmanager.dto;

import com.taskmanager.entity.Priority;
import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TaskRequest {

    @NotBlank
    @Size(max = 100)
    private String title;

    private String description;

    private TaskStatus status;

    private Priority priority;

    private Long columnId;
}
