import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { TaskDetailData, TaskForm, Project, User } from '../../models/tasks';

import { ChangeDetectorRef } from '@angular/core'; // Giữ lại import này nếu cần

@Component({
  selector: 'app-create-task',
  standalone: false,
  templateUrl: './create-task.html',
  styleUrls: ['./create-task.css']
})
export class CreateTask implements OnChanges {

  @Input() show = false;
  @Input() isEditMode = false;
  @Input() taskEdit: TaskDetailData | null = null; // --- INPUT MỚI ---
  @Input() modalTitle = 'Tạo công việc mới'; // Tiêu đề của modal
  @Input() taskData: TaskForm = this.resetForm();
  @Input() userList: User[] = [];
  @Input() projectList: Project[] = [];
  @Input() taskToEdit: TaskDetailData | null = null;

  @Output() save = new EventEmitter<TaskForm>();
  @Output() close = new EventEmitter<void>();


  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    // Chỉ xử lý khi modal được mở
    if (changes['show'] && this.show) {
      if (this.isEditMode && this.taskToEdit) {
        // NẾU LÀ CHẾ ĐỘ SỬA: Lấy dữ liệu từ taskToEdit và điền vào form
        this.taskData = {
          id: this.taskToEdit.task_id,
          name: this.taskToEdit.name,
          description: this.taskToEdit.description || '',
          status: this.taskToEdit.status,
          priority: this.taskToEdit.priority,
          cate: this.taskToEdit.cate || '',
          due_date: this.formatDate(this.taskToEdit.due_date), // Định dạng lại ngày tháng
          project_id: this.taskToEdit.project ? this.taskToEdit.project.id : null,
          assignee_id: this.taskToEdit.assignees.length > 0 ? this.taskToEdit.assignees[0].user_id : null
        };
      } else {
        // NẾU LÀ CHẾ ĐỘ TẠO MỚI: Reset form
        this.taskData = this.resetForm();
      }
    }
  }
  saveTask(): void {

    this.save.emit(this.taskData);
    this.closeModal();
  }

  public closeModal(): void {
    this.close.emit();
  }
  private formatDate(dateString: string): string {
    if (!dateString) return '';
    // new Date(dateString).toISOString() trả về "2025-12-20T00:00:00.000Z"
    // .split('T')[0] sẽ lấy "2025-12-20"
    return new Date(dateString).toISOString().split('T')[0];
  }
  private resetForm(): TaskForm {
    return { id: null, name: '', description: '', status: 'inreview', priority: 'medium', cate: '', due_date: '', project_id: null, assignee_id: null };
  }
}
