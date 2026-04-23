import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export type Theme = 'dark' | 'light';

/** Routes where dark mode must NEVER apply (landing + auth flows). */
const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'app-theme';
  private readonly router = inject(Router);

  /** User's chosen theme (persisted). */
  readonly theme = signal<Theme>(this.saved());

  /** Whether the current route is public (forces light). */
  private readonly isPublicRoute = signal<boolean>(this.matchPublic(this.router.url));

  constructor() {
    // Re-apply on every navigation so public routes always land on light.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.isPublicRoute.set(this.matchPublic(e.urlAfterRedirects));
        this.apply();
      });

    this.apply();
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem(this.KEY, next);
    this.apply();
  }

  /** Applies the effective theme: light on public routes, user pref otherwise. */
  private apply(): void {
    const effective: Theme = this.isPublicRoute() ? 'light' : this.theme();
    document.documentElement.setAttribute('data-theme', effective);
  }

  private matchPublic(url: string): boolean {
    const path = '/' + (url.split('?')[0].split('#')[0].replace(/^\/+/, ''));
    return PUBLIC_ROUTES.includes(path === '/' ? '/' : path.replace(/\/$/, ''));
  }

  private saved(): Theme {
    return (localStorage.getItem(this.KEY) as Theme) ?? 'light';
  }
}
