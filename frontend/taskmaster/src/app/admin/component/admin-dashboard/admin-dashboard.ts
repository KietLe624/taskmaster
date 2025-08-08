import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../service/admin'; // Adjust the import path as necessary
import { AdminDashboardStats } from '../../model/admin-dashboard'; // Adjust the import path as necessary
@Component({
  selector: 'app-admin-dashboard',
  standalone: false,
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard implements OnInit {
  dataDashboard: AdminDashboardStats | null = null;
  errorMessage: string = '';
  isLoading: boolean = true;
  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getStats();
  }

  getStats(): void {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.dataDashboard = data.data || data || null;
        console.log('Số liệu thống kê:', data);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải số liệu thống kê: ' + (err.error?.message || err.message);
        console.error('Lỗi khi lấy số liệu thống kê:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
