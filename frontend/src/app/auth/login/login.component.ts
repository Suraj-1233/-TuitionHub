import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card glass animate-fade">
        <div class="text-center mb-6">
          <div class="logo-container">
            <div class="logo-icon">TH</div>
            <h1 class="logo-text">TuitionHub</h1>
          </div>
          <p class="subtitle">Welcome back! Sign in to continue.</p>
        </div>

        <!-- Google Sign-In Button -->
        <button class="btn-google" (click)="loginWithGoogle()" [disabled]="isLoading">
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continue with Google
        </button>

        <div class="divider">
          <span>or sign in with email</span>
        </div>

        <!-- Forgot Password Mode -->
        <form *ngIf="mode === 'forgot'" (ngSubmit)="forgotPassword()" #forgotForm="ngForm">
          <p class="text-center mb-4 text-sm text-secondary">
            Enter your email and we'll send you a password reset link.
          </p>
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   placeholder="your@email.com" required email>
          </div>
          <button type="submit" class="btn btn-primary btn-block" [disabled]="forgotForm.invalid || isLoading">
            {{ isLoading ? 'Sending...' : '📧 Send Reset Link' }}
          </button>
          <div class="text-center mt-4">
            <a href="javascript:void(0)" (click)="mode = 'login'" class="text-primary text-sm">← Back to Login</a>
          </div>
        </form>

        <!-- Email Sent Confirmation -->
        <div *ngIf="mode === 'forgot-sent'" class="text-center animate-fade">
          <div class="success-icon">✅</div>
          <h3 class="mb-2">Check Your Email</h3>
          <p class="text-sm text-secondary mb-4">
            We sent a password reset link to <strong>{{ email }}</strong>.
            <br>Check your inbox (and spam folder).
          </p>
          <button class="btn btn-outline btn-block" (click)="mode = 'login'">← Back to Login</button>
        </div>

        <!-- Normal Login Form -->
        <form *ngIf="mode === 'login'" (ngSubmit)="loginWithEmail()" #loginForm="ngForm">
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="email" name="email"
                   placeholder="your@email.com" required email>
          </div>
          <div class="form-group">
            <div class="label-row">
              <label class="form-label">Password</label>
              <a href="javascript:void(0)" (click)="mode = 'forgot'" class="forgot-link">Forgot password?</a>
            </div>
            <input type="password" class="form-control" [(ngModel)]="password" name="password"
                   placeholder="Enter your password" required minlength="6">
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>

        <div class="text-center mt-4 text-sm" *ngIf="mode === 'login'">
          Don't have an account? <a routerLink="/auth/register" class="text-primary font-bold">Register here</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #312E81 100%);
      padding: 1rem;
    }
    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: 2.5rem 2rem;
      background: rgba(255,255,255,0.95);
      border-radius: 1.5rem;
      box-shadow: 0 25px 50px rgba(0,0,0,0.3);
    }
    .logo-container { display: flex; align-items: center; justify-content: center; gap: 0.75rem; margin-bottom: 0.5rem; }
    .logo-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 900; font-size: 1.125rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .logo-text { font-size: 1.75rem; font-weight: 900; color: #1E293B; margin: 0; }
    .subtitle { color: #64748B; font-size: 0.875rem; margin-top: 0.25rem; }

    .btn-google {
      width: 100%;
      display: flex; align-items: center; justify-content: center; gap: 0.75rem;
      padding: 0.85rem; border-radius: 12px;
      border: 1px solid #E2E8F0;
      background: white; color: #334155;
      font-weight: 700; font-size: 0.9375rem;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-google:hover { background: #F8FAFC; border-color: #CBD5E1; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

    .divider {
      display: flex; align-items: center; gap: 1rem;
      margin: 1.5rem 0; color: #94A3B8; font-size: 0.75rem; font-weight: 600;
    }
    .divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: #E2E8F0; }

    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; font-weight: 700; font-size: 0.8125rem; color: #334155; margin-bottom: 0.5rem; }
    .form-control {
      width: 100%; padding: 0.8rem 1rem; border-radius: 10px;
      border: 1.5px solid #E2E8F0; font-size: 0.9375rem;
      transition: all 0.2s; box-sizing: border-box;
    }
    .form-control:focus { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }

    .label-row { display: flex; justify-content: space-between; align-items: center; }
    .forgot-link { font-size: 0.8125rem; color: #6366F1; text-decoration: none; font-weight: 600; }
    .forgot-link:hover { text-decoration: underline; }

    .btn { border: none; cursor: pointer; font-weight: 700; border-radius: 12px; font-size: 0.9375rem; transition: all 0.2s; }
    .btn-primary {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; padding: 0.85rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-outline {
      background: transparent; border: 1.5px solid #E2E8F0; color: #334155; padding: 0.85rem;
    }
    .btn-block { width: 100%; }

    .text-primary { color: #6366F1; text-decoration: none; }
    .text-primary:hover { text-decoration: underline; }
    .text-secondary { color: #64748B; }
    .text-sm { font-size: 0.875rem; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }

    .success-icon { font-size: 3rem; margin-bottom: 1rem; }
    .animate-fade { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  mode: 'login' | 'forgot' | 'forgot-sent' = 'login';

  constructor(private authService: AuthService, private router: Router, private toast: ToastService) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role) this.authService.navigateByRole(role);
    }
    this.loadGoogleScript();
  }

  loginWithEmail() {
    this.isLoading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.role === 'TEACHER' && !res.isApproved) {
          this.toast.warning('Your teacher account is pending admin approval. Please wait.');
          this.authService.logout();
          return;
        }
        this.toast.success('Login successful!');
        this.authService.navigateByRole(res.role);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Login failed. Check your credentials.');
        this.isLoading = false;
      }
    });
  }

  loginWithGoogle() {
    // Use Google Identity Services popup
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.prompt();
    } else {
      // Fallback: simulate Google login for dev
      const email = prompt('Enter Google email (dev mode):');
      const name = prompt('Enter your name:');
      if (email && name) {
        this.isLoading = true;
        this.authService.googleLogin(email, name).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.role === 'TEACHER' && !res.isApproved) {
              this.toast.warning('Teacher account pending admin approval.');
              this.authService.logout();
              return;
            }
            this.toast.success('Google login successful!');
            this.authService.navigateByRole(res.role);
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Google login failed');
            this.isLoading = false;
          }
        });
      }
    }
  }

  forgotPassword() {
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.mode = 'forgot-sent';
        this.toast.success('Reset link sent to your email!');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Could not send reset link.');
        this.isLoading = false;
      }
    });
  }

  private loadGoogleScript() {
    // Load Google Identity Services script
    if (typeof document !== 'undefined' && !document.getElementById('google-gsi')) {
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (typeof google !== 'undefined') {
          google.accounts.id.initialize({
            client_id: environment.googleClientId,
            callback: (response: any) => this.handleGoogleResponse(response)
          });
        }
      };
      document.head.appendChild(script);
    }
  }

  private handleGoogleResponse(response: any) {
    // Decode the JWT from Google
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    this.isLoading = true;
    this.authService.googleLogin(payload.email, payload.name).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.role === 'TEACHER' && !res.isApproved) {
          this.toast.warning('Teacher account pending admin approval.');
          this.authService.logout();
          return;
        }
        this.toast.success('Google login successful!');
        this.authService.navigateByRole(res.role);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Google login failed');
        this.isLoading = false;
      }
    });
  }
}
