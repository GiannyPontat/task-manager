package com.taskmanager.dto;

import com.taskmanager.entity.TaskStatus;
import lombok.Data;

import java.util.List;

@Data
public class ColumnResponse {
    private Long id;
    private String title;
    private int position;
    private TaskStatus linkedStatus;
    private List<TaskResponse> tasks;
}
