import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { User, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/admin/dashboard`).pipe(map(res => res.data));
  }

  getAllTeachers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/admin/teachers`).pipe(map(res => res.data));
  }

  getPendingTeachers(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/admin/teachers/pending`).pipe(map(res => res.data));
  }

  approveTeacher(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}/approve`, {});
  }

  rejectTeacher(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}/reject`, {});
  }

  getAllStudents(): Observable<User[]> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/admin/students`).pipe(map(res => res.data));
  }

  getAllBatches(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/batches`).pipe(map(res => res.data));
  }

  deactivateUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/users/${id}`);
  }

  activateUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/users/${id}/activate`, {});
  }
  assignStudentToBatch(batchId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/batches/${batchId}/students/${studentId}`, {});
  }

  removeStudentFromBatch(batchId: number, studentId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/batches/${batchId}/students/${studentId}`);
  }

  getAssignmentRequests(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/assignment-requests`).pipe(map(res => res.data));
  }

  fulfillRequest(requestId: number, batchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/requests/${requestId}/assign/${batchId}`, {});
  }

  assignTeacherToRequest(requestId: number, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/requests/${requestId}/assign-teacher/${teacherId}`, {});
  }

  updateRequestDetails(requestId: number, negotiatedFees: number, isIndividual: boolean): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/requests/${requestId}/details`, { negotiatedFees, isIndividual });
  }

  // Subject Management
  getSubjects(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/subjects`).pipe(map(res => res.data));
  }

  addSubject(subject: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/subjects`, subject);
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/subjects/${id}`);
  }

  // Wallet & Session Management
  adjustWallet(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/wallet/adjust`, data);
  }

  getAllWalletTransactions(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/wallet/transactions`).pipe(map(res => res.data));
  }

  getAllSessions(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/admin/sessions`).pipe(map(res => res.data));
  }

  updatePayoutStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/sessions/${id}/payout`, { status });
  }
}
