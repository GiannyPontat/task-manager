package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoveTaskRequest {
    @NotNull
    private Long columnId;
    private int position;
    private TaskStatus status;
}
