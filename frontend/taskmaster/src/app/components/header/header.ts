import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebar';
import { Notification } from '../../services/notification/notification';
import { Observable } from 'rxjs';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  isLoggedIn$: Observable<boolean>;

  constructor(
    private sidebarService: SidebarService,
    private notificationService: Notification,
    private authService: Auth
  ) {
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
