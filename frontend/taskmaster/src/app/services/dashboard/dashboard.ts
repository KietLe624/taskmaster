import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardData } from '../../models/dashboard';
import { ScheduledTask } from '../../models/schedule'; // Import the ScheduledTask interface

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`); // Gọi endpoint để lấy dữ liệu dashboard
  }
  getTaskInMonth(year: number, month: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/tasks/activity/${year}/${month}`);
  }
}
