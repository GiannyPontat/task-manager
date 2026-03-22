import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkspaceMember {
  name: string;
  initials: string;
  color: string;
  role: 'admin' | 'member';
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly workspaceId = 1;

  getMembers(): Observable<WorkspaceMember[]> {
    return this.http
      .get<WorkspaceMember[]>(
        `${environment.apiUrl}/workspaces/${this.workspaceId}/members`
      )
      .pipe(catchError(() => of([])));
  }

  inviteMember(email: string): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/workspaces/${this.workspaceId}/invite`,
      { email }
    );
  }
}
