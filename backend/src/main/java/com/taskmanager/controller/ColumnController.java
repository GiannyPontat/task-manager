package com.taskmanager.controller;

import com.taskmanager.dto.ColumnPositionUpdate;
import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.User;
import com.taskmanager.service.ColumnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@Tag(name = "Colonnes Kanban", description = "Gestion et réorganisation des colonnes d'un projet")
@RestController
@RequestMapping("/api/projects/{projectId}/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @GetMapping
    public ResponseEntity<List<ColumnResponse>> getColumns(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId) {
        return ResponseEntity.ok(columnService.getColumns(user, projectId));
    }

    @PostMapping
    public ResponseEntity<ColumnResponse> createColumn(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @Valid @RequestBody ColumnRequest request) {
        ColumnResponse created = columnService.createColumn(user, projectId, request);
        return ResponseEntity.created(URI.create("/api/projects/" + projectId + "/columns/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ColumnResponse> updateColumn(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id,
            @Valid @RequestBody ColumnRequest request) {
        return ResponseEntity.ok(columnService.updateColumn(user, projectId, id, request));
    }

    @PatchMapping("/reorder")
    public ResponseEntity<Void> reorderColumns(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @RequestBody List<ColumnPositionUpdate> updates) {
        columnService.reorderColumns(user, projectId, updates);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColumn(
            @AuthenticationPrincipal User user,
            @PathVariable Long projectId,
            @PathVariable Long id) {
        columnService.deleteColumn(user, projectId, id);
        return ResponseEntity.noContent().build();
    }
}
