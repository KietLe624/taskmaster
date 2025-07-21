import { ChangeDetectorRef, Component, OnInit, } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProjectsData } from '../../models/projects';
import { ProjectService } from '../../services/project/project';
import { ProjectFrom } from '../create-project/create-project';


@Component({
  selector: 'app-projects',
  standalone: false,
  templateUrl: './projects.html',
  styleUrl: './projects.css',
})
export class Projects implements OnInit {
  public projects: ProjectsData[] = [];
  public isLoading = true; // Biến để kiểm soát trạng thái tải dữ liệu
  public showModal = false;
  public isEditMode = false;
  public projectToEdit: ProjectsData | null = null;

  constructor(private projectService: ProjectService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu dự án:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  public isCreateModalVisible = false;
  // Các hàm xử lý sự kiện (sẽ được thêm sau)
  openCreateModal(): void {
    this.isEditMode = false;
    this.projectToEdit = null;
    this.showModal = true;
  }

  openEditModal(project: ProjectsData): void {
    this.isEditMode = true;
    this.projectToEdit = project;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.reloadProjects(); // Tải lại danh sách dự án sau khi đóng modal
    this.cdr.detectChanges();
  }
  // edit project/ new project
  onSaveProject(formData: ProjectFrom): void {
    if (this.isEditMode && this.projectToEdit) {
      // Cập nhật dự án đã có
      if (!formData || !formData.name) {
        alert('Dữ liệu form không hợp lệ. Vui lòng kiểm tra các trường.');
        return;
      }
      this.projectService.updateProject(this.projectToEdit.id, formData).subscribe({
        next: (updatedProject) => {
          alert('Dự án ' + updatedProject.name + ' đã được cập nhật thành công!');
          this.closeModal(); // Đóng modal sau khi cập nhật thành công
          this.reloadProjects(); // Tải lại danh sách dự án sau khi cập nhật
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.closeModal(); // Đóng modal ngay cả khi có lỗi
          alert('Cập nhật dự án thất bại: ' + (err.error?.message || 'Lỗi không xác định'));
        }
      });
    } else {
      // Tạo dự án mới
      this.projectService.createProject(formData).subscribe({
        next: (newProject) => {
          alert('Dự án' + newProject + 'đã được tạo thành công!');
          this.closeModal(); // Đóng modal sau khi tạo thành công
          this.reloadProjects(); // Tải lại danh sách dự án sau khi tạo mới
          this.cdr.detectChanges();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Đã có lỗi không xác định xảy ra.';
          alert(errorMessage);
          this.closeModal(); // Đóng modal ngay cả khi có lỗi
        }
      });
    }
  }

  deleteProject(projectId: number): void {
    // Sử dụng confirm() để xác nhận đơn giản
    const confirmation = confirm('Bạn có chắc chắn muốn xóa dự án này không? Hành động này không thể hoàn tác.');
    if (confirmation) {
      this.projectService.deleteProject(projectId).subscribe({
        next: () => {
          this.reloadProjects();
          alert('Dự án đã được xóa thành công!');
          this.cdr.detectChanges();
        },
        error: (err) => {
          const errorMessage = err.error?.message || 'Đã có lỗi không xác định xảy ra.';
        }
      });
    }
  }
  saveProject(project: ProjectsData): void {
    console.log('Lưu dự án:', project.name);
  }
  // Hàm này sẽ được gọi khi người dùng muốn xem chi tiết dự án
  viewProjectDetails(project: ProjectsData): void {
  }
  // load lại danh sách dự án sau khi tạo hoặc cập nhật
  reloadProjects(): void {
    this.isLoading = true; // Đặt trạng thái tải dữ liệu
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Lỗi khi tải lại dữ liệu dự án:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }
}
