import { Component, OnInit, inject, Output, EventEmitter, computed, signal, effect } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { InvitationService } from '../../../core/services/invitation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { InviteDialogComponent } from './invite-dialog.component';
import { ProjectSettingsComponent } from '../../projects/project-settings/project-settings.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule, FormsModule,
    MatIconModule, MatButtonModule, MatRippleModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="sidebar-wrap">
      <div class="glass-panel">

        <!-- ── Sidebar Header (workspace + user) ── -->
        <div class="sidebar-header">
          <div class="workspace-label">
            <span class="workspace-logo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 12l2 2 4-4"/>
                <rect x="3" y="3" width="18" height="18" rx="4"/>
              </svg>
            </span>
            <span class="workspace-name">Flowly</span>
            <span class="workspace-badge">PRO</span>
          </div>
          <div class="profile-row">
            <div class="user-avatar">
              @if (authService.currentUser()?.avatarUrl) {
                <img class="avatar-img" [src]="authService.currentUser()!.avatarUrl!" alt="avatar" />
              } @else {
                {{ userInitials() }}
              }
              <span class="avatar-status"></span>
            </div>
            <div class="profile-info">
              <span class="profile-name">{{ authService.currentUser()?.username }}</span>
              <span class="profile-sub">{{ authService.currentUser()?.email }}</span>
            </div>
          </div>
        </div>

        <div class="divider"></div>

        <!-- Navigation -->
        <div class="section">
          <p class="section-label">Navigation</p>
          <nav class="nav-list">
            @for (item of navItems; track item.route) {
              <a
                class="nav-item"
                matRipple
                [routerLink]="item.route"
                routerLinkActive="active"
              >
                <span class="nav-indicator"></span>
                <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            }
          </nav>
        </div>

        <div class="divider"></div>

        <!-- ── Projets ── -->
        <div class="section projects-section">
          <div class="section-header-row">
            <p class="section-label">Projets</p>
            <button
              class="invite-btn"
              (click)="openCreateProject()"
              matTooltip="Nouveau projet"
              matTooltipPosition="right"
            >
              <mat-icon>add</mat-icon>
            </button>
          </div>

          <div class="nav-list">
            @for (project of projectService.projects(); track project.id) {
              <div
                class="nav-item project-item"
                matRipple
                [class.active]="projectService.selected()?.id === project.id"
                (click)="projectService.selectProject(project)"
              >
                <span class="nav-indicator"></span>
                <mat-icon class="nav-icon">folder</mat-icon>
                <span class="nav-label project-name-label">
                  <span class="project-name-text">{{ project.name }}</span>
                </span>
                <button class="project-action-btn" matTooltip="Paramètres" matTooltipPosition="right"
                        (click)="openSettings($event, project)">
                  <mat-icon>settings</mat-icon>
                </button>
              </div>
            }

            @if (creatingProject()) {
              <div class="inline-form">
                <input
                  class="inline-input"
                  type="text"
                  [(ngModel)]="newProjectName"
                  placeholder="Nom du projet…"
                  (keyup.enter)="submitProject()"
                  (keyup.escape)="creatingProject.set(false)"
                  autofocus
                />
                <div class="inline-actions">
                  <button class="action-btn check" (click)="submitProject()">
                    <mat-icon>check</mat-icon>
                  </button>
                  <button class="action-btn close-btn" (click)="creatingProject.set(false)">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="divider"></div>

        <!-- ── Membres du Projet ── -->
        @if (projectService.selected()) {
        <div class="section members-section">
          <div class="section-header-row">
            <p class="section-label">Membres du Projet</p>
            <button
              class="invite-btn"
              (click)="openInviteDialog()"
              matTooltip="Inviter un membre"
              matTooltipPosition="right"
            >
              <mat-icon>person_add</mat-icon>
            </button>
          </div>

          <div class="member-list">
            @for (m of projectService.selected()?.members ?? []; track m.userId) {
              <div class="member-row" [matTooltip]="m.username + ' · ' + m.role">
                <div class="member-avatar" [style.background]="memberAvatar(m) ? 'transparent' : memberColor(m.username)">
                  @if (memberAvatar(m)) {
                    <img class="avatar-img" [src]="memberAvatar(m)!" alt="avatar" />
                  } @else {
                    {{ memberInitials(m.username) }}
                  }
                </div>
                <div class="member-info">
                  <span class="member-name">{{ m.username }}</span>
                  @if (m.role === 'ADMIN') {
                    <span class="member-role-badge">Admin</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
        } <!-- end @if selected -->

        <div class="divider"></div>

        <!-- Filtres par priorité -->
        <div class="section">
          <p class="section-label">Priorité</p>
          <div class="filter-list">
            @for (f of filters; track f.label) {
              <button
                class="filter-item"
                matRipple
                [class.active]="activeFilter() === f.label"
                (click)="selectFilter(f.label)"
              >
                <span class="priority-dot"
                      [style.background]="f.color"
                      [style.box-shadow]="'0 0 8px ' + f.color + '99'"></span>
                <span class="filter-label">{{ f.label }}</span>
                @if (priorityCount(f.label) > 0) {
                  <span class="priority-count">{{ priorityCount(f.label) }}</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- ── Spacer ── -->
        <div class="spacer"></div>

        <div class="divider"></div>

        <!-- ── Theme toggle + Logout ── -->
        <div class="logout-section">
          <button class="theme-toggle-btn" matRipple (click)="themeService.toggle()"
                  [matTooltip]="themeService.theme() === 'dark' ? 'Mode clair' : 'Mode sombre'"
                  matTooltipPosition="right">
            <mat-icon class="logout-icon">{{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
            <span class="logout-label">{{ themeService.theme() === 'dark' ? 'Mode clair' : 'Mode sombre' }}</span>
          </button>
          <button
            class="logout-btn"
            matRipple
            (click)="authService.logout()"
          >
            <mat-icon class="logout-icon">logout</mat-icon>
            <span class="logout-label">Déconnexion</span>
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      font-family: 'Inter', -apple-system, system-ui, sans-serif;

      /* Palette Login (accent) */
      --orange:        #F87941;
      --orange-hover:  #EA580C;
      --salmon:        #F9B095;
      --orange-bg:     rgba(248,121,65,0.08);
      --orange-bg-2:   rgba(248,121,65,0.14);
      --orange-ring:   rgba(248,121,65,0.22);
      --orange-glow:   rgba(248,121,65,0.32);
      --gradient:      linear-gradient(135deg, #F87941 0%, #F9B095 100%);
    }

    .sidebar-wrap {
      width: 248px;
      height: 100vh;
      padding: 12px 10px;
      overflow: hidden;
    }

    /* ── Glass panel (SaaS premium) ── */
    .glass-panel {
      height: 100%;
      background: var(--bg-panel);
      backdrop-filter: blur(22px) saturate(180%);
      -webkit-backdrop-filter: blur(22px) saturate(180%);
      border: 1px solid var(--border-panel);
      border-radius: 22px;
      box-shadow: 0 12px 36px -12px rgba(15,23,42,0.10),
                  0 4px 12px -4px rgba(15,23,42,0.06),
                  inset 0 1px 0 rgba(255,255,255,0.5);
      display: flex;
      flex-direction: column;
      padding: 18px 12px;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
    }
    :host-context([data-theme="dark"]) .glass-panel {
      box-shadow: 0 12px 36px -12px rgba(0,0,0,0.5),
                  inset 0 1px 0 rgba(255,255,255,0.04);
    }

    .glass-panel::-webkit-scrollbar { display: none; }

    /* ── Sidebar Header ── */
    .sidebar-header {
      padding: 4px 8px 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .workspace-label {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .workspace-logo {
      width: 24px; height: 24px;
      border-radius: 7px;
      background: var(--gradient);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px var(--orange-glow);
      flex-shrink: 0;
    }

    .workspace-name {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      background: var(--gradient);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
      color: transparent;
    }

    .workspace-badge {
      font-size: 0.55rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      padding: 2px 6px;
      border-radius: 4px;
      background: var(--orange-bg-2);
      color: var(--orange);
      border: 1px solid var(--orange-ring);
      margin-left: auto;
    }

    /* ── Profile ── */
    .profile-row {
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 9px 9px;
      background: var(--bg-panel-hover);
      border: 1px solid var(--border-panel);
      border-radius: 12px;
      transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
    }
    .profile-row:hover {
      border-color: var(--orange-ring);
      box-shadow: 0 0 0 3px var(--orange-bg);
    }

    .avatar-img {
      display: block;
      width: 100%; height: 100%;
      min-width: 0; min-height: 0;
      object-fit: cover;
    }

    .user-avatar {
      position: relative;
      width: 34px; height: 34px; min-width: 34px;
      border-radius: 11px;
      overflow: visible;
      background: var(--gradient);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.02em;
      flex-shrink: 0;
      box-shadow: 0 4px 12px var(--orange-glow);
    }
    .user-avatar .avatar-img {
      border-radius: 11px;
    }
    .avatar-status {
      position: absolute;
      bottom: -2px; right: -2px;
      width: 11px; height: 11px;
      border-radius: 50%;
      background: #22C55E;
      border: 2px solid var(--bg-panel);
      box-shadow: 0 0 0 1px rgba(34,197,94,0.3);
    }

    .profile-info { display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
    .profile-name { font-size: 0.82rem; font-weight: 700; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: -0.01em; }
    .profile-sub  { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      margin: 6px 0;
      flex-shrink: 0;
    }

    /* ── Sections ── */
    .section { padding: 4px 0; }

    .section-label {
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 800;
      color: var(--text-muted);
      margin: 6px 0 8px 10px;
    }

    /* ── Nav ── */
    .nav-list { display: flex; flex-direction: column; gap: 2px; }

    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 11px;
      padding: 9px 12px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.83rem;
      font-weight: 500;
      border: 1px solid transparent;
      transition: background 0.2s, color 0.2s, transform 0.18s;
      cursor: pointer;
      overflow: hidden;
      &:hover {
        background: var(--bg-panel-hover);
        color: var(--text-main);
        transform: translateX(2px);
      }
      &:hover .nav-icon { color: var(--orange); }
      &:active { transform: scale(0.98); }
    }

    /* Indicateur de gauche (barre orange) */
    .nav-indicator {
      position: absolute;
      left: 0; top: 50%;
      width: 3px; height: 0;
      background: var(--gradient);
      border-radius: 0 3px 3px 0;
      transform: translateY(-50%);
      transition: height 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 0 8px var(--orange-glow);
    }

    .nav-item.active {
      background: var(--orange-bg);
      font-weight: 600;
    }
    .nav-item.active .nav-indicator { height: 60%; }
    .nav-item.active .nav-icon { color: var(--orange); }

    .nav-icon {
      font-size: 18px; width: 18px; height: 18px;
      flex-shrink: 0;
      transition: color 0.2s, transform 0.2s;
    }
    .nav-label { white-space: nowrap; letter-spacing: -0.01em; }

    /* ── Défilement du nom de projet ── */
    .project-name-label {
      overflow: hidden;
      white-space: nowrap;
      flex: 1;
      min-width: 0;
      display: block;
      mask-image: linear-gradient(to right, black 80%, transparent 100%);
      -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
    }

    .project-name-text {
      display: inline-block;
      white-space: nowrap;
    }

    .project-item:hover .project-name-text {
      animation: marquee-scroll 2.8s ease-in-out infinite;
    }

    @keyframes marquee-scroll {
      0%   { transform: translateX(0); }
      20%  { transform: translateX(0); }
      70%  { transform: translateX(-55px); }
      85%  { transform: translateX(-55px); }
      100% { transform: translateX(0); }
    }

    /* ════════════════════════════
       MEMBERS SECTION
    ════════════════════════════ */
    .members-section { flex-shrink: 0; }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 4px;
      margin-bottom: 6px;
    }

    .section-header-row .section-label { margin: 4px 0 0 10px; }

    .invite-btn {
      width: 28px; height: 28px;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;
      flex-shrink: 0;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:hover {
        background: var(--orange-bg);
        border-color: var(--orange);
        color: var(--orange);
        transform: scale(1.08) rotate(90deg);
        box-shadow: 0 0 0 3px var(--orange-bg);
      }
      &:active { transform: scale(0.92); }
    }

    .member-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .member-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 10px;
      border-radius: 9px;
      transition: background 0.2s, transform 0.18s;
      cursor: default;
      &:hover {
        background: var(--bg-panel-hover);
        transform: translateX(2px);
      }
    }

    .member-avatar {
      width: 30px; height: 30px; min-width: 30px;
      border-radius: 50%;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.66rem;
      font-weight: 800;
      color: #fff;
      text-transform: uppercase;
      flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(15,23,42,0.12);
      transition: transform 0.2s;
    }
    .member-row:hover .member-avatar { transform: scale(1.08); }

    .member-info {
      display: flex;
      align-items: center;
      gap: 6px;
      overflow: hidden;
    }

    .member-name {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .member-role-badge {
      font-size: 0.55rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--orange);
      background: var(--orange-bg);
      border: 1px solid var(--orange-ring);
      border-radius: 4px;
      padding: 2px 6px;
      flex-shrink: 0;
    }

    /* ── Project item with delete button ── */
    .project-item {
      position: relative;
      cursor: pointer;
    }

    .project-action-btn {
      margin-left: auto;
      width: 26px; height: 26px;
      background: none;
      border: none;
      border-radius: 6px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      opacity: 0;
      transition: color 0.2s, background 0.2s, transform 0.2s, opacity 0.2s;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover {
        color: var(--orange);
        background: var(--orange-bg);
        transform: rotate(45deg);
      }
      &:active { transform: scale(0.90); }
    }
    .project-item:hover .project-action-btn { opacity: 1; }

    /* ── Inline project create form ── */
    .inline-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px 8px;
      background: var(--bg-panel-hover);
      border: 1px dashed var(--orange-ring);
      border-radius: 10px;
      margin-top: 4px;
    }

    .inline-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 7px 10px;
      color: var(--text-main);
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      transition: border-color 0.2s, box-shadow 0.2s;
      &::placeholder { color: var(--text-muted); }
      &:focus {
        border-color: var(--orange);
        box-shadow: 0 0 0 3px var(--orange-bg);
      }
    }

    .inline-actions { display: flex; gap: 4px; justify-content: flex-end; }

    .action-btn {
      width: 30px; height: 30px;
      border: none;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s, transform 0.15s;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
      &:active { transform: scale(0.92); }
    }

    .action-btn.check {
      background: var(--orange-bg-2);
      color: var(--orange);
      &:hover { background: var(--orange); color: #fff; transform: scale(1.06); }
    }

    .action-btn.close-btn {
      background: var(--bg-panel-hover);
      color: var(--text-muted);
      &:hover { background: rgba(239,68,68,0.12); color: #ef4444; transform: scale(1.06); }
    }

    /* ── Filters ── */
    .filter-list { display: flex; flex-direction: column; gap: 2px; }

    .filter-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 12px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-size: 0.83rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background 0.2s, color 0.2s, transform 0.18s;
      font-family: inherit;
      &:hover { background: var(--bg-panel-hover); color: var(--text-main); transform: translateX(2px); }
      &:active { transform: scale(0.98); }
    }

    .filter-item.active {
      background: var(--orange-bg);
      color: var(--orange);
      font-weight: 600;
    }

    .priority-dot {
      width: 8px; height: 8px; min-width: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .filter-item:hover .priority-dot { transform: scale(1.4); }

    .filter-label { white-space: nowrap; flex: 1; letter-spacing: -0.01em; }

    .priority-count {
      font-size: 0.65rem;
      font-weight: 700;
      color: var(--text-muted);
      background: var(--bg-panel-hover);
      border-radius: 5px;
      padding: 2px 7px;
      flex-shrink: 0;
      font-family: 'JetBrains Mono', monospace;
    }
    .filter-item.active .priority-count {
      background: var(--orange-bg-2);
      color: var(--orange);
    }

    /* ── Spacer ── */
    .spacer { flex: 1; min-height: 8px; }

    /* ── Logout ── */
    .logout-section {
      padding: 4px 0 2px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .theme-toggle-btn {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.18s;
      &:hover {
        background: var(--orange-bg);
        border-color: var(--orange-ring);
        color: var(--orange);
        transform: translateX(2px);
      }
      &:hover mat-icon { transform: rotate(20deg); }
      mat-icon {
        font-size: 18px; width: 18px; height: 18px;
        flex-shrink: 0;
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 11px;
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.18s;
      &:hover {
        background: rgba(239, 68, 68, 0.08);
        border-color: rgba(239, 68, 68, 0.22);
        color: #ef4444;
        transform: translateX(2px);
      }
      &:hover mat-icon { transform: translateX(2px); }
      mat-icon { transition: transform 0.2s; }
    }

    .logout-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .logout-label { white-space: nowrap; letter-spacing: -0.01em; }
  `],
})
export class SidebarComponent implements OnInit {
  @Output() filterSelected = new EventEmitter<string | null>();

  readonly authService    = inject(AuthService);
  readonly themeService   = inject(ThemeService);
  readonly sidebarService = inject(SidebarService);
  readonly projectService = inject(ProjectService);
  private readonly taskService       = inject(TaskService);
  private readonly invitationService = inject(InvitationService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);

  creatingProject = signal(false);
  newProjectName  = '';

  private readonly PRIORITY_MAP: Record<string, string> = {
    'Urgent': 'HIGH', 'Moyen': 'MEDIUM', 'Bas': 'LOW',
  };
  private readonly taskCounts = signal<Record<string, number>>({});

  constructor() {
    effect(() => {
      const pid = this.projectService.selected()?.id;
      this.taskService.tasksChanged(); // re-déclenche quand une tâche est mutée
      if (!pid) { this.taskCounts.set({ HIGH: 0, MEDIUM: 0, LOW: 0 }); return; }
      this.taskService.getTasks(pid, undefined, 0, 200).subscribe(page => {
        const counts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0 };
        for (const task of page.content ?? []) counts[task.priority] = (counts[task.priority] ?? 0) + 1;
        this.taskCounts.set(counts);
      });
    });
  }

  priorityCount(label: string): number {
    return this.taskCounts()[this.PRIORITY_MAP[label]] ?? 0;
  }

  readonly userInitials = computed(() => {
    const name = this.authService.currentUser()?.username ?? '';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  });

  private readonly AVATAR_COLORS = [
    '#F87941', '#EA580C', '#F59E0B', '#FB923C',
    '#3B82F6', '#0EA5E9', '#22C55E', '#10B981',
    '#A855F7', '#EC4899', '#6366F1', '#06B6D4',
  ];

  memberColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return this.AVATAR_COLORS[Math.abs(hash) % this.AVATAR_COLORS.length];
  }

  memberAvatar(m: { email: string; avatarUrl?: string }): string | null {
    if (m.email === this.authService.currentUser()?.email) {
      return this.authService.currentUser()?.avatarUrl ?? null;
    }
    return m.avatarUrl ?? null;
  }

  memberInitials(username: string): string {
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  }

  readonly activeFilter = computed(() => {
    const p = this.sidebarService.priorityFilter();
    if (!p) return null;
    return ({ HIGH: 'Urgent', MEDIUM: 'Moyen', LOW: 'Bas' } as Record<string, string>)[p] ?? null;
  });

  readonly navItems = [
    { label: 'Tableau',    icon: 'grid_view',      route: '/tasks'    },
    { label: 'Calendrier', icon: 'calendar_today', route: '/calendar' },
    { label: 'Profil',     icon: 'person_outline', route: '/profile'  },
  ];

  readonly filters = [
    { label: 'Urgent', color: '#EF4444' },
    { label: 'Moyen',  color: '#F59E0B' },
    { label: 'Bas',    color: '#22C55E' },
  ];

  ngOnInit(): void {
    this.projectService.loadProjects().subscribe();
  }

  openSettings(event: Event, project: { id: number }): void {
    event.stopPropagation();
    const full = this.projectService.projects().find(p => p.id === project.id)
               ?? this.projectService.selected();
    if (!full) return;
    // Récupère le projet complet avec membres
    this.projectService.getProject(full.id).subscribe(p => {
      const ref = this.dialog.open(ProjectSettingsComponent, {
        data: { project: p },
        panelClass: 'dark-dialog',
        backdropClass: 'dark-backdrop',
        maxWidth: '620px',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'DELETED') {
          this.snack.open(`Projet supprimé`, 'OK', { duration: 3000 });
        }
      });
    });
  }

  openCreateProject(): void {
    this.newProjectName = '';
    this.creatingProject.set(true);
  }

  submitProject(): void {
    const name = this.newProjectName.trim();
    if (!name) return;
    this.projectService.createProject({ name }).subscribe({
      next: () => {
        this.creatingProject.set(false);
        this.newProjectName = '';
        this.snack.open(`Projet "${name}" créé`, 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur lors de la création', 'OK', { duration: 3000 }),
    });
  }

  openInviteDialog(): void {
    const project = this.projectService.selected();
    if (!project) return;
    const ref = this.dialog.open(InviteDialogComponent, {
      panelClass: 'dark-dialog',
      backdropClass: 'dark-backdrop',
    });
    ref.afterClosed().subscribe((email: string | null) => {
      if (!email) return;
      this.projectService.addMember(project.id, { email, role: 'EDITOR' }).subscribe({
        next: () => this.snack.open(`${email} ajouté au projet`, 'OK', { duration: 3000 }),
        error: (err) => {
          if (err.status === 404) {
            // Utilisateur non inscrit → invitation par email
            this.invitationService.invite(email, undefined, project.id).subscribe({
              next: (result) => this.snack.open(result.message, 'OK', { duration: 4000 }),
              error: () => this.snack.open('Erreur lors de l\'envoi de l\'invitation', 'OK', { duration: 3000 }),
            });
          } else {
            this.snack.open(err.error?.message ?? 'Erreur lors de l\'invitation', 'OK', { duration: 3000 });
          }
        },
      });
    });
  }

  selectFilter(label: string): void {
    const next = this.activeFilter() === label ? null : label;
    this.sidebarService.setFilter(next);
    this.filterSelected.emit(next);
  }
}
