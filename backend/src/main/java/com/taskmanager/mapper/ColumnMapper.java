package com.taskmanager.mapper;

import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.KanbanColumn;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ColumnMapper {

    private final TaskMapper taskMapper;

    public ColumnResponse toResponse(KanbanColumn column) {
        ColumnResponse response = new ColumnResponse();
        response.setId(column.getId());
        response.setTitle(column.getTitle());
        response.setPosition(column.getPosition());
        response.setLinkedStatus(inferStatus(column));
        response.setTasks(
                column.getTasks().stream()
                        .map(taskMapper::toResponse)
                        .collect(Collectors.toList())
        );
        return response;
    }

    private com.taskmanager.entity.TaskStatus inferStatus(KanbanColumn column) {
        if (column.getLinkedStatus() != null) return column.getLinkedStatus();
        return switch (column.getPosition()) {
            case 0 -> com.taskmanager.entity.TaskStatus.TODO;
            case 1 -> com.taskmanager.entity.TaskStatus.IN_PROGRESS;
            default -> com.taskmanager.entity.TaskStatus.DONE;
        };
    }

    public KanbanColumn toEntity(ColumnRequest request) {
        return KanbanColumn.builder()
                .title(request.getTitle())
                .position(request.getPosition())
                .build();
    }
}
