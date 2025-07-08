import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Lấy token từ localStorage
  const token = sessionStorage.getItem('auth_token');

  // Nếu không có token, cho request đi tiếp
  if (!token) {
    return next(req);
  }

  // Nếu có token, clone request và thêm header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};
