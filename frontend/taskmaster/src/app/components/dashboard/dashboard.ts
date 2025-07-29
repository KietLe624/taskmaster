import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard';
import { DashboardModel } from '../../models/dashboard';
import { ProjectsData } from '../../models/projects';
import { Users } from '../../models/users';


@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  public currentUser: Users | undefined;
  public stats: DashboardModel | undefined;
  public recentProjects: ProjectsData[] = [];
  public isLoading = true;

  // Thuộc tính cho Lịch Tháng
  public currentDate: Date = new Date();
  public daysInMonth: { date: Date, isCurrentMonth: boolean }[] = [];
  public weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private taskActivityDays = new Set<string>();

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
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

    this.loadCalendarData();
  }

  loadCalendarData(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    this.dashboardService.getTaskInMonth(year, month).subscribe(activeDays => {
      this.taskActivityDays = new Set(activeDays);
      this.generateCalendar();
      this.cdr.detectChanges();
    });
  }

  generateCalendar(): void {
    this.daysInMonth = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      const prevMonthDay = new Date(firstDay);
      prevMonthDay.setDate(prevMonthDay.getDate() - (startDayOfWeek - i));
      this.daysInMonth.push({ date: prevMonthDay, isCurrentMonth: false });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.daysInMonth.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentDate = new Date(this.currentDate);
    this.loadCalendarData();
  }
  goToToday(): void {
    this.currentDate = new Date();
    this.loadCalendarData();
  }
  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentDate = new Date(this.currentDate);
    this.loadCalendarData();
  }

  hasTask(day: { date: Date, isCurrentMonth: boolean }): boolean {
    if (!day.isCurrentMonth) return false;

    const year = day.date.getFullYear();
    const month = ('0' + (day.date.getMonth() + 1)).slice(-2);
    const dateOfMonth = ('0' + day.date.getDate()).slice(-2);
    const localDateString = `${year}-${month}-${dateOfMonth}`;

    return this.taskActivityDays.has(localDateString);
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  }
}
