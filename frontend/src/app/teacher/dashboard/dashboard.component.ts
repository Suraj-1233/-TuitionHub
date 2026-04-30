import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch, BatchJoinRequest } from '../../shared/models/models';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="teacher-hero animate-hand">
        <div class="hero-content">
          <h1 class="page-title">Morning, Mentor. 👋</h1>
          <p class="subtitle">Ready to inspire some minds today? Here's your classroom overview.</p>
        </div>
      </div>

      <div class="handcrafted-stats-asymmetric">
        <div class="h-stat-card tilt">
          <div class="h-icon primary">📚</div>
          <div class="h-details">
            <span class="h-val">{{ myBatches.length }}</span>
            <span class="h-lab">Active Batches</span>
          </div>
        </div>
        <div class="h-stat-card offset-card">
          <div class="h-icon warning">👋</div>
          <div class="h-details">
            <span class="h-val" [class.text-warning]="pendingRequests.length > 0">{{ pendingRequests.length }}</span>
            <span class="h-lab">New Join Requests</span>
          </div>
        </div>
        <div class="h-stat-card tilt-right highlight">
          <div class="h-icon success">💰</div>
          <div class="h-details">
            <span class="h-val text-success">{{ authService.getCurrencySymbolFor(myBatches.length > 0 ? myBatches[0].currency : undefined) }}{{ totalEarnings }}</span>
            <span class="h-lab">Monthly Revenue</span>
          </div>
        </div>
      </div>

      <div class="teacher-layout-grid animate-fade">
        <div class="requests-column">
          <div class="section-header-hand">
            <h2 class="section-title-hand">Student Queue</h2>
            <div class="title-underline"></div>
          </div>
          
          <div *ngIf="pendingRequests.length === 0" class="empty-state-hand glass-hand">
            <div class="empty-icon">✨</div>
            <p>Your queue is clear. All students are settled!</p>
          </div>

          <div class="request-stack" *ngIf="pendingRequests.length > 0">
            <div class="request-card-hand animate-slide" *ngFor="let req of pendingRequests">
              <div class="r-profile">
                <div class="r-avatar">{{ req.student.name.charAt(0) }}</div>
                <div class="r-info">
                  <span class="r-name">{{ req.student.name }}</span>
                  <span class="r-meta">Grade {{ req.student.studentClass }} • {{ req.student.board }}</span>
                </div>
              </div>
              <div class="r-batch-info">
                <span class="r-label">Applied for</span>
                <span class="r-batch-name">{{ req.batch.name }}</span>
              </div>
              <div class="r-actions">
                <button class="btn-hand btn-hand-primary btn-sm" (click)="respondRequest(req.id, true)">Approve</button>
                <button class="btn-hand btn-hand-outline btn-sm" (click)="respondRequest(req.id, false)">Decline</button>
              </div>
            </div>
          </div>
        </div>

        <div class="summary-column">
          <div class="section-header-hand">
            <h2 class="section-title-hand">Active Batches</h2>
            <div class="title-underline"></div>
          </div>

          <div *ngIf="myBatches.length === 0" class="empty-state-hand glass-hand">
            <div class="empty-icon">📂</div>
            <p>You haven't created any batches yet.</p>
            <button class="btn-hand btn-hand-primary btn-sm mt-4" routerLink="/teacher/classes">Create First Batch</button>
          </div>

          <div class="batch-summary-stack" *ngIf="myBatches.length > 0">
            <div class="batch-item-hand animate-slide" *ngFor="let batch of myBatches" [routerLink]="['/teacher/classes', batch.id]">
              <div class="b-top">
                <span class="b-title">{{ batch.name }}</span>
                <div class="b-occupancy">
                  <div class="progress-bar-mini">
                    <div class="progress-fill" [style.width.%]="(batch.currentStudents / batch.maxStudents) * 100"></div>
                  </div>
                  <span class="b-count">{{ batch.currentStudents }}/{{ batch.maxStudents }}</span>
                </div>
              </div>
              <div class="b-bottom">
                <span class="b-schedule">⏰ {{ batch.timingFrom }} - {{ batch.timingTo }} | {{ batch.days }}</span>
                <span class="b-status-pill" [class.active]="batch.liveClassLink">
                  {{ batch.liveClassLink ? 'Live Ready' : 'Setup Link' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .teacher-hero { margin-bottom: 4rem; }
    
    .handcrafted-stats-asymmetric { 
      display: flex; 
      gap: 2rem; 
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }
    
    .h-stat-card {
      background: white;
      padding: 2rem;
      border-radius: 2.5rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex: 1;
      min-width: 280px;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      transition: var(--transition-smooth);
    }
    .h-stat-card:hover { transform: translateY(-5px) rotate(0deg) !important; box-shadow: var(--shadow-float); }
    
    .h-icon {
      width: 56px;
      height: 56px;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .h-icon.primary { background: var(--primary-light); color: var(--primary); }
    .h-icon.warning { background: var(--accent-soft); color: var(--accent); }
    .h-icon.success { background: #DCFCE7; color: var(--success); }
    
    .h-details { display: flex; flex-direction: column; }
    .h-val { font-size: 2.25rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .h-lab { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; margin-top: 4px; }

    .teacher-layout-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 4rem; }
    
    .section-header-hand { margin-bottom: 2rem; }
    .section-title-hand { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; }
    .title-underline { width: 40px; height: 4px; background: var(--primary); border-radius: 2px; }

    .request-stack { display: flex; flex-direction: column; gap: 1.5rem; }
    .request-card-hand {
      background: white;
      padding: 1.5rem 2rem;
      border-radius: 2rem;
      border: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: var(--transition-smooth);
    }
    .request-card-hand:hover { border-color: var(--primary); transform: translateX(8px); }
    
    .r-profile { display: flex; align-items: center; gap: 1.25rem; }
    .r-avatar { width: 48px; height: 48px; border-radius: 14px; background: #F1F5F9; color: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; }
    .r-info { display: flex; flex-direction: column; }
    .r-name { font-weight: 800; color: var(--text-main); font-size: 1.125rem; }
    .r-meta { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    
    .r-batch-info { display: flex; flex-direction: column; text-align: center; }
    .r-label { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
    .r-batch-name { font-size: 0.875rem; font-weight: 700; color: var(--primary); }
    
    .r-actions { display: flex; gap: 0.75rem; }
    .btn-sm { padding: 0.5rem 1rem; font-size: 0.75rem; }

    .batch-summary-stack { display: flex; flex-direction: column; gap: 1.25rem; }
    .batch-item-hand {
      background: white;
      padding: 1.5rem;
      border-radius: 1.5rem;
      border: 1px solid var(--border);
      cursor: pointer;
      transition: var(--transition-smooth);
    }
    .batch-item-hand:hover { border-color: var(--primary); transform: scale(1.02); }
    
    .b-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .b-title { font-weight: 800; color: var(--text-main); font-size: 1rem; }
    .b-occupancy { display: flex; align-items: center; gap: 0.75rem; }
    .progress-bar-mini { width: 60px; height: 6px; background: #F1F5F9; border-radius: 100px; overflow: hidden; }
    .progress-fill { height: 100%; background: var(--primary); border-radius: 100px; }
    .b-count { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); }
    
    .b-bottom { display: flex; justify-content: space-between; align-items: center; }
    .b-schedule { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
    .b-status-pill { font-size: 0.65rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 100px; background: #FEE2E2; color: var(--danger); text-transform: uppercase; }
    .b-status-pill.active { background: #DCFCE7; color: var(--success); }

    .empty-state-hand { text-align: center; padding: 4rem 2rem; border-radius: 2.5rem; border: 1px dashed var(--border); }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }

    @media (max-width: 1024px) {
      .teacher-layout-grid { grid-template-columns: 1fr; gap: 3rem; }
      .request-card-hand { flex-direction: column; gap: 1.5rem; text-align: center; }
      .r-profile { flex-direction: column; }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  myBatches: Batch[] = [];
  pendingRequests: BatchJoinRequest[] = [];

  constructor(private batchService: BatchService, private toast: ToastService, public authService: AuthService) { }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchService.getTeacherBatches().subscribe((b: Batch[]) => this.myBatches = b);
    this.batchService.getPendingRequests().subscribe((r: BatchJoinRequest[]) => this.pendingRequests = r);
  }

  respondRequest(id: number, approve: boolean) {
    this.batchService.respondToRequest(id, approve).subscribe({
      next: () => {
        this.toast.success(approve ? 'Student enrollment approved!' : 'Enrollment request rejected');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error processing request')
    });
  }

  get totalEarnings() {
    return this.myBatches.reduce((acc, b) => acc + (b.monthlyFees * (b.currentStudents || 0)), 0);
  }
}
