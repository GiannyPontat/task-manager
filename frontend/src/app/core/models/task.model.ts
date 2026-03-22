export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type ActivityType = 'TASK_CREATED' | 'TASK_UPDATED' | 'COMMENT_ADDED';

export interface Activity {
  id: number;
  authorName: string;
  authorInitials: string;
  type: ActivityType;
  detail?: string;
  createdAt: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  createdAt: string;
  dueDate?: string;
  projectId?: number;
  columnId?: number;
  assignedMembers?: string[];
  createdByName?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  columnId?: number;
  assignedMembers?: string[];
}

export interface KanbanColumn {
  id: number;
  title: string;
  position: number;
  linkedStatus?: TaskStatus;
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
