import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard';
import { DashboardModel } from '../../models/dashboard';
import { Projects } from '../../models/projects';
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
  public recentProjects: Projects[] = [];
  public isLoading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('Dữ liệu được gán trong Component:', data);
        this.currentUser = data.currentUser;
        this.stats = data.stats;
        this.recentProjects = data.recentProjects;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu dashboard:', err);
        this.isLoading = false;
      }
    });
  }
}
