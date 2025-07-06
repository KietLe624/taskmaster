import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api/api';
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  message: string = '';
  constructor(private ApiService: ApiService) {}

  ngOnInit(): void {
  }
}
