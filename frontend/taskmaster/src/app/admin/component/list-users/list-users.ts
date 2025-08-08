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
  showDetailModal: boolean = false; // Biến để điều khiển hiển thị modal
  selectedUser: User | null = null; // Biến để lưu người dùng được chọn
  showEditModal = false; // Biến để điều khiển hiển thị modal chỉnh sửa
  userToEdit: User | null = null; // Biến để lưu trữ người dùng cần chỉnh sửa
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

  selectUser(user: User): void {
    this.selectedUser = { ...user }; // Sao chép để tránh thay đổi trực tiếp dữ liệu gốc
  }

  onOpenDetailModal(user: User): void {
    this.selectedUser = user; // Đặt lại selectedUser để mở modal trống
    this.showDetailModal = true; // Đặt showModal về true
    this.cdr.detectChanges(); // Cập nhật giao diện
  }
  onCloseDetailModal(): void {
    this.selectedUser = null; // Đóng modal khi nhận sự kiện close
    this.showDetailModal = false; // Đặt showModal về false
    this.cdr.detectChanges(); // Cập nhật giao diện
  }

  // Phương thức mới để xử lý chỉnh sửa
  editUser(user: User): void {
    // Logic xử lý khi click nút chỉnh sửa
    console.log('Chỉnh sửa người dùng:', user);
    this.selectedUser = { ...user }; // Tạo bản sao để tránh thay đổi trực tiếp
    this.showEditModal = true;
    console.log('Mở modal chỉnh sửa cho người dùng:', user);
    this.cdr.detectChanges();
  }

  // Phương thức mới để xử lý xóa
  // Phương thức xóa người dùng
  deleteUser(user: User): void {
    if (user && user.user_id) {
      if (confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.full_name || user.user_id}?`)) {
        this.adminService.deleteUser(user.user_id).subscribe({
          next: () => {
            this.users = this.users.filter(u => u.user_id !== user.user_id);
            this.totalItems = this.totalItems > 0 ? this.totalItems - 1 : 0; // Cập nhật tổng số mục
            this.showDetailModal = false; // Đóng modal nếu đang mở
            this.cdr.detectChanges();
            console.log('Xóa người dùng thành công:', user.user_id);
          },
          error: (err) => {
            this.errorMessage = 'Không thể xóa người dùng: ' + (err.error?.message || err.message);
            console.error('Lỗi khi xóa người dùng:', err);
            this.cdr.detectChanges();
          }
        });
      }
    }
  }

  // Phương thức để xử lý việc đóng modal
  handleModalClose(): void {
    this.showEditModal = false;
    this.userToEdit = null;
    this.getAllUsers();
  }
}
