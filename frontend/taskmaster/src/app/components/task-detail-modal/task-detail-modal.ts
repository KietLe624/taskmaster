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
import { Task, User } from '../../models/project-detail'; // Đảm bảo đường dẫn này chính xác

@Component({
  selector: 'app-task-detail-modal',
  standalone: false,
  templateUrl: './task-detail-modal.html',
  styleUrl: './task-detail-modal.css',
})
export class TaskDetailModal implements OnInit, OnChanges{

  @Input() task: Task | null = null;
  @Input() members: User[] = [];
  @Input() show = false;

  @Output() saveTask = new EventEmitter<Task>();
  @Output() closeModal = new EventEmitter<void>();
  @Output() deleteTask = new EventEmitter<number>();

  taskForm: FormGroup;
  isSubmitting = false;

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      due_date: ['', Validators.required],
      priority: ['medium', Validators.required],
      status: ['', Validators.required],
      assignee_id: [null], // ID của người được giao việc
    });
  }

  ngOnInit(): void {
    this.updateForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.updateForm();
    }
  }
  updateForm(): void {
    if (this.task) {
      this.taskForm.patchValue({
        name: this.task.name,
        description: this.task.description || '',
        due_date: this.formatDateForInput(this.task.due_date),
        priority: this.task.priority || 'medium',
        status: this.task.status || '',
        assignee_id:
          this.task.assignees && this.task.assignees.length > 0
            ? this.task.assignees[0].id
            : null,
      });
    }
  }

  onSave(): void {
    if (this.taskForm.invalid) {
      return;
    }
    this.isSubmitting = true;
    this.saveTask.emit(this.taskForm.value);
  }

  onDelete(): void {
    if (this.task && confirm(`Bạn có chắc chắn muốn xóa công việc "${this.task.name}" không?`)) {
      this.deleteTask.emit(this.task.task_id); // EMIT WITH THE NEW NAME
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
