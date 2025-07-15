import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { Task } from '../../services/task/task'; // Chỉnh sửa đường dẫn nếu cần
import { TaskDetailData } from '../../models/tasks'; // Sử dụng lại model chi tiết

@Component({
  selector: 'app-tasks',
  standalone: false,
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
  
})
export class Tasks implements OnInit {
  tasks: TaskDetailData[] = [];
  isLoading = true;

  constructor(private taskService: Task, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    // Giả sử bạn có một hàm getAllTasks trong service
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.isLoading = false;
        console.log('Dữ liệu công việc:', this.tasks);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách công việc:', err);
        this.isLoading = true;
        alert('Không thể tải danh sách công việc.');
      }
    });
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

  // --- Các hàm xử lý sự kiện (hiện tại là giữ chỗ) ---

  openCreateModal(): void {
    console.log('Mở modal để tạo công việc mới');
  }

  openEditModal(task: TaskDetailData): void {
    console.log('Mở modal để sửa công việc:', task.id);
  }

  deleteTask(taskId: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này không?')) {
      console.log('Xóa công việc:', taskId);
      // Gọi service để xóa và tải lại danh sách
    }
  }

  updateTaskStatus(taskId: number, newStatus: string): void {
    console.log(`Cập nhật trạng thái cho công việc ${taskId} thành ${newStatus}`);
    // Gọi service để cập nhật trạng thái và xử lý kết quả
  }
}
