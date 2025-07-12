import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectsData } from '../../models/projects';
import { ProjectDetailData } from '../../models/project-detail';
import { ProjectFrom } from '../../components/create-project/create-project';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:3000/api/projects'; // URL cho lấy danh sách dự án
  constructor(private http: HttpClient) { }

  getProjects(): Observable<{ data: ProjectsData[]; count: number; message: string }> {
    const token = sessionStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.get<{ data: ProjectsData[]; count: number; message: string }>(this.apiUrl, { headers });
  }

  getProjectById(id: number): Observable<ProjectDetailData> {
    const token = sessionStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.get<ProjectDetailData>(`${this.apiUrl}/${id}`, { headers });
  }

  createProject(projectData: Omit<ProjectFrom, 'id' | 'manager_name' | 'user_name'>): Observable<ProjectsData> {
    // Dữ liệu gửi đi chỉ cần các trường mà backend yêu cầu trong body
    const payload = {
      name: projectData.name,
      description: projectData.description,
      start_date: projectData.startDate,
      end_date: projectData.endDate
    };
    return this.http.post<ProjectsData>(this.apiUrl, payload);
  }
  updateProject(id: number, projectData: ProjectFrom): Observable<ProjectsData> {
    const payload = {
      name: projectData.name,
      description: projectData.description,
      start_date: projectData.startDate,
      end_date: projectData.endDate
    };
    return this.http.put<ProjectsData>(`${this.apiUrl}/${id}`, payload);
  }
  deleteProject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
