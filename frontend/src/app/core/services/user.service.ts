import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { AuthResponse } from '../models/auth.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  updateProfile(username: string) {
    return this.http
      .patch<AuthResponse>(`${environment.apiUrl}/users/me`, { username })
      .pipe(tap(res => this.auth.refreshSession(res)));
  }
}
