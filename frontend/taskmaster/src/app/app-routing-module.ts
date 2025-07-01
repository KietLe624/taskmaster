import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Define the routes for the application
import { Dashboard } from './components/dashboard/dashboard';
import { Projects } from './components/projects/projects';
import { ProjectDetail } from './components/project-detail/project-detail';
import { Tasks } from './components/tasks/tasks';
import { Reports } from './components/reports/reports';
import { Profile } from './components/profile/profile';
import { Notifications } from './components/notifications/notifications';

const routes: Routes = [
  { path: '', redirectTo: '/dashboards', pathMatch: 'full' },
  { path: 'dashboards', component: Dashboard, title: 'TaskMaster - Trang Chủ' },
  { path: 'projects', component: Projects, title: 'TaskMaster - Dự Án' },
  { path: 'project-detail', component: ProjectDetail, title: 'TaskMaster - Chi Tiết Dự Án' },
  { path: 'tasks', component: Tasks, title: 'TaskMaster - Công Việc' },
  { path: 'reports', component: Reports, title: 'TaskMaster - Báo Cáo' },
  { path: 'profile', component: Profile, title: 'TaskMaster - Hồ Sơ' },
  { path: 'notifications', component: Notifications, title: 'TaskMaster - Thông Báo' },
  // Catch-all route for 404 Not Found
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
