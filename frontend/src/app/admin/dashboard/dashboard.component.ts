import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="admin-header-section animate-hand">
        <div class="header-left">
          <h1 class="page-title">Operations Console</h1>
          <p class="subtitle">Platform-wide health and moderation metrics.</p>
        </div>
        <div class="system-health glass-hand">
          <div class="health-dot pulse"></div>
          <span>Platform Active</span>
        </div>
      </div>

      <div class="handcrafted-overview-bar animate-fade" *ngIf="stats">
        <div class="metric-block">
          <span class="m-val">{{ stats.totalStudents }}</span>
          <span class="m-lab">Active Students</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block">
          <span class="m-val">{{ stats.totalTeachers }}</span>
          <span class="m-lab">Vetted Mentors</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block warning">
          <span class="m-val">{{ stats.pendingTeacherApprovals }}</span>
          <span class="m-lab">Pending Reviews</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-block success">
          <span class="m-val">{{ stats.totalBatches }}</span>
          <span class="m-lab">Ongoing Batches</span>
        </div>
      </div>

      <div class="dashboard-layout-grid">
        <!-- Monitoring Section -->
        <div class="monitoring-column">
          <div class="handcrafted-section-header">
            <h2 class="section-title-hand">Session Activity</h2>
            <div class="title-underline"></div>
          </div>
          
          <div class="activity-feed">
            <div *ngFor="let batch of batches" class="activity-card-hand animate-slide">
              <div class="activity-header">
                <span class="a-batch">{{ batch.name }}</span>
                <span class="a-mentor">by {{ batch.teacher?.name }}</span>
              </div>
              <div class="activity-details">
                <div class="a-timing">
                  <span class="a-days">{{ batch.days }}</span>
                  <span class="a-time">{{ batch.timingFrom }} - {{ batch.timingTo }}</span>
                </div>
                <div class="a-learner">
                  <span class="learner-tag">Primary Learner:</span>
                  <span class="learner-name">{{ batch.students && batch.students.length > 0 ? batch.students[0].name : 'Not Linked' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Operations Section -->
        <div class="operations-column">
          <div class="handcrafted-section-header">
            <h2 class="section-title-hand">Quick Operations</h2>
            <div class="title-underline"></div>
          </div>

          <div class="operations-stack">
            <a routerLink="/admin/students" class="op-card-hand tilt">
              <div class="op-icon">👨‍🎓</div>
              <div class="op-text">
                <span class="op-name">Student Onboarding</span>
                <span class="op-desc">Manage enrollments and assignments</span>
              </div>
            </a>
            
            <a routerLink="/admin/teachers" class="op-card-hand offset-card">
              <div class="op-icon">📋</div>
              <div class="op-text">
                <span class="op-name">Mentor Approvals</span>
                <span class="op-desc">{{ stats?.pendingTeacherApprovals }} profiles to review</span>
              </div>
            </a>

            <a routerLink="/admin/parents" class="op-card-hand tilt-right">
              <div class="op-icon">👨‍👩‍👧‍👦</div>
              <div class="op-text">
                <span class="op-name">Guardian Management</span>
                <span class="op-desc">View and manage registered parents</span>
              </div>
            </a>

            <a routerLink="/admin/subjects" class="op-card-hand tilt">
              <div class="op-icon">📚</div>
              <div class="op-text">
                <span class="op-name">Academic Catalog</span>
                <span class="op-desc">Refine subject list and boards</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .admin-header-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4rem; }
    .system-health { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.25rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; color: var(--success); text-transform: uppercase; letter-spacing: 1px; }
    .health-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--success); }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

    .handcrafted-overview-bar { 
      background: white; 
      padding: 2.5rem; 
      border-radius: 2.5rem; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      margin-bottom: 4rem;
    }
    .metric-block { display: flex; flex-direction: column; gap: 4px; }
    .m-val { font-size: 2.5rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .m-lab { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-divider { width: 1px; height: 40px; background: var(--border); }
    .metric-block.warning .m-val { color: var(--warning); }
    .metric-block.success .m-val { color: var(--success); }

    .dashboard-layout-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 4rem; }
    
    .activity-feed { display: flex; flex-direction: column; gap: 1.5rem; }
    .activity-card-hand { 
      background: white; 
      padding: 1.5rem 2rem; 
      border-radius: 1.5rem; 
      border: 1px solid var(--border);
      transition: var(--transition-smooth);
    }
    .activity-card-hand:hover { border-color: var(--primary); transform: translateX(8px); }
    
    .activity-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.75rem; }
    .a-batch { font-size: 1.125rem; font-weight: 800; color: var(--text-main); }
    .a-mentor { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    
    .activity-details { display: flex; justify-content: space-between; align-items: center; }
    .a-timing { display: flex; flex-direction: column; }
    .a-days { font-size: 0.65rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
    .a-time { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }
    
    .a-learner { text-align: right; }
    .learner-tag { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); display: block; }
    .learner-name { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }

    .operations-stack { display: flex; flex-direction: column; gap: 2rem; }
    .op-card-hand { 
      display: flex; 
      align-items: center; 
      gap: 1.5rem; 
      padding: 2rem; 
      background: white; 
      border-radius: 2rem; 
      text-decoration: none; 
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      transition: var(--transition-smooth);
    }
    .op-card-hand:hover { transform: scale(1.02) rotate(0deg) !important; border-color: var(--primary); box-shadow: var(--shadow-float); }
    .op-icon { font-size: 2rem; }
    .op-name { display: block; font-size: 1.125rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); margin-bottom: 2px; }
    .op-desc { font-size: 0.8rem; font-weight: 500; color: var(--text-muted); }

    .section-title-hand { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; }
    .title-underline { width: 40px; height: 4px; background: var(--primary); border-radius: 2px; margin-bottom: 2rem; }

    @media (max-width: 1024px) {
      .dashboard-layout-grid { grid-template-columns: 1fr; gap: 3rem; }
      .handcrafted-overview-bar { flex-wrap: wrap; gap: 2rem; justify-content: center; text-align: center; }
      .metric-divider { display: none; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: any;
  batches: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getDashboard().subscribe(s => this.stats = s);
    this.adminService.getAllBatches().subscribe(b => this.batches = b);
  }
}
