import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NoAuthGuard implements CanActivate {
  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(): boolean | UrlTree {
    if (isPlatformBrowser(this.platformId)) {
      // Thay đổi: Sử dụng sessionStorage
      const token = sessionStorage.getItem('auth_token');

      if (token) {
        return this.router.createUrlTree(['/app/dashboards']);
      }
    }
    return true;
  }
}
