import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Batch as Class, BatchJoinRequest, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Common Class Operations
  getAllClasses(): Observable<Class[]> {
    return this.http.get<ApiResponse<Class[]>>(`${this.apiUrl}/batches`).pipe(map(res => res.data));
  }

  getClassById(id: number): Observable<Class> {
    return this.http.get<ApiResponse<Class>>(`${this.apiUrl}/batches/${id}`).pipe(map(res => res.data));
  }

  // Student Operations
  getMyClasses(): Observable<Class[]> {
    return this.http.get<ApiResponse<Class[]>>(`${this.apiUrl}/student/batches`).pipe(map(res => res.data));
  }

  // Teacher Operations
  createClass(data: any): Observable<Class> {
    return this.http.post<ApiResponse<Class>>(`${this.apiUrl}/teacher/batches`, data).pipe(map(res => res.data));
  }

  getTeacherClasses(): Observable<Class[]> {
    return this.http.get<ApiResponse<Class[]>>(`${this.apiUrl}/teacher/batches`).pipe(map(res => res.data));
  }

  updateLiveLink(classId: number, data: { liveClassLink: string; liveClassPlatform: string }): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/teacher/batches/${classId}/live-link`, data);
  }

  // Requests Management (1-on-1 Setup)
  getPendingRequests(): Observable<BatchJoinRequest[]> {
    return this.http.get<ApiResponse<BatchJoinRequest[]>>(`${this.apiUrl}/teacher/join-requests`).pipe(map(res => res.data));
  }

  respondToRequest(requestId: number, approve: boolean): Observable<{ message: string }> {
    return this.http.post<ApiResponse<{ message: string }>>(
      `${this.apiUrl}/teacher/join-requests/${requestId}/respond?approve=${approve}`,
      {}
    ).pipe(map(res => res.data));
  }

  proposeReschedule(batchId: number, newTiming: string): Observable<Class> {
    return this.http.post<ApiResponse<Class>>(`${this.apiUrl}/batches/${batchId}/propose-reschedule`, { newTiming }).pipe(map(res => res.data));
  }

  respondToReschedule(batchId: number, accept: boolean): Observable<Class> {
    return this.http.post<ApiResponse<Class>>(`${this.apiUrl}/batches/${batchId}/respond-reschedule?accept=${accept}`, {}).pipe(map(res => res.data));
  }

  // Legacy/Cleanup (Maintaining aliases for existing components)
  createBatch(data: any): Observable<Class> { return this.createClass(data); }
  getTeacherBatches(): Observable<Class[]> { return this.getTeacherClasses(); }
  getMyBatches(): Observable<Class[]> { return this.getMyClasses(); }
  getBatch(id: number): Observable<Class> { return this.getClassById(id); }
}
