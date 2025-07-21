import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Users } from '../../models/users'; // Adjust the path as necessary
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  // Hàm tạo header động với token
  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem('auth_token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      })
    };
  }
  // Phương thức để lấy thông tin người dùng theo ID đã đăng nhập
  getUserProfile(): Observable<Users> {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng.');
    }
    return this.http.get<Users>(`${this.apiUrl}/${userId}`, this.getAuthHeaders());
  }
  // Phương thức để cập nhật thông tin người dùng
  updateUserProfile(user: Users): Observable<Users> {
    const userId = sessionStorage.getItem('user_id');
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng.');
    }
    return this.http.put<Users>(`${this.apiUrl}/${userId}`, user, this.getAuthHeaders());
  }
}
