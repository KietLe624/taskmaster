import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Notification } from '../../models/notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';
  constructor(private http: HttpClient) { }

  // Lấy danh sách thông báo của người dùng
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}`);
  }
  markAsRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}`, {});
  }
  // Tạo thông báo mới
  createNotification(notification: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, notification);
  }
  // Xóa thông báo
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }
}
