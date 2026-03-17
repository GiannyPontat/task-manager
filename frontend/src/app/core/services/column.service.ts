import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ColumnRequest, KanbanColumn } from '../models/task.model';
import { environment } from '../../../environments/environment';

const API = `${environment.apiUrl}/columns`;

@Injectable({ providedIn: 'root' })
export class ColumnService {

  constructor(private http: HttpClient) {}

  getColumns(): Observable<KanbanColumn[]> {
    return this.http.get<KanbanColumn[]>(API);
  }

  createColumn(payload: ColumnRequest): Observable<KanbanColumn> {
    return this.http.post<KanbanColumn>(API, payload);
  }

  initDefaultColumns(): Observable<KanbanColumn[]> {
    return this.http.post<KanbanColumn[]>(`${API}/init`, {});
  }

  deleteColumn(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/${id}`);
  }
}
