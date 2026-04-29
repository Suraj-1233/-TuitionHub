import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ParentService {
  private apiUrl = `${environment.apiUrl}/parent`;

  constructor(private http: HttpClient) {}

  getDashboardSummary(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/dashboard`).pipe(
      map(res => res.data)
    );
  }

  getChildren(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/children`).pipe(
      map(res => res.data)
    );
  }

  getChildPayments(childId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/children/${childId}/payments`).pipe(
      map(res => res.data)
    );
  }

  // Payment Methods
  createOrder(studentId: number, batchId: number, forMonth: string): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/parent/payments/create-order`, {
      studentId, batchId, forMonth
    }).pipe(map(res => res.data));
  }

  verifyPayment(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/parent/payments/verify`, request).pipe(map(res => res.data));
  }

  notifyFailure(request: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/parent/payments/notify-failure`, request);
  }

  getPayments(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/parent/payments`).pipe(map(res => res.data));
  }

  // Wallet Methods
  getWalletBalance(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/wallet/balance`).pipe(map(res => res.data));
  }

  getWalletTransactions(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/wallet/transactions`).pipe(map(res => res.data));
  }

  createTopupOrder(amount: number): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/parent/wallet/topup/create-order?amount=${amount}`, {}).pipe(map(res => res.data));
  }

  verifyTopup(request: any): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/parent/wallet/topup/verify`, request).pipe(map(res => res.data));
  }

  getRazorpayKey(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/config/razorpay-key`).pipe(map(res => res.data));
  }
}
