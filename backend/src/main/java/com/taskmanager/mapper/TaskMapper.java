package com.taskmanager.mapper;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Priority;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import org.springframework.stereotype.Component;

@Component
public class TaskMapper {

    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setPriority(task.getPriority());
        response.setCreatedAt(task.getCreatedAt());
        response.setDueDate(task.getDueDate());
        response.setProjectId(task.getProject().getId());
        response.setAssignedMembers(task.getAssignedMembers());
        if (task.getColumn() != null) response.setColumnId(task.getColumn().getId());
        if (task.getCreatedBy() != null) response.setCreatedByName(task.getCreatedBy().getDisplayName());
        return response;
    }

    public Task toEntity(TaskRequest request) {
        return Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : Priority.LOW)
                .dueDate(request.getDueDate())
                .assignedMembers(request.getAssignedMembers() != null
                        ? new java.util.ArrayList<>(request.getAssignedMembers())
                        : new java.util.ArrayList<>())
                .build();
    }
}
