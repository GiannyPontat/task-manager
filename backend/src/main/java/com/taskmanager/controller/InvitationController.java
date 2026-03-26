package com.taskmanager.controller;

import com.taskmanager.dto.InvitationRequest;
import com.taskmanager.entity.User;
import com.taskmanager.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Invitations", description = "Invitation d'utilisateurs (inscrits ou non) à rejoindre un projet")
@RestController
@RequestMapping("/api/invitations")
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> invite(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody InvitationRequest request) {

        boolean invited = invitationService.invite(request.getEmail(), request.getTaskId(), request.getProjectId(), currentUser);

        if (!invited) {
            return ResponseEntity.ok(Map.of(
                    "status", "already_registered",
                    "message", "Cet utilisateur est déjà inscrit."
            ));
        }
        return ResponseEntity.ok(Map.of(
                "status", "invited",
                "message", "Invitation envoyée à " + request.getEmail()
        ));
    }
}
