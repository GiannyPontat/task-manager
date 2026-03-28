package com.taskmanager.config;

import com.taskmanager.entity.*;
import com.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository          userRepository;
    private final ProjectRepository       projectRepository;
    private final ProjectMemberRepository memberRepository;
    private final ColumnRepository        columnRepository;
    private final TaskRepository          taskRepository;
    private final ActivityRepository      activityRepository;
    private final PasswordEncoder         passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByEmail("demo@taskmanager.com").isPresent()) {
            log.info("DataInitializer — compte demo déjà présent, initialisation ignorée.");
            return;
        }

        try {
            seed();
        } catch (Exception e) {
            log.error("DataInitializer — échec de l'initialisation : {}", e.getMessage(), e);
        }
    }

    private void seed() {
        log.info("DataInitializer — création des données de démonstration...");

        // ── 1. Utilisateurs ──────────────────────────────────────────────────
        User demo = userRepository.save(User.builder()
                .username("Demo User")
                .email("demo@taskmanager.com")
                .password(passwordEncoder.encode("demo123"))
                .role(Role.ADMIN)
                .build());

        User thomas = userRepository.save(User.builder()
                .username("Thomas Lefebvre")
                .email("thomas@taskmanager.com")
                .password(passwordEncoder.encode("thomas123"))
                .role(Role.USER)
                .build());

        User clara = userRepository.save(User.builder()
                .username("Clara Martinez")
                .email("clara@taskmanager.com")
                .password(passwordEncoder.encode("clara123"))
                .role(Role.USER)
                .build());

        // ── 2. Projet ─────────────────────────────────────────────────────────
        Project project = projectRepository.save(Project.builder()
                .name("Refonte Application Mobile")
                .description("Refonte complète de l'application mobile pour améliorer l'UX et les performances.")
                .owner(demo)
                .build());

        // ── 3. Membres du projet ───────────────────────────────────────────────
        memberRepository.save(ProjectMember.builder()
                .project(project).user(demo).role(ProjectRole.ADMIN).build());
        memberRepository.save(ProjectMember.builder()
                .project(project).user(thomas).role(ProjectRole.EDITOR).build());
        memberRepository.save(ProjectMember.builder()
                .project(project).user(clara).role(ProjectRole.VIEWER).build());

        // ── 4. Colonnes Kanban ─────────────────────────────────────────────────
        KanbanColumn colTodo = columnRepository.save(KanbanColumn.builder()
                .title("À faire")
                .position(0)
                .linkedStatus(TaskStatus.TODO)
                .project(project)
                .build());

        KanbanColumn colInProgress = columnRepository.save(KanbanColumn.builder()
                .title("En cours")
                .position(1)
                .linkedStatus(TaskStatus.IN_PROGRESS)
                .project(project)
                .build());

        KanbanColumn colDone = columnRepository.save(KanbanColumn.builder()
                .title("Terminé")
                .position(2)
                .linkedStatus(TaskStatus.DONE)
                .project(project)
                .build());

        // ── 5. Tâches ─────────────────────────────────────────────────────────
        Task taskServer = taskRepository.save(Task.builder()
                .title("Configuration du serveur de production")
                .description("Configurer Nginx, SSL et les variables d'environnement pour le déploiement.")
                .status(TaskStatus.TODO)
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().plusDays(7))
                .assignedMembers(List.of("Thomas Lefebvre"))
                .project(project)
                .createdBy(demo)
                .column(colTodo)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build());

        Task taskDesign = taskRepository.save(Task.builder()
                .title("Design des maquettes UI")
                .description("Créer les wireframes et maquettes haute-fidélité pour les écrans principaux.")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().plusDays(3))
                .assignedMembers(List.of("Clara Martinez"))
                .project(project)
                .createdBy(demo)
                .column(colInProgress)
                .createdAt(LocalDateTime.now().minusDays(5))
                .build());

        Task taskApi = taskRepository.save(Task.builder()
                .title("Tests des endpoints API")
                .description("Rédiger et exécuter les tests d'intégration pour tous les endpoints REST.")
                .status(TaskStatus.IN_PROGRESS)
                .priority(Priority.MEDIUM)
                .dueDate(LocalDate.now().plusDays(5))
                .assignedMembers(List.of("Thomas Lefebvre", "Demo User"))
                .project(project)
                .createdBy(demo)
                .column(colInProgress)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build());

        Task taskAuth = taskRepository.save(Task.builder()
                .title("Implémentation de l'authentification JWT")
                .description("Mise en place de l'authentification JWT avec refresh token et gestion des rôles.")
                .status(TaskStatus.DONE)
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().minusDays(2))
                .assignedMembers(List.of("Demo User"))
                .project(project)
                .createdBy(demo)
                .column(colDone)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build());

        Task taskDb = taskRepository.save(Task.builder()
                .title("Modélisation de la base de données")
                .description("Conception du schéma relationnel et mise en place des migrations Flyway.")
                .status(TaskStatus.DONE)
                .priority(Priority.MEDIUM)
                .assignedMembers(List.of("Demo User", "Thomas Lefebvre"))
                .project(project)
                .createdBy(demo)
                .column(colDone)
                .createdAt(LocalDateTime.now().minusDays(15))
                .build());

        // ── 6. Activités ──────────────────────────────────────────────────────
        activityRepository.save(Activity.builder()
                .task(taskAuth).user(demo)
                .type(ActivityType.TASK_CREATED)
                .detail("a créé la tâche")
                .createdAt(LocalDateTime.now().minusDays(10))
                .build());

        activityRepository.save(Activity.builder()
                .task(taskAuth).user(thomas)
                .type(ActivityType.TASK_UPDATED)
                .detail("a changé le statut de 'En cours' → 'Terminé'")
                .createdAt(LocalDateTime.now().minusDays(3))
                .build());

        activityRepository.save(Activity.builder()
                .task(taskDesign).user(clara)
                .type(ActivityType.COMMENT_ADDED)
                .detail("Les maquettes sont prêtes dans Figma !")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());

        activityRepository.save(Activity.builder()
                .task(taskApi).user(thomas)
                .type(ActivityType.TASK_UPDATED)
                .detail("a changé le statut de 'À faire' → 'En cours'")
                .createdAt(LocalDateTime.now().minusHours(6))
                .build());

        activityRepository.save(Activity.builder()
                .task(taskServer).user(demo)
                .type(ActivityType.TASK_CREATED)
                .detail("a créé la tâche et assigné Thomas Lefebvre")
                .createdAt(LocalDateTime.now().minusDays(2))
                .build());

        log.info("DataInitializer — données de démonstration créées avec succès ✓");
        log.info("  → demo@taskmanager.com     / demo123");
        log.info("  → thomas@taskmanager.com   / thomas123");
        log.info("  → clara@taskmanager.com    / clara123");
    }
}
