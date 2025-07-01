import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebar';
import { NotificationService } from '../../services/notification/notification';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  public unreadCount$: Observable<number>;

  constructor(
    private sidebarService: SidebarService,
    private notificationService: NotificationService
  ) {
    this.unreadCount$ = this.notificationService.getUnreadCount();
  }

  ngOnInit(): void {}

  // Hàm để mở sidebar
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }
}
