import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TaskDetailData } from '../../models/tasks'; // Điều chỉnh đường dẫn nếu cần

@Injectable({
  providedIn: 'root'
})
export class Task {

  private apiUrl = 'http://localhost:3000/api/tasks'; // URL cho lấy danh sách công việc

  constructor(private http:HttpClient) { }

  getTasks(): Observable<any> {
    const token = sessionStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token || ''}`);
    return this.http.get<{data: TaskDetailData[]}>( this.apiUrl, { headers });
  }
}
