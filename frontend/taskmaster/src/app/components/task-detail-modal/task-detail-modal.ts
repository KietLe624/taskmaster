import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Task, User, ProjectMember } from '../../models/project-detail'; // Đảm bảo đường dẫn này chính xác

@Component({
  selector: 'app-task-detail-modal',
  standalone: false,
  templateUrl: './task-detail-modal.html',
  styleUrl: './task-detail-modal.css',
})
export class TaskDetailModal implements OnInit, OnChanges {

  @Input() task: Task | null = null;
  @Input() members: ProjectMember[] = [];
  @Input() show = false;

  @Output() saveTask = new EventEmitter<Task>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteTask = new EventEmitter<number>();

  taskForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      due_date: ['', Validators.required],
      priority: ['', Validators.required],
      status: ['', Validators.required],
      assignee_id: [null, Validators.required], // ID của người được giao việc
    });
  }

  ngOnInit(): void {
    this.updateForm();
    this.taskForm.get('assignee_id')?.valueChanges.subscribe(value => {
      console.log('assignee_id changed:', value, typeof value);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.updateForm();
    }
    if (changes['members'] && this.members) {
      console.log('Dữ liệu members thực tế nhận được:', this.members);
    }
  }
  updateForm(): void {
    if (this.task) {

      const assigneeId = this.task.assignees && this.task.assignees.length > 0
        ? this.task.assignees[0].user_id || this.task.assignees[0].user_id
        : null;

      this.taskForm.patchValue({
        name: this.task.name,
        description: this.task.description || '',
        due_date: this.formatDateForInput(this.task.due_date),
        priority: this.task.priority || '',
        status: this.task.status || '',
        assignee_id: assigneeId,
      });
    }
  }

  // onSave(): void {
  //   console.log('Button clicked: Lưu công việc');
  //   if (this.taskForm.invalid) {
  //     return;
  //   }
  //   console.log('Modal: Dữ liệu công việc:', this.taskForm.value);
  //   this.isSubmitting = true;
  //   const taskData = {
  //     ...this.taskForm.value,
  //     task_id: this.task?.task_id
  //   };

  //   this.saveTask.emit(taskData);
  // }

  // Sửa trong file: task-detail-modal.ts

  onSave(): void {
    if (this.taskForm.invalid) {
      return;
    }
    // Chỉ cần emit giá trị của form, không cần thêm bất cứ thông tin gì khác
    this.saveTask.emit(this.taskForm.value);
  }
  onDelete(): void {
    if (this.task && confirm(`Bạn có chắc chắn muốn xóa công việc "${this.task.name}" không?`)) {
      this.deleteTask.emit(this.task.task_id); // Gửi ID công việc để xóa
    }
  }

  onClose(): void {
    this.closeModal.emit();
    console.log('Modal: Modal đã đóng');
  }

  private formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }
}
