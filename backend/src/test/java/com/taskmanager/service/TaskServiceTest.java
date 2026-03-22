package com.taskmanager.service;

import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ColumnRepository columnRepository;
    @Mock private TaskMapper taskMapper;

    @InjectMocks private TaskService taskService;

    private User owner;
    private User otherUser;
    private Task task;
    private TaskResponse taskResponse;

    @BeforeEach
    void setUp() {
        owner = User.builder().id(1L).username("alice").email("alice@test.com")
                .role(Role.USER).build();
        otherUser = User.builder().id(2L).username("bob").email("bob@test.com")
                .role(Role.USER).build();

        task = Task.builder()
                .id(10L).title("My Task").status(TaskStatus.TODO)
                .priority(Priority.LOW).user(owner).createdAt(LocalDateTime.now())
                .build();

        taskResponse = new TaskResponse();
        taskResponse.setId(10L);
        taskResponse.setTitle("My Task");
        taskResponse.setStatus(TaskStatus.TODO);
    }

    // ── getTasks ──────────────────────────────────────────────────────────────

    @Test
    void getTasks_noFilter_returnsAllUserTasks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> page = new PageImpl<>(List.of(task));
        when(taskRepository.findByUserId(owner.getId(), pageable)).thenReturn(page);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        Page<TaskResponse> result = taskService.getTasks(owner, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("My Task");
    }

    @Test
    void getTasks_withStatusFilter_returnsFilteredTasks() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Task> page = new PageImpl<>(List.of(task));
        when(taskRepository.findByUserIdAndStatus(owner.getId(), TaskStatus.TODO, pageable)).thenReturn(page);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        Page<TaskResponse> result = taskService.getTasks(owner, TaskStatus.TODO, pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(taskRepository).findByUserIdAndStatus(owner.getId(), TaskStatus.TODO, pageable);
        verify(taskRepository, never()).findByUserId(any(), any());
    }

    // ── getTask ───────────────────────────────────────────────────────────────

    @Test
    void getTask_ownerAccess_returnsTask() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse result = taskService.getTask(owner, 10L);

        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    void getTask_notFound_throwsEntityNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(owner, 99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Task not found");
    }

    @Test
    void getTask_otherUserAccess_throwsAccessDeniedException() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.getTask(otherUser, 10L))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── createTask ────────────────────────────────────────────────────────────

    @Test
    void createTask_noColumn_savesAndReturnsTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");

        Task entity = Task.builder().title("New Task").status(TaskStatus.TODO).priority(Priority.LOW).build();
        Task saved  = Task.builder().id(11L).title("New Task").status(TaskStatus.TODO)
                .priority(Priority.LOW).user(owner).createdAt(LocalDateTime.now()).build();
        TaskResponse response = new TaskResponse();
        response.setId(11L);

        when(taskMapper.toEntity(request)).thenReturn(entity);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);
        when(taskMapper.toResponse(saved)).thenReturn(response);

        TaskResponse result = taskService.createTask(owner, request);

        assertThat(result.getId()).isEqualTo(11L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_columnNotFound_throwsEntityNotFoundException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Task with column");
        request.setColumnId(99L);

        Task entity = Task.builder().title("Task with column").build();
        when(taskMapper.toEntity(request)).thenReturn(entity);
        when(columnRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(owner, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Column not found");
    }

    @Test
    void createTask_columnBelongsToOtherUser_throwsAccessDeniedException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Task");
        request.setColumnId(5L);

        KanbanColumn column = new KanbanColumn();
        column.setId(5L);
        column.setUser(otherUser);

        Task entity = Task.builder().title("Task").build();
        when(taskMapper.toEntity(request)).thenReturn(entity);
        when(columnRepository.findById(5L)).thenReturn(Optional.of(column));

        assertThatThrownBy(() -> taskService.createTask(owner, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── updateTask ────────────────────────────────────────────────────────────

    @Test
    void updateTask_validRequest_updatesFields() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Updated");
        request.setDescription("New desc");
        request.setStatus(TaskStatus.IN_PROGRESS);
        request.setPriority(Priority.HIGH);

        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        taskService.updateTask(owner, 10L, request);

        assertThat(task.getTitle()).isEqualTo("Updated");
        assertThat(task.getDescription()).isEqualTo("New desc");
        assertThat(task.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(task.getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void updateTask_otherUser_throwsAccessDeniedException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Hacked");
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.updateTask(otherUser, 10L, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── deleteTask ────────────────────────────────────────────────────────────

    @Test
    void deleteTask_owner_deletesSuccessfully() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        taskService.deleteTask(owner, 10L);

        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTask_notFound_throwsEntityNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(owner, 99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteTask_otherUser_throwsAccessDeniedException() {
        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));

        assertThatThrownBy(() -> taskService.deleteTask(otherUser, 10L))
                .isInstanceOf(AccessDeniedException.class);
        verify(taskRepository, never()).delete(any());
    }

    // ── moveTask ──────────────────────────────────────────────────────────────

    @Test
    void moveTask_validColumn_updatesColumn() {
        KanbanColumn targetColumn = new KanbanColumn();
        targetColumn.setId(3L);
        targetColumn.setUser(owner);

        MoveTaskRequest request = new MoveTaskRequest();
        request.setColumnId(3L);

        when(taskRepository.findById(10L)).thenReturn(Optional.of(task));
        when(columnRepository.findById(3L)).thenReturn(Optional.of(targetColumn));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        taskService.moveTask(owner, 10L, request);

        assertThat(task.getColumn()).isEqualTo(targetColumn);
        verify(taskRepository).save(task);
    }
}
