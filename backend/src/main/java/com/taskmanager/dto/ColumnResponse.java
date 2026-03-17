package com.taskmanager.dto;

import lombok.Data;

import java.util.List;

@Data
public class ColumnResponse {
    private Long id;
    private String title;
    private int position;
    private List<TaskResponse> tasks;
}
