import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'; import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { Auth } from '../services/auth/auth'; // Import AuthService
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: Auth, // Sử dụng AuthService để kiểm tra token
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // canActivate(): boolean {
  //   // Chỉ kiểm tra nếu đang ở môi trường trình duyệt
  //   if (isPlatformBrowser(this.platformId)) {
  //     const token = localStorage.getItem('auth_token');

  //     if (token) {
  //       // Nếu có token, cho phép truy cập
  //       return true;
  //     }
  //   }
  //   // Nếu không có token hoặc không ở trên trình duyệt, chuyển về trang login
  //   this.router.navigate(['/login']);
  //   return false;
  // }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (isPlatformBrowser(this.platformId)) {
      return this.authService.isLoggedIn$.pipe(
        map((isLoggedIn) => {
          if (isLoggedIn) {
            return true;
          }
          this.router.navigate(['/login'], {replaceUrl : true});
          return false;
        })
      );
    }
     this.router.navigate(['/login'], {replaceUrl : true});
    return false;
  }
}
