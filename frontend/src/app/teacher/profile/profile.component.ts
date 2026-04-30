import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { TeacherService } from '../../shared/services/teacher.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-teacher-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="page-header animate-slide">
        <h1 class="page-title">Profile Settings</h1>
        <p class="text-secondary mt-1">Manage your public profile, expertise, and availability.</p>
      </div>

      <div class="profile-grid animate-fade">
        
        <!-- Left Column: Personal & Professional Info -->
        <div class="settings-column">
          <div class="card glass">
            <h3 class="section-title"><span class="icon">👤</span> Personal Details</h3>
            
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="input-modern" [(ngModel)]="profileData.name" placeholder="John Doe">
            </div>

            <div class="form-group">
              <label>City / Location</label>
              <input type="text" class="input-modern" [(ngModel)]="profileData.city" placeholder="e.g., New York, NY">
            </div>
            
            <div class="form-group">
              <label>Email Address</label>
              <input type="text" class="input-modern disabled" [value]="currentUser?.email" disabled>
              <span class="hint">Contact admin to change email.</span>
            </div>
          </div>

          <div class="card glass mt-4">
            <h3 class="section-title"><span class="icon">🎓</span> Professional Info</h3>
            
            <div class="form-group">
              <label>Primary Subject Expertise</label>
              <input type="text" class="input-modern" [(ngModel)]="profileData.teacherProfile.subject" placeholder="e.g., Advanced Mathematics">
            </div>

            <div class="form-group">
              <label>Highest Qualification</label>
              <input type="text" class="input-modern" [(ngModel)]="profileData.teacherProfile.qualification" placeholder="e.g., Ph.D. in Physics">
            </div>

            <div class="form-group">
              <label>Professional Bio</label>
              <textarea class="input-modern textarea" [(ngModel)]="profileData.teacherProfile.bio" rows="4" placeholder="Tell students about your teaching methodology and experience..."></textarea>
            </div>
          </div>

          <div class="action-footer mt-4">
            <button class="btn-primary-lg w-100" (click)="saveProfile()" [disabled]="isSaving">
              <span *ngIf="!isSaving">💾 Save Profile Changes</span>
              <span *ngIf="isSaving" class="spinner">⏳ Saving...</span>
            </button>
          </div>
        </div>

      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .w-100 { width: 100%; }

    .profile-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; align-items: start; max-width: 700px; }

    .card { padding: 1.75rem; border-radius: 16px; background: white; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
    .card.glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }
    .premium-highlight { border: 1px solid #C7D2FE; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.05); }

    .section-title { font-size: 1.125rem; font-weight: 800; color: #1E293B; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem; }
    .section-title .icon { background: #EEF2FF; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }

    .form-group { margin-bottom: 1.25rem; }
    .form-group:last-child { margin-bottom: 0; }
    .form-row { display: flex; gap: 1rem; }
    .form-group.half { flex: 1; }

    label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em; }
    
    .input-modern { width: 100%; padding: 0.875rem 1rem; border-radius: 10px; border: 1px solid #CBD5E1; background: #F8FAFC; font-size: 0.9375rem; color: #0F172A; transition: all 0.2s; }
    .input-modern:focus { background: white; border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); outline: none; }
    .input-modern.disabled { background: #F1F5F9; color: #94A3B8; cursor: not-allowed; border-color: #E2E8F0; }
    .textarea { resize: vertical; min-height: 100px; font-family: inherit; }

    .input-group { position: relative; display: flex; align-items: center; }
    .currency-symbol { position: absolute; left: 1rem; color: #64748B; font-weight: 700; z-index: 10; pointer-events: none; }
    .input-modern.with-prefix { padding-left: 2.5rem; }

    .hint { display: block; font-size: 0.75rem; color: #64748B; margin-top: 0.4rem; }

    .days-selector { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .day-btn { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #CBD5E1; background: white; color: #475569; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; flex: 1; min-width: 60px; }
    .day-btn:hover { border-color: var(--primary-color); color: var(--primary-color); background: #EEF2FF; }
    .day-btn.active { background: var(--primary-color); color: white; border-color: var(--primary-color); box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.3); }

    .btn-primary-lg { background: linear-gradient(135deg, var(--primary-color) 0%, #4338CA 100%); color: white; border: none; padding: 1rem; border-radius: 12px; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary-lg:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(99, 102, 241, 0.4); }
    .btn-primary-lg:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
    
    .spinner { animation: spin 2s linear infinite; display: inline-block; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class TeacherProfileComponent implements OnInit {
  currentUser: any = null;
  currencySymbol = '₹';
  isSaving = false;

  profileData: any = {
    name: '',
    city: '',
    teacherProfile: {
      subject: '',
      qualification: '',
      bio: ''
    }
  };

  constructor(
    private authService: AuthService,
    private teacherService: TeacherService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.currencySymbol = this.authService.getCurrencySymbolFor(this.currentUser.currency || 'INR');
      
      // Fetch fresh profile data to ensure we have the nested profile
      this.loadProfile();
    }
  }

  loadProfile() {
    if (!this.currentUser?.id) return;
    
    // Fallback initialize
    this.profileData.name = this.currentUser.name;
    this.profileData.city = this.currentUser.city || '';

    // Fetch from backend
    this.teacherService.getTeacherProfile(this.currentUser.id).subscribe({
      next: (res) => {
        if (res.data) {
          const t = res.data;
          this.profileData.name = t.name || '';
          this.profileData.city = t.city || '';
          
          if (t.teacherProfile) {
            this.profileData.teacherProfile = {
              subject: t.teacherProfile.subject || '',
              qualification: t.teacherProfile.qualification || '',
              bio: t.teacherProfile.bio || ''
            };
          }
        }
      },
      error: () => {
        // If fail to fetch, just use what we have in currentUser
      }
    });
  }

  saveProfile() {
    if (!this.profileData.name) {
      this.toast.error('Name is required');
      return;
    }

    this.isSaving = true;

    this.teacherService.updateProfile(this.profileData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.toast.success('Profile updated successfully! 🎉');
        
        // Update auth service user state
        if (res.data && this.currentUser) {
          const updatedUser = { ...this.currentUser, name: res.data.name, city: res.data.city };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
      error: (err) => {
        this.isSaving = false;
        this.toast.error(err.error?.message || 'Failed to update profile');
      }
    });
  }
}
