# Task Manager - Spring Boot + Angular

## Description
Application web full-stack permettant aux utilisateurs de gérer leurs tâches (type mini Trello / Todo manager).

Le projet est conçu pour démontrer des compétences recherchées chez un développeur Java junior :

- API REST avec Spring Boot
- Sécurité avec JWT
- Base de données relationnelle
- Frontend Angular
- Architecture propre

---

# Rule

1. Toujours répondre en ≤ 10 lignes sauf demande explicite.


# MCP Gemini Design

**Gemini is your frontend developer.** For all UI/design work, use this MCP. Tool descriptions contain all necessary instructions.

## Before writing any UI code, ask yourself:

- Is it a NEW visual component (popup, card, section, etc.)? → `snippet_frontend` or `create_frontend`
- Is it a REDESIGN of an existing element? → `modify_frontend`
- Is it just text/logic, or a trivial change? → Do it yourself

## Critical rules:

1. **If UI already exists and you need to redesign/restyle it** → use `modify_frontend`, NOT snippet_frontend.

2. **Tasks can be mixed** (logic + UI). Mentally separate them. Do the logic yourself, delegate the UI to Gemini.

# Stack technique

## Backend
- Java 17
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- PostgreSQL
- Maven

## Frontend
- Angular
- TypeScript
- Angular Material

## DevOps
- Docker
- Docker Compose

---

# Fonctionnalités

## Authentification

- Inscription utilisateur
- Connexion
- Authentification JWT
- Gestion des rôles (USER / ADMIN)

## Gestion des tâches

- Créer une tâche
- Modifier une tâche
- Supprimer une tâche
- Marquer une tâche comme terminée
- Filtrer les tâches

## Dashboard

- Liste des tâches
- Filtrage par statut
- Pagination

---

# Architecture Backend

```
controller
service
repository
entity
dto
mapper
security
config
```

## Explication

- **Controller** : expose les endpoints REST
- **Service** : logique métier
- **Repository** : accès base de données
- **DTO** : objets échangés avec l'API
- **Mapper** : conversion Entity <-> DTO
- **Security** : configuration JWT

---

# Modèle de données

## User

```
id
username
email
password
role
created_at
```

## Task

```
id
title
description
status
created_at
user_id
```

---

# API Endpoints

## Auth

```
POST /api/auth/register
POST /api/auth/login
```

## Tasks

```
GET /api/tasks
GET /api/tasks/{id}
POST /api/tasks
PUT /api/tasks/{id}
DELETE /api/tasks/{id}
```

---

# Installation

## Backend

```
git clone https://github.com/username/task-manager
cd backend
mvn spring-boot:run
```

## Frontend

```
cd frontend
npm install
ng serve
```

---

# Docker

```
docker-compose up --build
```

---

# Tests

Tests unitaires avec :

- JUnit
- Mockito

Commande :

```
mvn test
```

---

# Améliorations possibles

- Notifications email
- Upload de fichiers
- Drag & Drop style Kanban
- WebSockets pour mise à jour en temps réel

---

# Auteur

Projet réalisé pour portfolio développeur Java junior.

