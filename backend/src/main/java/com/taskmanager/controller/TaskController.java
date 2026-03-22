package com.taskmanager.controller;

import com.taskmanager.dto.ActivityResponse;
import com.taskmanager.dto.CommentRequest;
import com.taskmanager.dto.MoveTaskRequest;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.TaskStatus;
import com.taskmanager.entity.User;
import com.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping
    public ResponseEntity<Page<TaskResponse>> getTasks(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @PageableDefault(size = 50, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(taskService.getTasks(user, projectId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTask(user, projectId, id));
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request) {
        TaskResponse created = taskService.createTask(user, projectId, request);
        return ResponseEntity.created(URI.create("/api/projects/" + projectId + "/tasks/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(user, projectId, id, request));
    }

    @PatchMapping("/{id}/move")
    public ResponseEntity<TaskResponse> moveTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @RequestBody MoveTaskRequest request) {
        return ResponseEntity.ok(taskService.moveTask(user, projectId, id, request));
    }

    @GetMapping("/{id}/activities")
    public ResponseEntity<List<ActivityResponse>> getActivities(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        return ResponseEntity.ok(taskService.getActivities(user, projectId, id));
    }

    @PostMapping("/{id}/activities")
    public ResponseEntity<ActivityResponse> addComment(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(taskService.addComment(user, projectId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        taskService.deleteTask(user, projectId, id);
        return ResponseEntity.noContent().build();
    }
}
