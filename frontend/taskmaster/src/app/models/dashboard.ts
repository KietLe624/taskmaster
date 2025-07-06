import { Projects } from './projects';
import { Users } from './users';

export interface DashboardModel {
  managedProjects: number;
  inProgressTasks: number;
  dueSoonTasks: number;
  overdueTasks: number;
  completedThisWeek: number;
  avgTimePerTask: string;
  onTimeCompletionRate: string;
}

export interface DashboardData {
  currentUser: Users;
  stats: DashboardModel;
  recentProjects: Projects[];
}
