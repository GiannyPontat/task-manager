package com.taskmanager.service;

import com.taskmanager.dto.ActivityResponse;
import com.taskmanager.dto.CommentRequest;
import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.Activity;
import com.taskmanager.entity.ActivityType;
import com.taskmanager.entity.KanbanColumn;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectRole;
import com.taskmanager.entity.Task;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.mapper.ActivityMapper;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.ActivityRepository;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.NotificationRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
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
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjectSecurityService security;
    private final TaskMapper taskMapper;
    private final ActivityMapper activityMapper;

    public Page<TaskResponse> getTasks(User user, Long projectId, TaskStatus status, Pageable pageable) {
        security.getRole(user, projectId); // vérifie membership
        Page<Task> tasks = (status != null)
                ? taskRepository.findByProjectIdAndStatus(projectId, status, pageable)
                : taskRepository.findByProjectId(projectId, pageable);
        return tasks.map(taskMapper::toResponse);
    }

    public TaskResponse getTask(User user, Long projectId, Long id) {
        Task task = findTaskInProject(projectId, id);
        security.getRole(user, projectId);
        return taskMapper.toResponse(task);
    }

    public TaskResponse createTask(User user, Long projectId, TaskRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable"));
        Task task = taskMapper.toEntity(request);
        task.setProject(project);
        task.setCreatedBy(user);
        task.setColumn(resolveColumn(projectId, request.getColumnId()));
        Task saved = taskRepository.save(task);
        recordActivity(saved, user, ActivityType.TASK_CREATED, null);
        return taskMapper.toResponse(saved);
    }

    public TaskResponse updateTask(User user, Long projectId, Long id, TaskRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        Task task = findTaskInProject(projectId, id);

        List<String> previousMembers = List.copyOf(task.getAssignedMembers());
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        task.setDueDate(request.getDueDate());
        task.getAssignedMembers().clear();
        if (request.getAssignedMembers() != null) task.getAssignedMembers().addAll(request.getAssignedMembers());
        task.setColumn(resolveColumn(projectId, request.getColumnId()));

        Task saved = taskRepository.save(task);
        recordActivity(saved, user, ActivityType.TASK_UPDATED, null);
        notifyNewAssignees(user, saved, previousMembers, saved.getAssignedMembers());
        return taskMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivities(User user, Long projectId, Long taskId) {
        security.getRole(user, projectId);
        findTaskInProject(projectId, taskId);
        return activityRepository.findByTaskIdOrderByCreatedAtAsc(taskId)
                .stream().map(activityMapper::toResponse).toList();
    }

    @Transactional
    public ActivityResponse addComment(User user, Long projectId, Long taskId, CommentRequest request) {
        security.getRole(user, projectId);
        Task task = findTaskInProject(projectId, taskId);
        return activityMapper.toResponse(recordActivity(task, user, ActivityType.COMMENT_ADDED, request.getText()));
    }

    @Transactional
    public void deleteTask(User user, Long projectId, Long id) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        Task task = findTaskInProject(projectId, id);
        activityRepository.deleteByTaskId(id);
        taskRepository.delete(task);
    }

    public TaskResponse moveTask(User user, Long projectId, Long taskId, MoveTaskRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN, ProjectRole.EDITOR);
        Task task = findTaskInProject(projectId, taskId);
        task.setColumn(resolveColumn(projectId, request.getColumnId()));
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        return taskMapper.toResponse(taskRepository.save(task));
    }

    private void notifyNewAssignees(User assigner, Task task, List<String> previous, List<String> current) {
        current.stream()
                .filter(name -> !previous.contains(name))
                .forEach(name -> userRepository.findByUsernameIgnoreCase(name).ifPresent(recipient -> {
                    if (!recipient.getId().equals(assigner.getId())) {
                        notificationService.createNotification(
                                recipient,
                                "L'utilisateur " + assigner.getDisplayName() + " vous a assigné la tâche : " + task.getTitle(),
                                task.getId()
                        );
                    }
                }));
    }

    private Activity recordActivity(Task task, User user, ActivityType type, String detail) {
        return activityRepository.save(Activity.builder()
                .task(task).user(user).type(type).detail(detail).build());
    }

    private KanbanColumn resolveColumn(Long projectId, Long columnId) {
        if (columnId == null) return null;
        KanbanColumn column = columnRepository.findById(columnId)
                .orElseThrow(() -> new EntityNotFoundException("Column not found: " + columnId));
        if (!column.getProject().getId().equals(projectId)) {
            throw new AccessDeniedException("Column does not belong to this project");
        }
        return column;
    }

    private Task findTaskInProject(Long projectId, Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + taskId));
        if (!task.getProject().getId().equals(projectId)) {
            throw new AccessDeniedException("Task does not belong to this project");
        }
        return task;
    }
}
