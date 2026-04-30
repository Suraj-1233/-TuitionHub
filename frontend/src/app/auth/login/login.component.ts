import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="handcrafted-auth-wrapper">
      <!-- Decorative background elements -->
      <div class="blob-top"></div>
      <div class="blob-bottom"></div>

      <div class="auth-box-hand animate-hand">
        <div class="auth-header-hand">
          <div class="brand-badge-hand">
            <div class="logo-sq">TH</div>
            <span class="logo-txt">TuitionHub</span>
          </div>
          <h1 class="auth-title">Welcome Back.</h1>
          <p class="auth-subtitle">Sign in to continue your learning journey.</p>
        </div>

        <!-- Normal Login Form -->
        <form *ngIf="mode === 'login'" (ngSubmit)="loginWithEmail()" #loginForm="ngForm" class="auth-form-hand">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="input-hand" [(ngModel)]="email" name="email"
                   placeholder="e.g. name@company.com" required email>
          </div>
          
          <div class="form-group">
            <div class="label-row-hand">
              <label class="form-label">Password</label>
              <a href="javascript:void(0)" (click)="mode = 'forgot'" class="link-hand">Forgot?</a>
            </div>
            <input type="password" class="input-hand" [(ngModel)]="password" name="password"
                   placeholder="••••••••" required minlength="6">
          </div>

          <button type="submit" class="btn-hand btn-hand-primary btn-full mt-4" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Authenticating...' : 'Sign In to Dashboard' }}
          </button>
        </form>

        <!-- Forgot Password Mode -->
        <form *ngIf="mode === 'forgot'" (ngSubmit)="forgotPassword()" #forgotForm="ngForm" class="auth-form-hand animate-fade">
          <p class="form-hint">Enter your email and we'll send you a password reset link.</p>
          <div class="form-group">
            <label class="form-label">Account Email</label>
            <input type="email" class="input-hand" [(ngModel)]="email" name="email"
                   placeholder="your@email.com" required email>
          </div>
          <button type="submit" class="btn-hand btn-hand-primary btn-full" [disabled]="forgotForm.invalid || isLoading">
            {{ isLoading ? 'Sending...' : 'Send Reset Link' }}
          </button>
          <div class="center-link mt-6">
            <a href="javascript:void(0)" (click)="mode = 'login'" class="link-hand">← Back to Login</a>
          </div>
        </form>

        <!-- OTP & New Password Mode -->
        <div *ngIf="mode === 'forgot-sent'" class="auth-form-hand animate-fade">
          <p class="form-hint">Enter the code sent to <strong>{{ email }}</strong></p>
          <form (ngSubmit)="resetPassword()" #resetForm="ngForm">
            <div class="form-group">
              <label class="form-label">Security Code</label>
              <input type="text" class="input-hand text-center-bold" [(ngModel)]="otp" name="otp"
                     placeholder="000000" maxlength="6" required>
            </div>
            <div class="form-group">
              <label class="form-label">New Secure Password</label>
              <input type="password" class="input-hand" [(ngModel)]="password" name="password"
                     placeholder="Min. 6 characters" minlength="6" required>
            </div>
            <button type="submit" class="btn-hand btn-hand-primary btn-full" [disabled]="resetForm.invalid || isLoading">
              {{ isLoading ? 'Updating...' : 'Update Password' }}
            </button>
          </form>
          <div class="center-link mt-6">
            <a href="javascript:void(0)" (click)="mode = 'login'" class="link-hand">← Back to Login</a>
          </div>
        </div>

        <div class="auth-footer-hand" *ngIf="mode === 'login'">
          <span>New to the platform?</span>
          <a routerLink="/auth/register" class="link-hand-bold">Create an account</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .handcrafted-auth-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-app);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .blob-top {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 400px;
      height: 400px;
      background: var(--primary-light);
      border-radius: 50%;
      filter: blur(80px);
      z-index: 0;
    }
    
    .blob-bottom {
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 500px;
      height: 500px;
      background: var(--accent-soft);
      border-radius: 50%;
      filter: blur(100px);
      z-index: 0;
    }

    .auth-box-hand {
      width: 100%;
      max-width: 480px;
      background: white;
      padding: 4rem 3.5rem;
      border-radius: 3rem;
      box-shadow: var(--shadow-float);
      border: 1px solid var(--border);
      position: relative;
      z-index: 1;
    }

    .auth-header-hand { margin-bottom: 3rem; }
    
    .brand-badge-hand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .logo-sq {
      width: 36px;
      height: 36px;
      background: var(--primary);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.8rem;
    }
    .logo-txt { font-weight: 800; font-family: var(--font-heading); color: var(--text-main); font-size: 1.1rem; }
    
    .auth-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 0.75rem; }
    .auth-subtitle { color: var(--text-muted); font-weight: 500; font-size: 1rem; }

    .form-hint { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem; }
    .label-row-hand { display: flex; justify-content: space-between; align-items: baseline; }
    .link-hand { font-size: 0.8rem; color: var(--primary); font-weight: 700; text-decoration: none; }
    .link-hand:hover { text-decoration: underline; }
    
    .btn-full { width: 100%; padding: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .mt-6 { margin-top: 2rem; }
    .center-link { text-align: center; }
    
    .text-center-bold { text-align: center; font-weight: 800; font-size: 1.5rem; letter-spacing: 0.25em; }

    .auth-footer-hand {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px dashed var(--border);
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-muted);
    }
    .link-hand-bold { color: var(--text-main); font-weight: 800; text-decoration: none; border-bottom: 2px solid var(--primary-light); transition: var(--transition-smooth); }
    .link-hand-bold:hover { color: var(--primary); border-color: var(--primary); }

    @media (max-width: 500px) {
      .auth-box-hand { padding: 3rem 2rem; border-radius: 2rem; }
    }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  otp = '';
  isLoading = false;
  mode: 'login' | 'forgot' | 'forgot-sent' = 'login';

  constructor(private authService: AuthService, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role) this.authService.navigateByRole(role);
    }
  }

  loginWithEmail() {
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.role === 'TEACHER' && !res.isApproved) {
          this.toast.warning('Your teacher account is pending admin approval.');
          this.authService.logout();
          return;
        }
        this.toast.success('Welcome back!');
        this.authService.navigateByRole(res.role);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Login failed. Check your credentials.');
        this.isLoading = false;
      }
    });
  }

  forgotPassword() {
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.mode = 'forgot-sent';
        this.toast.success('Security code sent!');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not send code.');
        this.isLoading = false;
      }
    });
  }

  resetPassword() {
    this.isLoading = true;
    this.authService.resetPassword(this.email, this.otp, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.mode = 'login';
        this.toast.success('Password updated successfully!');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Update failed. Check your code.');
        this.isLoading = false;
      }
    });
  }
}
