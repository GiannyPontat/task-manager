package com.taskmanager.repository;

import com.taskmanager.entity.PendingInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PendingInvitationRepository extends JpaRepository<PendingInvitation, Long> {
    List<PendingInvitation> findByEmailAndAcceptedFalse(String email);
    Optional<PendingInvitation> findByToken(String token);
    boolean existsByEmailAndTaskId(String email, Long taskId);
    boolean existsByEmailAndProjectId(String email, Long projectId);
}
