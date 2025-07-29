import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard';
import { DashboardModel } from '../../models/dashboard';
import { ProjectsData } from '../../models/projects';
import { Users } from '../../models/users'; // Assuming you have a User model defined
import { ScheduledTask } from '../../models/schedule'; // Import the ScheduledTask interface

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

  // thuộc tính để hiển thị lịch trình
  public weeklySchedule: { [key: string]: ScheduledTask[] } = {};
  public daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  public timeMarkers: string[] = [];
  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef
  ) {
    for (let i = 0; i < 24; i++) {
      this.timeMarkers.push(`${i.toString().padStart(2, '0')}:00`);
    }
  }

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
      },
    });
    // Tải lịch trình khi component khởi tạo
    this.loadSchedule();
  }
  loadSchedule(): void {
    this.dashboardService.getScheduleData().subscribe((tasks) => {
      this.weeklySchedule = this.groupTasksByDay(tasks);
      this.cdr.detectChanges();
      console.log('Lịch trình hàng tuần:', this.weeklySchedule);
    });
  }
  private groupTasksByDay(tasks: ScheduledTask[]): {
    [key: string]: ScheduledTask[];
  } {
    // Khởi tạo đối tượng lịch trình trống
    const grouped: { [key: string]: ScheduledTask[] } = {
      Mon: [],
      Tue: [],
      Wed: [],
      Thu: [],
      Fri: [],
      Sat: [],
      Sun: [],
    };

    // Mảng để ánh xạ chỉ số từ getDay() ra tên ngày
    const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    tasks.forEach((task) => {
      const dayIndex = new Date(task.start_time).getDay(); // 0=Sun, 1=Mon...
      const dayName = dayMap[dayIndex]; // Lấy tên ngày chính xác từ map

      // Chỉ thêm task vào nếu ngày đó có trong lịch trình của chúng ta (T2-T6)
      if (grouped.hasOwnProperty(dayName)) {
        grouped[dayName].push(task);
      }
    });

    return grouped;
  }

  // Hàm tính toán vị trí và độ rộng của task trên lưới
  getTaskStyle(task: ScheduledTask): object {
    const startTime = new Date(task.start_time);
    const endTime = new Date(task.due_date);

    // Lịch trình giờ đây bắt đầu từ 0h
    const scheduleStartHour = 0;

    // Tính toán trên lưới 48 cột (2 cột/giờ)
    const start = (startTime.getHours() - scheduleStartHour) * 2 + (startTime.getMinutes() / 30) + 1;
    const end = (endTime.getHours() - scheduleStartHour) * 2 + (endTime.getMinutes() / 30) + 1;

    return {
      'grid-column': `${start} / ${end}`,
      'background-color': '#3b82f6',
      'border-color': '#2563eb'
    };
  }
}
