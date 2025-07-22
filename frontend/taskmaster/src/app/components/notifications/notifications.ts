import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Notification } from '../../services/notification/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.html',
  styleUrl: './notifications.css'
})
export class Notifications implements OnInit {

  notifications: any[] = [];
  unreadCount = 0;
  isLoading = false;
  showDropdown = false;

  constructor(private notificationService: Notification, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
        console.log("Thông báo:", this.notifications);
        this.unreadCount = this.notifications.filter(n => !n.status_read).length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Lỗi khi tải thông báo:", err);
        this.isLoading = false;
      }
    });
  }

  // Tạo thông báo
  createNotification(notification: any): void {
    this.notificationService.createNotification(notification).subscribe({
      next: (data) => {
        console.log("Thông báo đã được tạo:", data);
        this.loadNotifications(); // Tải lại danh sách thông báo sau khi tạo mới
      },
      error: (err) => {
        console.error("Lỗi khi tạo thông báo:", err);
      }
    });
  }
  // mark notification as read
  markAsRead(notification: any): void {
    if (!notification.status_read) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          const index = this.notifications.findIndex(n => n.id === notification.id);
          if (index > -1) {
            const updatedNotification = { ...this.notifications[index], status_read: true };
            const newNotifications = [...this.notifications];
            newNotifications[index] = updatedNotification;
            this.notifications = newNotifications;
            this.unreadCount = this.notifications.filter(n => !n.status_read).length;
          }
          if (notification.link) {
            this.router.navigateByUrl(notification.link);
          }
        },
        error: (err) => console.error("Lỗi khi đánh dấu đã đọc:", err)
      });
    } else {
      if (notification.link) {
        this.router.navigateByUrl(notification.link);
      }
    }
  }
}
