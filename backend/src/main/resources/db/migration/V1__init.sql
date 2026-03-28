-- ── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id         BIGSERIAL    PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       VARCHAR(20)  NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    avatar_url TEXT
);

-- ── Projects ────────────────────────────────────────────────────────────────
CREATE TABLE projects (
    id          BIGSERIAL    PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    owner_id    BIGINT       NOT NULL REFERENCES users(id),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ── Kanban columns ──────────────────────────────────────────────────────────
CREATE TABLE kanban_columns (
    id            BIGSERIAL    PRIMARY KEY,
    title         VARCHAR(100) NOT NULL,
    position      INT          NOT NULL,
    linked_status VARCHAR(20),
    project_id    BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE
);

-- ── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
    id          BIGSERIAL    PRIMARY KEY,
    title       VARCHAR(100) NOT NULL,
    description TEXT,
    status      VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    priority    VARCHAR(255) NOT NULL DEFAULT 'MEDIUM',
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    due_date    DATE,
    project_id  BIGINT       NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by  BIGINT       REFERENCES users(id),
    column_id   BIGINT       REFERENCES kanban_columns(id) ON DELETE SET NULL
);

CREATE TABLE task_assigned_members (
    task_id     BIGINT       NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    member_name VARCHAR(100)
);

-- ── Project members ──────────────────────────────────────────────────────────
CREATE TABLE project_members (
    id         BIGSERIAL PRIMARY KEY,
    project_id BIGINT    NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id    BIGINT    NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL DEFAULT 'VIEWER',
    UNIQUE (project_id, user_id)
);

-- ── Activities ───────────────────────────────────────────────────────────────
CREATE TABLE activities (
    id         BIGSERIAL   PRIMARY KEY,
    task_id    BIGINT      NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id    BIGINT      NOT NULL REFERENCES users(id),
    type       VARCHAR(30) NOT NULL,
    detail     TEXT,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- ── Password reset tokens ────────────────────────────────────────────────────
CREATE TABLE password_reset_tokens (
    id         BIGSERIAL    PRIMARY KEY,
    token      VARCHAR(255) NOT NULL UNIQUE,
    user_id    BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP    NOT NULL,
    used       BOOLEAN      NOT NULL DEFAULT FALSE
);

-- ── Notifications ────────────────────────────────────────────────────────────
CREATE TABLE notifications (
    id           BIGSERIAL    PRIMARY KEY,
    recipient_id BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message      VARCHAR(255) NOT NULL,
    is_read      BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    task_id      BIGINT
);

-- ── Pending invitations ──────────────────────────────────────────────────────
CREATE TABLE pending_invitations (
    id         BIGSERIAL    PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    task_id    BIGINT,
    project_id BIGINT,
    invited_by BIGINT       REFERENCES users(id) ON DELETE SET NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    accepted   BOOLEAN      NOT NULL DEFAULT FALSE
);
