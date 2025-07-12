import { ProjectsData } from './projects';
import { Users } from './users';

export interface DashboardModel {
  manageProjectsCount: number;
  manageTasksCount: number;
  inProgressTasksCount: number;
  dueSoonTasksCount: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  completedThisWeekCount: number;
  avgTimePerTask: number;
  onTimeCompletionRate: number;
}

export interface DashboardData {
  currentUser: Users;
  stats: DashboardModel;
  recentProjects: ProjectsData[];
}
