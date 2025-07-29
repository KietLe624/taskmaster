import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  userData = {
    username: '',
    email: '',
    full_name: '',
    password: '',
    confirmPassword: '',
  };

  errorMessage = '';
  successMessage = '';

  constructor(private authService: Auth, private router: Router, private cdr: ChangeDetectorRef) { }

  onRegister(): void {
    // Reset thông báo
    this.errorMessage = '';
    this.successMessage = '';

    // 1. Kiểm tra mật khẩu ở phía client trước khi gửi đi
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'Mật khẩu và xác nhận mật khẩu không khớp.';
      return;
    }

    // 2. Tạo một đối tượng mới không chứa confirmPassword để gửi lên server
    const registrationData = {
      username: this.userData.username,
      full_name: this.userData.full_name,
      email: this.userData.email,
      password: this.userData.password,
    };

    // 3. Gọi service để thực hiện đăng ký
    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.successMessage =
          'Đăng ký thành công!, vui lòng đăng nhập để tiếp tục.';
        // Tự động chuyển hướng về trang đăng nhập sau khi thành công
        setTimeout(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        // Hiển thị lỗi từ backend
        this.errorMessage =
          err.error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      },
      complete: () => {
        this.cdr.detectChanges();
      }
    });
  }
}
