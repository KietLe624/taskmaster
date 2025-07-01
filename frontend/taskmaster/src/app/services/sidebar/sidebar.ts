/* File: src/app/services/sidebar.service.ts
  Description: Service để quản lý trạng thái đóng/mở của sidebar.
*/
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  // BehaviorSubject giữ trạng thái hiện tại của sidebar
  private isOpen = new BehaviorSubject<boolean>(false);

  // Expose an observable for components to subscribe to
  public isOpen$: Observable<boolean> = this.isOpen.asObservable();

  constructor() {}

  // Hàm để mở sidebar
  open(): void {
    this.isOpen.next(true);
  }

  // Hàm để đóng sidebar
  close(): void {
    this.isOpen.next(false);
  }

  // Hàm để bật/tắt sidebar
  toggle(): void {
    this.isOpen.next(!this.isOpen.value);
  }
}
