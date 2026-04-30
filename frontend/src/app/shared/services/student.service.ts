import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  requestTuition(data: { subjects: string, timings: string, notes: string }): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/student/request-tuition`, data).pipe(map(res => res.data));
  }

  getMyRequests(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/student/my-requests`).pipe(map(res => res.data));
  }

  getPayments(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/student/my-payments`).pipe(map(res => res.data));
  }

  getReferrals(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/student/referrals`).pipe(map(res => res.data));
  }
}
