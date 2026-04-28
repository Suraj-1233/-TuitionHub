import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`);
  }

  getAllTeachers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/teachers`);
  }

  getPendingTeachers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/teachers/pending`);
  }

  approveTeacher(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}/approve`, {});
  }

  rejectTeacher(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}/reject`, {});
  }

  getAllStudents(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/students`);
  }

  getAllBatches(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/batches`);
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
    return this.http.get<any[]>(`${this.apiUrl}/admin/assignment-requests`);
  }

  fulfillRequest(requestId: number, batchId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/requests/${requestId}/assign/${batchId}`, {});
  }

  assignTeacherToRequest(requestId: number, teacherId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/requests/${requestId}/assign-teacher/${teacherId}`, {});
  }

  // Subject Management
  getSubjects(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/subjects`);
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
    return this.http.get<any[]>(`${this.apiUrl}/admin/wallet/transactions`);
  }

  getAllSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/sessions`);
  }

  updatePayoutStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/sessions/${id}/payout`, { status });
  }
}
