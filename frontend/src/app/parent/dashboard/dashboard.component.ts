import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { RouterLink } from '@angular/router';
import { ParentService } from '../../shared/services/parent.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Parent Dashboard</h1>
          <p class="subtitle">Monitor your children's learning journey</p>
        </div>
      </div>

      <div class="stats-grid animate-fade">
        <div class="stat-card glass">
          <span class="stat-icon">👨‍👩‍👧‍👦</span>
          <div class="stat-info">
            <span class="stat-value">{{ childrenCount }}</span>
            <span class="stat-label">Children Enrolled</span>
          </div>
        </div>
        <div class="stat-card glass">
          <span class="stat-icon">📚</span>
          <div class="stat-info">
            <span class="stat-value">{{ activeBatchesCount }}</span>
            <span class="stat-label">Active Batches</span>
          </div>
        </div>
        <div class="stat-card glass">
          <span class="stat-icon">💳</span>
          <div class="stat-info">
            <span class="stat-value">₹{{ totalPendingFees }}</span>
            <span class="stat-label">Pending Fees</span>
          </div>
        </div>
      </div>

      <div class="quick-actions mt-8 animate-slide">
        <h2 class="section-title">Quick Actions</h2>
        <div class="action-grid">
          <button class="action-card glass" routerLink="/parent/children">
            <span class="action-icon">👀</span>
            <span>View Children</span>
          </button>
          <button class="action-card glass" routerLink="/parent/payments">
            <span class="action-icon">💳</span>
            <span>Pay Fees</span>
          </button>
          <button class="action-card glass" routerLink="/parent/wallet">
            <span class="action-icon">👛</span>
            <span>Top-up Wallet</span>
          </button>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; }
    .stat-card { padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--border-color); }
    .stat-icon { font-size: 2.5rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--primary-color); line-height: 1.2; }
    .stat-label { font-size: 0.85rem; color: var(--text-secondary); font-weight: 500; }

    .section-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 1.5rem; }
    .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; }
    .action-card { 
      padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color);
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      cursor: pointer; transition: var(--transition);
      background: white;
    }
    .action-card:hover { transform: translateY(-5px); border-color: var(--primary-color); }
    .action-icon { font-size: 2rem; }
  `]
})
export class ParentDashboardComponent implements OnInit {
  childrenCount = 0;
  activeBatchesCount = 0;
  totalPendingFees = 0;
  isLoading = true;

  constructor(private parentService: ParentService) {}

  ngOnInit() {
    this.parentService.getDashboardSummary().subscribe({
      next: (data) => {
        this.childrenCount = data.childrenCount;
        this.activeBatchesCount = data.activeBatchesCount;
        this.totalPendingFees = data.totalPendingFees;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
