import { Component, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ProjectService } from '../../services/project/project'; // Chỉnh lại đường dẫn nếu cần
import { ProjectMember } from '../../models/project-detail';

@Component({
  selector: 'app-add-member-modal',
  templateUrl: './add-member-modal.html',
  styleUrls: ['./add-member-modal.css'],
  standalone: false
})
export class AddMemberModal {
  @Input() show: boolean = false;
  @Input() projectId!: number;
  @Input() projectName!: string; // Tên dự án để hiển thị trong modal
  @Input() members: any[] = []; // Danh sách thành viên hiện tại
  @Input() currentMembers: ProjectMember[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() memberAdded = new EventEmitter<void>(); // Sự kiện báo hiệu đã thêm thành công

  email: string = '';
  role: string = 'member';
  isLoading: boolean = false;
  errorMessage: string = '';
  constructor(private projectService: ProjectService, private cdr: ChangeDetectorRef) { }

  onFormSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'Vui lòng nhập địa chỉ email.';
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';

    const emailToLowerCase = this.email.toLowerCase();
    const isAlreadyMember = this.currentMembers.some(
      member => member.users?.email.toLowerCase() === emailToLowerCase
    );

    if (isAlreadyMember) {
      this.errorMessage = 'Người dùng này đã là thành viên của dự án.';
      return; // Dừng lại và không gọi API
    }

    const memberData = {
      email: this.email,
      role: this.role
    };

    this.projectService.addMemberToProject(this.projectId, memberData).subscribe({
      next: (response) => {
        this.isLoading = false;
        alert(response.message || 'Thêm thành viên thành công!');
        this.memberAdded.emit(); // Phát sự kiện để component cha tải lại dữ liệu
        this.closeModal();
        this.resetForm(); // Reset form sau khi thêm thành viên thành công
        this.cdr.detectChanges(); // Cập nhật UI ngay lập tức
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Đã có lỗi không xác định xảy ra.';
        console.error('Lỗi khi thêm thành viên:', err);
        this.cdr.detectChanges();
      }
    });
  }

  closeModal(): void {
    if (!this.isLoading) {
      this.resetForm();
      this.close.emit();
    }
  }

  private resetForm(): void {
    this.email = '';
    this.role = 'member';
    this.errorMessage = '';
  }
}
