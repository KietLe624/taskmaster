import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-layout',
  standalone: false,
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout {

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
}
