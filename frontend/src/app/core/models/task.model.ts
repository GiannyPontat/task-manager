export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
  columnId?: number;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  columnId?: number;
}

export interface KanbanColumn {
  id: number;
  title: string;
  position: number;
  tasks: Task[];
}

export interface ColumnRequest {
  title: string;
  position: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
