import { User } from './users';

export interface AdminDashboardStats {
  userCount: number;
  projectCount: number;
  taskCount: number;
  users: User[];
}
