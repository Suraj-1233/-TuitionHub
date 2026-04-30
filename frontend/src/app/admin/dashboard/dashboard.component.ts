import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="welcome-banner animate-slide">
        <div class="welcome-text">
          <h1 class="page-title">Admin Control Center 🛡️</h1>
          <p class="subtitle">Platform health and moderation overview.</p>
        </div>
      </div>

      <div class="stats-grid animate-fade" *ngIf="stats">
        <div class="stat-card glass">
          <div class="stat-icon info">👨‍🎓</div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalStudents }}</div>
            <div class="stat-label">Total Students</div>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon primary">👨‍🏫</div>
          <div class="stat-info">
            <div class="stat-value text-primary">{{ stats.totalTeachers }}</div>
            <div class="stat-label">Total Teachers</div>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon warning">⏳</div>
          <div class="stat-info">
            <div class="stat-value text-warning">{{ stats.pendingTeacherApprovals }}</div>
            <div class="stat-label">Pending Reviews</div>
          </div>
        </div>
        <div class="stat-card glass">
          <div class="stat-icon success">🏫</div>
          <div class="stat-info">
            <div class="stat-value text-success">{{ stats.totalBatches }}</div>
            <div class="stat-label">Active Classes</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-grid animate-fade">
        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">Live Class Monitoring 🕒</h2>
          </div>
          <div class="schedule-summary">
            <div *ngFor="let batch of batches" class="schedule-item">
              <div class="batch-info">
                <span class="batch-name">{{ batch.name }}</span>
                <span class="teacher-label">Teacher: {{ batch.teacher?.name }}</span>
              </div>
              <div class="time-info">
                <span class="days-tag">{{ batch.days }}</span>
                <span class="time-tag">{{ batch.timingFrom }} - {{ batch.timingTo }}</span>
              </div>
              <div class="student-count">
                👤 {{ batch.students && batch.students.length > 0 ? batch.students[0].name : 'Unassigned' }}
              </div>
            </div>
          </div>
        </div>

        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </div>
          <div class="actions-list">
            <a routerLink="/admin/students" class="action-item">
              <div class="action-icon">🤝</div>
              <div class="action-details">
                <span class="action-name">Onboard Students</span>
                <span class="action-desc">Assign students to teachers and classes</span>
              </div>
            </a>
            <a routerLink="/admin/teachers" class="action-item">
              <div class="action-icon">📋</div>
              <div class="action-details">
                <span class="action-name">Teacher Approvals</span>
                <span class="action-desc">{{ stats?.pendingTeacherApprovals }} pending reviews</span>
              </div>
            </a>
            <a routerLink="/admin/subjects" class="action-item">
              <div class="action-icon">📚</div>
              <div class="action-details">
                <span class="action-name">Manage Subjects</span>
                <span class="action-desc">Add or remove subjects from the platform</span>
              </div>
            </a>
            <a routerLink="/admin/parents" class="action-item">
              <div class="action-icon">👨‍👩‍👧‍👦</div>
              <div class="action-details">
                <span class="action-name">Guardian Management</span>
                <span class="action-desc">Manage parent accounts and linked students</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .welcome-banner { background: var(--gradient-primary); border-radius: var(--border-radius); padding: 2rem; color: white; margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; margin: 0; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
    .stat-label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; }

    .dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
    
    .schedule-summary { display: flex; flex-direction: column; gap: 1rem; max-height: 400px; overflow-y: auto; }
    .schedule-item { 
      padding: 1rem; 
      border-radius: 12px; 
      background: #F8FAFC; 
      display: grid; 
      grid-template-columns: 1.5fr 1.5fr 1fr; 
      align-items: center;
      border: 1px solid var(--border-color);
    }
    .batch-name { display: block; font-weight: 700; color: var(--text-primary); }
    .teacher-label { font-size: 0.75rem; color: var(--text-secondary); }
    
    .days-tag { display: block; font-size: 0.7rem; font-weight: 800; color: var(--primary-color); }
    .time-tag { font-size: 0.75rem; color: var(--text-primary); font-weight: 600; }
    
    .student-count { font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); text-align: right; }

    .actions-list { display: flex; flex-direction: column; gap: 1rem; }
    .action-item { 
      display: flex; 
      gap: 1rem; 
      padding: 1.25rem; 
      border-radius: 12px; 
      text-decoration: none; 
      background: #F8FAFC; 
      border: 1px solid var(--border-color);
      transition: var(--transition);
    }
    .action-item:hover { transform: translateX(5px); border-color: var(--primary-color); background: white; }
    .action-icon { font-size: 1.5rem; }
    .action-name { display: block; font-weight: 700; color: var(--text-primary); }
    .action-desc { font-size: 0.75rem; color: var(--text-secondary); }

    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any;
  batches: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: (s) => this.stats = s,
      error: () => this.stats = null
    });
    this.adminService.getAllBatches().subscribe({
      next: (b) => this.batches = b || [],
      error: () => this.batches = []
    });
  }
}
