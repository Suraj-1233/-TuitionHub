import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { PublicService } from '../../shared/services/public.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card glass animate-fade">
        <div class="text-center mb-6">
          <div class="logo-container">
            <div class="logo-icon">TH</div>
            <h1 class="logo-text">Join TuitionHub</h1>
          </div>
          <p class="subtitle">Create an account to get started</p>
        </div>

        <!-- Step 2: OTP Verification -->
        <div *ngIf="isVerifying" class="animate-fade">
          <div class="text-center mb-6">
            <div class="success-icon">📧</div>
            <h3 class="font-bold text-xl">Verify Your Email</h3>
            <p class="text-sm text-secondary">We sent an OTP to <strong>{{ formData.email }}</strong>. Please enter it below to activate your account.</p>
          </div>

          <form (ngSubmit)="verifyOtp()" #otpForm="ngForm">
            <div class="form-group">
              <label class="form-label">6-Digit OTP</label>
              <input type="text" class="form-control text-center text-xl tracking-widest" [(ngModel)]="otpValue" name="otp"
                     placeholder="000000" maxlength="6" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" [disabled]="otpForm.invalid || isLoading">
              {{ isLoading ? 'Verifying...' : '✅ Verify & Activate' }}
            </button>
          </form>
          
          <div class="text-center mt-6">
            <p class="text-xs text-secondary">Didn't receive code? <a href="javascript:void(0)" (click)="register()" class="text-primary font-bold">Resend OTP</a></p>
          </div>
        </div>

        <!-- Success: Teacher Pending (After Verification) -->
        <div *ngIf="teacherPending" class="text-center animate-fade">
          <div class="pending-icon">⏳</div>
          <h3 class="mb-2">Email Verified!</h3>
          <p class="text-sm text-secondary mb-4">
            Your <strong>Teacher</strong> account is now verified. 
            <br>However, it still requires <strong>admin approval</strong> before you can login.
            <br><br>We'll notify you once approved.
          </p>
          <button class="btn btn-primary btn-block" routerLink="/auth/login">← Go to Login</button>
        </div>

        <!-- Step 1: Registration Form -->
        <form *ngIf="!teacherPending && !isVerifying" (ngSubmit)="register()" #regForm="ngForm">
          <!-- Role Selection -->
          <div class="role-selector mb-4">
            <button type="button" class="role-btn" [class.active]="formData.role === 'STUDENT'" (click)="formData.role = 'STUDENT'">
              <span class="role-icon">🎓</span>
              <span class="role-label">Student</span>
            </button>
            <button type="button" class="role-btn" [class.active]="formData.role === 'TEACHER'" (click)="formData.role = 'TEACHER'">
              <span class="role-icon">👩‍🏫</span>
              <span class="role-label">Teacher</span>
            </button>
          </div>

          <div *ngIf="formData.role === 'TEACHER'" class="approval-notice mb-4">
            ⚠️ Teacher accounts require <strong>admin approval</strong> before you can access the platform.
          </div>

          <!-- Basic Info -->
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" class="form-control" [(ngModel)]="formData.name" name="name" required placeholder="Enter your full name">
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="form-control" [(ngModel)]="formData.email" name="email" required email placeholder="your@email.com">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" class="form-control" [(ngModel)]="formData.password" name="password" required minlength="6" placeholder="Min 6 characters">
          </div>

          <div class="form-group">
            <label class="form-label">Country</label>
            <select class="form-control" [(ngModel)]="formData.country" name="country" required (change)="onCountryChange()">
              <option value="">-- Select Country --</option>
              <option value="IN">🇮🇳 India</option>
              <option value="US">🇺🇸 United States</option>
              <option value="GB">🇬🇧 United Kingdom</option>
              <option value="CA">🇨🇦 Canada</option>
              <option value="AU">🇦🇺 Australia</option>
              <option value="AE">🇦🇪 UAE</option>
              <option value="SG">🇸🇬 Singapore</option>
              <option value="DE">🇩🇪 Germany</option>
              <option value="FR">🇫🇷 France</option>
              <option value="JP">🇯🇵 Japan</option>
              <option value="KR">🇰🇷 South Korea</option>
              <option value="NZ">🇳🇿 New Zealand</option>
              <option value="SA">🇸🇦 Saudi Arabia</option>
              <option value="QA">🇶🇦 Qatar</option>
              <option value="KW">🇰🇼 Kuwait</option>
              <option value="NP">🇳🇵 Nepal</option>
              <option value="BD">🇧🇩 Bangladesh</option>
              <option value="LK">🇱🇰 Sri Lanka</option>
              <option value="OTHER">🌍 Other</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">City</label>
              <input type="text" class="form-control" [(ngModel)]="formData.city" name="city" required placeholder="e.g. Mumbai, New York">
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Mobile (Optional)</label>
              <input type="text" class="form-control" [(ngModel)]="formData.mobile" name="mobile" placeholder="Phone number">
            </div>
          </div>

          <div class="timezone-badge" *ngIf="formData.timezone">
            🌍 Timezone: <strong>{{ formData.timezone }}</strong>
          </div>

          <ng-container *ngIf="formData.role === 'STUDENT'">
            <div class="form-row">
              <div class="form-group flex-1">
                <label class="form-label">Class/Grade</label>
                <input type="text" class="form-control" [(ngModel)]="formData.studentClass" name="studentClass" required placeholder="e.g. 10">
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Parent Email Address</label>
                <input type="email" class="form-control" [(ngModel)]="formData.parentEmail" name="parentEmail" required email placeholder="parent@email.com">
              </div>
            </div>
            <p class="text-xs text-secondary mt-[-10px] mb-4">Parent will manage your fees and class requests.</p>
          </ng-container>

          <!-- Teacher Fields -->
          <ng-container *ngIf="formData.role === 'TEACHER'">
            <div class="form-group">
              <label class="form-label">Subject Expertise</label>
              <select class="form-control" [(ngModel)]="formData.subject" name="subject" required>
                <option value="">-- Select Subject --</option>
                <option *ngFor="let s of subjects" [value]="s.name">{{ s.icon }} {{ s.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Qualification</label>
              <input type="text" class="form-control" [(ngModel)]="formData.qualification" name="qualification" required placeholder="e.g. M.Sc Mathematics">
            </div>
          </ng-container>

          <!-- Parent Fields Removed -->

          <div class="form-group">
            <label class="form-label">Referral Code (Optional)</label>
            <input type="text" class="form-control" [(ngModel)]="formData.referralCode" name="referralCode" placeholder="e.g. TUI-ABCD1">
          </div>

          <button type="submit" class="btn btn-primary btn-block mt-4" [disabled]="regForm.invalid || isLoading">
            {{ isLoading ? 'Creating Account...' : (formData.role === 'TEACHER' ? '📋 Submit for Approval' : '🚀 Create Account') }}
          </button>
        </form>

        <div class="text-center mt-4 text-sm" *ngIf="!teacherPending && !isVerifying">
          Already have an account? <a routerLink="/auth/login" class="text-primary font-bold">Login here</a>
        </div>
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
      width: 100%; max-width: 500px; padding: 2.5rem 2rem;
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
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }
    .logo-text { font-size: 1.75rem; font-weight: 900; color: #1E293B; margin: 0; }
    .subtitle { color: #64748B; font-size: 0.875rem; margin-top: 0.25rem; }

    .role-selector { display: flex; gap: 0.5rem; }
    .role-btn {
      flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.25rem;
      padding: 0.75rem; border-radius: 12px;
      border: 2px solid #E2E8F0; background: white;
      cursor: pointer; transition: all 0.2s;
      font-weight: 700; font-size: 0.75rem; color: #64748B;
    }
    .role-btn.active {
      border-color: #6366F1; background: #EEF2FF; color: #6366F1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    .role-icon { font-size: 1.5rem; }

    .approval-notice {
      background: #FEF3C7; border: 1px solid #FDE68A;
      border-radius: 10px; padding: 0.75rem 1rem;
      font-size: 0.8125rem; color: #92400E; font-weight: 600;
    }

    .form-group { margin-bottom: 1rem; }
    .form-label { display: block; font-weight: 700; font-size: 0.8125rem; color: #334155; margin-bottom: 0.4rem; }
    .form-control {
      width: 100%; padding: 0.75rem 1rem; border-radius: 10px;
      border: 1.5px solid #E2E8F0; font-size: 0.9375rem;
      transition: all 0.2s; box-sizing: border-box;
    }
    .form-control:focus { border-color: #6366F1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }

    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }

    .btn { border: none; cursor: pointer; font-weight: 700; border-radius: 12px; font-size: 0.9375rem; transition: all 0.2s; }
    .btn-primary {
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      color: white; padding: 0.85rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-block { width: 100%; }

    .text-primary { color: #6366F1; text-decoration: none; }
    .text-primary:hover { text-decoration: underline; }
    .text-secondary { color: #64748B; }
    .text-sm { font-size: 0.875rem; }
    .text-center { text-align: center; }
    .font-bold { font-weight: 700; }

    .pending-icon { font-size: 3rem; margin-bottom: 1rem; }
    .timezone-badge {
      background: #EEF2FF; border: 1px solid #C7D2FE;
      border-radius: 10px; padding: 0.6rem 1rem;
      font-size: 0.8125rem; color: #4338CA; font-weight: 600;
      margin-bottom: 1.25rem; text-align: center;
    }
    .animate-fade { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class RegisterComponent implements OnInit {
  isLoading = false;
  isVerifying = false;
  teacherPending = false;
  otpValue = '';
  subjects: any[] = [];

  formData: any = {
    role: 'STUDENT',
    name: '',
    email: '',
    password: '',
    mobile: '',
    country: '',
    city: '',
    timezone: '',
    currency: 'INR',
    studentClass: '',
    board: 'CBSE',
    parentEmail: '',
    qualification: '',
    subject: '',
    referralCode: ''
  };

  private countryMap: Record<string, { tz: string; currency: string }> = {
    'IN': { tz: 'Asia/Kolkata', currency: 'INR' },
    'US': { tz: 'America/New_York', currency: 'USD' },
    'GB': { tz: 'Europe/London', currency: 'GBP' },
    'CA': { tz: 'America/Toronto', currency: 'CAD' },
    'AU': { tz: 'Australia/Sydney', currency: 'AUD' },
    'AE': { tz: 'Asia/Dubai', currency: 'AED' },
    'SG': { tz: 'Asia/Singapore', currency: 'SGD' },
    'DE': { tz: 'Europe/Berlin', currency: 'EUR' },
    'FR': { tz: 'Europe/Paris', currency: 'EUR' },
    'JP': { tz: 'Asia/Tokyo', currency: 'JPY' },
    'KR': { tz: 'Asia/Seoul', currency: 'KRW' },
    'NZ': { tz: 'Pacific/Auckland', currency: 'NZD' },
    'SA': { tz: 'Asia/Riyadh', currency: 'SAR' },
    'QA': { tz: 'Asia/Qatar', currency: 'QAR' },
    'KW': { tz: 'Asia/Kuwait', currency: 'KWD' },
    'NP': { tz: 'Asia/Kathmandu', currency: 'NPR' },
    'BD': { tz: 'Asia/Dhaka', currency: 'BDT' },
    'LK': { tz: 'Asia/Colombo', currency: 'LKR' },
    'OTHER': { tz: Intl.DateTimeFormat().resolvedOptions().timeZone, currency: 'USD' }
  };

  constructor(
    private authService: AuthService, 
    private toast: ToastService,
    private publicService: PublicService
  ) {}

  ngOnInit() {
    this.loadSubjects();
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role) this.authService.navigateByRole(role);
    }
  }

  loadSubjects() {
    this.publicService.getSubjects().subscribe(s => this.subjects = s);
  }

  onCountryChange() {
    const mapping = this.countryMap[this.formData.country];
    if (mapping) {
      this.formData.timezone = mapping.tz;
      this.formData.currency = mapping.currency;
    }
  }

  register() {
    this.isLoading = true;
    this.authService.register(this.formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.isVerifying = true;
        this.toast.success('OTP sent to your email. Please verify.');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Registration failed. Please try again.');
        this.isLoading = false;
      }
    });
  }

  verifyOtp() {
    this.isLoading = true;
    this.authService.verifyOtp(this.formData.email, this.otpValue).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.role === 'TEACHER' && !res.isApproved) {
          this.isVerifying = false;
          this.teacherPending = true;
          this.authService.logout();
          return;
        }
        this.toast.success('Account verified successfully! Welcome to TuitionHub!');
        this.authService.navigateByRole(res.role);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Verification failed. Invalid OTP.');
        this.isLoading = false;
      }
    });
  }
}
