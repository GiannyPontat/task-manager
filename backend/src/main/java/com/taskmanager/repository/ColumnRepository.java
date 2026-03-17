package com.taskmanager.repository;

import com.taskmanager.entity.KanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ColumnRepository extends JpaRepository<KanbanColumn, Long> {
    List<KanbanColumn> findByUserIdOrderByPositionAsc(Long userId);
    long countByUserId(Long userId);
}
