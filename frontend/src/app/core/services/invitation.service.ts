import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface InvitationResult {
  status: 'invited' | 'already_registered';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http = inject(HttpClient);
  private readonly BASE = `${environment.apiUrl}/invitations`;

  invite(email: string, taskId?: number, projectId?: number) {
    return this.http.post<InvitationResult>(this.BASE, { email, taskId, projectId });
  }
}
