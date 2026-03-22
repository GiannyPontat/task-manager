import { Component, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';

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

    /* ── Hamburger ── */
    .hamburger-btn {
      color: #94a3b8 !important;
      margin-right: 8px;
      transition: color 0.15s;
    }
    .hamburger-btn:hover { color: #f1f5f9 !important; }

    /* ── Brand ── */
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-mark {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
    }

    .brand-name {
      font-size: 1rem;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: -0.2px;
    }

    .spacer { flex: 1 1 auto; }

    /* ── Nav link ── */
    .nav-link {
      color: #94a3b8 !important;
      font-size: 0.875rem !important;
      font-weight: 500 !important;
      border-radius: 8px !important;
      margin-right: 4px;
      transition: color 0.15s, background 0.15s;
      letter-spacing: 0;
    }

    .nav-link:hover {
      color: #f1f5f9 !important;
      background: rgba(255,255,255,0.07) !important;
    }

    :host ::ng-deep .nav-active.nav-link {
      color: #60a5fa !important;
      background: rgba(59,130,246,0.14) !important;
    }

    /* ── Separator ── */
    .sep {
      width: 1px;
      height: 22px;
      background: rgba(255,255,255,0.1);
      margin: 0 16px;
    }

    /* ── User area ── */
    .user-area {
      display: flex;
      align-items: center;
      gap: 9px;
      margin-right: 6px;
    }

    .avatar {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 700;
      color: #fff;
      text-transform: uppercase;
      flex-shrink: 0;
    }

    .username-label {
      font-size: 0.875rem;
      color: #cbd5e1;
      font-weight: 500;
      max-width: 140px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Logout btn ── */
    .logout-btn {
      color: #475569 !important;
      transition: color 0.15s;
      &:hover { color: #f87171 !important; }
    }

    /* ── Auth buttons ── */
    .auth-link {
      color: #94a3b8 !important;
      font-size: 0.875rem;
    }

    .cta-btn {
      background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%) !important;
      color: #fff !important;
      border-radius: 8px !important;
      font-size: 0.875rem !important;
      font-weight: 600 !important;
      margin-left: 10px;
      padding: 0 18px !important;
      box-shadow: 0 2px 8px rgba(99,102,241,0.4) !important;
    }
  `],
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  readonly authService = inject(AuthService);

  userInitial = computed(() => this.authService.currentUser()?.username?.[0] ?? '?');

  logout(): void {
    this.authService.logout();
  }
}
