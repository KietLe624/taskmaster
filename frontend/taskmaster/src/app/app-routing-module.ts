import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// Import necessary components and guards
import { AuthGuard } from './guards/auth-guard';
import { NoAuthGuard } from './guards/no-auth-guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { authInterceptor } from './interceptor/auth-interceptor'; // Import interceptor dạng hàm của bạn


// Define the routes for the application
import { Dashboard } from './components/dashboard/dashboard';
import { Projects } from './components/projects/projects';
import { ProjectDetail } from './components/project-detail/project-detail';
import { Tasks } from './components/tasks/tasks';
import { Reports } from './components/reports/reports';
import { Profile } from './components/profile/profile';
import { Notifications } from './components/notifications/notifications';
import { Login } from './components/login/login';
import { Register } from './components/register/register';

const routes: Routes = [
  // Public routes
  {
    path: '',
    component: PublicLayout,
    canActivate: [NoAuthGuard],
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Tự động chuyển đến trang login
      { path: 'login', component: Login },
      { path: 'register', component: Register },
    ],
  },
  // Authenticated routes
  {
    path: 'app',
    component: AuthLayout,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboards', pathMatch: 'full' },
      {
        path: 'dashboards',
        component: Dashboard,
        title: 'TaskMaster - Trang Chủ',
      },
      { path: 'projects', component: Projects, title: 'TaskMaster - Dự Án' },
      {
        path: 'project-detail',
        component: ProjectDetail,
        title: 'TaskMaster - Chi Tiết Dự Án',
      },
      { path: 'tasks', component: Tasks, title: 'TaskMaster - Công Việc' },
      { path: 'reports', component: Reports, title: 'TaskMaster - Báo Cáo' },
      { path: 'profile', component: Profile, title: 'TaskMaster - Hồ Sơ' },
      {
        path: 'notifications',
        component: Notifications,
        title: 'TaskMaster - Thông Báo',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})

export class AppRoutingModule {}
