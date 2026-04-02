import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { SidebarComponent } from './features/shared/sidebar/sidebar.component';
import { SidebarService } from './core/services/sidebar.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];
const NO_SIDEBAR_EXACT = ['/'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
    MatIconModule,
  ],
  template: `
    <div class="app-bg">
      <div class="blob blob-1" [style.opacity]="themeService.theme() === 'dark' ? 0.18 : 0.07"></div>
      <div class="blob blob-2" [style.opacity]="themeService.theme() === 'dark' ? 0.14 : 0.05"></div>

      <mat-sidenav-container class="sidenav-container" autosize>

        @if (authService.currentUser() && !isAuthRoute) {
          <mat-sidenav
            #sidenav
            class="app-sidenav"
            [mode]="isMobile ? 'over' : 'side'"
            [opened]="isMobile ? false : true"
            [fixedInViewport]="true"
            [fixedTopGap]="0"
          >
            <app-sidebar />
          </mat-sidenav>
        }

        <mat-sidenav-content class="sidenav-content">
          @if (authService.currentUser() && !isAuthRoute && isMobile) {
            <button class="hamburger-fab" (click)="sidenav?.toggle()" aria-label="Menu">
              <mat-icon>menu</mat-icon>
            </button>
          }
          <main [class]="isAuthRoute ? 'main-content--bare' : 'main-content'">
            <router-outlet />
          </main>
        </mat-sidenav-content>

      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
    }

    /* ── Background with blobs ── */
    .app-bg {
      position: fixed;
      inset: 0;
      background: var(--bg-app);
      overflow: hidden;
      transition: background-color 0.3s ease;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }

    .blob-1 {
      width: 500px;
      height: 500px;
      top: -120px;
      left: -80px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      filter: blur(130px);
      transition: opacity 0.3s ease;
    }

    .blob-2 {
      width: 440px;
      height: 440px;
      bottom: -80px;
      left: 40px;
      background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
      filter: blur(120px);
      transition: opacity 0.3s ease;
    }

    /* ── Sidenav container ── */
    .sidenav-container {
      position: absolute;
      inset: 0;
      background: transparent !important;
    }

    .app-sidenav {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      width: auto;
    }

    /* ── Content area ── */
    .sidenav-content {
      display: flex;
      flex-direction: column;
      background: transparent;
      scroll-behavior: smooth;
    }

    .main-content {
      flex: 1;
      padding: 24px 20px;
      overflow-y: auto;
    }
    .main-content--bare {
      flex: 1;
      padding: 0;
      background: #090f1a;
    }

    .hamburger-fab {
      position: fixed;
      top: 16px;
      left: 16px;
      z-index: 200;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-main);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: var(--shadow);
      transition: background 0.15s, transform 0.1s;
      &:active { transform: scale(0.92); }
    }

    @media (max-width: 768px) {
      .main-content { padding: 16px 12px; }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('sidenav') sidenav?: MatSidenav;
  isMobile = false;
  isAuthRoute = false;
  private sub!: Subscription;
  private routeSub!: Subscription;

  private breakpointObserver = inject(BreakpointObserver);
  private router = inject(Router);
  readonly sidebarService = inject(SidebarService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);

  ngOnInit() {
    this.sub = this.breakpointObserver
      .observe([Breakpoints.Handset, '(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    this.routeSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const url = e.urlAfterRedirects.split('#')[0] || '/';
        this.isAuthRoute = AUTH_ROUTES.some(r => url.startsWith(r)) || NO_SIDEBAR_EXACT.includes(url);
        if (this.isMobile) this.sidenav?.close();
      });
    const initUrl = this.router.url.split('#')[0] || '/';
    this.isAuthRoute = AUTH_ROUTES.some(r => initUrl.startsWith(r)) || NO_SIDEBAR_EXACT.includes(initUrl);
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
