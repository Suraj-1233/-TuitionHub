import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createOrder(batchId: number, forMonth: string): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/student/payments/create-order`, {
      batchId,
      forMonth
    });
  }

  verifyPayment(data: {
    paymentId: number;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/student/payments/verify`, data);
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

  notifyFailure(paymentId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/student/payments/${paymentId}/fail`, {});
  }
}
