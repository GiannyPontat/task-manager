package com.taskmanager.service;

import com.taskmanager.dto.ActivityResponse;
import com.taskmanager.dto.CommentRequest;
import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Activity;
import com.taskmanager.entity.ActivityType;
import com.taskmanager.entity.KanbanColumn;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.mapper.ActivityMapper;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.ActivityRepository;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;
    private final ActivityRepository activityRepository;
    private final TaskMapper taskMapper;
    private final ActivityMapper activityMapper;

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
        Task saved = taskRepository.save(task);
        recordActivity(saved, user, ActivityType.TASK_CREATED, null);
        return taskMapper.toResponse(saved);
    }

    public TaskResponse updateTask(User user, Long id, TaskRequest request) {
        Task task = findTaskOwnedBy(user, id);
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.setAssignedMember(request.getAssignedMember());
        task.setColumn(resolveColumn(user, request.getColumnId()));
        Task saved = taskRepository.save(task);
        recordActivity(saved, user, ActivityType.TASK_UPDATED, null);
        return taskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities(User user, Long taskId) {
        findTaskOwnedBy(user, taskId);
        return activityRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(activityMapper::toResponse).toList();
    }

    @Transactional
    public ActivityResponse addComment(User user, Long taskId, CommentRequest request) {
        Task task = findTaskOwnedBy(user, taskId);
        return activityMapper.toResponse(recordActivity(task, user, ActivityType.COMMENT_ADDED, request.getText()));
    }

    private Activity recordActivity(Task task, User user, ActivityType type, String detail) {
        return activityRepository.save(Activity.builder()
                .task(task).user(user).type(type).detail(detail).build());
    }

    @Transactional
    public void deleteTask(User user, Long id) {
        Task task = findTaskOwnedBy(user, id);
        activityRepository.deleteByTaskId(id);
        taskRepository.delete(task);
    }

    public TaskResponse moveTask(User user, Long taskId, MoveTaskRequest request) {
        Task task = findTaskOwnedBy(user, taskId);
        task.setColumn(resolveColumn(user, request.getColumnId()));
        if (request.getStatus() != null) task.setStatus(request.getStatus());
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
