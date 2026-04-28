import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createOrder(batchId: number, forMonth: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/student/payments/create-order`, {
      batchId,
      forMonth
    });
  }

  verifyPayment(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/payments/verify`, request);
  }

  notifyFailure(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/student/payments/notify-failure`, request);
  }

  getStudentPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/student/payments`);
  }

  getTeacherPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/teacher/payments`);
  }

  getAllPayments(): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.apiUrl}/admin/payments`);
  }

  markAsPaid(paymentId: number, remark: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/admin/payments/${paymentId}/mark-as-paid?remark=${remark}`, {});
  }

  // Wallet Methods
  getWalletBalance(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/wallet/balance?userId=${userId}`);
  }

  getWalletTransactions(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/wallet/transactions?userId=${userId}`);
  }

  topupWallet(userId: number, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/wallet/topup`, { userId, amount });
  }

  // Session Methods
  bookSession(request: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/book`, request);
  }

  payForSession(sessionId: number, method: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/pay`, { method });
  }

  confirmGateway(sessionId: number, ref: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/${sessionId}/confirm-gateway`, { paymentReference: ref, amount });
  }

  getStudentSessions(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/student?studentId=${studentId}`);
  }
}
