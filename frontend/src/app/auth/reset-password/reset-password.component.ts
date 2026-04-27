import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card glass animate-fade">
        <div class="text-center mb-6">
          <div class="logo-container">
            <div class="logo-icon">TH</div>
            <h1 class="logo-text">Reset Password</h1>
          </div>
        </div>

        <!-- Success -->
        <div *ngIf="success" class="text-center animate-fade">
          <div class="success-icon">✅</div>
          <h3 class="mb-2">Password Reset!</h3>
          <p class="text-sm text-secondary mb-4">Your password has been changed successfully.</p>
          <button class="btn btn-primary btn-block" routerLink="/auth/login">Go to Login</button>
        </div>

        <!-- Reset Form -->
        <form *ngIf="!success" (ngSubmit)="resetPassword()" #resetForm="ngForm">
          <p class="text-center text-sm text-secondary mb-4">
            Enter your email, the OTP sent to you, and your new password.
          </p>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   placeholder="your@email.com" required email>
          </div>

          <div class="form-group">
            <label class="form-label">6-Digit OTP</label>
            <input type="text" class="form-control text-center tracking-widest" [(ngModel)]="otp" name="otp"
                   placeholder="000000" maxlength="6" required>
          </div>

          <div class="form-group">
            <label class="form-label">New Password</label>
            <input type="password" class="form-control" [(ngModel)]="newPassword" name="newPassword"
                   placeholder="Min 6 characters" required minlength="6">
          </div>

          <div class="form-group">
            <label class="form-label">Confirm Password</label>
            <input type="password" class="form-control" [(ngModel)]="confirmPassword" name="confirmPassword"
                   placeholder="Re-enter password" required minlength="6">
          </div>

          <div *ngIf="newPassword && confirmPassword && newPassword !== confirmPassword" class="error-text mb-3">
            Passwords do not match.
          </div>

          <button type="submit" class="btn btn-primary btn-block" 
                  [disabled]="resetForm.invalid || isLoading || newPassword !== confirmPassword">
            {{ isLoading ? 'Resetting...' : '🔒 Set New Password' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%);
      padding: 1rem;
    }
    .auth-card {
      width: 100%; max-width: 440px; padding: 2.5rem 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .logo-container { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .logo-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 14px; display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-size: 1.125rem;
    }
    .logo-text { font-size: 1.5rem; font-weight: 900; color: #1E293B; margin: 0; }
    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; font-weight: 700; font-size: 0.8125rem; color: #334155; margin-bottom: 0.5rem; }
    .form-control {
      width: 100%; padding: 0.8rem 1rem; border-radius: 10px;
      border: 1.5px solid #E2E8F0; font-size: 0.9375rem;
      transition: all 0.2s; box-sizing: border-box;
    }
    .form-control:focus { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }
    .btn { border: none; cursor: pointer; font-weight: 700; border-radius: 12px; font-size: 0.9375rem; transition: all 0.2s; }
    .btn-primary {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; padding: 0.85rem;
    }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-block { width: 100%; }
    .error-text { color: #EF4444; font-size: 0.8125rem; font-weight: 600; }
    .text-secondary { color: #64748B; }
    .text-sm { font-size: 0.875rem; }
    .text-center { text-align: center; }
    .success-icon { font-size: 3rem; margin-bottom: 1rem; }
    .animate-fade { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ResetPasswordComponent implements OnInit {
  email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  success = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    // Check if email was passed in query params
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.toast.error('Passwords do not match');
      return;
    }
    this.isLoading = true;
    this.authService.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.success = true;
        this.toast.success('Password reset successful!');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Reset failed. Check your OTP.');
        this.isLoading = false;
      }
    });
  }
}
