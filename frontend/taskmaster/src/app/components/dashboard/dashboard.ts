import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  // Biến để xác định xem sidebar có đang mở hay không
  public isSidebarOpen: boolean = false;

  constructor() {}
  //
}
