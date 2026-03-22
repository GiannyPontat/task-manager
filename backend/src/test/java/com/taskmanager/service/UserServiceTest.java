package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.UserProfileRequest;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.User;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private JwtService jwtService;

    @InjectMocks private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@test.com")
                .password("encoded")
                .role(Role.USER)
                .build();
    }

    // ── updateUserProfile ─────────────────────────────────────────────────────

    @Test
    void updateUserProfile_sameUsername_updatesAndReturnsToken() {
        UserProfileRequest request = new UserProfileRequest();
        request.setUsername("alice"); // same username, no conflict check needed

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(userRepository.save(user)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("new-jwt-token");

        AuthResponse response = userService.updateUserProfile("alice@test.com", request);

        assertThat(response.getToken()).isEqualTo("new-jwt-token");
        assertThat(response.getUsername()).isEqualTo("alice");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        verify(userRepository).save(user);
    }

    @Test
    void updateUserProfile_newUsername_notTaken_updatesSuccessfully() {
        UserProfileRequest request = new UserProfileRequest();
        request.setUsername("alice_new");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("alice_new")).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("new-jwt-token");

        AuthResponse response = userService.updateUserProfile("alice@test.com", request);

        assertThat(user.getDisplayName()).isEqualTo("alice_new");
        assertThat(response.getToken()).isEqualTo("new-jwt-token");
    }

    @Test
    void updateUserProfile_newUsername_alreadyTaken_throwsIllegalArgumentException() {
        UserProfileRequest request = new UserProfileRequest();
        request.setUsername("bob");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("bob")).thenReturn(true);

        assertThatThrownBy(() -> userService.updateUserProfile("alice@test.com", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("déjà pris");

        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUserProfile_userNotFound_throwsIllegalArgumentException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        UserProfileRequest request = new UserProfileRequest();
        request.setUsername("anyone");

        assertThatThrownBy(() -> userService.updateUserProfile("unknown@test.com", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("introuvable");
    }

    @Test
    void updateUserProfile_generatesNewJwtWithUpdatedUser() {
        UserProfileRequest request = new UserProfileRequest();
        request.setUsername("alice_v2");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByUsername("alice_v2")).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("updated-token");

        AuthResponse response = userService.updateUserProfile("alice@test.com", request);

        // JWT must be generated AFTER username update, so it reflects the new state
        verify(jwtService).generateToken(argThat(u -> ((User) u).getDisplayName().equals("alice_v2")));
        assertThat(response.getToken()).isEqualTo("updated-token");
    }
}
