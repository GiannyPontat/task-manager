import {
  Component, OnInit, inject, signal, computed, HostListener, ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService }    from '../../../core/services/auth.service';
import { ThemeService }   from '../../../core/services/theme.service';
import { ProjectService } from '../../../core/services/project.service';
import { InviteDialogComponent }     from '../sidebar/invite-dialog.component';
import { ProjectSettingsComponent }  from '../../projects/project-settings/project-settings.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule, MatSnackBarModule],
  template: `
    <header class="topbar">
      <div class="tb-inner">

        <!-- LEFT: Logo + Project selector -->
        <div class="tb-left">
          <a routerLink="/tasks" class="tb-logo">Flowly</a>

          <div class="proj-wrap">
            <button class="proj-btn" (click)="toggleProj($event)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <span class="proj-name">{{ projectService.selected()?.name ?? 'Sélectionner un projet' }}</span>
              <svg class="proj-chevron" [class.open]="projOpen()" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            @if (projOpen()) {
              <div class="proj-dropdown">

                <!-- Project list -->
                <div class="proj-list">
                  @for (p of projectService.projects(); track p.id) {
                    <div class="proj-item" [class.proj-active]="projectService.selected()?.id === p.id"
                         (click)="selectProject(p)">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                      </svg>
                      <span class="proj-item-name">{{ p.name }}</span>
                      <button class="proj-settings-btn" (click)="openSettings($event, p)" title="Paramètres">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                        </svg>
                      </button>
                    </div>
                  }
                  @if (projectService.projects().length === 0) {
                    <div class="proj-empty">Aucun projet — créez-en un.</div>
                  }
                </div>

                <div class="dd-divider"></div>

                <!-- Inline create form -->
                @if (creatingProject()) {
                  <div class="proj-create">
                    <input class="proj-input" type="text" [(ngModel)]="newProjectName"
                           placeholder="Nom du projet..."
                           (keyup.enter)="submitProject()"
                           (keyup.escape)="creatingProject.set(false)"
                           autofocus />
                    <div class="proj-create-actions">
                      <button class="ca-btn ca-ok"  (click)="submitProject()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button class="ca-btn ca-cancel" (click)="creatingProject.set(false)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  </div>
                } @else {
                  <button class="proj-new-btn" (click)="creatingProject.set(true)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Nouveau projet
                  </button>
                }

                <!-- Members of selected project -->
                @if (projectService.selected()?.members?.length) {
                  <div class="dd-divider"></div>
                  <div class="proj-members">
                    <span class="members-label">Membres</span>
                    <div class="members-row">
                      @for (m of projectService.selected()!.members!; track m.userId) {
                        <div class="member-av" [style.background]="memberColor(m.username)"
                             [title]="m.username">
                          {{ memberInitials(m.username) }}
                        </div>
                      }
                      <button class="invite-btn" (click)="openInviteDialog()">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="8.5" cy="7" r="4"/>
                          <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        Inviter
                      </button>
                    </div>
                  </div>
                }

              </div>
            }
          </div>
        </div>

        <!-- CENTER: Nav links -->
        <nav class="tb-nav">
          <a routerLink="/tasks" routerLinkActive="tb-active" class="tb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Tableau
          </a>
          <a routerLink="/calendar" routerLinkActive="tb-active" class="tb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Calendrier
          </a>
          <a routerLink="/profile" routerLinkActive="tb-active" class="tb-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Profil
          </a>
        </nav>

        <!-- RIGHT: Theme + User + Logout -->
        <div class="tb-right">
          <button class="icon-btn theme-btn" (click)="themeService.toggle()"
                  [title]="themeService.theme() === 'dark' ? 'Mode clair' : 'Mode sombre'">
            @if (themeService.theme() === 'dark') {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            } @else {
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
              </svg>
            }
          </button>

          <div class="user-chip">
            <div class="user-av">{{ userInitial() }}</div>
            <span class="user-name">{{ authService.currentUser()?.username }}</span>
          </div>

          <button class="icon-btn logout-btn" (click)="authService.logout()" title="Déconnexion">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    }

    .topbar {
      height: 56px;
      background: var(--bg-card);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .tb-inner {
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    /* ── Left ── */
    .tb-left { display: flex; align-items: center; gap: 12px; }

    .tb-logo {
      font-size: 1rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
      letter-spacing: -0.02em;
      flex-shrink: 0;
    }

    /* Project selector */
    .proj-wrap { position: relative; }

    .proj-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-panel, rgba(240,244,250,0.6));
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 5px 10px;
      font-family: inherit;
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
      cursor: pointer;
      max-width: 200px;
      transition: background 0.15s, border-color 0.15s;
    }
    .proj-btn:hover { background: var(--bg-panel-hover); border-color: var(--primary); }

    .proj-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 130px;
    }

    .proj-chevron {
      flex-shrink: 0;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .proj-chevron.open { transform: rotate(180deg); }

    .proj-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      left: 0;
      width: 260px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 14px;
      box-shadow: 0 12px 36px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06);
      padding: 6px;
      z-index: 200;
      animation: dropIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes dropIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .proj-list { display: flex; flex-direction: column; gap: 2px; }

    .proj-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      border-radius: 9px;
      cursor: pointer;
      font-size: 12.5px;
      color: var(--text-secondary);
      transition: background 0.12s;
    }
    .proj-item:hover { background: var(--bg-panel-hover); color: var(--text-main); }
    .proj-item.proj-active {
      background: rgba(99,102,241,0.08);
      color: var(--primary);
      font-weight: 600;
    }
    .proj-item-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .proj-settings-btn {
      background: none;
      border: none;
      padding: 3px;
      border-radius: 5px;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      opacity: 0;
      transition: opacity 0.15s, background 0.15s;
    }
    .proj-item:hover .proj-settings-btn { opacity: 1; }
    .proj-settings-btn:hover { background: var(--bg-panel); color: var(--text-main); }

    .proj-empty {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      padding: 8px 0;
    }

    .dd-divider {
      height: 1px;
      background: var(--border);
      margin: 4px 0;
    }

    .proj-create {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 4px 6px;
    }
    .proj-input {
      flex: 1;
      background: var(--input-bg);
      border: 1px solid var(--border);
      border-radius: 7px;
      padding: 6px 10px;
      font-family: inherit;
      font-size: 12.5px;
      color: var(--text-main);
      outline: none;
      transition: border-color 0.15s;
    }
    .proj-input:focus { border-color: var(--primary); }
    .proj-create-actions { display: flex; gap: 4px; }

    .ca-btn {
      width: 26px; height: 26px;
      border-radius: 7px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s;
    }
    .ca-ok     { background: rgba(99,102,241,0.12); color: var(--primary); }
    .ca-cancel { background: rgba(239,68,68,0.1);   color: #f87171; }
    .ca-ok:hover     { background: rgba(99,102,241,0.2); }
    .ca-cancel:hover { background: rgba(239,68,68,0.18); }

    .proj-new-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 7px 10px;
      background: none;
      border: none;
      border-radius: 9px;
      font-family: inherit;
      font-size: 12.5px;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.12s, color 0.12s;
    }
    .proj-new-btn:hover { background: var(--bg-panel-hover); color: var(--text-main); }

    .proj-members { padding: 6px 4px 4px; }
    .members-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      margin-bottom: 8px;
      padding: 0 6px;
    }
    .members-row { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; padding: 0 4px; }

    .member-av {
      width: 26px; height: 26px;
      border-radius: 50%;
      font-size: 10px;
      font-weight: 700;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      cursor: default;
    }

    .invite-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 999px;
      padding: 4px 10px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
      transition: background 0.15s;
    }
    .invite-btn:hover { background: rgba(99,102,241,0.14); }

    /* ── Center nav ── */
    .tb-nav {
      display: flex;
      align-items: center;
      gap: 2px;
      margin: 0 auto;
    }

    .tb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      padding: 6px 12px;
      border-radius: 9px;
      transition: color 0.15s, background 0.15s;
    }
    .tb-link:hover { color: var(--text-main); background: var(--bg-panel-hover); }
    .tb-link.tb-active {
      color: var(--primary);
      background: rgba(99,102,241,0.08);
      font-weight: 600;
    }

    /* ── Right ── */
    .tb-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

    .icon-btn {
      width: 34px; height: 34px;
      border-radius: 9px;
      background: none;
      border: 1px solid transparent;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
    }
    .icon-btn:hover {
      background: var(--bg-panel-hover);
      color: var(--text-main);
      border-color: var(--border);
    }
    .icon-btn:active { transform: scale(0.94); }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px 4px 4px;
      border-radius: 999px;
      background: var(--bg-panel);
      border: 1px solid var(--border);
    }
    .user-av {
      width: 26px; height: 26px;
      border-radius: 50%;
      background: var(--primary);
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      text-transform: uppercase;
      flex-shrink: 0;
    }
    .user-name {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--text-main);
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .tb-nav { display: none; }
      .proj-name { max-width: 80px; }
      .user-name { display: none; }
      .user-chip { padding: 4px; }
    }
  `]
})
export class TopbarComponent implements OnInit {
  readonly authService    = inject(AuthService);
  readonly themeService   = inject(ThemeService);
  readonly projectService = inject(ProjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snack  = inject(MatSnackBar);
  private readonly el     = inject(ElementRef);

  projOpen        = signal(false);
  creatingProject = signal(false);
  newProjectName  = '';

  readonly userInitial = computed(() => {
    const name = this.authService.currentUser()?.username ?? '?';
    return name[0].toUpperCase();
  });

  ngOnInit(): void {
    this.projectService.loadProjects().subscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (!this.el.nativeElement.contains(e.target as Node)) {
      this.projOpen.set(false);
    }
  }

  toggleProj(e: MouseEvent): void {
    e.stopPropagation();
    this.projOpen.update(v => !v);
  }

  selectProject(p: { id: number; name: string }): void {
    this.projectService.getProject(p.id).subscribe(full =>
      this.projectService.selected.set(full)
    );
    this.projOpen.set(false);
  }

  openSettings(event: Event, project: { id: number }): void {
    event.stopPropagation();
    const full = this.projectService.projects().find(p => p.id === project.id)
               ?? this.projectService.selected();
    if (!full) return;
    this.projectService.getProject(full.id).subscribe(p => {
      const ref = this.dialog.open(ProjectSettingsComponent, {
        data: { project: p },
        panelClass: 'dark-dialog',
        backdropClass: 'dark-backdrop',
        maxWidth: '620px',
      });
      ref.afterClosed().subscribe(result => {
        if (result === 'DELETED')
          this.snack.open('Projet supprimé', 'OK', { duration: 3000 });
      });
    });
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
    this.projOpen.set(false);
    const ref = this.dialog.open(InviteDialogComponent, {
      panelClass: 'dark-dialog',
      backdropClass: 'dark-backdrop',
    });
    ref.afterClosed().subscribe((email: string | null) => {
      if (!email) return;
      this.projectService.addMember(project.id, { email, role: 'EDITOR' }).subscribe({
        next: () => this.snack.open(`${email} ajouté au projet`, 'OK', { duration: 3000 }),
        error: () => this.snack.open('Invitation échouée', 'OK', { duration: 3000 }),
      });
    });
  }

  memberColor(username: string): string {
    const COLORS = ['#e53935','#d81b60','#8e24aa','#5e35b1','#1e88e5','#039be5','#00897b','#43a047','#f4511e','#fb8c00'];
    let hash = 0;
    for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
  }

  memberInitials(username: string): string {
    const parts = username.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return username.slice(0, 2).toUpperCase();
  }
}
