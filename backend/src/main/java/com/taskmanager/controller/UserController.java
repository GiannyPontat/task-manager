package com.taskmanager.controller;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.UserProfileRequest;
import com.taskmanager.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PatchMapping("/me")
    public ResponseEntity<AuthResponse> updateProfile(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UserProfileRequest request) {
        AuthResponse response = userService.updateUserProfile(principal.getUsername(), request);
        return ResponseEntity.ok(response);
    }
}
