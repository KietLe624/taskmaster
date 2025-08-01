import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/users'; // Adjust the import path as necessary

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/admin'; // Điều chỉnh URL API của bạn

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboards`);
  }

  // Phương thức mới để lấy Users
  getAllUsers(params: { page: number; limit: number; search: string; }): Observable<User[]> {
    return this.http.get<User[]>('http://localhost:3000/api/users/all');
  }

  updateUser(userId: string, data: { full_name?: string, email?: string, roles?: string[] }): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}`, data);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
