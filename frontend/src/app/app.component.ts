import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from './features/shared/sidebar/sidebar.component';
import { SidebarService } from './core/services/sidebar.service';
import { AuthService } from './core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    SidebarComponent,
  ],
  template: `
    <div class="app-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>

      <mat-sidenav-container class="sidenav-container" autosize>

        @if (authService.currentUser()) {
          <mat-sidenav
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
          <main class="main-content">
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
      background: #0f172a;
      overflow: hidden;
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
      opacity: 0.18;
    }

    .blob-2 {
      width: 440px;
      height: 440px;
      bottom: -80px;
      left: 40px;
      background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%);
      filter: blur(120px);
      opacity: 0.14;
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
    }

    .main-content {
      flex: 1;
      padding: 24px 20px;
      overflow-y: auto;
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  isMobile = false;
  private sub!: Subscription;

  private breakpointObserver = inject(BreakpointObserver);
  readonly sidebarService = inject(SidebarService);
  readonly authService = inject(AuthService);

  ngOnInit() {
    this.sub = this.breakpointObserver
      .observe([Breakpoints.Handset, '(max-width: 768px)'])
      .subscribe(result => {
        this.isMobile = result.matches;
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
