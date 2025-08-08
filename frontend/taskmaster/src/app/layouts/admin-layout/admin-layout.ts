import { Component } from '@angular/core';
import { Auth } from '../../services/auth/auth'; // Adjust the import path as necessary
@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {
  constructor(private auth: Auth) {}

  // Biến để theo dõi trạng thái đóng/mở của sidebar
  isSidebarOpen: boolean = false;

  // Phương thức để mở/đóng sidebar
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // Phương thức để đóng sidebar
  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
  // đăng xuất
  logout(): void {
    // Gọi phương thức logout từ AuthService
    this.auth.logout();
  }
}
