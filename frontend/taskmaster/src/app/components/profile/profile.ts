import { Component, OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Users } from '../../models/users';
import { User } from '../../services/user/user';
import { Auth } from '../../services/auth/auth';
@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  public isLoading = true; // Biến để kiểm soát trạng thái tải dữ liệu
  public users: Users[] = []; // Khởi tạo mảng người dùng
  isEditing = false; // Biến để kiểm soát trạng thái chỉnh sửa
  isEditingPassword = false; // Biến để kiểm soát trạng thái chỉnh sửa mật khẩu
  currentUser: Users | null = null; // Biến để lưu thông tin người dùng hiện tại
  constructor(
    private userService: User,
    private authService: Auth,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const userId = sessionStorage.getItem('user_id');
    this.currentUser = {
      user_id: userId ? parseInt(userId, 10) : 0, // Chuyển đổi ID người dùng từ chuỗi sang số
      username: '',
      full_name: '',
      email: '',
      phone_number: '', // Khởi tạo các trường khác nếu cần
      address: '',
    };

    if (!userId) {
      console.error('User ID not found in session storage');
      return;
    }
    this.loadUserProfile();
  }

  loadUserProfile() {
    this.userService.getUserProfile().subscribe({
      next: (data: Users) => {
        this.users = data ? [data] : []; // Đảm bảo users là mảng
        this.isLoading = false;
        this.cdr.detectChanges(); // Cập nhật giao diện sau khi dữ liệu đã được tải
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.isLoading = false;
      },
    });
  }

  // toggle form
  toggleForm(): void {
    if (this.isEditing) {
      this.isEditing = false;
      this.updateProfile();
      console.log('Form closed');
      this.loadUserProfile();
    } else {
      this.isEditing = true;
      console.log('Form opened');
    }
  }

  // Phương thức để cập nhật thông tin người dùng
  updateProfile() {
    if (this.currentUser) {
      this.userService.updateUserProfile(this.currentUser).subscribe({
        next: (data: Users) => {
          console.log('Profile updated successfully:', data);
          this.isEditing = false; // Đóng form chỉnh sửa
          this.loadUserProfile(); // Tải lại dữ liệu người dùng sau khi cập nhật
          this.cdr.detectChanges(); // Cập nhật giao diện
        },
        error: (error) => {
          console.error('Error updating profile:', error);
        },
      });
    } else {
      console.error('No user data available for update');
    }
  }
  closeForm() {
    this.isEditing = false; // Đóng form chỉnh sửa
    this.isEditingPassword = false; // Đóng form chỉnh sửa mật khẩu
  }
  // toggle form change password
  toggleChangePasswordForm() {
    if (this.isEditingPassword) {
      this.isEditingPassword = false; // Đóng form chỉnh sửa mật khẩu nếu đang mở
      console.log('Change password form closed');
      this.changePassword(); // Gọi phương thức để cập nhật mật khẩu
      this.loadUserProfile(); // Tải lại dữ liệu người dùng sau khi cập nhật
    } else {
      this.isEditingPassword = true; // Mở form chỉnh sửa mật khẩu nếu đang đóng
      console.log('Change password form opened');
    }
  }

  // Đối tượng để binding với form HTML
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  // Phương thức để cập nhật mật khẩu người dùng
  changePassword() {
    // 1. Kiểm tra phía client trước
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      console.error('Mật khẩu mới và xác nhận mật khẩu không khớp.');
      this.isLoading = false;
      return;
    }

    // 2. Gọi service để gửi yêu cầu lên backend
    this.authService.changePassword(this.passwordData).subscribe({
      // Xử lý khi thành công
      next: (response) => {
        this.isLoading = false;
        console.log('Mật khẩu đã được cập nhật thành công:', response);
        // Reset form
        this.passwordData = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        };
      },
      // Xử lý khi có lỗi
      error: (err) => {
        this.isLoading = false;
        // Hiển thị lỗi trả về từ API
        if (err.error && err.error.message) {
          console.log('Error changing password:', err.error.message);
        } else {
          console.error('Error changing password:', err);
        }
      },
    });
  }
}
