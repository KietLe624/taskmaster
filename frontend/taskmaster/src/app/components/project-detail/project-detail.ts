import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
})
export class ProjectDetail implements OnInit {

  project: ProjectDetailData | null = null;
  tasks: Task[] = [];
  members: User[] = [];
  isLoading = true;

  public projects: ProjectsData[] = [];
  showEditModal = false;

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
        next: (data: ProjectDetailData) => { // 3. Sử dụng kiểu dữ liệu mới
          // 4. Gán và xử lý dữ liệu nhận được
          this.project = data;
          this.tasks = data.tasks || [];
          // Trích xuất thông tin User từ mảng members
          this.members = data.members?.map(member => member.users);
          console.log('Members:', this.members);
          this.isLoading = false;
          console.log('Dữ liệu chi tiết dự án đã được xử lý:', this.project);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi tải chi tiết dự án:', err);
          this.isLoading = false;
          alert('Không tìm thấy dự án hoặc có lỗi xảy ra.');
          this.router.navigate(['/projects']);
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

  // Hàm được gọi khi form trong modal được lưu
  handleUpdateProject(formData: ProjectFrom): void {
    if (!this.project) return;

    this.projectService.updateProject(this.project.id, formData).subscribe({
      next: (updatedProject) => {
        alert(`Dự án "${updatedProject.name}" đã được cập nhật thành công!`);
        this.showEditModal = false; // Đóng modal
        this.loadProjectDetails(); // Tải lại dữ liệu để hiển thị thông tin mới nhất
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Đã có lỗi không xác định xảy ra.';
        alert(`Cập nhật dự án thất bại: ${errorMessage}`);
      }
    });
  }


  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    // Chuyển trạng thái về chữ thường và xóa khoảng trắng thừa để so sánh chính xác
    const formattedStatus = status.toLowerCase().trim();
    switch (formattedStatus) {
      case 'hoàn thành':
      case 'completed':
        return 'bg-green-100 text-green-800'; // Xanh lá: Hoàn thành

      case 'đang tiến hành':
      case 'in_progress': // Sửa lại để khớp với dữ liệu từ ảnh
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'; // Vàng: Đang làm

      case 'quá hạn':
      case 'overdue':
        return 'bg-red-100 text-red-800'; // Đỏ: Trễ hạn

      case 'cần làm':
      case 'todo':
        return 'bg-blue-100 text-blue-800'; // Xanh dương: Cần làm (thay cho màu xám)

      default:
        return 'bg-gray-100 text-gray-800'; // Xám: Mặc định
    }
  }

  // Chuyển trạng thái về chữ thường và xóa khoảng trắng thừa để so sánh chính xác
  translateStatus(status: string): string {
    if (!status) return 'Không xác định';
    const formattedStatus = status.toLowerCase().trim();
    switch (formattedStatus) {
      case 'completed': return 'Hoàn thành';
      case 'in_progress':
      case 'in-progress': return 'Đang tiến hành';
      case 'overdue': return 'Quá hạn';
      case 'todo': return 'Cần làm';
      default: return status; // Trả về trạng thái gốc nếu không khớp
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
}
