package com.taskmanager.service;

import com.taskmanager.dto.ProjectMemberRequest;
import com.taskmanager.dto.ProjectMemberResponse;
import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.dto.ProjectResponse;
import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
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
class ProjectServiceTest {

    @Mock private ProjectRepository projectRepository;
    @Mock private ProjectMemberRepository memberRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectSecurityService security;
    @Mock private ColumnService columnService;
    @Mock private ActivityRepository activityRepository;
    @Mock private TaskRepository taskRepository;
    @Mock private ColumnRepository columnRepository;

    @InjectMocks private ProjectService projectService;

    private User alice;
    private User bob;
    private Project project;

    private static final Long PROJECT_ID = 1L;

    @BeforeEach
    void setUp() {
        alice = User.builder().id(1L).username("alice").email("alice@test.com").role(Role.USER).build();
        bob   = User.builder().id(2L).username("bob").email("bob@test.com").role(Role.USER).build();

        project = Project.builder()
                .id(PROJECT_ID).name("My Project").owner(alice)
                .members(new ArrayList<>())
                .build();
    }

    // ── createProject ─────────────────────────────────────────────────────────

    @Test
    void createProject_savesProjectAndAdminMemberAndDefaultColumns() {
        ProjectRequest request = new ProjectRequest();
        request.setName("New Project");

        Project saved = Project.builder().id(PROJECT_ID).name("New Project").owner(alice).members(new ArrayList<>()).build();
        when(projectRepository.save(any(Project.class))).thenReturn(saved);
        when(memberRepository.save(any(ProjectMember.class))).thenReturn(
                ProjectMember.builder().project(saved).user(alice).role(ProjectRole.ADMIN).build());

        ProjectResponse response = projectService.createProject(alice, request);

        assertThat(response.getName()).isEqualTo("New Project");
        assertThat(response.getCurrentUserRole()).isEqualTo(ProjectRole.ADMIN);
        verify(memberRepository).save(argThat(m -> m.getRole() == ProjectRole.ADMIN && m.getUser().equals(alice)));
        verify(columnService).initDefaultColumns(saved);
    }

    // ── getProjects ───────────────────────────────────────────────────────────

    @Test
    void getProjects_returnsMemberProjects() {
        when(projectRepository.findByMemberUserId(alice.getId())).thenReturn(List.of(project));
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.ADMIN);

        List<ProjectResponse> result = projectService.getProjects(alice);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("My Project");
    }

    @Test
    void getProjects_noProjects_returnsEmptyList() {
        when(projectRepository.findByMemberUserId(alice.getId())).thenReturn(List.of());

        List<ProjectResponse> result = projectService.getProjects(alice);

        assertThat(result).isEmpty();
    }

    // ── getProject ────────────────────────────────────────────────────────────

    @Test
    void getProject_member_returnsProjectWithMembers() {
        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(security.getRole(alice, PROJECT_ID)).thenReturn(ProjectRole.ADMIN);

        ProjectResponse result = projectService.getProject(alice, PROJECT_ID);

        assertThat(result.getId()).isEqualTo(PROJECT_ID);
        verify(security).getRole(alice, PROJECT_ID);
    }

    @Test
    void getProject_notFound_throwsEntityNotFoundException() {
        when(projectRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.getProject(alice, 99L))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Projet introuvable");
    }

    // ── updateProject ─────────────────────────────────────────────────────────

    @Test
    void updateProject_admin_updatesNameAndDescription() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Renamed");
        request.setDescription("New desc");

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(projectRepository.save(project)).thenReturn(project);

        ProjectResponse result = projectService.updateProject(alice, PROJECT_ID, request);

        assertThat(project.getName()).isEqualTo("Renamed");
        assertThat(project.getDescription()).isEqualTo("New desc");
        verify(projectRepository).save(project);
    }

    @Test
    void updateProject_nonAdmin_throwsAccessDeniedException() {
        ProjectRequest request = new ProjectRequest();
        request.setName("Hack");
        doThrow(new AccessDeniedException("not admin"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN);

        assertThatThrownBy(() -> projectService.updateProject(alice, PROJECT_ID, request))
                .isInstanceOf(AccessDeniedException.class);
        verify(projectRepository, never()).save(any());
    }

    // ── deleteProject ─────────────────────────────────────────────────────────

    @Test
    void deleteProject_admin_cascadesAndDeletes() {
        projectService.deleteProject(alice, PROJECT_ID);

        // order matters: activities → tasks → columns → project
        verify(activityRepository).deleteByTaskProjectId(PROJECT_ID);
        verify(taskRepository).deleteByProjectId(PROJECT_ID);
        verify(columnRepository).deleteByProjectId(PROJECT_ID);
        verify(projectRepository).deleteById(PROJECT_ID);
    }

    @Test
    void deleteProject_nonAdmin_throwsAccessDeniedException() {
        doThrow(new AccessDeniedException("not admin"))
                .when(security).requireRole(alice, PROJECT_ID, ProjectRole.ADMIN);

        assertThatThrownBy(() -> projectService.deleteProject(alice, PROJECT_ID))
                .isInstanceOf(AccessDeniedException.class);
        verify(projectRepository, never()).deleteById(any());
    }

    // ── addMember ─────────────────────────────────────────────────────────────

    @Test
    void addMember_admin_addsMemberSuccessfully() {
        ProjectMemberRequest request = new ProjectMemberRequest();
        request.setEmail("bob@test.com");
        request.setRole(ProjectRole.VIEWER);

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(bob));
        when(memberRepository.existsByProjectIdAndUserId(PROJECT_ID, bob.getId())).thenReturn(false);
        ProjectMember saved = ProjectMember.builder().project(project).user(bob).role(ProjectRole.VIEWER).build();
        when(memberRepository.save(any(ProjectMember.class))).thenReturn(saved);

        ProjectMemberResponse result = projectService.addMember(alice, PROJECT_ID, request);

        assertThat(result.getEmail()).isEqualTo("bob@test.com");
        assertThat(result.getRole()).isEqualTo(ProjectRole.VIEWER);
    }

    @Test
    void addMember_userNotFound_throwsEntityNotFoundException() {
        ProjectMemberRequest request = new ProjectMemberRequest();
        request.setEmail("unknown@test.com");
        request.setRole(ProjectRole.VIEWER);

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.addMember(alice, PROJECT_ID, request))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Utilisateur introuvable");
    }

    @Test
    void addMember_alreadyMember_throwsIllegalArgumentException() {
        ProjectMemberRequest request = new ProjectMemberRequest();
        request.setEmail("bob@test.com");
        request.setRole(ProjectRole.VIEWER);

        when(projectRepository.findById(PROJECT_ID)).thenReturn(Optional.of(project));
        when(userRepository.findByEmail("bob@test.com")).thenReturn(Optional.of(bob));
        when(memberRepository.existsByProjectIdAndUserId(PROJECT_ID, bob.getId())).thenReturn(true);

        assertThatThrownBy(() -> projectService.addMember(alice, PROJECT_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("déjà membre");
    }

    // ── removeMember ──────────────────────────────────────────────────────────

    @Test
    void removeMember_admin_deletesSuccessfully() {
        projectService.removeMember(alice, PROJECT_ID, bob.getId());

        verify(memberRepository).deleteByProjectIdAndUserId(PROJECT_ID, bob.getId());
    }

    @Test
    void removeMember_self_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> projectService.removeMember(alice, PROJECT_ID, alice.getId()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("vous-même");
        verify(memberRepository, never()).deleteByProjectIdAndUserId(any(), any());
    }

    // ── changeMemberRole ──────────────────────────────────────────────────────

    @Test
    void changeMemberRole_admin_updatesRole() {
        ProjectMember member = ProjectMember.builder().project(project).user(bob).role(ProjectRole.VIEWER).build();
        when(memberRepository.findByProjectIdAndUserId(PROJECT_ID, bob.getId())).thenReturn(Optional.of(member));
        when(memberRepository.save(member)).thenReturn(member);

        ProjectMemberResponse result = projectService.changeMemberRole(alice, PROJECT_ID, bob.getId(), ProjectRole.EDITOR);

        assertThat(member.getRole()).isEqualTo(ProjectRole.EDITOR);
        verify(memberRepository).save(member);
    }

    @Test
    void changeMemberRole_memberNotFound_throwsEntityNotFoundException() {
        when(memberRepository.findByProjectIdAndUserId(PROJECT_ID, 99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> projectService.changeMemberRole(alice, PROJECT_ID, 99L, ProjectRole.EDITOR))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("Membre introuvable");
    }
}
