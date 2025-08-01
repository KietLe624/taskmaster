import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth/auth';


@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  credentials = { login: '', password: '' };
  errorMessage = '';

  constructor(private authService: Auth, private router: Router) { }

  onLogin(): void {
    console.log('[LOGIN] Credentials:', this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('[LOGIN] Response from server:', response);
        const token = response.accessToken || response.token;
        if (token) {
          console.log('[LOGIN] Token saved:', token);
          // Thay đổi: Sử dụng sessionStorage
          sessionStorage.setItem('auth_token', token);
          sessionStorage.setItem('user_info', JSON.stringify(response.user || response));
          this.authService.loggedIn.next(true);
          if(this.authService.hasRole('admin')) {
            this.router.navigate(['/admin/dashboards']);
            console.log(`[LOGIN] Đăng nhập thành công với username: ${this.credentials.login}`);
          } else {
            this.router.navigate(['/app/dashboards']);
            console.log(`[LOGIN] Đăng nhập thành công với username: ${this.credentials.login}`);
          }
        } else {
          console.error('[LOGIN] No token in response:', response);
          this.errorMessage = 'Không nhận được token từ server. Response:', JSON.stringify(response);
        }
      },
      error: (err) => {
        console.error('[LOGIN] Login error:', err);
        this.errorMessage = err.error?.message || err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      }
    });
  }
}
