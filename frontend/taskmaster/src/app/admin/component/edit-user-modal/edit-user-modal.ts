import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { User } from '../../model/users';
import { AdminService } from '../../service/admin';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-edit-user-modal',
  standalone: false,
  templateUrl: './edit-user-modal.html',
  styleUrl: './edit-user-modal.css'
})
export class EditUserModal implements OnChanges {
  @Input() show: boolean = false;
  @Input() user: User | null = null;
  @Output() closed = new EventEmitter<void>();

  userData: User | null = null; // Khởi tạo biến userData để liên kết với form

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    // Khi thuộc tính 'user' thay đổi, tạo một bản sao để chỉnh sửa
    if (changes['user'] && this.user) {
      this.userData = { ...this.user };
    }
  }

  openModal() {
    this.show = true;
    console.log('Modal opened');
  }

  closeModal() {
    this.show = false;
    this.user = null;
    this.closed.emit();
  }

  saveUser() {
    if (this.userData && this.userData.user_id) {
      const { email, ...payload } = this.userData;

      this.adminService.updateUser(this.userData.user_id, payload).subscribe({
        next: () => {
          if (this.user) {
            Object.assign(this.user, this.userData);
          }
          console.log('Cập nhật thành công');
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật người dùng:', err);
          this.cdr.detectChanges();
          this.closeModal();
        }
      });
    }
  }


}
