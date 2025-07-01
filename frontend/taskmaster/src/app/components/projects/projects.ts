import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Định nghĩa kiểu dữ liệu cho một dự án để code an toàn và dễ quản lý hơn
export interface Project {
  id: string;
  name: string;
  description: string;
  manager: string;
  members: number;
  startDate: string;
  endDate: string;
  progress: number; // Tiến độ từ 0 đến 100
  tasksCompleted: number;
  totalTasks: number;
}

@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  // 1. Tạo một mảng chứa dữ liệu các dự án.
  // Sau này, bạn sẽ thay thế mảng này bằng một lời gọi API từ service.
  public projects: Project[] = [];

  constructor() {}

  ngOnInit(): void {
    // Giả lập việc lấy dữ liệu từ backend
    this.projects = [
      {
        id: 'proj1',
        name: 'Thiết kế lại Website',
        description: 'Làm mới hoàn toàn giao diện website của công ty.',
        manager: 'Alice Wonderland',
        members: 2,
        startDate: '2024-07-01',
        endDate: '2024-09-30',
        progress: 50,
        tasksCompleted: 1,
        totalTasks: 2,
      },
      {
        id: 'proj2',
        name: 'Ứng dụng Di động',
        description: 'Phát triển ứng dụng di động cho cả iOS và Android.',
        manager: 'Bob Builder',
        members: 5,
        startDate: '2024-08-15',
        endDate: '2024-12-20',
        progress: 10,
        tasksCompleted: 1,
        totalTasks: 10,
      },
      {
        id: 'proj3',
        name: 'Tích hợp Hệ thống CRM',
        description: 'Kết nối hệ thống bán hàng với phần mềm CRM mới.',
        manager: 'Charlie Chocolate',
        members: 3,
        startDate: '2024-09-01',
        endDate: '2024-11-15',
        progress: 0,
        tasksCompleted: 0,
        totalTasks: 8,
      },
    ];
  }
  public isCreateModalVisible = false;
  // Các hàm xử lý sự kiện (sẽ được thêm sau)
  openCreateModal(): void {
    this.isCreateModalVisible = true;
  }

  editProject(project: Project): void {
    console.log('Chỉnh sửa dự án:', project.name);
  }

  deleteProject(project: Project): void {
    console.log('Xóa dự án:', project.name);
    // Logic xóa dự án khỏi mảng (và gọi API xóa ở backend)
  }
  saveProject(project: Project): void {
    console.log('Lưu dự án:', project.name);
    // Logic để lưu dự án mới hoặc cập nhật dự án hiện tại
  }
  // Hàm này sẽ được gọi khi người dùng muốn xem chi tiết dự án
  viewProjectDetails(project: Project): void {
    console.log('Xem chi tiết dự án:', project.name);
    // Logic để điều hướng đến trang chi tiết dự án
  }
}
