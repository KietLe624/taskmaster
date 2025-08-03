import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { TaskDetailData, TaskForm, User, Project, TaskNotification } from '../../models/tasks';
import { Task } from '../../models/project-detail';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private apiUrl = 'http://localhost:3000/api/tasks'; // URL cho lấy danh sách công việc
  // private apiUrlTasks = 'http://localhost:3000/api/tasks/taskStatus'; // URL cho lấy trạng thái công việc

  constructor(private http: HttpClient) { }
  // Phương thức mới để lấy Projects
  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>('http://localhost:3000/api/projects/all');
  }
  // Phương thức mới để lấy Users
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/api/users/all');
  }
  getTasks(filters: any): Observable<TaskDetailData[]> {
    const token = sessionStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    }
    return this.http.get<TaskDetailData[]>(this.apiUrl, { headers, params });
  }
  createTask(taskData: TaskForm): Observable<{ message: string; data: TaskDetailData }> {
    return this.http.post<{ message: string; data: TaskDetailData }>(this.apiUrl, taskData);
  }
  updateTaskStatus(taskId: number, newStatus: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/taskStatus/${taskId}`, { status: newStatus });
  }
  // Phương thức để cập nhật công việc
  updateTask(taskId: number, taskData: TaskForm): Observable<TaskDetailData> {
    const payload = {
      name: taskData.name,
      description: taskData.description,
      priority: taskData.priority,
      status: taskData.status,
      project_id: taskData.project_id,
      cate: taskData.cate,
      due_date: taskData.due_date,
    }
    return this.http.put<TaskDetailData>(`${this.apiUrl}/${taskId}`, payload).pipe(
      tap(_ => console.log(`Cập nhật công việc ${taskId} thành công`)),
      catchError(this.handleError<TaskDetailData>(`updateTask id=${taskId}`))
    );
  }

  deleteTask(taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${taskId}`);
  }

  getNotificationsForTask(taskId: number): Observable<TaskNotification[]> {
    return this.http.get<TaskNotification[]>(`${this.apiUrl}/${taskId}/notifications`);
  }

  // getTaskOverdue(): Observable<TaskDetailData[]> {
  //   const token = sessionStorage.getItem('auth_token');


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }

}
