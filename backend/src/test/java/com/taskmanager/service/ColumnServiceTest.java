package com.taskmanager.service;

import com.taskmanager.dto.ColumnPositionUpdate;
import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.*;
import com.taskmanager.mapper.ColumnMapper;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.ProjectRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ColumnServiceTest {

    @Mock private ColumnRepository columnRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private ColumnMapper columnMapper;
    @Mock private ProjectSecurityService security;

    @InjectMocks private ColumnService columnService;

    private User alice;
    private Project project;
    private KanbanColumn column;
    private ColumnResponse columnResponse;

    private static final Long PROJECT_ID = 1L;
    private static final Long COLUMN_ID  = 5L;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("alice@test.com").role(Role.USER).build();

        project = Project.builder().id(PROJECT_ID).name("My Project").owner(alice).members(new ArrayList<>()).build();

        column = new KanbanColumn();
        column.setId(COLUMN_ID);
        column.setTitle("À faire");
        column.setPosition(0);
        column.setProject(project);

        columnResponse = new ColumnResponse();
        columnResponse.setId(COLUMN_ID);
        columnResponse.setTitle("À faire");
    }

    // ── getColumns ────────────────────────────────────────────────────────────

    @Test
    void getColumns_member_returnsOrderedList() {
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.VIEWER);
        when(columnRepository.findByProjectIdOrderByPositionAsc(PROJECT_ID)).thenReturn(List.of(column));
        when(columnMapper.toResponse(column)).thenReturn(columnResponse);

        List<ColumnResponse> result = columnService.getColumns(alice, PROJECT_ID);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("À faire");
    }

    @Test
    void getColumns_nonMember_throwsAccessDeniedException() {
        when(security.getRole(alice, PROJECT_ID)).thenThrow(new AccessDeniedException("not a member"));

        assertThatThrownBy(() -> columnService.getColumns(alice, PROJECT_ID))
                .isInstanceOf(AccessDeniedException.class);
        verify(columnRepository, never()).findByProjectIdOrderByPositionAsc(any());
    }

    // ── createColumn ──────────────────────────────────────────────────────────

    @Test
    void createColumn_adminRole_savesAndReturnsColumn() {
        ColumnRequest request = new ColumnRequest();
        request.setTitle("New Column");
        request.setPosition(3);

        KanbanColumn entity = new KanbanColumn();
        entity.setTitle("New Column");
        KanbanColumn saved = new KanbanColumn();
        saved.setId(6L); saved.setTitle("New Column"); saved.setProject(project);
        ColumnResponse response = new ColumnResponse(); response.setId(6L);

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(columnMapper.toEntity(request)).thenReturn(entity);
        when(columnRepository.save(entity)).thenReturn(saved);
        when(columnMapper.toResponse(saved)).thenReturn(response);

        ColumnResponse result = columnService.createColumn(alice, PROJECT_ID, request);

        assertThat(result.getId()).isEqualTo(6L);
        assertThat(entity.getProject()).isEqualTo(project);
        verify(columnRepository).save(entity);
    }

    @Test
    void createColumn_insufficientRole_throwsAccessDeniedException() {
        ColumnRequest request = new ColumnRequest();
        request.setTitle("Hack");
        doThrow(new AccessDeniedException("no permission"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN, ProjectRole.EDITOR);

        assertThatThrownBy(() -> columnService.createColumn(alice, PROJECT_ID, request))
                .isInstanceOf(AccessDeniedException.class);
        verify(columnRepository, never()).save(any());
    }

    @Test
    void createColumn_projectNotFound_throwsEntityNotFoundException() {
        ColumnRequest request = new ColumnRequest();
        request.setTitle("Missing project");
        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> columnService.createColumn(alice, PROJECT_ID, request))
                .isInstanceOf(EntityNotFoundException.class);
    }

    // ── updateColumn ──────────────────────────────────────────────────────────

    @Test
    void updateColumn_adminRole_updatesFields() {
        ColumnRequest request = new ColumnRequest();
        request.setTitle("Renamed");
        request.setPosition(2);

        when(columnRepository.findById(COLUMN_ID)).thenReturn(Optional.of(column));
        when(columnRepository.save(column)).thenReturn(column);
        when(columnMapper.toResponse(column)).thenReturn(columnResponse);

        columnService.updateColumn(alice, PROJECT_ID, COLUMN_ID, request);

        assertThat(column.getTitle()).isEqualTo("Renamed");
        assertThat(column.getPosition()).isEqualTo(2);
        verify(columnRepository).save(column);
    }

    @Test
    void updateColumn_columnFromOtherProject_throwsAccessDeniedException() {
        Project otherProject = Project.builder().id(99L).name("Other").owner(alice).members(new ArrayList<>()).build();
        KanbanColumn foreignColumn = new KanbanColumn();
        foreignColumn.setId(COLUMN_ID);
        foreignColumn.setProject(otherProject);

        when(columnRepository.findById(COLUMN_ID)).thenReturn(Optional.of(foreignColumn));

        ColumnRequest request = new ColumnRequest();
        request.setTitle("Attempt");

        assertThatThrownBy(() -> columnService.updateColumn(alice, PROJECT_ID, COLUMN_ID, request))
                .isInstanceOf(AccessDeniedException.class);
    }

    // ── deleteColumn ──────────────────────────────────────────────────────────

    @Test
    void deleteColumn_adminRole_deletesColumn() {
        when(columnRepository.findById(COLUMN_ID)).thenReturn(Optional.of(column));

        columnService.deleteColumn(alice, PROJECT_ID, COLUMN_ID);

        verify(columnRepository).delete(column);
    }

    @Test
    void deleteColumn_columnNotFound_throwsEntityNotFoundException() {
        when(columnRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> columnService.deleteColumn(alice, PROJECT_ID, 99L))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void deleteColumn_insufficientRole_throwsAccessDeniedException() {
        doThrow(new AccessDeniedException("no permission"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN);

        assertThatThrownBy(() -> columnService.deleteColumn(alice, PROJECT_ID, COLUMN_ID))
                .isInstanceOf(AccessDeniedException.class);
        verify(columnRepository, never()).delete(any());
    }

    // ── reorderColumns ────────────────────────────────────────────────────────

    @Test
    void reorderColumns_updatesPositions() {
        KanbanColumn col2 = new KanbanColumn(); col2.setId(6L); col2.setProject(project); col2.setPosition(1);
        ColumnPositionUpdate u1 = new ColumnPositionUpdate(); u1.setId(COLUMN_ID); u1.setPosition(1);
        ColumnPositionUpdate u2 = new ColumnPositionUpdate(); u2.setId(6L); u2.setPosition(0);

        when(columnRepository.findById(COLUMN_ID)).thenReturn(Optional.of(column));
        when(columnRepository.findById(6L)).thenReturn(Optional.of(col2));

        columnService.reorderColumns(alice, PROJECT_ID, List.of(u1, u2));

        assertThat(column.getPosition()).isEqualTo(1);
        assertThat(col2.getPosition()).isEqualTo(0);
        verify(columnRepository, times(2)).save(any(KanbanColumn.class));
    }

    // ── initDefaultColumns ────────────────────────────────────────────────────

    @Test
    void initDefaultColumns_createsThreeColumns() {
        when(columnRepository.countByProjectId(PROJECT_ID)).thenReturn(0L, 1L, 2L);
        when(columnRepository.save(any(KanbanColumn.class))).thenAnswer(inv -> inv.getArgument(0));

        columnService.initDefaultColumns(project);

        verify(columnRepository, times(3)).save(any(KanbanColumn.class));
    }
}
