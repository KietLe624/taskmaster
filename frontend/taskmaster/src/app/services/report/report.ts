import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportData } from '../../models/reports'; // Assuming you have a model for report data

@Injectable({
  providedIn: 'root'
})
export class ReportService  {
  private apiUrl = 'http://localhost:3000/api/reports';
  constructor(private http: HttpClient) { }

      getOverviewReport(): Observable<ReportData> {
        return this.http.get<ReportData>(`${this.apiUrl}/overview`);
    }

}
