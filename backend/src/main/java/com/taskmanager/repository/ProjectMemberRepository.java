package com.taskmanager.repository;

import com.taskmanager.entity.ProjectMember;
import com.taskmanager.entity.ProjectRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);
    boolean existsByProjectIdAndUserId(Long projectId, Long userId);
    void deleteByProjectIdAndUserId(Long projectId, Long userId);
    long countByProjectIdAndRole(Long projectId, ProjectRole role);
}
