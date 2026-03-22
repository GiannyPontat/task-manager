package com.taskmanager.dto;

import com.taskmanager.entity.ProjectRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProjectMemberRequest {
    @NotBlank @Email
    private String email;

    @NotNull
    private ProjectRole role;
}
