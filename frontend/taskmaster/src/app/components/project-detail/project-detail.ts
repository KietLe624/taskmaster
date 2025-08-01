import { ChangeDetectorRef, Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ProjectService } from '../../services/project/project';
import { ProjectsData } from '../../models/projects';
import { ProjectDetailData, Task, ProjectMember } from '../../models/project-detail';
import { ProjectFrom } from '../create-project/create-project';

@Component({
  selector: 'app-project-detail',
  standalone: false,
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail implements OnInit {
  project: ProjectDetailData | null = null;
  tasks: Task[] = [];
  members: ProjectMember[] = [];
  isLoading = true;
  public projects: ProjectsData[] = [];
  showEditModal = false;
  isColumnOpen: { [key: string]: boolean } = { todo: false, 'in_progress': false, inreview: false, done: false, overdue: false };
  selectedTask: Task | null = null;

  showTaskDetailModal = false; // Biến để điều khiển modal chi tiết công việc

  showAddMemberModal = false; // Biến để điều khiển modal thêm thành viên

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private location: Location,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadProjectDetails();
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
        this.members = data.members || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Lỗi khi tải chi tiết dự án:', err);
        alert('Không thể tải chi tiết dự án.');
        this.router.navigate(['/app/projects']);
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
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

  openTaskDetailModal(task: Task): void {
    console.log('Hàm openTaskDetailModal đã được gọi với task:', task);
    this.selectedTask = task;
    this.showTaskDetailModal = true;
    this.cdr.detectChanges();
  }

  closeTaskDetailModal(): void {
    console.log('Parent: Hàm closeTaskDetailModal() đã được gọi.'); // <-- THÊM DÒNG NÀY
    this.showTaskDetailModal = false;
    this.selectedTask = null;
    this.cdr.detectChanges(); // Dòng này rất quan trọng
  }

  // handleUpdateTask(formData: any): void {
  //   // Thêm một bước kiểm tra an toàn
  //   if (!this.selectedTask) {
  //     console.error('Không có công việc nào được chọn để cập nhật.');
  //     alert('Đã có lỗi xảy ra, không tìm thấy công việc.');
  //     return;
  //   }
  //   console.log('Parent: Hàm handleUpdateTask đã được gọi với formData:', formData);
  //   console.log('Parent: selectedTask:', this.selectedTask);
  //   // Lấy ID từ `selectedTask` và gửi `formData` tới service
  //   this.projectService.updateTask(this.selectedTask.task_id, formData).subscribe({
  //     next: () => {
  //       alert('Cập nhật công việc thành công!');
  //       this.closeTaskDetailModal();
  //       this.loadProjectDetails(); // Tải lại dữ liệu để cập nhật danh sách
  //     },
  //     error: (err) => {
  //       console.error('Lỗi khi cập nhật công việc:', err);
  //       alert('Cập nhật công việc thất bại.');
  //     }
  //   });
  // }
  // file: project-detail.ts

  handleUpdateTask(formData: any): void {
    // Kiểm tra để đảm bảo có task và project được chọn
    if (!this.selectedTask || !this.project) {
      console.error('Không có công việc hoặc dự án được chọn để cập nhật.');
      alert('Đã có lỗi xảy ra, vui lòng tải lại trang.');
      return;
    }

    // 1. Dữ liệu người dùng sửa trên form, nhận từ modal
    const formValues = formData;

    // 2. Các dữ liệu tĩnh, lấy từ component cha
    const staticValues = {
      project_id: this.project.id,        // Lấy ID từ project đang xem
      cate: this.selectedTask.cate,       // Lấy cate từ task đã chọn
    };

    // 3. Trộn tất cả lại để có payload hoàn chỉnh
    const finalPayload = { ...formValues, ...staticValues };

    console.log('Payload cuối cùng gửi tới service:', finalPayload);

    // 4. Gọi service với payload hoàn chỉnh
    this.projectService.updateTask(this.selectedTask.task_id, finalPayload).subscribe({
      next: () => {
        alert('Cập nhật công việc thành công!');
        this.closeTaskDetailModal();
        this.loadProjectDetails();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật công việc:', err);
        alert('Cập nhật công việc thất bại.');
        this.cdr.detectChanges(); // Cập nhật giao diện sau khi có lỗi
      }
    });
  }
  handleDeleteTask(taskId: number): void {
    this.projectService.deleteTask(taskId).subscribe({
      next: () => {
        alert('Đã xóa công việc thành công.');
        this.closeTaskDetailModal();
        this.loadProjectDetails(); // Tải lại dữ liệu
      },
      error: (err) => {
        console.error('Lỗi khi xóa công việc:', err);
        alert('Xóa công việc thất bại.');
        this.cdr.detectChanges(); // Cập nhật giao diện sau khi có lỗi
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
    }
  }

  allowDrop(event: DragEvent): void {
    if (event) {
      event.preventDefault();
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
          const task = updatedTasks[taskIndex];
          task.status = newStatus; // Cập nhật trạng thái
          this.tasks = updatedTasks; // Gán lại mảng mới
          this.project = { ...this.project, tasks: updatedTasks }; // Gán lại project với tham chiếu mới
          this.updateTaskStatus(+taskId, newStatus);
          this.updateProgress(); // Cập nhật tiến độ
          this.cdr.detectChanges(); // Cập nhật giao diện
        } else {
        }
      }
    } else {
    }
  }

  updateTaskStatus(taskId: number, newStatus: string): void {
    if (this.project) {
      this.projectService.updateStatusTask(taskId, { status: newStatus }).subscribe({
        next: () => {
        },
        error: (err) => {
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

  updateProgress(): void {
    if (this.project && this.tasks.length > 0) {
      const totalTasks = this.tasks.length;
      const completedTasks = this.tasks.filter(task => task.status === 'done').length; // Giả sử 'done' là trạng thái hoàn thành
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      this.project.progress = Math.round(progress); // Cập nhật progress
      this.project.completedTasksCount = completedTasks;
      this.project.totalTasksCount = totalTasks;
      this.cdr.detectChanges(); // Cập nhật giao diện
    }
  }

  openAddMemberModal(): void {
    this.showAddMemberModal = true;
    this.loadProjectDetails(); // Tải lại dữ liệu để đảm bảo danh sách thành viên mới nhất
  }

  closeAddMemberModal(): void {
    this.showAddMemberModal = false;
  }

  // Hàm này sẽ được gọi khi modal phát sự kiện 'memberAdded'
  handleMemberAdded(): void {
    // kiểm tra xem thành viên đã tồn tại chưa
    console.log('Thành viên mới đã được thêm. Tải lại danh sách...');
    this.loadProjectDetails(); // Tải lại dữ liệu để cập nhật UI
  }
}
