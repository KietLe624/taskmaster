import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../../services/sidebar/sidebar';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public isOpen$: Observable<boolean>;

  constructor(private sidebarService: SidebarService) {
    this.isOpen$ = this.sidebarService.isOpen$;
  }

  ngOnInit(): void {}

  closeSidebar(): void {
    this.sidebarService.close();
  }
}
