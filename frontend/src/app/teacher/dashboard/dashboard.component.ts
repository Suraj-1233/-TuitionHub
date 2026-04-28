import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch, BatchJoinRequest } from '../../shared/models/models';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="welcome-banner animate-slide">
        <div class="welcome-text">
          <h1 class="page-title">Teacher Dashboard 👨‍🏫</h1>
          <p class="subtitle">Empowering the next generation, one class at a time.</p>
        </div>
      </div>

      <div class="stats-grid animate-fade">
        <div class="stat-card glass">
          <div class="stat-icon primary">📚</div>
          <div class="stat-info">
            <div class="stat-value">{{ myBatches.length }}</div>
            <div class="stat-label">Active Batches</div>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon warning">👋</div>
          <div class="stat-info">
            <div class="stat-value text-warning">{{ pendingRequests.length }}</div>
            <div class="stat-label">New Requests</div>
          </div>
        </div>
        <div class="stat-card glass highlight">
          <div class="stat-icon success">💰</div>
          <div class="stat-info">
            <div class="stat-value text-success">{{ getCurrencySymbol(myBatches[0]?.currency) }}{{ totalEarnings }}</div>
            <div class="stat-label">Monthly Revenue</div>
          </div>
        </div>
      </div>

      <div class="dashboard-content animate-fade">
        <div class="content-left">
          <div class="card glass">
            <div class="card-header">
              <h2 class="card-title">Pending Enrollments</h2>
              <span class="badge badge-info" *ngIf="pendingRequests.length > 0">{{ pendingRequests.length }} New</span>
            </div>
            
            <div *ngIf="pendingRequests.length === 0" class="empty-state">
              <div class="empty-icon">✨</div>
              <p>All caught up! No pending requests.</p>
            </div>

            <div class="request-list" *ngIf="pendingRequests.length > 0">
              <div class="request-card" *ngFor="let req of pendingRequests">
                <div class="request-info">
                  <div class="student-name">{{ req.student.name }}</div>
                  <div class="batch-name">Wants to join: <strong>{{ req.batch.name }}</strong></div>
                  <div class="student-meta">Class {{ req.student.studentClass }} • {{ req.student.board }}</div>
                </div>
                <div class="request-actions">
                  <button class="btn-approve" (click)="respondRequest(req.id, true)">Accept</button>
                  <button class="btn-reject" (click)="respondRequest(req.id, false)">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="content-right">
          <div class="card glass">
            <div class="card-header">
              <h2 class="card-title">Batch Summary</h2>
              <a routerLink="/teacher/batches" class="text-link">Manage All ➔</a>
            </div>

            <div *ngIf="myBatches.length === 0" class="empty-state">
              <div class="empty-icon">📂</div>
              <p>You haven't created any batches.</p>
              <button class="btn btn-primary btn-sm" routerLink="/teacher/batches">Create New Batch</button>
            </div>

            <div class="batch-summary-list" *ngIf="myBatches.length > 0">
              <div class="batch-summary-item" *ngFor="let batch of myBatches">
                <div class="b-header">
                  <span class="b-name">{{ batch.name }}</span>
                  <span class="b-count">{{ batch.currentStudents }}/{{ batch.maxStudents }}</span>
                </div>
                <div class="b-meta">🕒 {{ batch.timingFrom }} - {{ batch.timingTo }} | {{ batch.days }}</div>
                <div class="b-status">
                  <span *ngIf="batch.liveClassLink" class="status-ok">● Live Class Configured</span>
                  <span *ngIf="!batch.liveClassLink" class="status-warn">○ No Live Link</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .welcome-banner {
      background: var(--gradient-primary);
      border-radius: var(--border-radius);
      padding: 2.5rem;
      color: white;
      margin-bottom: 2rem;
      box-shadow: var(--shadow-lg);
    }
    .page-title { font-size: 2rem; font-weight: 800; margin: 0; }
    .subtitle { opacity: 0.9; margin-top: 0.5rem; color: white; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      border-radius: var(--border-radius);
      transition: var(--transition);
    }
    .stat-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); }
    .stat-card.highlight { background: #EEF2FF; border: 1px solid #C7D2FE; }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .stat-icon.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary-color); }
    .stat-icon.warning { background: rgba(245, 158, 11, 0.1); color: var(--accent-color); }
    .stat-icon.success { background: rgba(16, 185, 129, 0.1); color: var(--secondary-color); }

    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); line-height: 1.2; }
    .stat-label { font-size: 0.875rem; color: var(--text-secondary); font-weight: 500; }

    .dashboard-content { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2rem; }
    
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
    .card-title { font-size: 1.125rem; font-weight: 700; color: var(--text-primary); margin: 0; }
    .text-link { color: var(--primary-color); text-decoration: none; font-weight: 600; font-size: 0.875rem; }

    .request-list { display: flex; flex-direction: column; gap: 1rem; }
    .request-card {
      padding: 1.25rem;
      background: #F8FAFC;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid var(--border-color);
      transition: var(--transition);
    }
    .request-card:hover { border-color: var(--primary-color); background: white; box-shadow: var(--shadow-md); }
    
    .student-name { font-weight: 700; color: var(--text-primary); }
    .batch-name { font-size: 0.875rem; color: var(--text-secondary); margin: 0.25rem 0; }
    .student-meta { font-size: 0.75rem; color: var(--primary-color); font-weight: 600; }

    .request-actions { display: flex; gap: 0.5rem; }
    .btn-approve { background: var(--secondary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: var(--transition); }
    .btn-approve:hover { transform: scale(1.05); filter: brightness(1.1); }
    .btn-reject { background: #FEE2E2; color: var(--danger-color); border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 700; font-size: 0.875rem; cursor: pointer; }

    .batch-summary-list { display: flex; flex-direction: column; gap: 1rem; }
    .batch-summary-item { padding: 1rem; border: 1px solid var(--border-color); border-radius: 12px; transition: var(--transition); }
    .batch-summary-item:hover { background: #F8FAFC; }
    .b-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.25rem; }
    .b-name { font-weight: 700; color: var(--text-primary); }
    .b-count { font-size: 0.75rem; background: #F1F5F9; padding: 0.2rem 0.5rem; border-radius: 6px; color: var(--text-secondary); font-weight: 700; }
    .b-meta { font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
    .b-status { font-size: 0.7rem; font-weight: 800; }
    .status-ok { color: var(--secondary-color); }
    .status-warn { color: var(--accent-color); }

    .empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-secondary); }
    .empty-icon { font-size: 2.5rem; margin-bottom: 1rem; }

    @media (max-width: 1024px) {
      .dashboard-content { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class TeacherDashboardComponent implements OnInit {
  myBatches: Batch[] = [];
  pendingRequests: BatchJoinRequest[] = [];

  getCurrencySymbol(currency?: string): string {
    if (!currency) return '₹';
    switch (currency.toUpperCase()) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      default: return '₹';
    }
  }

  constructor(private batchService: BatchService, private toast: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchService.getTeacherBatches().subscribe(b => this.myBatches = b);
    this.batchService.getPendingRequests().subscribe(r => this.pendingRequests = r);
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
    return this.myBatches.reduce((acc, b) => acc + (b.monthlyFees * b.currentStudents), 0);
  }
}
