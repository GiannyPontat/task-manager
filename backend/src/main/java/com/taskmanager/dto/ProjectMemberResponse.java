package com.taskmanager.dto;

import com.taskmanager.entity.ProjectRole;
import lombok.Data;

@Data
public class ProjectMemberResponse {
    private Long userId;
    private String username;
    private String email;
    private ProjectRole role;
    private String avatarUrl;
}
