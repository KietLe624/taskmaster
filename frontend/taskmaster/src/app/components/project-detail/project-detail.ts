import { Component, OnInit } from '@angular/core';

export interface Tasks {
  id: string; // ID của công việc
  projectId: string; // ID của dự án mà công việc này thuộc về
  name: string; // Tên công việc
  description: string; // Mô tả công việc
  status: string; // Trạng thái của công việc (ví dụ: "Đang làm", "Hoàn thành", "Chưa bắt đầu")
  priority: string; // Mức độ ưu tiên (ví dụ: "Thấp", "Trung bình", "Cao")
  dueDate: string; // Ngày hết hạn
  assignedTo: string; // Người được giao công việc
  createdAt: string; // Ngày tạo công việc
  updatedAt: string; // Ngày cập nhật công việc
}

@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  ngOnInit(): void {}
  public projectDetails: any = {};
  // 1. Tạo một mảng chứa dữ liệu các công việc(mẫu).
  public tasks: Tasks[] = [
    {
      id: 'task1',
      projectId: 'proj1',
      name: 'Thiết kế giao diện chính',
      description: 'Thiết kế giao diện người dùng cho trang chủ.',
      status: 'Đang làm',
      priority: 'Cao',
      dueDate: '2024-08-15',
      assignedTo: 'Alice Wonderland',
      createdAt: '2024-07-01',
      updatedAt: '2024-07-10',
    },
    {
      id: 'task2',
      projectId: 'proj1',
      name: 'Phát triển chức năng đăng nhập',
      description: 'Xây dựng chức năng đăng nhập và đăng ký người dùng.',
      status: 'Chưa bắt đầu',
      priority: 'Trung bình',
      dueDate: '2024-08-30',
      assignedTo: 'Bob Builder',
      createdAt: '2024-07-05',
      updatedAt: '2024-07-12',
    },
  ];
  // 2. Tạo một mảng chứa dữ liệu các dự án(mẫu).
  public projects = [
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
  ];

  // 3. Hàm để lấy thông tin dự án theo ID
  getProjectById(projectId: string) {
    return this.projects.find((project) => project.id === projectId);
  }
  // 4. Hàm để lấy danh sách công việc theo ID dự án
  getTasksByProjectId(projectId: string) {
    return this.tasks.filter((task) => task.projectId === projectId);
  }
  // 5. Hàm để thêm công việc mới vào dự án
  addTask(newTask: Tasks) {
    this.tasks.push(newTask);
  }
  editProject() {
    console.log('Edit task button clicked');
  }
  // 6. Hàm để cập nhật công việc
  updateTask(updatedTask: Tasks) {
    const index = this.tasks.findIndex((task) => task.id === updatedTask.id);
    if (index !== -1) {
      this.tasks[index] = updatedTask;
    }
  }
  // 7. Hàm để xóa công việc
  deleteTask(taskId: string) {
    this.tasks = this.tasks.filter((task) => task.id !== taskId);
  }
  // 8. Hàm để tính tổng số công việc và số công việc hoàn thành trong dự án
  getProjectProgress(projectId: string) {
    const projectTasks = this.getTasksByProjectId(projectId);
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(
      (task) => task.status === 'Hoàn thành'
    ).length;
    return totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  }
}
