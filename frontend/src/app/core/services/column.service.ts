import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ColumnRequest, KanbanColumn } from '../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ColumnService {

  constructor(private http: HttpClient) {}

  private base(projectId: number) {
    return `${environment.apiUrl}/projects/${projectId}/columns`;
  }

  getColumns(projectId: number): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(this.base(projectId));
  }

  createColumn(projectId: number, payload: ColumnRequest): Observable<KanbanColumn> {
    return this.http.post<KanbanColumn>(this.base(projectId), payload);
  }

  reorderColumns(projectId: number, updates: { id: number; position: number }[]): Observable<void> {
    return this.http.patch<void>(`${this.base(projectId)}/reorder`, updates);
  }

  deleteColumn(projectId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.base(projectId)}/${id}`);
  }
}
