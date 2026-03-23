package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.dto.TaskResponse;
import com.taskmanager.entity.*;
import com.taskmanager.security.JwtService;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TaskControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JwtService jwtService;

    @MockBean private TaskService taskService;
    @MockBean private UserDetailsService userDetailsService;

    private User user;
    private String validToken;
    private TaskResponse sampleResponse;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .username("alice")
                .email("alice@test.com")
                .password("encoded")
                .role(Role.USER)
                .build();

        // JwtAuthFilter loads user by email (= getUsername()) — mock the lookup
        when(userDetailsService.loadUserByUsername("alice@test.com")).thenReturn(user);

        validToken = "Bearer " + jwtService.generateToken(user);

        sampleResponse = new TaskResponse();
        sampleResponse.setId(1L);
        sampleResponse.setTitle("Test Task");
        sampleResponse.setStatus(TaskStatus.TODO);
        sampleResponse.setPriority(Priority.LOW);
        sampleResponse.setCreatedAt(LocalDateTime.now());
    }

    // ── Security: unauthenticated requests must return 401 ────────────────────

    @Test
    void getTasks_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/projects/1/tasks"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getTask_noToken_returns401() throws Exception {
        mockMvc.perform(get("/api/projects/1/tasks/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createTask_noToken_returns401() throws Exception {
        mockMvc.perform(post("/api/projects/1/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"hack\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void updateTask_noToken_returns401() throws Exception {
        mockMvc.perform(put("/api/projects/1/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"hack\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void deleteTask_noToken_returns401() throws Exception {
        mockMvc.perform(delete("/api/projects/1/tasks/1"))
                .andExpect(status().isUnauthorized());
    }

    // ── GET /api/projects/{projectId}/tasks ───────────────────────────────────

    @Test
    void getTasks_withValidToken_returns200() throws Exception {
        when(taskService.getTasks(any(User.class), eq(1L), isNull(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleResponse)));

        mockMvc.perform(get("/api/projects/1/tasks").header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Test Task"));
    }

    @Test
    void getTasks_withStatusFilter_returns200() throws Exception {
        when(taskService.getTasks(any(User.class), eq(1L), eq(TaskStatus.TODO), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(sampleResponse)));

        mockMvc.perform(get("/api/projects/1/tasks?status=TODO").header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    // ── GET /api/projects/{projectId}/tasks/{id} ──────────────────────────────

    @Test
    void getTask_withValidToken_returns200() throws Exception {
        when(taskService.getTask(any(User.class), eq(1L), eq(1L))).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/projects/1/tasks/1").header("Authorization", validToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    // ── POST /api/projects/{projectId}/tasks ──────────────────────────────────

    @Test
    void createTask_withValidToken_returns201() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("New Task");

        when(taskService.createTask(any(User.class), eq(1L), any(TaskRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(post("/api/projects/1/tasks")
                        .header("Authorization", validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void createTask_missingTitle_returns400() throws Exception {
        TaskRequest request = new TaskRequest(); // title blank → @NotBlank

        mockMvc.perform(post("/api/projects/1/tasks")
                        .header("Authorization", validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ── PUT /api/projects/{projectId}/tasks/{id} ──────────────────────────────

    @Test
    void updateTask_withValidToken_returns200() throws Exception {
        TaskRequest request = new TaskRequest();
        request.setTitle("Updated Task");

        when(taskService.updateTask(any(User.class), eq(1L), eq(1L), any(TaskRequest.class)))
                .thenReturn(sampleResponse);

        mockMvc.perform(put("/api/projects/1/tasks/1")
                        .header("Authorization", validToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    // ── DELETE /api/projects/{projectId}/tasks/{id} ───────────────────────────

    @Test
    void deleteTask_withValidToken_returns204() throws Exception {
        mockMvc.perform(delete("/api/projects/1/tasks/1").header("Authorization", validToken))
                .andExpect(status().isNoContent());
    }
}
