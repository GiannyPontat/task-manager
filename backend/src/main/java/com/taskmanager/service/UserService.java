package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.UserProfileRequest;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse updateUserProfile(String email, UserProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (!user.getDisplayName().equals(request.getUsername())
                && userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Ce nom d'utilisateur est déjà pris");
        }

        user.setUsername(request.getUsername());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getDisplayName(), user.getEmail(), user.getRole().name());
    }
}
