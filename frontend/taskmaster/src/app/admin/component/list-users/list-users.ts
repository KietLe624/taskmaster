import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../service/admin';
import { User } from '../../model/users';

@Component({
  selector: 'app-list-users',
  standalone: false,
  templateUrl: './list-users.html',
  styleUrl: './list-users.css'
})
export class ListUsers implements OnInit {
  users: User[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  currentPage: number = 1;
  totalPages: number = 1;
  totalItems: number = 0;
  limit: number = 10; // Số mục trên mỗi trang
  search: string = '';
  showModal: boolean = false; // Biến để điều khiển hiển thị modal
  selectedUser: User | null = null; // Biến để lưu người dùng được chọn

  constructor(private adminService: AdminService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    const params = {
      page: this.currentPage,
      limit: this.limit,
      search: this.search
    };
    this.adminService.getAllUsers(params).subscribe({
      next: (data) => {
        this.users = data || [];
        this.totalItems = 0;
        this.totalPages = 1;
        this.isLoading = false;
        console.log('Danh sách người dùng:', this.users);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Không thể tải thông tin người dùng: ' + (err.error?.message || err.message);
        console.error('Lỗi khi lấy thông tin người dùng:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string): void {
    this.search = search;
    this.currentPage = 1; // Reset về trang 1 khi tìm kiếm
    this.getAllUsers();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.getAllUsers();
    }
  }

  deleteUser(userId: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa người dùng này không?')) {
      this.isLoading = true;
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.getAllUsers(); // Tải lại danh sách sau khi xóa
        },
        error: (err) => {
          this.errorMessage = 'Không thể xóa người dùng: ' + (err.error?.message || err.message);
          console.error('Lỗi khi xóa người dùng:', err);
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }
  selectUser(user: User): void {
    this.selectedUser = { ...user }; // Sao chép để tránh thay đổi trực tiếp dữ liệu gốc
  }
  onOpenModal(user: User): void {
    this.selectedUser = user; // Đặt lại selectedUser để mở modal trống
    this.showModal = true; // Đặt showModal về true
    this.cdr.detectChanges(); // Cập nhật giao diện
  }
  onCloseModal(): void {
    this.selectedUser = null; // Đóng modal khi nhận sự kiện close
    this.showModal = false; // Đặt showModal về false
    this.cdr.detectChanges(); // Cập nhật giao diện
  }

}
