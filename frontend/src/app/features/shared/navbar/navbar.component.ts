import { Component, computed, inject, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar class="navbar">

      <button mat-icon-button class="hamburger-btn" (click)="menuToggle.emit()" aria-label="Toggle menu">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="brand">
        <div class="brand-mark">✓</div>
        <span class="brand-name">TaskBoard</span>
      </span>

      <span class="spacer"></span>

      @if (authService.currentUser()) {
        <a mat-button routerLink="/tasks" routerLinkActive="nav-active" class="nav-link">
          <mat-icon>dashboard</mat-icon>
          Mes Tâches
        </a>

        <!-- Bell -->
        <button mat-icon-button class="notif-btn" [matMenuTriggerFor]="notifMenu" matTooltip="Notifications">
          <mat-icon>notifications</mat-icon>
          @if (ns.unreadCount() > 0) {
            <span class="badge">{{ ns.unreadCount() }}</span>
          }
        </button>

        <mat-menu #notifMenu="matMenu" xPosition="before" panelClass="notif-panel">
          <div class="notif-header" (click)="$event.stopPropagation()">Notifications</div>
          <div class="notif-list" (click)="$event.stopPropagation()">
            @for (n of ns.notifications(); track n.id) {
              <button class="notif-item" [class.read]="n.read" (click)="onNotifClick(n.id)">
                <span class="notif-dot" [class.unread-dot]="!n.read"></span>
                <div class="notif-content">
                  <span class="notif-msg">{{ n.message }}</span>
                  <span class="notif-time">{{ timeAgo(n.createdAt) }}</span>
                </div>
              </button>
            } @empty {
              <div class="notif-empty">Aucune notification</div>
            }
          </div>
        </mat-menu>

        <div class="sep"></div>

        <div class="user-area">
          <div class="avatar">{{ userInitial() }}</div>
          <span class="username-label">{{ authService.currentUser()!.username }}</span>
        </div>

        <button mat-icon-button class="logout-btn"
                matTooltip="Se déconnecter"
                (click)="logout()">
          <mat-icon>logout</mat-icon>
        </button>
      } @else {
        <a mat-button class="auth-link" routerLink="/login">Connexion</a>
        <button mat-flat-button class="cta-btn" routerLink="/register">
          Commencer gratuitement
        </button>
      }
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      height: 58px;
      padding: 0 24px;
      background: #1e293b;
      box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 4px 20px rgba(0,0,0,0.25);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .hamburger-btn { color: #94a3b8 !important; margin-right: 8px; transition: color 0.15s; }
    .hamburger-btn:hover { color: #f1f5f9 !important; }

    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-size: 15px; font-weight: 800; color: #fff; flex-shrink: 0;
    }
    .brand-name { font-size: 1rem; font-weight: 700; color: #f1f5f9; letter-spacing: -0.2px; }

    .spacer { flex: 1 1 auto; }

    .nav-link { color: #94a3b8 !important; font-size: 0.875rem !important; font-weight: 500 !important; border-radius: 8px !important; margin-right: 4px; transition: color 0.15s, background 0.15s; letter-spacing: 0; }
    .nav-link:hover { color: #f1f5f9 !important; background: rgba(255,255,255,0.07) !important; }
    :host ::ng-deep .nav-active.nav-link { color: #60a5fa !important; background: rgba(59,130,246,0.14) !important; }

    /* Bell */
    .notif-btn {
      position: relative;
      color: #475569 !important;
      margin: 0 4px;
      transition: color 0.15s;
    }
    .notif-btn:hover { color: #f1f5f9 !important; }

    .badge {
      position: absolute;
      top: 6px; right: 6px;
      background: #ef4444;
      color: #fff;
      font-size: 0.6rem;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      border: 2px solid #1e293b;
      line-height: 1;
    }

    /* Dropdown content (inside mat-menu portal) */
    .notif-header {
      padding: 12px 16px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .notif-list {
      max-height: 340px;
      overflow-y: auto;
    }
    .notif-list::-webkit-scrollbar { width: 3px; }
    .notif-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }

    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      width: 100%;
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      cursor: pointer;
      text-align: left;
      transition: background 0.15s;
      &:hover { background: rgba(255,255,255,0.05); }
      &.read { opacity: 0.45; }
    }

    .notif-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-top: 5px;
      background: transparent;
    }
    .notif-dot.unread-dot { background: #6366f1; }

    .notif-content { display: flex; flex-direction: column; gap: 3px; }
    .notif-msg { color: #e2e8f0; font-size: 0.82rem; line-height: 1.4; white-space: normal; }
    .notif-time { color: #475569; font-size: 0.7rem; }

    .notif-empty { padding: 28px 16px; text-align: center; color: #334155; font-size: 0.82rem; }

    .sep { width: 1px; height: 22px; background: rgba(255,255,255,0.1); margin: 0 16px; }

    .user-area { display: flex; align-items: center; gap: 9px; margin-right: 6px; }
    .avatar {
      width: 32px; height: 32px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.78rem; font-weight: 700; color: #fff; text-transform: uppercase; flex-shrink: 0;
    }
    .username-label { font-size: 0.875rem; color: #cbd5e1; font-weight: 500; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .logout-btn { color: #475569 !important; transition: color 0.15s; }
    .logout-btn:hover { color: #f87171 !important; }

    .auth-link { color: #94a3b8 !important; font-size: 0.875rem; }
    .cta-btn {
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important; border-radius: 8px !important; font-size: 0.875rem !important;
      font-weight: 600 !important; margin-left: 10px; padding: 0 18px !important;
      box-shadow: 0 2px 8px rgba(99,102,241,0.4) !important;
    }
  `],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();
  readonly authService = inject(AuthService);
  readonly ns = inject(NotificationService);

  userInitial = computed(() => this.authService.currentUser()?.username?.[0] ?? '?');

  ngOnInit(): void {
    if (this.authService.currentUser()) {
      this.ns.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.ns.stopPolling();
  }

  onNotifClick(id: number): void {
    const notif = this.ns.notifications().find(n => n.id === id);
    if (!notif?.read) {
      this.ns.markAsRead(id).subscribe(() => {
        this.ns.notifications.update(list =>
          list.map(n => n.id === id ? { ...n, read: true } : n)
        );
        this.ns.unreadCount.update(c => Math.max(0, c - 1));
      });
    }
  }

  timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  }

  logout(): void {
    this.authService.logout();
  }
}
