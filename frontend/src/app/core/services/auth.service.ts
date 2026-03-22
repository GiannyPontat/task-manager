import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/auth`;
const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'current_user';

@Injectable({ providedIn: 'root' })
export class AuthService {

  readonly currentUser = signal<AuthResponse | null>(this.loadUser());

  constructor(private http: HttpClient, private router: Router) {}

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

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${API}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${API}/reset-password`, { token, newPassword });
  }

  logout(): void {
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
