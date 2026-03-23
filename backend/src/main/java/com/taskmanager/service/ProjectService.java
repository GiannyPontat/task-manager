package com.taskmanager.service;

import com.taskmanager.dto.ProjectMemberRequest;
import com.taskmanager.dto.ProjectMemberResponse;
import com.taskmanager.dto.ProjectRequest;
import com.taskmanager.dto.ProjectResponse;
import com.taskmanager.entity.Project;
import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.ProjectRole;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ActivityRepository;
import com.taskmanager.repository.ColumnRepository;
import com.taskmanager.repository.ProjectMemberRepository;
import com.taskmanager.repository.ProjectRepository;
import com.taskmanager.repository.TaskRepository;
import com.taskmanager.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ProjectSecurityService security;
    private final ColumnService columnService;
    private final ActivityRepository activityRepository;
    private final TaskRepository taskRepository;
    private final ColumnRepository columnRepository;

    @Transactional
    public ProjectResponse createProject(User owner, ProjectRequest request) {
        Project project = projectRepository.save(Project.builder()
                .name(request.getName())
                .owner(owner)
                .build());

        memberRepository.save(ProjectMember.builder()
                .project(project)
                .user(owner)
                .role(ProjectRole.ADMIN)
                .build());

        columnService.initDefaultColumns(project);
        return toResponse(project, ProjectRole.ADMIN);
    }

    public List<ProjectResponse> getProjects(User user) {
        return projectRepository.findByMemberUserId(user.getId()).stream()
                .map(p -> toResponse(p, security.getRole(user, p.getId())))
                .toList();
    }

    public ProjectResponse getProject(User user, Long id) {
        Project project = findProject(id);
        ProjectRole role = security.getRole(user, id);
        return toResponseWithMembers(project, role);
    }

    @Transactional
    public ProjectResponse updateProject(User user, Long id, ProjectRequest request) {
        security.requireRole(user, id, ProjectRole.ADMIN);
        Project project = findProject(id);
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        projectRepository.save(project);
        return toResponseWithMembers(project, ProjectRole.ADMIN);
    }

    @Transactional
    public void deleteProject(User user, Long id) {
        security.requireRole(user, id, ProjectRole.ADMIN);
        activityRepository.deleteByTaskProjectId(id);
        taskRepository.deleteByProjectId(id);
        columnRepository.deleteByProjectId(id);
        projectRepository.deleteById(id);
    }

    @Transactional
    public ProjectMemberResponse addMember(User user, Long projectId, ProjectMemberRequest request) {
        security.requireRole(user, projectId, ProjectRole.ADMIN);
        Project project = findProject(projectId);
        User target = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Utilisateur introuvable : " + request.getEmail()));

        if (memberRepository.existsByProjectIdAndUserId(projectId, target.getId())) {
            throw new IllegalArgumentException("Cet utilisateur est déjà membre du projet");
        }

        ProjectMember member = memberRepository.save(ProjectMember.builder()
                .project(project)
                .user(target)
                .role(request.getRole())
                .build());

        return toMemberResponse(member);
    }

    @Transactional
    public ProjectMemberResponse changeMemberRole(User user, Long projectId, Long userId, ProjectRole role) {
        security.requireRole(user, projectId, ProjectRole.ADMIN);
        ProjectMember member = memberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Membre introuvable"));
        if (member.getRole() == ProjectRole.ADMIN && role != ProjectRole.ADMIN) {
            long adminCount = memberRepository.countByProjectIdAndRole(projectId, ProjectRole.ADMIN);
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Impossible de retirer le dernier administrateur du projet");
            }
        }
        member.setRole(role);
        return toMemberResponse(memberRepository.save(member));
    }

    @Transactional
    public void removeMember(User user, Long projectId, Long userId) {
        security.requireRole(user, projectId, ProjectRole.ADMIN);
        if (user.getId().equals(userId)) throw new IllegalArgumentException("Vous ne pouvez pas vous retirer vous-même");
        memberRepository.deleteByProjectIdAndUserId(projectId, userId);
    }

    // ── Mappers ──────────────────────────────────────────────────────────────

    private ProjectResponse toResponse(Project p, ProjectRole role) {
        ProjectResponse r = new ProjectResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setDescription(p.getDescription());
        r.setOwnerName(p.getOwner().getDisplayName());
        r.setCurrentUserRole(role);
        r.setMemberCount(p.getMembers().size());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }

    private ProjectResponse toResponseWithMembers(Project p, ProjectRole role) {
        ProjectResponse r = toResponse(p, role);
        r.setMembers(p.getMembers().stream().map(this::toMemberResponse).toList());
        return r;
    }

    private ProjectMemberResponse toMemberResponse(ProjectMember m) {
        ProjectMemberResponse r = new ProjectMemberResponse();
        r.setUserId(m.getUser().getId());
        r.setUsername(m.getUser().getDisplayName());
        r.setEmail(m.getUser().getEmail());
        r.setRole(m.getRole());
        return r;
    }

    private Project findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable : " + id));
    }
}
