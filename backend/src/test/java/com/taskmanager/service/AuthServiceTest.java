package com.taskmanager.service;

import com.taskmanager.dto.AuthResponse;
import com.taskmanager.dto.ForgotPasswordRequest;
import com.taskmanager.dto.LoginRequest;
import com.taskmanager.dto.RegisterRequest;
import com.taskmanager.dto.ResetPasswordRequest;
import com.taskmanager.entity.PasswordResetToken;
import com.taskmanager.entity.Role;
import com.taskmanager.entity.User;
import com.taskmanager.repository.PasswordResetTokenRepository;
import com.taskmanager.repository.UserRepository;
import com.taskmanager.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private PasswordResetTokenRepository tokenRepository;
    @Mock private EmailService emailService;
    @Mock private InvitationService invitationService;

    @InjectMocks private AuthService authService;

    private User alice;

    @BeforeEach
    void setUp() {
        alice = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@test.com")
                .password("encoded-password")
                .role(Role.USER)
                .build();
    }

    // ── register ──────────────────────────────────────────────────────────────

    @Test
    void register_success_savesUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(alice);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        assertThat(response.getUsername()).isEqualTo("alice");
        verify(userRepository).save(any(User.class));
        verify(invitationService).acceptPendingInvitations(any(User.class));
    }

    @Test
    void register_emailAlreadyInUse_throwsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_usernameTaken_throwsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail("alice@test.com")).thenReturn(false);
        when(userRepository.existsByUsername("alice")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Username already taken");

        verify(userRepository, never()).save(any());
    }

    @Test
    void register_passwordIsEncodedBeforeSave() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@test.com");
        request.setPassword("plaintext");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(passwordEncoder.encode("plaintext")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(alice);
        when(jwtService.generateToken(any())).thenReturn("token");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getPassword()).isEqualTo("hashed");
    }

    @Test
    void register_newUserHasRoleUser() {
        RegisterRequest request = new RegisterRequest();
        request.setUsername("alice");
        request.setEmail("alice@test.com");
        request.setPassword("password123");

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.existsByUsername(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(alice);
        when(jwtService.generateToken(any())).thenReturn("token");

        authService.register(request);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(captor.capture());
        assertThat(captor.getValue().getRole()).isEqualTo(Role.USER);
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Test
    void login_validCredentials_returnsToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@test.com");
        request.setPassword("password123");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(jwtService.generateToken(alice)).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
        verify(authenticationManager).authenticate(
                argThat(auth -> auth instanceof UsernamePasswordAuthenticationToken
                        && auth.getPrincipal().equals("alice@test.com"))
        );
    }

    @Test
    void login_badCredentials_throwsBadCredentialsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("alice@test.com");
        request.setPassword("wrong");

        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any());

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BadCredentialsException.class);

        verify(userRepository, never()).findByEmail(any());
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_generatesNewToken() {
        when(jwtService.generateToken(alice)).thenReturn("refreshed-token");

        AuthResponse response = authService.refresh(alice);

        assertThat(response.getToken()).isEqualTo("refreshed-token");
        assertThat(response.getEmail()).isEqualTo("alice@test.com");
    }

    // ── forgotPassword ────────────────────────────────────────────────────────

    @Test
    void forgotPassword_existingUser_savesTokenAndSendsEmail() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("alice@test.com");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        authService.forgotPassword(request);

        verify(tokenRepository).deleteByUserId(alice.getId());
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("alice@test.com"), anyString());
    }

    @Test
    void forgotPassword_unknownEmail_doesNothingSilently() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@test.com");

        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // must not throw and must not send any email
        assertThatNoException().isThrownBy(() -> authService.forgotPassword(request));
        verify(emailService, never()).sendPasswordResetEmail(any(), any());
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void forgotPassword_tokenExpiresInOneHour() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("alice@test.com");

        when(userRepository.findByEmail("alice@test.com")).thenReturn(Optional.of(alice));
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        LocalDateTime before = LocalDateTime.now().plusHours(1).minusSeconds(5);
        authService.forgotPassword(request);
        LocalDateTime after = LocalDateTime.now().plusHours(1).plusSeconds(5);

        ArgumentCaptor<PasswordResetToken> captor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepository).save(captor.capture());
        assertThat(captor.getValue().getExpiresAt()).isBetween(before, after);
        assertThat(captor.getValue().isUsed()).isFalse();
    }

    // ── resetPassword ─────────────────────────────────────────────────────────

    @Test
    void resetPassword_validToken_updatesPasswordAndMarksUsed() {
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token("valid-token")
                .user(alice)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token");
        request.setNewPassword("new-password");

        when(tokenRepository.findByToken("valid-token")).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new");
        when(userRepository.save(alice)).thenReturn(alice);
        when(tokenRepository.save(resetToken)).thenReturn(resetToken);

        authService.resetPassword(request);

        assertThat(alice.getPassword()).isEqualTo("encoded-new");
        assertThat(resetToken.isUsed()).isTrue();
        verify(userRepository).save(alice);
        verify(tokenRepository).save(resetToken);
    }

    @Test
    void resetPassword_tokenNotFound_throwsIllegalArgumentException() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("ghost-token");
        request.setNewPassword("new-password");

        when(tokenRepository.findByToken("ghost-token")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalide ou expiré");

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_tokenAlreadyUsed_throwsIllegalArgumentException() {
        PasswordResetToken usedToken = PasswordResetToken.builder()
                .token("used-token")
                .user(alice)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(true)
                .build();

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("used-token");
        request.setNewPassword("new-password");

        when(tokenRepository.findByToken("used-token")).thenReturn(Optional.of(usedToken));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalide ou expiré");

        verify(userRepository, never()).save(any());
    }

    @Test
    void resetPassword_tokenExpired_throwsIllegalArgumentException() {
        PasswordResetToken expiredToken = PasswordResetToken.builder()
                .token("expired-token")
                .user(alice)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .used(false)
                .build();

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token");
        request.setNewPassword("new-password");

        when(tokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        assertThatThrownBy(() -> authService.resetPassword(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("invalide ou expiré");

        verify(userRepository, never()).save(any());
    }
}
