package com.taskmanager.service;

import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.mapper.ActivityMapper;
import com.taskmanager.mapper.TaskMapper;
import com.taskmanager.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ColumnRepository columnRepository;
    @Mock private ActivityRepository activityRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private ProjectSecurityService security;
    @Mock private TaskMapper taskMapper;
    @Mock private ActivityMapper activityMapper;

    @InjectMocks private TaskService taskService;

    private User alice;
    private Project project;
    private Task task;
    private TaskResponse taskResponse;

    private static final Long PROJECT_ID = 1L;
    private static final Long TASK_ID    = 10L;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("alice@test.com").role(Role.USER).build();

        project = Project.builder().id(PROJECT_ID).name("My Project").owner(alice).build();

        task = Task.builder()
                .id(TASK_ID).title("My Task").status(TaskStatus.TODO)
                .priority(Priority.LOW).project(project).createdAt(LocalDateTime.now())
                .assignedMembers(new java.util.ArrayList<>())
                .build();

        taskResponse = new TaskResponse();
        taskResponse.setId(TASK_ID);
        taskResponse.setTitle("My Task");
        taskResponse.setStatus(TaskStatus.TODO);
    }

    // ── getTasks ──────────────────────────────────────────────────────────────

    @Test
    void getTasks_noFilter_returnsPageOfTasks() {
        Pageable pageable = PageRequest.of(0, 10);
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.VIEWER);
        when(taskRepository.findByProjectId(PROJECT_ID, pageable)).thenReturn(new PageImpl<>(List.of(task)));
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        Page<TaskResponse> result = taskService.getTasks(alice, PROJECT_ID, null, pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("My Task");
    }

    @Test
    void getTasks_withStatusFilter_queriesFilteredRepository() {
        Pageable pageable = PageRequest.of(0, 10);
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.VIEWER);
        when(taskRepository.findByProjectIdAndStatus(PROJECT_ID, TaskStatus.TODO, pageable))
                .thenReturn(new PageImpl<>(List.of(task)));
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        taskService.getTasks(alice, PROJECT_ID, TaskStatus.TODO, pageable);

        verify(taskRepository).findByProjectIdAndStatus(PROJECT_ID, TaskStatus.TODO, pageable);
        verify(taskRepository, never()).findByProjectId(any(), any());
    }

    @Test
    void getTasks_nonMember_throwsAccessDeniedException() {
        Pageable pageable = PageRequest.of(0, 10);
        when(security.getRole(alice, PROJECT_ID)).thenThrow(new AccessDeniedException("not a member"));

        assertThatThrownBy(() -> taskService.getTasks(alice, PROJECT_ID, null, pageable))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── getTask ───────────────────────────────────────────────────────────────

    @Test
    void getTask_memberAccess_returnsTask() {
        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.VIEWER);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        TaskResponse result = taskService.getTask(alice, PROJECT_ID, TASK_ID);

        assertThat(result.getId()).isEqualTo(TASK_ID);
    }

    @Test
    void getTask_notFound_throwsEntityNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(alice, PROJECT_ID, 99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void getTask_taskBelongsToOtherProject_throwsAccessDeniedException() {
        Project otherProject = Project.builder().id(99L).name("Other").owner(alice).build();
        Task foreignTask = Task.builder().id(TASK_ID).project(otherProject).build();
        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(foreignTask));

        assertThatThrownBy(() -> taskService.getTask(alice, PROJECT_ID, TASK_ID))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── createTask ────────────────────────────────────────────────────────────

    @Test
    void createTask_adminRole_savesAndReturnsTask() {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");

        Task entity = Task.builder().title("New Task").build();
        Task saved  = Task.builder().id(11L).title("New Task").project(project).createdAt(LocalDateTime.now()).build();
        TaskResponse response = new TaskResponse(); response.setId(11L);

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(taskMapper.toEntity(request)).thenReturn(entity);
        when(taskRepository.save(any(Task.class))).thenReturn(saved);
        when(taskMapper.toResponse(saved)).thenReturn(response);
        when(activityRepository.save(any())).thenReturn(null);

        TaskResponse result = taskService.createTask(alice, PROJECT_ID, request);

        assertThat(result.getId()).isEqualTo(11L);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    void createTask_nonMember_throwsAccessDeniedException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Hack");
        doThrow(new AccessDeniedException("no permission"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN, ProjectRole.EDITOR);

        assertThatThrownBy(() -> taskService.createTask(alice, PROJECT_ID, request))
                .isInstanceOf(AccessDeniedException.class);
        verify(taskRepository, never()).save(any());
    }

    @Test
    void createTask_projectNotFound_throwsEntityNotFoundException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Task");
        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.createTask(alice, PROJECT_ID, request))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ── updateTask ────────────────────────────────────────────────────────────

    @Test
    void updateTask_validRequest_updatesFields() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Updated");
        request.setDescription("New desc");
        request.setStatus(TaskStatus.IN_PROGRESS);
        request.setPriority(Priority.HIGH);

        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);
        when(activityRepository.save(any())).thenReturn(null);

        taskService.updateTask(alice, PROJECT_ID, TASK_ID, request);

        assertThat(task.getTitle()).isEqualTo("Updated");
        assertThat(task.getDescription()).isEqualTo("New desc");
        assertThat(task.getStatus()).isEqualTo(TaskStatus.IN_PROGRESS);
        assertThat(task.getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    void updateTask_insufficientRole_throwsAccessDeniedException() {
        TaskRequest request = new TaskRequest();
        request.setTitle("Attempt");
        doThrow(new AccessDeniedException("no permission"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN, ProjectRole.EDITOR);

        assertThatThrownBy(() -> taskService.updateTask(alice, PROJECT_ID, TASK_ID, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── deleteTask ────────────────────────────────────────────────────────────

    @Test
    void deleteTask_adminRole_deletesSuccessfully() {
        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));

        taskService.deleteTask(alice, PROJECT_ID, TASK_ID);

        verify(taskRepository).delete(task);
    }

    @Test
    void deleteTask_notFound_throwsEntityNotFoundException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(alice, PROJECT_ID, 99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteTask_insufficientRole_throwsAccessDeniedException() {
        doThrow(new AccessDeniedException("no permission"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN, ProjectRole.EDITOR);

        assertThatThrownBy(() -> taskService.deleteTask(alice, PROJECT_ID, TASK_ID))
                .isInstanceOf(AccessDeniedException.class);
        verify(taskRepository, never()).delete(any());
    }

    // ── moveTask ──────────────────────────────────────────────────────────────

    @Test
    void moveTask_validColumn_updatesTaskColumn() {
        KanbanColumn target = new KanbanColumn();
        target.setId(3L);
        target.setProject(project);

        MoveTaskRequest request = new MoveTaskRequest();
        request.setColumnId(3L);

        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));
        when(columnRepository.findById(3L)).thenReturn(Optional.of(target));
        when(taskRepository.save(task)).thenReturn(task);
        when(taskMapper.toResponse(task)).thenReturn(taskResponse);

        taskService.moveTask(alice, PROJECT_ID, TASK_ID, request);

        assertThat(task.getColumn()).isEqualTo(target);
        verify(taskRepository).save(task);
    }

    @Test
    void moveTask_columnFromOtherProject_throwsAccessDeniedException() {
        Project otherProject = Project.builder().id(99L).name("Other").owner(alice).build();
        KanbanColumn foreignColumn = new KanbanColumn();
        foreignColumn.setId(3L);
        foreignColumn.setProject(otherProject);

        MoveTaskRequest request = new MoveTaskRequest();
        request.setColumnId(3L);

        when(taskRepository.findById(TASK_ID)).thenReturn(Optional.of(task));
        when(columnRepository.findById(3L)).thenReturn(Optional.of(foreignColumn));

        assertThatThrownBy(() -> taskService.moveTask(alice, PROJECT_ID, TASK_ID, request))
                .isInstanceOf(AccessDeniedException.class);
    }
}
