import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Payment, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createOrder(batchId: number, forMonth: string): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/student/payments/create-order`, {
      batchId,
      forMonth
    }).pipe(map(res => res.data));
  }

  verifyPayment(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/student/payments/verify`, request).pipe(map(res => res.data));
  }

  notifyFailure(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/student/payments/notify-failure`, request).pipe(map(res => res.data));
  }

  createSessionOrder(sessionId: number): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/student/sessions/${sessionId}/create-order`, {}).pipe(map(res => res.data));
  }

  getStudentPayments(): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/student/payments`).pipe(map(res => res.data));
  }

  getTeacherPayments(): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/teacher/payments`).pipe(map(res => res.data));
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}/admin/payments`).pipe(map(res => res.data));
  }

  markAsPaid(paymentId: number, remark: string): Observable<Payment> {
    return this.http.post<ApiResponse<Payment>>(`${this.apiUrl}/admin/payments/${paymentId}/mark-as-paid?remark=${remark}`, {}).pipe(map(res => res.data));
  }



  // Session Methods
  bookSession(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/sessions/book`, request).pipe(map(res => res.data));
  }

  payForSession(sessionId: number, method: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/sessions/${sessionId}/pay`, { method }).pipe(map(res => res.data));
  }

  getRazorpayKey(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/config/razorpay-key`).pipe(map(res => res.data));
  }

  confirmGateway(sessionId: number, ref: string, amount: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/sessions/${sessionId}/confirm-gateway`, { paymentReference: ref, amount }).pipe(map(res => res.data));
  }

  getStudentSessions(studentId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/sessions/student?studentId=${studentId}`).pipe(map(res => res.data));
  }
}
