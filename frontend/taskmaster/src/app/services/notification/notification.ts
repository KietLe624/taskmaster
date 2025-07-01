/*
  File: src/app/services/notification.service.ts
  Description: Quản lý dữ liệu và logic cho hệ thống thông báo.
*/
import { Injectable } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http'; // Import HttpClient để gọi API
import { BehaviorSubject, Observable, map, tap } from 'rxjs';

// Định nghĩa kiểu dữ liệu cho một thông báo
export interface Notification {
  id: string;
  type: 'due-soon' | 'assignment' | 'project-update' | 'completed-task';
  message: string;
  date: string;
  time: string;
  link: string;
  read: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  // BehaviorSubject để lưu trữ danh sách thông báo và phát hiện thay đổi
  private notifications = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notifications.asObservable();

  // URL của API để lấy thông báo, có thể thay đổi tùy theo backend
  private apiUrl = 'http://localhost:3000/api/notifications'; // Ví dụ URL

  constructor(private http: HttpClient) {
    // Khởi tạo với một mảng rỗng nếu không có thông báo nào
    this.notifications.next([]);
  }

  /**
   * Lấy danh sách thông báo từ backend và cập nhật state.
   * Bạn sẽ gọi hàm này từ một component, ví dụ trong ngOnInit.
   */
  public fetchNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl).pipe(
      tap(notifications => {
        // Khi nhận được dữ liệu từ API, cập nhật BehaviorSubject
        this.notifications.next(notifications);
      })
    );
  }

  public markAsRead(id: string): Observable<any> {
    // Gửi yêu cầu PATCH đến API để cập nhật trạng thái
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => {
        // Sau khi backend xác nhận thành công, cập nhật state ở client
        const currentNotifications = this.notifications.getValue();
        const updatedNotifications = currentNotifications.map(n =>
          n.id === id ? { ...n, read: true } : n
        );
        this.notifications.next(updatedNotifications);
      })
    );
  }

  /**
   * Lấy số lượng thông báo chưa đọc. Logic này không thay đổi.
   */
  public getUnreadCount(): Observable<number> {
    return this.notifications$.pipe(
      map(notifications => notifications.filter(n => !n.read).length)
    );
  }
}
