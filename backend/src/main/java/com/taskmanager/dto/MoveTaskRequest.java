package com.taskmanager.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MoveTaskRequest {
    @NotNull
    private Long columnId;
    private int position;
}
