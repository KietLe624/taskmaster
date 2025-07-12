import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard';
import { DashboardModel } from '../../models/dashboard';
import { ProjectsData } from '../../models/projects';
import { Users } from '../../models/users'; // Assuming you have a User model defined

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})

export class Dashboard implements OnInit {
  public currentUser: Users | undefined;
  public stats: DashboardModel | undefined;
  public recentProjects: ProjectsData[] = [];
  public isLoading = true;
  dashboardData: any;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.currentUser = data.currentUser;
        this.stats = data.stats;
        this.recentProjects = data.recentProjects;
        this.isLoading = false;
        console.log('Dữ liệu từ backend:', data);
        this.dashboardData = data; // Gán dữ liệu để hiển thị ra template
        // Báo cho Angular cập nhật lại giao diện
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
        this.isLoading = false; // Đặt isLoading thành false khi có lỗi
        // Báo cho Angular cập nhật lại giao diện
        this.cdr.detectChanges();
      }
    });
  }
}
