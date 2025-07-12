import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { ProjectsData } from '../../models/projects'; // Điều chỉnh đường dẫn nếu cần

export interface ProjectFrom {
  id: string | null;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  manager_name: string;
  user_name: string;
}

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.html',
  styleUrls: ['./create-project.css'],
  standalone: false, 
})
export class CreateProject implements OnChanges {
  @Input() show = false;
  @Input() isEditMode = false;
  @Input() projectToEdit: ProjectsData | null = null; // --- INPUT MỚI ---

  @Output() save = new EventEmitter<ProjectFrom>();
  @Output() close = new EventEmitter<void>();

  public projectData: ProjectFrom = this.resetForm();
  public modalTitle = 'Tạo dự án mới';

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    // Nếu modal được hiển thị, kiểm tra xem có phải chế độ sửa không
    if (changes['show'] && this.show) {
      if (this.isEditMode && this.projectToEdit) {
        // --- CHẾ ĐỘ SỬA ---
        this.modalTitle = 'Chỉnh sửa dự án';
        this.projectData = {
          id: this.projectToEdit.id.toString(),
          name: this.projectToEdit.name,
          description: this.projectToEdit.description,
          // Định dạng ngày cho input type="date" (YYYY-MM-DD)
          startDate: this.formatDate(this.projectToEdit.start_date),
          endDate: this.formatDate(this.projectToEdit.end_date),
          manager_name: '', // Các trường này không thuộc form sửa
          user_name: ''
        };
      } else {
        // --- CHẾ ĐỘ TẠO MỚI ---
        this.modalTitle = 'Tạo dự án mới';
        this.projectData = this.resetForm();
      }
    }
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    // new Date(dateString).toISOString() trả về "2025-12-20T00:00:00.000Z"
    // .split('T')[0] sẽ lấy "2025-12-20"
    return new Date(dateString).toISOString().split('T')[0];
  }

  private resetForm(): ProjectFrom {
    return { id: null, name: '', description: '', startDate: '', endDate: '', manager_name: '', user_name: '' };
  }

  closeModal(): void {
    this.close.emit();
  }

  saveProject(): void {
    if (!this.projectData.name || !this.projectData.startDate) {
      alert('Vui lòng điền các trường bắt buộc!');
      return;
    }
    this.save.emit(this.projectData);
  }
}
