import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

export interface ProjectFrom {
  id: string | null;
  name: string;
  description: string;
  manager: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-create-project',
  standalone: false,
  templateUrl: './create-project.html',
  styleUrl: './create-project.css'
})
export class CreateProject implements OnChanges {
    @Input() show: boolean = false;

  // 2. Output 'save' giờ sẽ gửi đi dữ liệu của form
  @Output() save = new EventEmitter<ProjectFrom>();
  @Output() close = new EventEmitter<void>();

  // 3. Tạo một đối tượng để binding với các input trong form
  public projectData: ProjectFrom = this.resetForm();

  constructor() {}

  // Hàm này sẽ chạy mỗi khi giá trị Input (ví dụ: 'show') thay đổi
  ngOnChanges(changes: SimpleChanges): void {
    // Nếu modal được mở (từ false -> true), reset form
    if (changes['show'] && changes['show'].currentValue === true) {
      this.projectData = this.resetForm();
    }
  }

  // Hàm để reset form về trạng thái ban đầu
  private resetForm(): ProjectFrom {
    return {
      id: null,
      name: '',
      description: '',
      manager: '',
      startDate: '',
      endDate: ''
    };
  }

  closeModal(): void {
    this.close.emit();
  }

  // Hàm xử lý khi form được submit
  saveProject(): void {
    // Kiểm tra tính hợp lệ của form (bạn có thể thêm logic phức tạp hơn)
    if (!this.projectData.name || !this.projectData.startDate) {
      alert('Vui lòng điền các trường bắt buộc!');
      return;
    }

    // Gửi dữ liệu form ra component cha
    this.save.emit(this.projectData);
    this.closeModal(); // Đóng modal sau khi lưu
  }
}
