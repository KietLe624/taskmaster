import { Component, OnInit, ChangeDetectorRef, input, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../service/admin'; // Adjust the import path as necessary
import { User } from '../../model/users'; // Adjust the import path as necessary

@Component({
  selector: 'app-user-detail',
  standalone: false,
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.css',
})
export class UserDetail implements OnInit {

  @Input() show: boolean = false;
  @Input() user: User | null = null;
  @Input() isDetailUser: boolean = false;
  @Output() close = new EventEmitter<void>();
  isLoaning: boolean = false;
  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  onClose(): void {
    this.close.emit();
    console.log('Modal closed');
  }
}
