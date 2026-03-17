import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Page, Task, TaskRequest, TaskStatus } from '../models/task.model';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/tasks`;

@Injectable({ providedIn: 'root' })
export class TaskService {

  constructor(private http: HttpClient) {}

  getTasks(status?: TaskStatus, page = 0, size = 10): Observable<Page<Task>> {
    let params = new HttpParams().set('page', page).set('size', size).set('sort', 'createdAt,desc');
    if (status) params = params.set('status', status);
    return this.http.get<Page<Task>>(API, { params });
  }

  createTask(payload: TaskRequest): Observable<Task> {
    return this.http.post<Task>(API, payload);
  }

  updateTask(id: number, payload: TaskRequest): Observable<Task> {
    return this.http.put<Task>(`${API}/${id}`, payload);
  }

  moveTask(id: number, columnId: number, position: number): Observable<Task> {
    return this.http.patch<Task>(`${API}/${id}/move`, { columnId, position });
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
