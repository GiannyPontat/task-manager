export type ProjectRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface Project {
  id: number;
  name: string;
  description?: string;
  ownerName: string;
  currentUserRole: ProjectRole;
  memberCount: number;
  createdAt: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  userId: number;
  username: string;
  email: string;
  role: ProjectRole;
  avatarUrl?: string;
}

export interface ProjectRequest {
  name: string;
  description?: string;
}

export interface ProjectMemberRequest {
  email: string;
  role: ProjectRole;
}
