import { Injectable, signal } from '@angular/core';
import { Priority } from '../models/task.model';

const LABEL_TO_PRIORITY: Record<string, Priority> = {
  'Urgent': 'HIGH',
  'Moyen':  'MEDIUM',
  'Bas':    'LOW',
};

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private _open = signal(true);
  readonly priorityFilter = signal<Priority | null>(null);

  open = this._open.asReadonly();

  toggle() { this._open.update(v => !v); }
  close()  { this._open.set(false); }

  setFilter(label: string | null): void {
    this.priorityFilter.set(label ? (LABEL_TO_PRIORITY[label] ?? null) : null);
  }
}
