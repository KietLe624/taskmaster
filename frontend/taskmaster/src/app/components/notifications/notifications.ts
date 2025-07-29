import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NotificationService } from '../../services/notification/notification';
import { Router } from '@angular/router';
import { Notification } from '../../models/notifications';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  // --- THAY ĐỔI: Chia thành hai danh sách riêng biệt ---
  unreadNotifications: any[] = [];
  readNotifications: any[] = [];

  unreadCount = 0;
  isLoading = false;

  constructor(private notificationService: NotificationService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        // --- THAY ĐỔI: Phân loại thông báo vào hai danh sách ---
        this.unreadNotifications = data.filter(n => !n.status_read);
        this.readNotifications = data.filter(n => n.status_read);
        this.unreadCount = this.unreadNotifications.length;

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi tải thông báo:", err);
        this.isLoading = false;
      }
    });
  }

  // --- TỐI ƯU: Logic đánh dấu đã đọc ---
  markAsRead(notification: any): void {
    // Chỉ xử lý nếu thông báo chưa đọc
    if (notification.status_read) {
        if (notification.link) this.router.navigateByUrl(notification.link);
        return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        // Di chuyển thông báo từ danh sách "chưa đọc" sang "đã đọc"
        const index = this.unreadNotifications.findIndex(n => n.id === notification.id);
        if (index > -1) {
          const readNotification = { ...this.unreadNotifications[index], status_read: true };
          this.unreadNotifications.splice(index, 1);
          this.readNotifications.unshift(readNotification); // Thêm vào đầu danh sách đã đọc
          this.unreadCount = this.unreadNotifications.length;
        }

        if (notification.link) {
          this.router.navigateByUrl(notification.link);
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error("Lỗi khi đánh dấu đã đọc:", err)
    });
  }

  // --- TỐI ƯU: Logic xóa thông báo ---
  deleteNotification(notificationId: number, isRead: boolean): void {
    this.notificationService.deleteNotification(notificationId).subscribe({
      next: () => {
        // Xóa thông báo khỏi danh sách tương ứng
        if (isRead) {
          this.readNotifications = this.readNotifications.filter(n => n.id !== notificationId);
        } else {
          this.unreadNotifications = this.unreadNotifications.filter(n => n.id !== notificationId);
          this.unreadCount = this.unreadNotifications.length;
        }
        console.log("Thông báo đã được xóa:", notificationId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi xóa thông báo:", err);
      }
    });
  }
}
