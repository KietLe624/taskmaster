import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project/project';
import { ProjectsData } from '../../models/projects';
import { ProjectDetailData, Task, User } from '../../models/project-detail';
import { ProjectFrom } from '../create-project/create-project';

@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush, // Sử dụng OnPush để tối ưu hiệu suất
})
export class ProjectDetail implements OnInit {
  project: ProjectDetailData | null = null;
  tasks: Task[] = [];
  members: User[] = [];
  isLoading = true;
  public projects: ProjectsData[] = [];
  showEditModal = false;
  isColumnOpen: { [key: string]: boolean } = { todo: false, 'inprogress': false, inreview: false, done: false, overdue: false };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProjectDetails();
    const projectId = this.route.snapshot.paramMap.get('id');

    if (projectId) {
      this.projectService.getProjectById(+projectId).subscribe({
        next: (data: ProjectDetailData) => {
          this.project = data;
          this.tasks = data.tasks || [];
          this.members = data.members?.map(member => member.users) || [];
          this.isLoading = false;
          console.log('Dữ liệu chi tiết dự án đã được xử lý:', this.project);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải chi tiết dự án:', err);
          this.isLoading = false;
          alert('Không tìm thấy dự án hoặc có lỗi xảy ra.');
          this.router.navigate(['/app/projects']);
        }
      });
    } else {
      console.error('Không tìm thấy ID dự án trong URL.');
      this.router.navigate(['/projects']);
      this.cdr.detectChanges();
    }
  }

  loadProjectDetails(): void {
    this.isLoading = true;
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) {
      console.error('Không tìm thấy ID dự án trong URL.');
      this.router.navigate(['/projects']);
      return;
    }

    this.projectService.getProjectById(+projectId).subscribe({
      next: (data) => {
        this.project = data;
        this.tasks = data.tasks || [];
        this.members = data.members?.map(member => member.users).filter(user => user) || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        alert('Không thể tải chi tiết dự án.');
        this.router.navigate(['/projects']);
      }
    });
  }

  // --- Các hàm xử lý sự kiện cho modal ---
  openEditModal(): void {
    if (this.project) {
      this.showEditModal = true;
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  handleUpdateProject(formData: ProjectFrom): void {
    if (!this.project) return;

    this.projectService.updateProject(this.project.id, formData).subscribe({
      next: (updatedProject) => {
        alert(`Dự án "${updatedProject.name}" đã được cập nhật thành công!`);
        this.showEditModal = false;
        this.loadProjectDetails();
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Đã có lỗi không xác định xảy ra.';
        alert(`Cập nhật dự án thất bại: ${errorMessage}`);
      }
    });
  }

  drag(event: DragEvent, task_id: number): void {
    if (event && event.dataTransfer && task_id !== undefined && task_id !== null) {
      try {
        event.dataTransfer.setData('text/plain', task_id.toString());
        this.cdr.detectChanges(); // Cập nhật view sau khi set dataTransfer
      } catch (e) {
        console.error('Error setting dataTransfer:', e);
      }
    } else {
      console.error('Drag failed: event, dataTransfer, or taskId is invalid', { event, task_id });
    }
  }

  allowDrop(event: DragEvent): void {
    if (event) {
      event.preventDefault();
      console.log('Allowing drop');
    }
  }

  drop(event: DragEvent, newStatus: string): void {
    event.preventDefault();

    if (event.dataTransfer) {
      const taskId = event.dataTransfer.getData('text/plain');
      console.log('Dropped task ID:', taskId);
      if (taskId && this.project) {
        const taskIndex = this.tasks.findIndex(t => t.task_id === +taskId);
        if (taskIndex !== -1) {
          const updatedTasks = [...this.tasks];
          updatedTasks[taskIndex].status = newStatus;
          this.tasks = updatedTasks; // Gán lại mảng mới
          this.updateTaskStatus(+taskId, newStatus);
          this.cdr.detectChanges(); // Đảm bảo giao diện cập nhật
        } else {
          console.error('Task not found for ID:', taskId);
        }
      }
    } else {
      console.error('dataTransfer is undefined during drop');
    }
  }

  updateTaskStatus(taskId: number, newStatus: string): void {
    if (this.project) {
      this.projectService.updateTask(taskId, { status: newStatus }).subscribe({
        next: () => {
          console.log(`Cập nhật trạng thái công việc ${taskId} thành ${newStatus} thành công`);
          // Không cần gọi loadProjectDetails, vì đã cập nhật trực tiếp trong drop
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật trạng thái:', err);
          alert('Cập nhật trạng thái thất bại. Vui lòng thử lại.');
          // Nếu thất bại, khôi phục trạng thái cũ (tùy chọn)
          const taskIndex = this.tasks.findIndex(t => t.task_id === taskId);
          if (taskIndex !== -1) {
            this.loadProjectDetails(); // Tải lại nếu có lỗi
          }
        }
      });
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

  getPriorityInfo(priority: string): { text: string; colorClass: string } {
    if (!priority) {
      return { text: 'Không rõ', colorClass: 'text-gray-500' };
    }
    const formattedPriority = priority.toLowerCase().trim();
    switch (formattedPriority) {
      case 'high':
        return { text: 'Cao', colorClass: 'text-red-500' };
      case 'medium':
        return { text: 'Trung bình', colorClass: 'text-yellow-500' };
      case 'low':
        return { text: 'Thấp', colorClass: 'text-green-500' };
      default:
        return { text: priority, colorClass: 'text-gray-500' };
    }
  }

  goBack(): void {
    this.location.back();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  toggleColumn(columnId: string): void {
    this.isColumnOpen[columnId] = !this.isColumnOpen[columnId];
  }
}
