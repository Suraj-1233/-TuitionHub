import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch, BatchJoinRequest } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BatchService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Public
  getAllBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.apiUrl}/batches`);
  }

  getBatchById(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.apiUrl}/batches/${id}`);
  }

  getBatch(id: number): Observable<Batch> {
    return this.getBatchById(id);
  }

  // Student
  getMyBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.apiUrl}/student/batches`);
  }

  joinBatch(batchId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/student/batches/${batchId}/join`, {});
  }

  leaveBatch(batchId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/student/batches/${batchId}/leave`);
  }

  proposeReschedule(batchId: number, newTiming: string): Observable<Batch> {
    return this.http.post<Batch>(`${this.apiUrl}/batches/${batchId}/propose-reschedule`, { newTiming });
  }

  respondToReschedule(batchId: number, accept: boolean): Observable<Batch> {
    return this.http.post<Batch>(`${this.apiUrl}/batches/${batchId}/respond-reschedule?accept=${accept}`, {});
  }

  // Teacher
  createBatch(data: any): Observable<Batch> {
    return this.http.post<Batch>(`${this.apiUrl}/teacher/batches`, data);
  }

  getTeacherBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(`${this.apiUrl}/teacher/batches`);
  }

  updateLiveLink(batchId: number, data: { liveClassLink: string; liveClassPlatform: string }): Observable<Batch> {
    return this.http.put<Batch>(`${this.apiUrl}/teacher/batches/${batchId}/live-link`, data);
  }

  getPendingRequests(): Observable<BatchJoinRequest[]> {
    return this.http.get<BatchJoinRequest[]>(`${this.apiUrl}/teacher/join-requests`);
  }

  respondToRequest(requestId: number, approve: boolean): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/teacher/join-requests/${requestId}/respond?approve=${approve}`,
      {}
    );
  }
}
