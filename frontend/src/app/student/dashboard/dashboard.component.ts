import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AuthService } from '../../shared/services/auth.service';
import { BatchService } from '../../shared/services/batch.service';
import { StudentService } from '../../shared/services/student.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch } from '../../shared/models/models';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink, FormsModule],
  template: `
    <app-dashboard-layout role="STUDENT">
      <!-- Welcome Banner -->
      <div class="welcome-banner animate-slide">
        <div class="welcome-text">
          <h1 class="page-title">Welcome back! 👋</h1>
          <p class="subtitle">Here's what's happening with your studies today.</p>
        </div>
        <div class="banner-actions">
          <button class="btn-request-glow" (click)="showRequestModal = true">
            🚀 Request New Subject
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="stats-grid animate-fade">
        <div class="stat-card glass" routerLink="/student/batches">
          <div class="stat-icon primary">🎓</div>
          <div class="stat-info">
            <div class="stat-value">{{ myBatches.length }}</div>
            <div class="stat-label">My Batches</div>
          </div>
        </div>
        <div class="stat-card glass warning" routerLink="/student/payments">
          <div class="stat-icon warning">💸</div>
          <div class="stat-info">
            <div class="stat-value">{{ paymentCount }}</div>
            <div class="stat-label">Payments</div>
          </div>
        </div>
        <div class="stat-card glass highlight" routerLink="/student/batches">
          <div class="stat-icon success">🔍</div>
          <div class="stat-info">
            <div class="stat-value">0</div>
            <div class="stat-label">Explore</div>
          </div>
        </div>
      </div>

      <!-- Request Tuition Modal -->
      <div class="modal-overlay" *ngIf="showRequestModal">
        <div class="modal-card glass animate-slide">
          <div class="modal-header">
            <h3>Request a New Mentor</h3>
            <button class="close-btn" (click)="showRequestModal = false">×</button>
          </div>
          <div class="modal-body">
            <div class="form-group mb-4">
              <label class="block text-sm font-bold mb-1">What do you want to learn?</label>
              <select [(ngModel)]="requestData.subjects" class="modal-input">
                <option value="" disabled>Select a Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Hindi">Hindi</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group mb-4">
              <label class="block text-sm font-bold mb-1">Preferred Timings</label>
              <div class="flex gap-2">
                <div class="flex-1">
                  <span class="text-xs text-secondary">From</span>
                  <input type="time" [(ngModel)]="requestData.startTime" class="modal-input">
                </div>
                <div class="flex-1">
                  <span class="text-xs text-secondary">To</span>
                  <input type="time" [(ngModel)]="requestData.endTime" class="modal-input">
                </div>
              </div>
            </div>
            <div class="form-group mb-4">
              <label class="block text-sm font-bold mb-1">Additional Notes</label>
              <textarea [(ngModel)]="requestData.notes" rows="3" class="modal-input"></textarea>
            </div>
            <button class="btn btn-primary w-full mt-4" (click)="submitRequest()" [disabled]="isLoading">
              {{ isLoading ? 'Submitting...' : 'Send Request to Admin' }}
            </button>
          </div>
        </div>
      </div>

      <div class="dashboard-grid animate-fade">
        <!-- Requests Section -->
        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">My Tuition Requests</h2>
          </div>
          <div *ngIf="pendingRequests.length === 0" class="empty-state">
            <div class="empty-icon">📝</div>
            <p>No active requests. Request a subject to get started!</p>
          </div>
          <div class="request-list">
            <div *ngFor="let req of pendingRequests" class="request-item">
              <div class="req-info">
                <span class="req-subj">📚 {{ req.subjects }}</span>
                <span class="status-badge" [ngClass]="req.status">{{ req.status }}</span>
              </div>
              <div class="req-footer">
                <span>Time: {{ req.preferredTimings }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Classes Section -->
        <div class="card glass">
          <div class="card-header flex justify-between items-center">
            <h2 class="card-title">Your Live Classes</h2>
            <a routerLink="/student/schedule" class="text-link text-sm">View Schedule →</a>
          </div>
          
          <div *ngIf="myBatches.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <h3>No active classes</h3>
            <p class="text-secondary mb-4">Start your learning journey by joining a batch.</p>
            <button class="btn btn-primary" routerLink="/student/batches">Browse All Batches</button>
          </div>

          <div class="batch-list" *ngIf="myBatches.length > 0">
            <div *ngFor="let batch of myBatches" class="batch-mini animate-scale" [routerLink]="['/student/mentors', batch.id]">
              <div class="batch-icon">🎓</div>
              <div class="batch-info">
                <div class="batch-name">{{ batch.name }}</div>
                <div class="batch-meta">
                  <span>👨‍🏫 {{ batch.teacher.name }}</span>
                  <span class="timing-pill">🕒 {{ batch.timingFrom }}</span>
                </div>
              </div>
              <div class="batch-arrow">→</div>
            </div>
          </div>
        </div>

        <!-- Referrals Section -->
        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">My Referrals 🎁</h2>
          </div>
          <div *ngIf="referrals.length === 0" class="empty-state">
            <div class="empty-icon">🤝</div>
            <p>No referrals yet. Invite your friends to join!</p>
          </div>
          <div class="referral-list">
            <div *ngFor="let ref of referrals" class="ref-item animate-fade">
              <div class="ref-avatar">{{ ref.name.charAt(0) }}</div>
              <div class="ref-details">
                <div class="ref-name">{{ ref.name }}</div>
                <div class="ref-meta">Joined as {{ ref.role }} • {{ ref.joinedAt | date:'mediumDate' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .welcome-banner {
      background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
      border-radius: 20px;
      padding: 2.5rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
    }
    .page-title { font-size: 2.25rem; font-weight: 800; margin: 0; }
    .subtitle { font-size: 1.1rem; opacity: 0.9; margin-top: 0.5rem; }
    
    .btn-request-glow {
      background: white;
      color: #6366F1;
      border: none;
      padding: 1rem 1.75rem;
      border-radius: 14px;
      font-weight: 800;
      font-size: 1rem;
      cursor: pointer;
      box-shadow: 0 0 25px rgba(255,255,255,0.4);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .btn-request-glow:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 15px 30px rgba(255,255,255,0.6); }

    .banner-actions { display: flex; gap: 1rem; margin-top: 2rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; border-radius: 20px; cursor: pointer; transition: var(--transition); }
    .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
    .stat-icon { width: 50px; height: 50px; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
    .stat-icon.primary { background: #EEF2FF; color: #6366F1; }
    .stat-icon.warning { background: #FFFBEB; color: #D97706; }
    .stat-icon.success { background: #ECFDF5; color: #059669; }
    .stat-value { font-size: 1.5rem; font-weight: 800; }
    .stat-label { font-size: 0.85rem; color: var(--text-secondary); }

    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(8px);
    }
    .modal-card { width: 90%; max-width: 480px; background: white; border-radius: 24px; padding: 2.5rem; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .modal-input { width: 100%; padding: 0.85rem; border-radius: 12px; border: 1.5px solid #E2E8F0; transition: border-color 0.2s; }
    .modal-input:focus { outline: none; border-color: #6366F1; }
    
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    
    .request-item { padding: 1.25rem; border-radius: 16px; background: #F8FAFC; border: 1px solid #E2E8F0; margin-bottom: 1rem; }
    .req-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .req-subj { font-weight: 700; color: #1E293B; }
    .status-badge { font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; }
    .status-badge.PENDING { background: #FEF3C7; color: #92400E; }
    .status-badge.ASSIGNED { background: #DCFCE7; color: #166534; }
    .req-footer { font-size: 0.75rem; color: #64748B; font-weight: 500; }
    
    .batch-mini { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; border-radius: 16px; background: #F8FAFC; margin-bottom: 1rem; border: 1px solid #E2E8F0; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }
    .batch-mini:hover { background: white; border-color: #6366f1; transform: translateX(8px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.1); }
    .batch-icon { width: 50px; height: 50px; border-radius: 14px; background: #EEF2FF; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; color: #6366f1; }
    .batch-name { font-weight: 800; color: #1E293B; font-size: 1.1rem; }
    .batch-meta { display: flex; align-items: center; gap: 1rem; margin-top: 0.25rem; }
    .batch-meta span { font-size: 0.8rem; color: #64748B; font-weight: 600; }
    .timing-pill { background: #ECFDF5; color: #059669 !important; padding: 2px 8px; border-radius: 6px; font-size: 0.7rem !important; }
    .batch-arrow { margin-left: auto; color: #CBD5E1; font-weight: 900; transition: all 0.2s; }
    .batch-mini:hover .batch-arrow { color: #6366f1; transform: translateX(5px); }

    .referral-list { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; }
    .ref-item { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; }
    .ref-avatar { width: 36px; height: 36px; background: #E0F2FE; color: #0369A1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.875rem; }
    .ref-name { font-weight: 700; color: #1E293B; font-size: 0.875rem; }
    .ref-meta { font-size: 0.7rem; color: #64748B; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: #64748B; }
    .empty-icon { font-size: 3.5rem; margin-bottom: 1.5rem; opacity: 0.5; }
    
    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .welcome-banner { flex-direction: column; text-align: center; gap: 1.5rem; }
    }
  `]
})
export class StudentDashboardComponent implements OnInit {
  userName = '';
  myBatches: Batch[] = [];
  pendingRequests: any[] = [];
  showRequestModal = false;
  isLoading = false;
  requestData = { subjects: '', startTime: '', endTime: '', notes: '' };
  paymentCount = 0;
  referrals: any[] = [];

  constructor(
    private authService: AuthService,
    private batchService: BatchService,
    private studentService: StudentService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Student';
    this.loadData();
  }

  loadData() {
    this.batchService.getMyBatches().subscribe((b: Batch[]) => this.myBatches = b);
    this.studentService.getMyRequests().subscribe(r => this.pendingRequests = r);

    // Fetch payments count (Placeholder logic until backend summary API is ready)
    this.studentService.getPayments().subscribe(p => {
      this.paymentCount = p.length;
    });

    this.studentService.getReferrals().subscribe(ref => {
      this.referrals = ref;
    });
  }

  submitRequest() {
    if (!this.requestData.subjects) {
      this.toast.error('Please specify subjects');
      return;
    }
    const payload = {
      subjects: this.requestData.subjects,
      timings: `${this.requestData.startTime} - ${this.requestData.endTime}`,
      notes: this.requestData.notes
    };

    this.studentService.requestTuition(payload).subscribe({
      next: () => {
        this.toast.success('Request sent to Admin!');
        this.showRequestModal = false;
        this.isLoading = false;
        this.requestData = { subjects: '', startTime: '', endTime: '', notes: '' };
        this.loadData();
      },
      error: () => {
        this.toast.error('Submission failed');
        this.isLoading = false;
      }
    });
  }
}
