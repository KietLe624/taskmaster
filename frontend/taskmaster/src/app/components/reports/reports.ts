import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { ReportService } from '../../services/report/report'; // Đường dẫn tới service của bạn
import {
  ReportData,
  TaskStatusDistribution,
  TasksPerProject,
} from '../../models/reports'; // Đường dẫn tới model

@Component({
  selector: 'app-reports',
  standalone: false,
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit, AfterViewInit {
  public taskStatusChart: Chart | undefined;
  public tasksByProjectChart: Chart | undefined;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReportData();
  }

  ngAfterViewInit(): void {}

  loadReportData(): void {
    this.reportService.getOverviewReport().subscribe({
      next: (data: ReportData) => {
        // Đảm bảo DOM đã sẵn sàng trước khi vẽ
        setTimeout(() => {
          this.createTaskStatusChart(data.taskStatusDistribution);
          this.createTasksByProjectChart(data.tasksPerProject);
        }, 0);
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu báo cáo:', err);
      },
    });
  }

  createTaskStatusChart(data: TaskStatusDistribution[]): void {
    const labels = data.map((item) => this.formatStatusLabel(item.status));
    const counts = data.map((item) => item.count);
    const backgroundColors = data.map((item) =>
      this.getStatusColor(item.status)
    );
    if (this.taskStatusChart) {
      this.taskStatusChart.destroy();
    }

    this.taskStatusChart = new Chart('taskStatusChart', {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Số lượng công việc',
            data: counts,
            backgroundColor: backgroundColors,
            borderColor: '#fff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }

  createTasksByProjectChart(data: TasksPerProject[]): void {
    const labels = data.map((item) => item.name);
    const counts = data.map((item) => item.taskCount);

    if (this.tasksByProjectChart) {
      this.tasksByProjectChart.destroy();
    }

    this.tasksByProjectChart = new Chart('tasksByProjectChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Tổng số công việc',
            data: counts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
    });
  }

  // Tiện ích chuyển đổi status sang tiếng Việt để hiển thị
  formatStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      inreview: 'Chờ duyệt',
      todo: 'Cần làm',
      in_progress: 'Đang làm',
      completed: 'Hoàn thành',
      overdue: 'Quá hạn',
    };
    return statusMap[status] || status;
  }
  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      pending_approval: 'rgba(107, 114, 128, 0.8)', // Màu xám
      todo: 'rgba(59, 130, 246, 0.8)', // Màu xanh dương
      in_progress: 'rgba(251, 191, 36, 0.8)', // Màu vàng
      overdue: 'rgba(239, 68, 68, 0.8)', // Màu đỏ
      completed: 'rgba(16, 185, 129, 0.8)', // Màu xanh lá
      default: 'rgba(156, 163, 175, 0.8)', // Màu mặc định
    };
    return colorMap[status] || colorMap['default'];
  }
}
