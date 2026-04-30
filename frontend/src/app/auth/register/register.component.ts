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
    <div class="handcrafted-auth-wrapper">
      <div class="blob-top"></div>
      <div class="blob-bottom"></div>

      <div class="auth-box-hand wide animate-hand">
        <div class="auth-header-hand">
          <div class="brand-badge-hand">
            <div class="logo-sq">TH</div>
            <span class="logo-txt">TuitionHub</span>
          </div>
          <h1 class="auth-title">{{ isVerifying ? 'One Last Step.' : 'Create Your Account.' }}</h1>
          <p class="auth-subtitle">{{ isVerifying ? 'Verify your email to get started.' : 'Join our community of lifelong learners and educators.' }}</p>
        </div>

        <!-- Step 2: OTP Verification -->
        <div *ngIf="isVerifying" class="animate-fade">
          <div class="otp-instruction-hand">
            <div class="instruction-icon">📩</div>
            <p>We've sent a 6-digit security code to <strong>{{ formData.email }}</strong>.</p>
          </div>

          <form (ngSubmit)="verifyOtp()" #otpForm="ngForm" class="auth-form-hand">
            <div class="form-group">
              <label class="form-label">Security Code</label>
              <input type="text" class="input-hand text-center-bold" [(ngModel)]="otpValue" name="otp"
                     placeholder="000000" maxlength="6" required>
            </div>
            <button type="submit" class="btn-hand btn-hand-primary btn-full" [disabled]="otpForm.invalid || isLoading">
              {{ isLoading ? 'Verifying...' : 'Complete Registration' }}
            </button>
          </form>
          
          <div class="auth-footer-hand mt-8">
            <p>Didn't get the code? <a href="javascript:void(0)" (click)="register()" class="link-hand-bold">Resend it</a></p>
          </div>
        </div>

        <!-- Success: Teacher Pending -->
        <div *ngIf="teacherPending" class="text-center animate-fade">
          <div class="pending-badge-hand">
            <span class="p-icon">⏳</span>
            <h3 class="p-title">Review in Progress</h3>
          </div>
          <p class="p-text">
            Your teacher profile has been submitted successfully. Our team will review your credentials and get back to you within 24-48 hours.
          </p>
          <button class="btn-hand btn-hand-primary btn-full mt-6" routerLink="/auth/login">Return to Login</button>
        </div>

        <!-- Step 1: Registration Form -->
        <form *ngIf="!teacherPending && !isVerifying" (ngSubmit)="register()" #regForm="ngForm" class="auth-form-hand">
          
          <div class="section-divider-hand">
            <span>Identify Your Role</span>
          </div>

          <div class="role-grid-hand">
            <div class="role-option-hand" [class.active]="formData.role === 'STUDENT'" (click)="formData.role = 'STUDENT'">
              <span class="role-emoji">🎓</span>
              <span class="role-name">Student</span>
            </div>
            <div class="role-option-hand" [class.active]="formData.role === 'TEACHER'" (click)="formData.role = 'TEACHER'">
              <span class="role-emoji">👨‍🏫</span>
              <span class="role-name">Mentor</span>
            </div>
            <div class="role-option-hand" [class.active]="formData.role === 'PARENT'" (click)="formData.role = 'PARENT'">
              <span class="role-emoji">👨‍👩‍👧‍👦</span>
              <span class="role-name">Parent</span>
            </div>
          </div>

          <div class="section-divider-hand mt-8">
            <span>Personal Details</span>
          </div>

          <div class="form-row-hand">
            <div class="form-group flex-1">
              <label class="form-label">Full Legal Name</label>
              <input type="text" class="input-hand" [(ngModel)]="formData.name" name="name" required placeholder="John Doe">
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Contact Number (Opt)</label>
              <input type="text" class="input-hand" [(ngModel)]="formData.mobile" name="mobile" placeholder="+1 ...">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" class="input-hand" [(ngModel)]="formData.email" name="email" required email placeholder="hello@example.com">
          </div>

          <div class="form-group">
            <label class="form-label">Create Password</label>
            <input type="password" class="input-hand" [(ngModel)]="formData.password" name="password" required minlength="6" placeholder="••••••••">
          </div>

          <div class="form-row-hand">
            <div class="form-group flex-1">
              <label class="form-label">Country</label>
              <select class="input-hand" [(ngModel)]="formData.country" name="country" required (change)="onCountryChange()">
                <option value="">Select...</option>
                <option value="IN">🇮🇳 India</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="AE">🇦🇪 UAE</option>
                <option value="SG">🇸🇬 Singapore</option>
                <option value="OTHER">🌍 Other</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">City</label>
              <input type="text" class="input-hand" [(ngModel)]="formData.city" name="city" required placeholder="e.g. London">
            </div>
          </div>

          <!-- Role-specific Sections -->
          <div class="role-specific-hand animate-fade" *ngIf="formData.role === 'STUDENT'">
            <div class="section-divider-hand">
              <span>Academic Link</span>
            </div>
            <div class="form-row-hand">
              <div class="form-group flex-1">
                <label class="form-label">Current Grade</label>
                <input type="text" class="input-hand" [(ngModel)]="formData.studentClass" name="studentClass" required placeholder="e.g. 10">
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Parent's Email</label>
                <input type="email" class="input-hand" [(ngModel)]="formData.parentEmail" name="parentEmail" required placeholder="guardian@email.com">
              </div>
            </div>
          </div>

          <div class="role-specific-hand animate-fade" *ngIf="formData.role === 'TEACHER'">
            <div class="section-divider-hand">
              <span>Professional Profile</span>
            </div>
            <div class="form-group">
              <label class="form-label">Primary Expertise</label>
              <select class="input-hand" [(ngModel)]="formData.subject" name="subject" required>
                <option value="">Select a subject...</option>
                <option *ngFor="let s of subjects" [value]="s.name">{{ s.icon }} {{ s.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Highest Qualification</label>
              <input type="text" class="input-hand" [(ngModel)]="formData.qualification" name="qualification" required placeholder="e.g. PhD in Physics">
            </div>
          </div>

          <div class="form-group mt-4">
            <label class="form-label">Referral Code (If any)</label>
            <input type="text" class="input-hand" [(ngModel)]="formData.referralCode" name="referralCode" placeholder="TUI-XXXXX">
          </div>

          <button type="submit" class="btn-hand btn-hand-primary btn-full mt-8" [disabled]="regForm.invalid || isLoading">
            {{ isLoading ? 'Processing...' : (formData.role === 'TEACHER' ? 'Submit Profile for Approval' : 'Create My Account') }}
          </button>
        </form>

        <div class="auth-footer-hand" *ngIf="!teacherPending && !isVerifying">
          <span>Already have an account?</span>
          <a routerLink="/auth/login" class="link-hand-bold">Sign In here</a>
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
      padding: 4rem 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .blob-top { position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: var(--primary-light); border-radius: 50%; filter: blur(80px); z-index: 0; }
    .blob-bottom { position: absolute; bottom: -150px; left: -100px; width: 500px; height: 500px; background: var(--accent-soft); border-radius: 50%; filter: blur(100px); z-index: 0; }

    .auth-box-hand {
      width: 100%;
      max-width: 520px;
      background: white;
      padding: 4rem 3.5rem;
      border-radius: 3rem;
      box-shadow: var(--shadow-float);
      border: 1px solid var(--border);
      position: relative;
      z-index: 1;
    }
    .auth-box-hand.wide { max-width: 600px; }

    .auth-header-hand { margin-bottom: 3rem; }
    .brand-badge-hand { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
    .logo-sq { width: 36px; height: 36px; background: var(--primary); color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
    .logo-txt { font-weight: 800; font-family: var(--font-heading); color: var(--text-main); font-size: 1.1rem; }
    
    .auth-title { font-size: 2.25rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 0.75rem; }
    .auth-subtitle { color: var(--text-muted); font-weight: 500; font-size: 1rem; }

    .section-divider-hand { display: flex; align-items: center; gap: 1rem; margin: 2rem 0 1.5rem; }
    .section-divider-hand span { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; white-space: nowrap; }
    .section-divider-hand::after { content: ''; flex: 1; height: 1px; background: var(--border); border-radius: 1px; }

    .role-grid-hand { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .role-option-hand {
      background: #F8FAFC;
      border: 2px solid #F1F5F9;
      padding: 1.25rem 0.5rem;
      border-radius: 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .role-option-hand:hover { border-color: var(--primary-light); background: white; }
    .role-option-hand.active { background: var(--primary-light); border-color: var(--primary); transform: translateY(-4px); }
    .role-emoji { font-size: 1.5rem; }
    .role-name { font-size: 0.8rem; font-weight: 800; color: var(--text-main); }
    .role-option-hand.active .role-name { color: var(--primary); }

    .form-row-hand { display: flex; gap: 1.5rem; }
    .flex-1 { flex: 1; }

    .otp-instruction-hand { text-align: center; background: #F8FAFC; padding: 2rem; border-radius: 2rem; margin-bottom: 2.5rem; border: 1px solid var(--border); }
    .instruction-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .text-center-bold { text-align: center; font-weight: 800; font-size: 1.5rem; letter-spacing: 0.25em; }

    .pending-badge-hand { margin-bottom: 2rem; }
    .p-icon { font-size: 4rem; display: block; margin-bottom: 1rem; }
    .p-title { font-size: 1.75rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); margin: 0; }
    .p-text { color: var(--text-muted); font-size: 1rem; line-height: 1.6; }

    .btn-full { width: 100%; padding: 1rem; }
    .mt-8 { margin-top: 2.5rem; }
    
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
      .form-row-hand { flex-direction: column; gap: 0; }
      .role-grid-hand { grid-template-columns: 1fr; }
    }
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
        this.toast.success('Security code sent to your email.');
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Registration failed. Please check your details.');
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
        this.toast.success('Account verified! Welcome to the family.');
        this.authService.navigateByRole(res.role);
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Verification failed. Invalid code.');
        this.isLoading = false;
      }
    });
  }
}
