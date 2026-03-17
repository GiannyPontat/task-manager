package com.taskmanager.service;

import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.KanbanColumn;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final TaskMapper taskMapper;

    public Page<TaskResponse> getTasks(User user, TaskStatus status, Pageable pageable) {
        Page<Task> tasks = (status != null)
                ? taskRepository.findByUserIdAndStatus(user.getId(), status, pageable)
                : taskRepository.findByUserId(user.getId(), pageable);
        return tasks.map(taskMapper::toResponse);
    }

    public TaskResponse getTask(User user, Long id) {
        Task task = findTaskOwnedBy(user, id);
        return taskMapper.toResponse(task);
    }

    public TaskResponse createTask(User user, TaskRequest request) {
        Task task = taskMapper.toEntity(request);
        task.setUser(user);
        task.setColumn(resolveColumn(user, request.getColumnId()));
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public TaskResponse updateTask(User user, Long id, TaskRequest request) {
        Task task = findTaskOwnedBy(user, id);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setColumn(resolveColumn(user, request.getColumnId()));
        return taskMapper.toResponse(taskRepository.save(task));
    }

    public void deleteTask(User user, Long id) {
        Task task = findTaskOwnedBy(user, id);
        taskRepository.delete(task);
    }

    public TaskResponse moveTask(User user, Long taskId, MoveTaskRequest request) {
        Task task = findTaskOwnedBy(user, taskId);
        task.setColumn(resolveColumn(user, request.getColumnId()));
        return taskMapper.toResponse(taskRepository.save(task));
    }

    private KanbanColumn resolveColumn(User user, Long columnId) {
        if (columnId == null) return null;
        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + columnId));
        if (!column.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return column;
    }

    private Task findTaskOwnedBy(User user, Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Task not found: " + id));
        if (!task.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Access denied");
        }
        return task;
    }
}
