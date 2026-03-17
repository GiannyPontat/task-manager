package com.taskmanager.controller;

import com.taskmanager.dto.ColumnRequest;
import com.taskmanager.dto.ColumnResponse;
import com.taskmanager.entity.User;
import java.util.List;
import com.taskmanager.service.ColumnService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/columns")
@RequiredArgsConstructor
public class ColumnController {

    private final ColumnService columnService;

    @GetMapping
    public ResponseEntity<List<ColumnResponse>> getColumns(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(columnService.getColumns(user));
    }

    @PostMapping("/init")
    public ResponseEntity<List<ColumnResponse>> initColumns(@AuthenticationPrincipal User user) {
        columnService.initDefaultColumns(user);
        return ResponseEntity.ok(columnService.getColumns(user));
    }

    @PostMapping
    public ResponseEntity<ColumnResponse> createColumn(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ColumnRequest request
    ) {
        ColumnResponse created = columnService.createColumn(user, request);
        return ResponseEntity.created(URI.create("/api/columns/" + created.getId())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ColumnResponse> updateColumn(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody ColumnRequest request
    ) {
        return ResponseEntity.ok(columnService.updateColumn(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteColumn(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        columnService.deleteColumn(user, id);
        return ResponseEntity.noContent().build();
    }
}
