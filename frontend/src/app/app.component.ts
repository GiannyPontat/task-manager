import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService }   from './core/services/auth.service';
import { ThemeService }  from './core/services/theme.service';
import { TopbarComponent } from './features/shared/topbar/topbar.component';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

const AUTH_ROUTES    = ['/login', '/register', '/forgot-password', '/reset-password'];
const NO_TOPBAR_EXACT = ['/'];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TopbarComponent],
  template: `
    <!-- Fixed decorative background -->
    <div class="app-bg" [class.app-bg--landing]="isLandingRoute">
      <div class="blob blob-1" [style.opacity]="themeService.theme() === 'dark' ? 0.18 : 0.07"></div>
      <div class="blob blob-2" [style.opacity]="themeService.theme() === 'dark' ? 0.14 : 0.05"></div>
    </div>

    <!-- Single scroll container -->
    <div class="app-shell">

      @if (authService.currentUser() && !isAuthRoute) {
        <app-topbar />
      }

      <main [class]="isAuthRoute ? 'app-main--bare' : 'app-main'">
        <router-outlet />
      </main>

      @if (authService.currentUser() && !isAuthRoute) {
        <footer class="app-footer">
          <div class="footer-inner">
            <span class="footer-copy">© 2025 Flowly · Gianny_Pnt</span>
            <div class="footer-links">
              <a href="https://gianny-dev.com" target="_blank" rel="noopener" class="footer-a">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                gianny-dev.com
              </a>
              <a href="https://linkedin.com/in/gianny-pnt" target="_blank" rel="noopener" class="footer-a">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                  <circle cx="4" cy="4" r="2"/>
                </svg>
                LinkedIn
              </a>
              <a href="https://github.com/Gianny-Pnt/task-manager" target="_blank" rel="noopener" class="footer-a">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836a9.59 9.59 0 012.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
        </footer>
      }

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    /* ── Fixed background ── */
    .app-bg {
      position: fixed;
      inset: 0;
      background: var(--bg-app);
      overflow: hidden;
      transition: background-color 0.3s ease;
      z-index: 0;
    }
    .app-bg--landing { background: #090f1a !important; }

    .blob {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .blob-1 {
      width: 500px; height: 500px;
      top: -120px; left: -80px;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      filter: blur(130px);
      transition: opacity 0.3s ease;
    }
    .blob-2 {
      width: 440px; height: 440px;
      bottom: -80px; right: 40px;
      background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
      filter: blur(120px);
      transition: opacity 0.3s ease;
    }

    /* ── App shell — single scroll container ── */
    .app-shell {
      position: absolute;
      inset: 0;
      z-index: 1;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-behavior: smooth;
    }

    /* ── Main content ── */
    .app-main {
      flex: 1;
      padding: 24px 20px;
    }
    .app-main--bare {
      flex: 1;
    }

    /* ── Footer ── */
    .app-footer {
      border-top: 1px solid var(--border);
      padding: 16px 20px;
      flex-shrink: 0;
    }
    .footer-inner {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .footer-copy {
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 12px;
      color: var(--text-muted);
    }
    .footer-links {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .footer-a {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      text-decoration: none;
      font-family: 'Outfit', system-ui, sans-serif;
      font-size: 12px;
      color: var(--text-muted);
      transition: color 0.15s;
    }
    .footer-a:hover { color: var(--text-main); }

    @media (max-width: 768px) {
      .app-main { padding: 16px 12px; }
      .footer-inner { flex-direction: column; align-items: flex-start; }
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  isAuthRoute    = false;
  isLandingRoute = false;
  private sub!: Subscription;

  readonly authService  = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  ngOnInit() {
    this.sub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        const url = e.urlAfterRedirects.split('#')[0] || '/';
        this.isLandingRoute = NO_TOPBAR_EXACT.includes(url);
        this.isAuthRoute    = AUTH_ROUTES.some(r => url.startsWith(r)) || this.isLandingRoute;
      });

    const initUrl = this.router.url.split('#')[0] || '/';
    this.isLandingRoute = NO_TOPBAR_EXACT.includes(initUrl);
    this.isAuthRoute    = AUTH_ROUTES.some(r => initUrl.startsWith(r)) || this.isLandingRoute;
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
