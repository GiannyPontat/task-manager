import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, Page, Task, TaskRequest, TaskStatus } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {

  constructor(private http: HttpClient) {}

  private base(projectId: number) {
    return `${environment.apiUrl}/projects/${projectId}/tasks`;
  }

  getTasks(projectId: number, status?: TaskStatus, page = 0, size = 50): Observable<Page<Task>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (status) params = params.set('status', status);
    return this.http.get<Page<Task>>(this.base(projectId), { params });
  }

  createTask(projectId: number, payload: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.base(projectId), payload);
  }

  updateTask(projectId: number, id: number, payload: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${this.base(projectId)}/${id}`, payload);
  }

  moveTask(projectId: number, id: number, columnId: number, position: number, status?: TaskStatus): Observable<Task> {
    return this.http.patch<Task>(`${this.base(projectId)}/${id}/move`, { columnId, position, status });
  }

  deleteTask(projectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(projectId)}/${id}`);
  }

  getActivities(projectId: number, taskId: number): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.base(projectId)}/${taskId}/activities`);
  }

  addComment(projectId: number, taskId: number, text: string): Observable<Activity> {
    return this.http.post<Activity>(`${this.base(projectId)}/${taskId}/activities`, { text });
  }
}
