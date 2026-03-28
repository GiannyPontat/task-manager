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
            <mat-icon class="workspace-icon">task_alt</mat-icon>
            <span class="workspace-name">TaskBoard</span>
          </div>
          <div class="profile-row">
            <div class="user-avatar">
              @if (authService.currentUser()?.avatarUrl) {
                <img class="avatar-img" [src]="authService.currentUser()!.avatarUrl!" alt="avatar" />
              } @else {
                {{ userInitials() }}
              }
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
                  <span class="priority-count">({{ priorityCount(f.label) }})</span>
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
    }

    .sidebar-wrap {
      width: 240px;
      height: 100vh;
      padding: 12px 10px;
      overflow: hidden;
    }

    /* ── Glass panel ── */
    .glass-panel {
      height: 100%;
      background: var(--bg-panel);
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      border: 1px solid var(--border-panel);
      border-right: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      padding: 20px 12px;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
    }

    .glass-panel::-webkit-scrollbar { display: none; }

    /* ── Sidebar Header ── */
    .sidebar-header {
      padding: 4px 6px 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .workspace-label {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .workspace-icon {
      font-size: 13px;
      width: 13px;
      height: 13px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .workspace-name {
      font-size: 0.62rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* ── Profile ── */
    .profile-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar-img {
      display: block;
      width: 100%; height: 100%;
      min-width: 0; min-height: 0;
      object-fit: cover;
    }

    .user-avatar {
      width: 34px; height: 34px; min-width: 34px;
      border-radius: 12px;
      overflow: hidden;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.03em;
      flex-shrink: 0;
    }

    .profile-info { display: flex; flex-direction: column; overflow: hidden; }
    .profile-name { font-size: 0.8rem; font-weight: 600; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .profile-sub  { font-size: 0.68rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--border), transparent);
      margin: 8px 0;
      flex-shrink: 0;
    }

    /* ── Sections ── */
    .section { padding: 4px 0; }

    .section-label {
      font-size: 0.62rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      font-weight: 700;
      color: var(--text-muted);
      margin: 4px 0 8px 8px;
    }

    /* ── Nav ── */
    .nav-list { display: flex; flex-direction: column; gap: 3px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      border-radius: 10px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 500;
      border: 1px solid transparent;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      cursor: pointer;
      &:hover { background: var(--bg-panel-hover); color: var(--text-main); }
    }

    .nav-item.active {
      background: rgba(99,102,241,0.1);
      border-color: rgba(99,102,241,0.2);
      color: var(--primary);
    }

    .nav-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .nav-label { white-space: nowrap; }

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

    .section-header-row .section-label { margin: 4px 0 0 8px; }

    .invite-btn {
      width: 22px; height: 22px;
      background: var(--bg-panel);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text-muted);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      flex-shrink: 0;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover {
        background: rgba(99,102,241,0.15);
        border-color: var(--primary);
        color: var(--primary);
      }
    }

    .member-list {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .member-row {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 5px 8px;
      border-radius: 9px;
      transition: background 0.15s;
      cursor: default;
      &:hover { background: var(--bg-panel-hover); }
    }

    .member-avatar {
      width: 30px; height: 30px; min-width: 30px;
      border-radius: 50%;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      flex-shrink: 0;
    }

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
      font-size: 0.58rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #818cf8;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.25);
      border-radius: 4px;
      padding: 1px 5px;
      flex-shrink: 0;
    }

    /* ── Project item with delete button ── */
    .project-item {
      position: relative;
      cursor: pointer;
      .delete-project-btn { display: none; }
      &:hover .delete-project-btn { display: flex; }
    }

    .project-action-btn {
      margin-left: auto;
      width: 20px; height: 20px;
      background: none;
      border: none;
      border-radius: 5px;
      color: #64748b;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      padding: 0;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
      &:hover { color: #818cf8; background: rgba(99,102,241,0.15); }
    }

    /* ── Inline project create form ── */
    .inline-form {
      display: flex;
      flex-direction: column;
      gap: 6px;
      padding: 6px 8px;
    }

    .inline-input {
      width: 100%;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 6px 10px;
      color: var(--text-main);
      font-size: 0.82rem;
      font-family: inherit;
      outline: none;
      box-sizing: border-box;
      &::placeholder { color: var(--text-muted); }
      &:focus { border-color: var(--primary); }
    }

    .inline-actions { display: flex; gap: 4px; justify-content: flex-end; }

    .action-btn {
      width: 24px; height: 24px;
      border: none;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .action-btn.check {
      background: rgba(99,102,241,0.3);
      color: #a5b4fc;
      &:hover { background: rgba(99,102,241,0.5); }
    }

    .action-btn.close-btn {
      background: rgba(255,255,255,0.06);
      color: #64748b;
      &:hover { background: rgba(255,77,77,0.15); color: #ff4d4d; }
    }

    /* ── Filters ── */
    .filter-list { display: flex; flex-direction: column; gap: 3px; }

    .filter-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 10px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-secondary);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      &:hover { background: var(--bg-panel-hover); color: var(--text-main); }
    }

    .filter-item.active {
      background: rgba(99,102,241,0.1);
      border-color: rgba(99,102,241,0.2);
      color: var(--primary);
    }

    .priority-dot {
      width: 8px; height: 8px; min-width: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .filter-label { white-space: nowrap; flex: 1; }

    .priority-count {
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    /* ── Spacer ── */
    .spacer { flex: 1; }

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
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
      transition: background 0.18s, color 0.18s;
      &:hover {
        background: rgba(99,102,241,0.08);
        border-color: rgba(99,102,241,0.15);
        color: var(--primary);
      }
      mat-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--text-muted);
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      &:hover {
        background: rgba(255, 77, 77, 0.08);
        border-color: rgba(255, 77, 77, 0.18);
        color: #ef4444;
      }
    }

    .logout-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .logout-label { white-space: nowrap; }
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
      if (!pid) return;
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
    '#e53935', '#d81b60', '#8e24aa', '#5e35b1',
    '#1e88e5', '#039be5', '#00897b', '#43a047',
    '#f4511e', '#fb8c00', '#00acc1', '#6d4c41',
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
    { label: 'Urgent', color: '#ff4d4d' },
    { label: 'Moyen',  color: '#ffbd2e' },
    { label: 'Bas',    color: '#2ecc71' },
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
