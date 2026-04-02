import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';

/** Délai avant expiration à partir duquel on rafraîchit (5 min) */
const REFRESH_BEFORE_MS = 5 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {

  readonly currentUser = signal<AuthResponse | null>(this.loadUser());

  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    // Replanifie le refresh si un token existe déjà au démarrage
    if (this.getToken()) this.scheduleRefresh(this.getToken()!);
  }

  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(`${API}/register`, payload).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${API}/login`, payload).pipe(
      tap(res => this.saveSession(res))
    );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/refresh`, {}).pipe(
      tap(res => this.saveSession(res))
    );
  }

  private scheduleRefresh(token: string): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const exp = this.getTokenExpiry(token);
    if (!exp) return;
    const delay = exp - Date.now() - REFRESH_BEFORE_MS;
    if (delay <= 0) {
      // Token expiré — on nettoie la session sans rediriger (l'utilisateur peut être sur une route publique)
      if (this.refreshTimer) clearTimeout(this.refreshTimer);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      this.currentUser.set(null);
      return;
    }
    this.refreshTimer = setTimeout(() => {
      this.refresh().subscribe({
        error: () => this.logout(),
      });
    }, delay);
  }

  private getTokenExpiry(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${API}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API}/reset-password`, { token, newPassword });
  }

  logout(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  refreshSession(res: AuthResponse): void {
    this.saveSession(res);
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this.currentUser.set(res);
    this.scheduleRefresh(res.token);
  }

  private loadUser(): AuthResponse | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as AuthResponse;
    // Session obsolète : username contient un email (avant le fix backend)
    if (user.username?.includes('@')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    return user;
  }
}
