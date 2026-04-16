import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../core/services/theme.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <aside class="sidebar">

      <!-- ── Avatar ── -->
      <div class="sidebar-top">
        <div class="avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>

      <!-- ── Nav items ── -->
      <nav class="sidebar-nav">
        @for (item of navItems; track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="nav-item--active"
            [title]="item.label"
          >
            <span class="nav-accent-bar"></span>
            <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
          </a>
        }
      </nav>

      <!-- ── Bottom bubble ── -->
      <div class="sidebar-bottom">
        <div class="bottom-divider"></div>

        <a
          class="nav-item"
          routerLink="/profile"
          routerLinkActive="nav-item--active"
          title="Paramètres"
        >
          <span class="nav-accent-bar"></span>
          <mat-icon class="nav-icon">settings</mat-icon>
        </a>

        <button
          class="theme-btn"
          (click)="themeService.toggle()"
          [title]="themeService.theme() === 'dark' ? 'Mode clair' : 'Mode sombre'"
        >
          <mat-icon class="nav-icon">
            {{ themeService.theme() === 'dark' ? 'light_mode' : 'dark_mode' }}
          </mat-icon>
        </button>
      </div>

    </aside>
  `,
  styles: [`
    :host {
      --accent-bar: #f43a09;
      --item-active-bg: rgba(0,0,0,0.05);
      --item-hover-bg:  rgba(0,0,0,0.04);
    }
    :host-context([data-theme="dark"]) {
      --accent-bar: #4048E7;
      --item-active-bg: rgba(255,255,255,0.07);
      --item-hover-bg:  rgba(255,255,255,0.04);
    }

    /* ── Shell ── */
    .sidebar {
      position: sticky;
      top: 16px;
      height: calc(100dvh - 32px);
      width: 72px;
      flex-shrink: 0;
      border-radius: 2.5rem;
      background: var(--bg-card);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 14px 10px;
      gap: 4px;
      overflow: hidden;
      transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
    }

    /* ── Avatar ── */
    .sidebar-top {
      padding-bottom: 10px;
    }
    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 14px;
      background: var(--bg-app);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      flex-shrink: 0;
    }

    /* ── Nav ── */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      width: 100%;
    }

    /* ── Nav item ── */
    .nav-item {
      position: relative;
      width: 100%;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      text-decoration: none;
      color: var(--text-muted);
      transition: background 0.15s ease, color 0.15s ease;
      cursor: pointer;
    }
    .nav-item:hover {
      background: var(--item-hover-bg);
      color: var(--text-main);
    }
    .nav-item--active {
      background: var(--item-active-bg);
      color: var(--text-main);
    }

    /* ── Accent bar (left edge, only on active) ── */
    .nav-accent-bar {
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 55%;
      border-radius: 0 2px 2px 0;
      background: var(--accent-bar);
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .nav-item--active .nav-accent-bar {
      opacity: 1;
    }

    /* ── Icon ── */
    .nav-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      line-height: 1 !important;
    }

    /* ── Bottom bubble ── */
    .sidebar-bottom {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      width: 100%;
      padding-top: 4px;
    }

    .bottom-divider {
      width: 32px;
      height: 1px;
      background: var(--border);
      margin-bottom: 4px;
    }

    /* ── Theme toggle ── */
    .theme-btn {
      width: 100%;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .theme-btn:hover {
      background: var(--item-hover-bg);
      color: var(--text-main);
    }
  `],
})
export class SidebarComponent {
  readonly themeService = inject(ThemeService);

  readonly navItems: NavItem[] = [
    { icon: 'view_kanban',   label: 'Board',     route: '/tasks'    },
    { icon: 'calendar_month',label: 'Calendrier',route: '/calendar' },
  ];
}
