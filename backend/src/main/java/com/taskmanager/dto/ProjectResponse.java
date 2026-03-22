package com.taskmanager.dto;

import com.taskmanager.entity.ProjectRole;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ProjectResponse {
    private Long id;
    private String name;
    private String description;
    private String ownerName;
    private ProjectRole currentUserRole;
    private int memberCount;
    private LocalDateTime createdAt;
    private List<ProjectMemberResponse> members;
}
