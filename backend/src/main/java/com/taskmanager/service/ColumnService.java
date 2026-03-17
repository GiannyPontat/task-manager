package com.taskmanager.service;

import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.KanbanColumn;
import com.taskmanager.entity.User;
import com.taskmanager.mapper.ColumnMapper;
import com.taskmanager.repository.ColumnRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColumnService {

    private final ColumnRepository columnRepository;
    private final ColumnMapper columnMapper;

    public List<ColumnResponse> getColumns(User user) {
        return columnRepository.findByUserIdOrderByPositionAsc(user.getId())
                .stream()
                .map(columnMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ColumnResponse createColumn(User user, ColumnRequest request) {
        KanbanColumn column = columnMapper.toEntity(request);
        column.setUser(user);
        return columnMapper.toResponse(columnRepository.save(column));
    }

    public ColumnResponse updateColumn(User user, Long id, ColumnRequest request) {
        KanbanColumn column = findColumnOwnedBy(user, id);
        column.setTitle(request.getTitle());
        column.setPosition(request.getPosition());
        return columnMapper.toResponse(columnRepository.save(column));
    }

    public void initDefaultColumns(User user) {
        if (!columnRepository.findByUserIdOrderByPositionAsc(user.getId()).isEmpty()) return;
        List.of("À faire", "En cours", "Terminé").forEach((title) -> {
            int pos = (int) columnRepository.countByUserId(user.getId());
            KanbanColumn col = KanbanColumn.builder()
                    .title(title)
                    .position(pos)
                    .user(user)
                    .build();
            columnRepository.save(col);
        });
    }

    public void deleteColumn(User user, Long id) {
        KanbanColumn column = findColumnOwnedBy(user, id);
        columnRepository.delete(column);
    }

    private KanbanColumn findColumnOwnedBy(User user, Long id) {
        KanbanColumn column = columnRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + id));
        if (!column.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return column;
    }
}
