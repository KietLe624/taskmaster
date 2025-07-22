import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Task } from '../../services/task/task';
import { TaskDetailData, TaskForm } from '../../models/tasks'; // Sử dụng lại model chi tiết
import { User, Project } from '../../models/tasks'; // Sử dụng lại model người dùng và dự án

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  tasks: TaskDetailData[] = [];
  isLoading = true;
  isModalOpen = false;
  currentModalTitle = '';
  selectedTask: any = {}; // Dữ liệu cho modal
  public isEditMode = false;
  public taskToEdit: TaskDetailData | null = null; // Dữ liệu công việc để chỉnh sửa
  public allUsers: User[] = [];
  public allProjects: Project[] = [];
  constructor(private taskService: Task, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTasks();
    this.loadDataForModal();
  }
  // lưu thông tin để lọc
  filters = {
    name: '',
    status: 'all',
    priority: 'all',
    sortBy: 'due_date',
    sortOrder: 'asc'
  };

  // kiểm tra user và project có tồn tại hay không
  checkUserAndProjectExistence(): void {
    this.taskService.getUsers().subscribe(users => {
      this.allUsers = users;
    });

    this.taskService.getProjects().subscribe(projects => {
      this.allProjects = projects;
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.taskService.getTasks(this.filters).subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách công việc:', err);
        this.isLoading = false;
      },
    });
  }

  loadDataForModal(): void {
    this.taskService.getProjects().subscribe({
      next: (projects) => { this.allProjects = projects; },
      error: (err) => console.error('Lỗi khi tải danh sách dự án:', err)
    });

    this.taskService.getUsers().subscribe({
      next: (users) => { this.allUsers = users; },
      error: (err) => console.error('Lỗi khi tải danh sách người dùng:', err)
    });
  }

  applyFilters(): void {
    this.loadTasks();
  }

  getStatusBorderClass(status: string): string {
    if (!status) return 'border-gray-400';
    const formattedStatus = status.toLowerCase().trim();
    switch (formattedStatus) {
      case 'completed':
        return 'border-green-400'; // Xanh lá: Hoàn thành
      case 'in_progress':
        return 'border-yellow-400'; // Vàng: Đang làm
      case 'overdue':
        return 'border-red-400'; // Đỏ: Trễ hạn
      case 'todo':
        return 'border-blue-400'; // Xanh dương: Cần làm (thay cho màu xám)
      default:
        return 'border-gray-400'; // Xám: Mặc định
    }
  }

  // hàm lấy trạng thái công việc
  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    const formattedStatus = status.toLowerCase().trim();
    switch (formattedStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800'; // Xanh lá: Hoàn thành
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'; // Vàng: Đang làm
      case 'overdue':
        return 'bg-red-100 text-red-800'; // Đỏ: Trễ hạn
      case 'todo':
        return 'bg-blue-100 text-blue-800'; // Xanh dương
      default:
        return 'bg-gray-100 text-gray-800'; // Xám: Mặc định
    }
  }

  // Hiển thị độ ưu tiên
  getPriorityInfo(priority: string): { text: string; colorClass: string } {
    if (!priority) {
      return { text: 'Không rõ', colorClass: 'text-gray-500' };
    }
    const formattedPriority = priority.toLowerCase().trim(); // Chuyển đổi về chữ thường và xóa khoảng trắng thừa
    switch (formattedPriority) {
      case 'high':
        return { text: 'Cao', colorClass: 'text-red-500' };
      case 'medium':
        return { text: 'Trung bình', colorClass: 'text-yellow-500' };
      case 'low':
        return { text: 'Thấp', colorClass: 'text-green-500' };
      default:
        // Trả về giá trị gốc nếu không khớp
        return { text: priority, colorClass: 'text-gray-500' };
    }
  }

  openCreateModal(): void {
    this.selectedTask = {
      // Reset dữ liệu
      name: '',
      description: '',
      priority: '',
      status: '',
      due_date: '',
      project_id: null,
      assignee: [],
    };
    this.currentModalTitle = 'Tạo Công việc Mới';
    this.isModalOpen = true;
  }

  openEditModal(task: any): void {
    this.isEditMode = true; // Kích hoạt chế độ sửa
    this.taskToEdit = task; // Lưu lại task cần sửa
    this.currentModalTitle = `Chỉnh sửa: ${task.name}`;
    this.isModalOpen = true; // Mở modal
  }

  onSaveTask(taskFormData: TaskForm): void {
    if (this.isEditMode && this.taskToEdit) {
      // Cập nhật công việc hiện tại
      if (this.taskToEdit) {
        if (!taskFormData || !taskFormData.name) {
          alert('Dữ liệu form không hợp lệ. Vui lòng kiểm tra các trường.');
          return;
        }
        this.taskService
          .updateTask(this.taskToEdit.task_id, taskFormData)
          .subscribe({
            next: (updateTask) => {
              alert('Công việc đã được cập nhật thành công!');
              this.isModalOpen = false; // Đóng modal sau khi cập nhật thành công
              this.closeModal(); // Đóng modal
              this.loadTasks(); // Tải lại danh sách công việc
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Lỗi khi cập nhật công việc:', err);
              alert('Không thể cập nhật công việc. Vui lòng thử lại sau.');
            },
          });
      }
    } else {
      // Tạo công việc mới
      this.taskService.createTask(taskFormData).subscribe({
        next: (newTask) => {
          alert('Công việc đã được tạo thành công!');
          this.isModalOpen = false; // Đóng modal sau khi tạo thành công
          this.loadTasks(); // Tải lại danh sách công việc
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tạo công việc:', err);
          alert('Không thể tạo công việc. Vui lòng thử lại sau.');
          this.closeModal(); // Đóng modal ngay cả khi có lỗi
        },
      });
    }
  }

  onStatusChange(event: Event, taskId: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const newStatus = selectElement.value;
    if (taskId === undefined || taskId === null) {
      return;
    }
    this.taskService.updateTaskStatus(taskId, newStatus).subscribe({
      next: (response) => {
        const taskToUpdate = this.tasks.find((t) => t.task_id === taskId);
        if (taskToUpdate) {
          taskToUpdate.status = newStatus;
        }
      },
      error: (err) => {
        alert(
          'Không thể cập nhật trạng thái. Vui lòng tải lại trang và thử lại.'
        );
        const taskToUpdate = this.tasks.find((t) => t.task_id === taskId);
        if (taskToUpdate) {
          selectElement.value = taskToUpdate.status;
        }
      },
    });
  }
  // Hàm được gọi khi nhận sự kiện "close" từ component con
  closeModal(): void {
    this.isModalOpen = false;
    this.cdr.detectChanges();
  }
  deleteTask(taskId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: (response) => {
          alert('Công việc đã được xóa thành công!');
          // Sửa toán tử so sánh từ !== thành !=
          this.tasks = this.tasks.filter((task) => task.task_id != taskId);
          this.cdr.detectChanges(); // Cập nhật lại view
        },
        error: (err) => {
          alert('Không thể xóa công việc. Vui lòng thử lại.');
        },
      });
    }
  }
  // Xoá bộ lọc
  clearFilters(): void {
    this.filters = {
      name: '',
      status: 'all',
      priority: 'all',
      sortBy: 'due_date',
      sortOrder: 'asc'
    };
    this.applyFilters();
  }
  updateTaskStatus(taskId: number, newStatus: string): void {
  }
}
