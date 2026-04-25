import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'tuitionhub_token';
  private userKey = 'tuitionhub_user';

  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router, private ngZone: NgZone) {}

  // ==================== EMAIL/PASSWORD LOGIN ====================

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        this.storeAuth(res);
        this.saveUserTimezone();
      })
    );
  }

  // ==================== REGISTRATION ====================

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
      tap(res => {
        this.storeAuth(res);
        this.saveUserTimezone();
      })
    );
  }

  // ==================== GOOGLE LOGIN ====================

  googleLogin(email: string, name: string, role: string = 'STUDENT'): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/google-login`, { email, name, role }).pipe(
      tap(res => {
        this.storeAuth(res);
        this.saveUserTimezone();
      })
    );
  }

  // ==================== FORGOT PASSWORD ====================

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, { token, password });
  }

  // ==================== LEGACY OTP (kept for backward compat) ====================

  sendOtp(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/send-otp`, { email });
  }

  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/verify-otp`, { email, otp }).pipe(
      tap(res => {
        this.storeAuth(res);
        this.saveUserTimezone();
      })
    );
  }

  // ==================== AUTH HELPERS ====================

  private storeAuth(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    localStorage.setItem(this.userKey, JSON.stringify(res));
    this.currentUserSubject.next(res);
  }

  private saveUserTimezone() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    localStorage.setItem('tuitionhub_timezone', tz);
    this.http.put(`${this.apiUrl}/auth/update-timezone`, { timezone: tz }).subscribe({
      next: () => console.log('[Auth] Timezone saved:', tz),
      error: () => console.warn('[Auth] Could not save timezone, using local.')
    });
  }

  getUserTimezone(): string {
    return localStorage.getItem('tuitionhub_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  private getStoredUser(): AuthResponse | null {
    const stored = localStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  navigateByRole(role: string) {
    const roleUpper = role?.toUpperCase();
    
    let url = '/auth/login';
    if (roleUpper === 'STUDENT') url = '/student/dashboard';
    else if (roleUpper === 'TEACHER') url = '/teacher/dashboard';
    else if (roleUpper === 'PARENT') url = '/parent/dashboard';
    else if (roleUpper === 'ADMIN' || roleUpper === 'SUPER_ADMIN' || roleUpper === 'ORG_ADMIN') url = '/admin/dashboard';
    
    if (url === '/auth/login') {
      this.logout();
      return;
    }

    this.ngZone.run(() => {
      this.router.navigate([url]).then(success => {
        console.log('[AuthService] navigation:', success ? 'OK' : 'FAILED');
      });
    });
  }
}
