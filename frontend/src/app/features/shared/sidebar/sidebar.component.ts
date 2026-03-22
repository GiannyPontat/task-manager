import { Component, inject, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SidebarService } from '../../../core/services/sidebar.service';
import { AuthService } from '../../../core/services/auth.service';
import { WorkspaceService } from '../../../core/services/workspace.service';
import { InviteDialogComponent } from './invite-dialog.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, AsyncPipe, RouterModule,
    MatIconModule, MatButtonModule, MatRippleModule,
    MatTooltipModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="sidebar-wrap">
      <div class="glass-panel">

        <!-- ── Logo / Brand ── -->
        <div class="brand-row">
          <div class="brand-icon">
            <mat-icon>task_alt</mat-icon>
          </div>
          <span class="brand-name">TaskBoard</span>
        </div>

        <div class="divider"></div>

        <!-- Profile -->
        <div class="profile-row">
          <div class="workspace-avatar">
            <mat-icon>grid_view</mat-icon>
          </div>
          <div class="profile-info">
            <span class="profile-name">Mon Espace</span>
            <span class="profile-sub">Pro Plan</span>
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
            @for (m of (members$ | async) ?? []; track m.name) {
              <div class="member-row" [matTooltip]="m.name + ' · ' + (m.role === 'admin' ? 'Admin' : 'Membre')">
                <div class="member-avatar" [style.background]="m.color">
                  {{ m.initials }}
                </div>
                <div class="member-info">
                  <span class="member-name">{{ m.name }}</span>
                  @if (m.role === 'admin') {
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
              </button>
            }
          </div>
        </div>

        <!-- ── Spacer ── -->
        <div class="spacer"></div>

        <div class="divider"></div>

        <!-- ── Logout ── -->
        <div class="logout-section">
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
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(18px) saturate(180%);
      -webkit-backdrop-filter: blur(18px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
      display: flex;
      flex-direction: column;
      padding: 20px 12px;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      scrollbar-width: none;
    }

    .glass-panel::-webkit-scrollbar { display: none; }

    /* ── Brand ── */
    .brand-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 6px 10px;
    }

    .brand-icon {
      width: 36px; height: 36px; min-width: 36px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #fff; }
    }

    .brand-name {
      font-size: 0.95rem;
      font-weight: 700;
      color: #f8fafc;
      white-space: nowrap;
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
      padding: 4px 6px 12px;
    }

    .workspace-avatar {
      width: 36px; height: 36px; min-width: 36px;
      border-radius: 12px;
      background: rgba(255,255,255,0.08);
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 17px; width: 17px; height: 17px; color: #94a3b8; }
    }

    .profile-info { display: flex; flex-direction: column; overflow: hidden; }
    .profile-name { font-size: 0.8rem; font-weight: 600; color: #f8fafc; white-space: nowrap; }
    .profile-sub  { font-size: 0.68rem; color: rgba(255,255,255,0.45); }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
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
      color: rgba(255, 255, 255, 0.35);
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
      color: #94a3b8;
      font-size: 0.82rem;
      font-weight: 500;
      border: 1px solid transparent;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      cursor: pointer;
      &:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      color: #f8fafc;
    }

    .nav-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .nav-label { white-space: nowrap; }

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
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      color: #64748b;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: background 0.15s, color 0.15s, border-color 0.15s;
      flex-shrink: 0;
      mat-icon { font-size: 13px; width: 13px; height: 13px; }
      &:hover {
        background: rgba(99,102,241,0.2);
        border-color: rgba(99,102,241,0.4);
        color: #818cf8;
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
      &:hover { background: rgba(255,255,255,0.04); }
    }

    .member-avatar {
      width: 30px; height: 30px; min-width: 30px;
      border-radius: 50%;
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
      color: #cbd5e1;
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
      color: #94a3b8;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      &:hover { background: rgba(255,255,255,0.06); color: #e2e8f0; }
    }

    .filter-item.active {
      background: rgba(255,255,255,0.1);
      border-color: rgba(255,255,255,0.18);
      color: #f8fafc;
    }

    .priority-dot {
      width: 8px; height: 8px; min-width: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .filter-label { white-space: nowrap; }

    /* ── Spacer ── */
    .spacer { flex: 1; }

    /* ── Logout ── */
    .logout-section {
      padding: 4px 0 2px;
      flex-shrink: 0;
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
      color: #64748b;
      font-size: 0.82rem;
      font-weight: 500;
      cursor: pointer;
      text-align: left;
      transition: background 0.18s, color 0.18s, border-color 0.18s;
      &:hover {
        background: rgba(255, 77, 77, 0.1);
        border-color: rgba(255, 77, 77, 0.2);
        color: #ff4d4d;
      }
    }

    .logout-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }
    .logout-label { white-space: nowrap; }
  `],
})
export class SidebarComponent {
  @Output() filterSelected = new EventEmitter<string | null>();

  readonly authService      = inject(AuthService);
  readonly sidebarService   = inject(SidebarService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly dialog  = inject(MatDialog);
  private readonly snack   = inject(MatSnackBar);

  readonly activeFilter = computed(() => {
    const p = this.sidebarService.priorityFilter();
    if (!p) return null;
    return ({ HIGH: 'Urgent', MEDIUM: 'Moyen', LOW: 'Bas' } as Record<string, string>)[p] ?? null;
  });

  readonly members$ = this.workspaceService.getMembers();

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

  openInviteDialog(): void {
    const ref = this.dialog.open(InviteDialogComponent, {
      panelClass: 'dark-dialog',
      backdropClass: 'dark-backdrop',
    });
    ref.afterClosed().subscribe((email: string | null) => {
      if (!email) return;
      this.workspaceService.inviteMember(email).subscribe({
        next: () => this.snack.open(`Invitation envoyée à ${email}`, 'OK', { duration: 3000 }),
        error: () => this.snack.open('Erreur lors de l\'envoi de l\'invitation', 'OK', { duration: 3000 }),
      });
    });
  }

  selectFilter(label: string): void {
    const next = this.activeFilter() === label ? null : label;
    this.sidebarService.setFilter(next);
    this.filterSelected.emit(next);
  }
}
