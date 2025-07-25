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
        } else {
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('user_info');
          this.loggedIn.next(false);
        }
      } else {
        this.loggedIn.next(false);
      }
    } catch (error) {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('user_info');
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
            // decode token to get user_id
            const decodedToken: any = this.decodeToken(token);
            if (decodedToken && decodedToken.user_id) {
              sessionStorage.setItem('user_id', decodedToken.user_id.toString());
            } else {
              console.error('[AuthService] LOGIN - Không tìm thấy user_id trong token.');
            }
            this.loggedIn.next(true);
          }
        }
      })
    );
  }
  // decodeToken
  private decodeToken(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1])); // Giải mã payload JWT
    } catch (e) {
      console.error('Lỗi giải mã token:', e);
      return null;
    }
  }


  public hasToken(): boolean {
    // Thay đổi: Sử dụng sessionStorage
    return !!sessionStorage.getItem('auth_token');
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
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

  changePassword(passwords: any): Observable<any> {
    const { currentPassword, newPassword } = passwords;
    return this.http.patch(`${this.apiUrl}/changePassword`, { currentPassword, newPassword });
  }
}
