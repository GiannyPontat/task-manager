import { Injectable, signal } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly KEY = 'app-theme';

  readonly theme = signal<Theme>(this.saved());

  constructor() {
    this.apply(this.theme());
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.apply(next);
    localStorage.setItem(this.KEY, next);
  }

  private apply(t: Theme): void {
    document.documentElement.setAttribute('data-theme', t);
  }

  private saved(): Theme {
    return (localStorage.getItem(this.KEY) as Theme) ?? 'light';
  }
}
