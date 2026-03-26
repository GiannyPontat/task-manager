# Task Manager

Application web full-stack de gestion de tâches style Kanban, réalisée pour portfolio développeur Java junior.

## Stack technique

| Couche | Technologies |
|--------|-------------|
| Backend | Java 17, Spring Boot 3, Spring Security, JWT |
| Base de données | PostgreSQL 16, Spring Data JPA / Hibernate |
| Frontend | Angular 17, Angular Material, TypeScript |
| DevOps | Docker, Docker Compose, Nginx |

## Fonctionnalités

- **Authentification** — inscription, connexion JWT, mot de passe oublié par email
- **Projets** — création, paramétrage, gestion des membres (PROJECT_ADMIN / MEMBER)
- **Kanban** — colonnes personnalisables, drag & drop des tâches et colonnes
- **Tâches** — titre, description, priorité (LOW / MEDIUM / HIGH), assignation, statut
- **Invitations** — inviter un utilisateur existant ou non-inscrit par email
- **Notifications** — système de notifications in-app
- **Calendrier** — vue calendrier des tâches (FullCalendar)
- **Thème** — mode clair / sombre avec design tokens CSS
- **Rôles** — USER / ADMIN au niveau applicatif

## Architecture backend

```
controller/   → endpoints REST
service/      → logique métier
repository/   → accès base de données (Spring Data JPA)
entity/       → modèles JPA
dto/          → objets échangés avec l'API
mapper/       → conversions Entity ↔ DTO
security/     → filtre JWT, configuration Spring Security
config/       → beans applicatifs
```

## API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Projets
```
GET    /api/projects
POST   /api/projects
PUT    /api/projects/{id}
DELETE /api/projects/{id}
GET    /api/projects/{id}/members
POST   /api/projects/{id}/members
DELETE /api/projects/{id}/members/{userId}
```

### Tâches
```
GET    /api/tasks?projectId=
POST   /api/tasks
PUT    /api/tasks/{id}
DELETE /api/tasks/{id}
POST   /api/tasks/{id}/move
```

### Colonnes Kanban
```
GET    /api/columns?projectId=
POST   /api/columns
PUT    /api/columns/{id}
DELETE /api/columns/{id}
PUT    /api/columns/reorder
```

### Autres
```
GET    /api/notifications
PUT    /api/notifications/{id}/read
GET    /api/users/me
PUT    /api/users/me
POST   /api/invitations
```

## Lancer avec Docker (recommandé)

```bash
docker-compose up --build
```

- Frontend      : http://localhost:4200
- Backend       : http://localhost:8080
- Swagger UI    : http://localhost:8080/swagger-ui.html

### Variables d'environnement (optionnel)

Créer un fichier `.env` à la racine :

```env
DB_USERNAME=taskmanager
DB_PASSWORD=taskmanager
```

## Lancer en développement

### Prérequis
- Java 17+
- Maven 3.8+
- Node 20+, npm
- PostgreSQL 16 (ou via Docker : `docker-compose up postgres`)

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
ng serve
```

## Tests

```bash
# Backend (JUnit + Mockito)
cd backend
mvn test

# Frontend E2E (Cypress)
cd frontend
npx cypress open
```

## Captures d'écran

> *(à ajouter)*

## Auteur

Projet réalisé pour portfolio développeur Java junior.
