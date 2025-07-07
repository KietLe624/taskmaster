import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';

  public loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  private initialized = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.initialized.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    console.log('[AuthService] CONSTRUCTOR - Service đang được khởi tạo.');
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuthState();
    } else {
      console.log('[AuthService] CONSTRUCTOR - Môi trường không phải trình duyệt, bỏ qua khởi tạo.');
      this.initialized.next(true);
    }
  }

  private initializeAuthState(): void {
    console.log('[AuthService] INIT - Bắt đầu kiểm tra trạng thái đăng nhập...');
    try {
      const token = sessionStorage.getItem('auth_token');
      console.log(`[AuthService] INIT - Token từ sessionStorage: ${token ? 'TÌM THẤY' : 'KHÔNG TÌM THẤY'}`);

      if (token) {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        console.log('[AuthService] INIT - Đã giải mã token:', decodedToken);

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          console.log('[AuthService] INIT - Token còn hạn. Cập nhật loggedIn = true.');
          this.loggedIn.next(true);
        } else {
          console.log('[AuthService] INIT - Token đã hết hạn. Xóa token.');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('user_info');
          this.loggedIn.next(false);
        }
      } else {
        console.log('[AuthService] INIT - Không có token. Cập nhật loggedIn = false.');
        this.loggedIn.next(false);
      }
    } catch (error) {
      console.error('[AuthService] INIT - Lỗi khi giải mã token, xóa token cũ:', error);
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_info');
      this.loggedIn.next(false);
    } finally {
      console.log('[AuthService] INIT - HOÀN TẤT. Cập nhật initialized = true.');
      this.initialized.next(true);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, credentials).pipe(
      tap((response) => {
        console.log('[AuthService] LOGIN - Nhận được phản hồi từ server.');
        if (isPlatformBrowser(this.platformId)) {
          const token = response.accessToken || response.token;
          if (token) {
            console.log('[AuthService] LOGIN - Lưu token vào sessionStorage và cập nhật loggedIn = true.');
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('user_info', JSON.stringify(response.user || response));
            this.loggedIn.next(true);
          }
        }
      })
    );
  }

  public hasToken(): boolean {
    // Thay đổi: Sử dụng sessionStorage
    return !!sessionStorage.getItem('auth_token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Thay đổi: Sử dụng sessionStorage
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_info');
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
    }
  }
}
