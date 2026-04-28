import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch as Class, BatchJoinRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Common Class Operations
  getAllClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/batches`);
  }

  getClassById(id: number): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/batches/${id}`);
  }

  // Student Operations
  getMyClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/student/batches`);
  }

  // Teacher Operations
  createClass(data: any): Observable<Class> {
    return this.http.post<Class>(`${this.apiUrl}/teacher/batches`, data);
  }

  getTeacherClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.apiUrl}/teacher/batches`);
  }

  updateLiveLink(classId: number, data: { liveClassLink: string; liveClassPlatform: string }): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/teacher/batches/${classId}/live-link`, data);
  }

  // Requests Management (1-on-1 Setup)
  getPendingRequests(): Observable<BatchJoinRequest[]> {
    return this.http.get<BatchJoinRequest[]>(`${this.apiUrl}/teacher/join-requests`);
  }

  respondToRequest(requestId: number, approve: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/teacher/join-requests/${requestId}/respond?approve=${approve}`,
      {}
    );
  }

  // Legacy/Cleanup (Maintaining aliases for existing components)
  createBatch(data: any): Observable<Class> { return this.createClass(data); }
  getTeacherBatches(): Observable<Class[]> { return this.getTeacherClasses(); }
  getMyBatches(): Observable<Class[]> { return this.getMyClasses(); }
  getBatch(id: number): Observable<Class> { return this.getClassById(id); }
}
