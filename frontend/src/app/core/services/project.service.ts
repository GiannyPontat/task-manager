import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';
import { Project, ProjectMember, ProjectMemberRequest, ProjectRequest, ProjectRole } from '../models/project.model';
import { environment } from '../../../environments/environment';

const BASE = `${environment.apiUrl}/projects`;

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http = inject(HttpClient);

  projects   = signal<Project[]>([]);
  selected   = signal<Project | null>(null);

  loadProjects() {
    return this.http.get<Project[]>(BASE).pipe(
      tap(list => this.projects.set(list)),
      switchMap(list => {
        const first = !this.selected() && list.length > 0 ? list[0] : (this.selected() ?? null);
        if (!first) return [];
        return this.getProject(first.id).pipe(tap(full => this.selected.set(full)));
      })
    );
  }

  createProject(payload: ProjectRequest) {
    return this.http.post<Project>(BASE, payload).pipe(
      tap(p => {
        this.projects.update(list => [...list, p]);
        this.selected.set(p);
      })
    );
  }

  getProject(id: number) {
    return this.http.get<Project>(`${BASE}/${id}`);
  }

  updateProject(id: number, payload: ProjectRequest) {
    return this.http.put<Project>(`${BASE}/${id}`, payload).pipe(
      tap(updated => {
        this.projects.update(list => list.map(p => p.id === id ? { ...p, ...updated } : p));
        if (this.selected()?.id === id) this.selected.update(p => ({ ...p!, ...updated }));
      })
    );
  }

  deleteProject(id: number) {
    return this.http.delete<void>(`${BASE}/${id}`).pipe(
      tap(() => {
        this.projects.update(list => list.filter(p => p.id !== id));
        if (this.selected()?.id === id) {
          const remaining = this.projects();
          this.selected.set(remaining.length > 0 ? remaining[0] : null);
        }
      })
    );
  }

  addMember(projectId: number, payload: ProjectMemberRequest) {
    return this.http.post<ProjectMember>(`${BASE}/${projectId}/members`, payload);
  }

  changeMemberRole(projectId: number, userId: number, role: ProjectRole) {
    return this.http.patch<ProjectMember>(
      `${BASE}/${projectId}/members/${userId}`,
      null,
      { params: { role } }
    );
  }

  removeMember(projectId: number, userId: number) {
    return this.http.delete<void>(`${BASE}/${projectId}/members/${userId}`);
  }

  selectProject(project: Project) {
    this.selected.set(project);
    // Fetch full project (with members) and update
    this.getProject(project.id).pipe(
      tap(full => this.selected.set(full))
    ).subscribe();
  }
}
