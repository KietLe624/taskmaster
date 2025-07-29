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


  constructor(private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['show'] && this.show) {
      console.log(this.userList, this.projectList);
      if (this.isEditMode && this.taskToEdit) {
        this.taskData = {
          id: this.taskToEdit.task_id,
          name: this.taskToEdit.name,
          description: this.taskToEdit.description || '',
          status: this.taskToEdit.status,
          priority: this.taskToEdit.priority,
          cate: this.taskToEdit.cate || '',
          start_time: this.formatDateTimeForInput(this.taskToEdit.start_time),
          due_date: this.formatDateTimeForInput(this.taskToEdit.due_date),
          project_id: this.taskToEdit.project ? this.taskToEdit.project.id : null,
          assignee_id: this.taskToEdit.assignees.length > 0 ? this.taskToEdit.assignees[0].user_id : null
        };
      } else {
        this.taskData = this.resetForm();
        this.cdr.detectChanges(); // Cập nhật giao diện khi mở modal
      }
    }
  }
  saveTask(): void {
    this.save.emit(this.taskData);
  }

  public closeModal(): void {
    this.close.emit();
  }

  private formatDateTimeForInput(dateString: string | null | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Tránh vấn đề timezone bằng cách lấy các thành phần và tự ghép chuỗi
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }
  private resetForm(): TaskForm {
    return { id: null, name: '', description: '', status: 'inreview', priority: 'medium', cate: '', start_time: '', due_date: '', project_id: null, assignee_id: null };
  }
}
