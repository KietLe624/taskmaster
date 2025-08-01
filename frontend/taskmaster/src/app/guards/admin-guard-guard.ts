import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Auth } from '../services/auth/auth'; // Import Auth service của bạn

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: Auth, private router: Router) {} // Inject Auth service

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // 1. Kiểm tra xem người dùng đã đăng nhập chưa
    if (!this.authService.isLoggedIn()) { // Sử dụng phương thức isLoggedIn từ Auth service
      alert('Bạn cần đăng nhập để truy cập trang này.');
      this.router.navigate(['/login']); // Chuyển hướng đến trang đăng nhập
      return false;
    }
    if (this.authService.hasRole('admin')) { // Sử dụng phương thức hasRole từ Auth service
      return true; // Cho phép truy cập nếu có vai trò 'admin'
    } else {
      alert('Bạn không có quyền truy cập trang này.');
      this.router.navigate(['/admin/dashboards']);
      return false;
    }
  }
}
