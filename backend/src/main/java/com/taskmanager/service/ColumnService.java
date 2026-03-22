package com.taskmanager.service;

import com.taskmanager.dto.ColumnPositionUpdate;
import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.KanbanColumn;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectRole;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.mapper.ColumnMapper;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final ProjectRepository projectRepository;
    private final ColumnMapper columnMapper;
    private final ProjectSecurityService security;

    public List<ColumnResponse> getColumns(User user, Long projectId) {
        security.getRole(user, projectId);
        return columnRepository.findByProjectIdOrderByPositionAsc(projectId)
                .stream()
                .map(columnMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ColumnResponse createColumn(User user, Long projectId, ColumnRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        Project project = findProject(projectId);
        KanbanColumn column = columnMapper.toEntity(request);
        column.setProject(project);
        return columnMapper.toResponse(columnRepository.save(column));
    }

    public ColumnResponse updateColumn(User user, Long projectId, Long id, ColumnRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        KanbanColumn column = findColumnInProject(projectId, id);
        column.setTitle(request.getTitle());
        column.setPosition(request.getPosition());
        return columnMapper.toResponse(columnRepository.save(column));
    }

    public void initDefaultColumns(Project project) {
        var defaults = List.of(
            Map.entry("À faire",  TaskStatus.TODO),
            Map.entry("En cours", TaskStatus.IN_PROGRESS),
            Map.entry("Terminé",  TaskStatus.DONE)
        );
        defaults.forEach(entry -> {
            int pos = (int) columnRepository.countByProjectId(project.getId());
            columnRepository.save(KanbanColumn.builder()
                    .title(entry.getKey())
                    .position(pos)
                    .linkedStatus(entry.getValue())
                    .project(project)
                    .build());
        });
    }

    @Transactional
    public void reorderColumns(User user, Long projectId, List<ColumnPositionUpdate> updates) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        updates.forEach(update -> {
            KanbanColumn column = findColumnInProject(projectId, update.getId());
            column.setPosition(update.getPosition());
            columnRepository.save(column);
        });
    }

    public void deleteColumn(User user, Long projectId, Long id) {
        security.requireRole(user, projectId, ProjectRole.ADMIN);
        columnRepository.delete(findColumnInProject(projectId, id));
    }

    private KanbanColumn findColumnInProject(Long projectId, Long id) {
        KanbanColumn column = columnRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + id));
        if (!column.getProject().getId().equals(projectId)) {
            throw new AccessDeniedException("Column does not belong to this project");
        }
        return column;
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Project not found: " + id));
    }
}
