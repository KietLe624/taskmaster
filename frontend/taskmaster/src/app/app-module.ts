import {
  NgModule,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { Dashboard } from './components/dashboard/dashboard';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { Projects } from './components/projects/projects';
import { Tasks } from './components/tasks/tasks';
import { Reports } from './components/reports/reports';
import { Profile } from './components/profile/profile';
import { Notifications } from './components/notifications/notifications';
import { ProjectDetail } from './components/project-detail/project-detail';
import { CreateProject } from './components/create-project/create-project';
import { CreateTask } from './components/create-task/create-task';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { authInterceptor } from './interceptor/auth-interceptor';
import { FilterPipe } from './services/filter/filer';
import { BellModule } from './components/bell-module/bell-module';
import { TaskDetailModal } from './components/task-detail-modal/task-detail-modal';
import { AddMemberModal } from './components/add-member-modal/add-member-modal';
import { Admin } from './admin/component/admin/admin';

@NgModule({
  declarations: [
    App,
    Header,
    Sidebar,
    Footer,
    Dashboard,
    Projects,
    Tasks,
    Reports,
    Profile,
    Notifications,
    ProjectDetail,
    CreateProject,
    CreateTask,
    Login,
    Register,
    AuthLayout,
    PublicLayout,
    BellModule,
    TaskDetailModal,
    AddMemberModal,
    Admin,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule, CommonModule, FilterPipe, ReactiveFormsModule],

  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ],
  bootstrap: [App],
})
export class AppModule { }
