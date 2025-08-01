import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { jwtDecode } from 'jwt-decode'; // Đảm bảo bạn đã cài đặt: npm install jwt-decode

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private apiUrl = 'http://localhost:3000/api/auth';

  public loggedIn = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.loggedIn.asObservable();

  private initialized = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.initialized.asObservable();

  // Thêm BehaviorSubject để lưu trữ vai trò của người dùng
  private currentUserRolesSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public currentUserRoles: Observable<string[]> = this.currentUserRolesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeAuthState();
    } else {
      this.initialized.next(true);
    }
  }

  private initializeAuthState(): void {
    try {
      const token = sessionStorage.getItem('auth_token');

      if (token) {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp && decodedToken.exp > currentTime) {
          this.loggedIn.next(true);
          // Khởi tạo vai trò khi ứng dụng tải lại hoặc làm mới
          this.extractAndSetUserRoles(decodedToken);
        } else {
          this.clearSession(); // Xóa session nếu token hết hạn
          this.loggedIn.next(false);
        }
      } else {
        this.loggedIn.next(false);
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo trạng thái xác thực:', error);
      this.clearSession();
      this.loggedIn.next(false);
    } finally {
      this.initialized.next(true);
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/signin`, credentials).pipe(
      tap((response) => {
        console.log('[AuthService] LOGIN - Nhận được phản hồi từ server.');
        console.log('[AuthService] LOGIN - Phản hồi:', response);
        if (isPlatformBrowser(this.platformId)) {
          const token = response.accessToken || response.token;
          if (token) {
            console.log('[AuthService] LOGIN - Lưu token vào sessionStorage và cập nhật loggedIn = true.');
            sessionStorage.setItem('auth_token', token);
            sessionStorage.setItem('user_info', JSON.stringify(response.user || response));

            const decodedToken: any = jwtDecode(token); // Sử dụng jwtDecode
            if (decodedToken) {
              // Lưu user_id vào sessionStorage
              if (decodedToken.user_id) {
                sessionStorage.setItem('user_id', decodedToken.user_id.toString());
              } else {
                console.warn('[AuthService] LOGIN - Không tìm thấy user_id trong token.');
              }
              // Trích xuất và lưu trữ vai trò
              this.extractAndSetUserRoles(decodedToken);
            } else {
              console.error('[AuthService] LOGIN - Không thể giải mã token.');
            }
            this.loggedIn.next(true);
          } else {
            console.error('[AuthService] LOGIN - Không nhận được token từ phản hồi.');
          }
        }
      })
    );
  }

  private extractAndSetUserRoles(decodedToken: any): void {

    const roles: string[] = decodedToken.roles || decodedToken.role || [];

    // Nếu roles không phải là một mảng, cố gắng chuyển đổi nó thành mảng
    if (!Array.isArray(roles) && typeof roles === 'string') {
        this.currentUserRolesSubject.next([roles]);
        sessionStorage.setItem('user_roles', JSON.stringify([roles]));
    } else if (Array.isArray(roles)) {
        this.currentUserRolesSubject.next(roles);
        sessionStorage.setItem('user_roles', JSON.stringify(roles));
    } else {
        this.currentUserRolesSubject.next([]); // Đặt rỗng nếu không có vai trò hợp lệ
        sessionStorage.removeItem('user_roles');
        console.warn('[AuthService] Không tìm thấy vai trò hoặc vai trò không hợp lệ trong token.');
    }
  }

  public hasToken(): boolean {
    return !!sessionStorage.getItem('auth_token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.clearSession();
      this.loggedIn.next(false);
      this.router.navigate(['/login']);
    }
  }

  private clearSession(): void {
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('user_info');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('user_roles'); // Xóa vai trò khi đăng xuất
    this.currentUserRolesSubject.next([]); // Reset vai trò
  }

  changePassword(passwords: any): Observable<any> {
    const { currentPassword, newPassword } = passwords;
    return this.http.patch(`${this.apiUrl}/changePassword`, { currentPassword, newPassword });
  }

  // --- Các phương thức mới để kiểm tra vai trò ---

  isLoggedIn(): boolean {
    return this.loggedIn.value;
  }

  // Lấy vai trò của người dùng hiện tại
  getUserRoles(): string[] {
    // Đọc từ BehaviorSubject hoặc từ sessionStorage
    const rolesString = isPlatformBrowser(this.platformId) ? sessionStorage.getItem('user_roles') : null;
    if (rolesString) {
      try {
        return JSON.parse(rolesString);
      } catch (e) {
        console.error('Lỗi khi phân tích vai trò từ sessionStorage:', e);
        return [];
      }
    }
    return this.currentUserRolesSubject.value;
  }

  // Kiểm tra xem người dùng có một vai trò cụ thể hay không
  hasRole(requiredRole: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(requiredRole);
  }

  // Kiểm tra xem người dùng có ít nhất một trong các vai trò yêu cầu hay không
  hasAnyRole(requiredRoles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return requiredRoles.some(role => userRoles.includes(role));
  }
}
