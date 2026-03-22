package com.taskmanager.service;

import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.ProjectRole;
import com.taskmanager.entity.User;
import com.taskmanager.repository.ProjectMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectSecurityService {

    private final ProjectMemberRepository memberRepository;

    public ProjectRole getRole(User user, Long projectId) {
        return memberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .map(ProjectMember::getRole)
                .orElseThrow(() -> new AccessDeniedException("Vous n'êtes pas membre de ce projet"));
    }

    public void requireRole(User user, Long projectId, ProjectRole... allowed) {
        ProjectRole role = getRole(user, projectId);
        for (ProjectRole a : allowed) {
            if (role == a) return;
        }
        throw new AccessDeniedException("Permissions insuffisantes pour cette action");
    }

    public boolean isMember(User user, Long projectId) {
        return memberRepository.existsByProjectIdAndUserId(projectId, user.getId());
    }

    public Optional<ProjectRole> findRole(User user, Long projectId) {
        return memberRepository.findByProjectIdAndUserId(projectId, user.getId())
                .map(ProjectMember::getRole);
    }
}
