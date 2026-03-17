package com.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ColumnRequest {

    @NotBlank
    @Size(max = 100)
    private String title;

    private int position;
}
