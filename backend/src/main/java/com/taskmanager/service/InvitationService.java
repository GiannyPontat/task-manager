package com.taskmanager.service;

import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class InvitationService {

    private final PendingInvitationRepository invitationRepository;
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    /**
     * Crée une invitation si l'email n'existe pas en base.
     * Retourne true si une invitation a été créée, false si l'utilisateur existe déjà.
     */
    @Transactional
    public boolean invite(String email, Long taskId, Long projectId, User invitedBy) {
        if (userRepository.findByEmail(email).isPresent()) {
            return false; // utilisateur déjà inscrit
        }
        if (taskId != null && invitationRepository.existsByEmailAndTaskId(email, taskId)) {
            return true; // invitation déjà envoyée pour cette tâche
        }
        if (projectId != null && invitationRepository.existsByEmailAndProjectId(email, projectId)) {
            return true; // invitation déjà envoyée pour ce projet
        }

        String token = UUID.randomUUID().toString();
        invitationRepository.save(PendingInvitation.builder()
                .email(email)
                .taskId(taskId)
                .projectId(projectId)
                .invitedBy(invitedBy)
                .token(token)
                .accepted(false)
                .build());

        String taskTitle = resolveTaskTitle(taskId);
        emailService.sendInvitationEmail(email, invitedBy.getDisplayName(), taskTitle, token);
        return true;
    }

    /**
     * Appelé après l'inscription : lie le nouvel utilisateur à toutes ses tâches en attente.
     */
    @Transactional
    public void acceptPendingInvitations(User newUser) {
        var pending = invitationRepository.findByEmailAndAcceptedFalse(newUser.getEmail());
        for (PendingInvitation inv : pending) {
            if (inv.getTaskId() != null) {
                taskRepository.findById(inv.getTaskId()).ifPresent(task -> {
                    if (!task.getAssignedMembers().contains(newUser.getDisplayName())) {
                        task.getAssignedMembers().add(newUser.getDisplayName());
                        taskRepository.save(task);
                    }
                });
            }
            if (inv.getProjectId() != null) {
                projectRepository.findById(inv.getProjectId()).ifPresent(project -> {
                    if (!projectMemberRepository.existsByProjectIdAndUserId(inv.getProjectId(), newUser.getId())) {
                        projectMemberRepository.save(ProjectMember.builder()
                                .project(project)
                                .user(newUser)
                                .role(ProjectRole.EDITOR)
                                .build());
                    }
                });
            }
            inv.setAccepted(true);
            invitationRepository.save(inv);
        }
    }

    private String resolveTaskTitle(Long taskId) {
        if (taskId == null) return null;
        return taskRepository.findById(taskId).map(Task::getTitle).orElse(null);
    }
}
