import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, of, tap } from 'rxjs';
import { ProjectsData } from '../../models/projects';
import { ProjectDetailData } from '../../models/project-detail';
import { ProjectFrom } from '../../components/create-project/create-project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api/projects';
  private apiUrlTasks = 'http://localhost:3000/api/taskStatus';

  // Hàm tạo header động với token
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }

  constructor(private http: HttpClient) { }

  getProjects(): Observable<{ data: ProjectsData[]; count: number; message: string }> {
    return this.http.get<{ data: ProjectsData[]; count: number; message: string }>(this.apiUrl, this.getAuthHeaders());
  }

  getProjectById(id: number): Observable<ProjectDetailData> {
    return this.http.get<ProjectDetailData>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  createProject(projectData: Omit<ProjectFrom, 'id' | 'manager_name' | 'user_name'>): Observable<ProjectsData> {
    const payload = {
      name: projectData.name,
      description: projectData.description,
      start_date: projectData.startDate,
      end_date: projectData.endDate
    };
    return this.http.post<ProjectsData>(this.apiUrl, payload, this.getAuthHeaders());
  }

  updateProject(id: number, projectData: ProjectFrom): Observable<ProjectsData> {
    const payload = {
      name: projectData.name,
      description: projectData.description,
      start_date: projectData.startDate,
      end_date: projectData.endDate
    };
    return this.http.put<ProjectsData>(`${this.apiUrl}/${id}`, payload, this.getAuthHeaders()).pipe(
      tap(_ => console.log(`Cập nhật dự án ${id} thành công`)),
      catchError(this.handleError<ProjectsData>(`updateProject id=${id}`))
    );
  }

  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  updateTask(taskId: number, updateData: { status: string }): Observable<any> {
    const url = `${this.apiUrlTasks}/${taskId}`;
    return this.http.patch(url, updateData, this.getAuthHeaders()).pipe(
      tap(_ => console.log(`Cập nhật trạng thái task ${taskId} thành công`)),
      catchError(this.handleError<any>(`updateTask id=${taskId}`))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`, error);
      return of(result as T);
    };
  }
}
