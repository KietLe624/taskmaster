import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebar';
import { NotificationService } from '../../services/notification/notification';
import { Observable } from 'rxjs';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  public unreadCount$: Observable<number>;
  isLoggedIn$: Observable<boolean>;

  constructor(
    private sidebarService: SidebarService,
    private notificationService: NotificationService,
    private authService: Auth
  ) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
    this.isLoggedIn$ = this.authService.isLoggedIn$;
  }

  ngOnInit(): void { }

  // Hàm để mở sidebar
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
  // Hàm đăng xuất
    // Hàm này sẽ được gọi khi người dùng nhấn nút Đăng xuất
  logout(): void {
    this.authService.logout();
  }
}
