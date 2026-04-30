import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { RouterLink } from '@angular/router';
import { ParentService } from '../../shared/services/parent.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="welcome-section animate-hand">
        <div class="welcome-text">
          <h1 class="page-title">Welcome back, {{ userName }}! 👋</h1>
          <p class="subtitle">Here's how your children's learning journey is looking today.</p>
        </div>
      </div>

      <div class="handcrafted-grid">
        <!-- Main Stats - Asymmetrical -->
        <div class="stats-asymmetric">
          <div class="stat-card-hand tilt">
            <div class="stat-icon-blob">👨‍👩‍👧‍👦</div>
            <div class="stat-info-hand">
              <span class="stat-value-hand">{{ childrenCount }}</span>
              <span class="stat-label-hand">Little Learners</span>
            </div>
          </div>
          
          <div class="stat-card-hand offset-card">
            <div class="stat-icon-blob accent">📚</div>
            <div class="stat-info-hand">
              <span class="stat-value-hand">{{ activeBatchesCount }}</span>
              <span class="stat-label-hand">Active Batches</span>
            </div>
          </div>

          <div class="stat-card-hand tilt-right">
            <div class="stat-icon-blob warning">💰</div>
            <div class="stat-info-hand">
              <span class="stat-value-hand">₹{{ totalPendingFees }}</span>
              <span class="stat-label-hand">Pending Dues</span>
            </div>
          </div>
        </div>

        <!-- Quick Actions - Handcrafted feel -->
        <div class="actions-section animate-slide">
          <div class="section-header-hand">
            <h2 class="section-title-hand">Quick Links</h2>
            <div class="title-underline"></div>
          </div>
          
          <div class="action-buttons-hand">
            <button class="btn-hand btn-hand-primary" routerLink="/parent/children">
              <span>View Children</span>
              <span class="btn-icon">→</span>
            </button>
            <button class="btn-hand btn-hand-accent" routerLink="/parent/payments">
              <span>Pay Fees</span>
              <span class="btn-icon">💳</span>
            </button>
            <button class="btn-hand btn-hand-outline" routerLink="/parent/wallet">
              <span>Top-up Wallet</span>
              <span class="btn-icon">👛</span>
            </button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .welcome-section { margin-bottom: 4rem; position: relative; }
    .handcrafted-grid { display: flex; flex-direction: column; gap: 4rem; }
    
    .stats-asymmetric { 
      display: flex; 
      gap: 2rem; 
      flex-wrap: wrap;
      padding: 1rem 0;
    }
    
    .stat-card-hand {
      background: white;
      padding: 2rem;
      border-radius: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      min-width: 300px;
      flex: 1;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      transition: var(--transition-smooth);
    }
    .stat-card-hand:hover { transform: translateY(-8px) rotate(0deg) !important; box-shadow: var(--shadow-float); }
    
    .stat-icon-blob {
      width: 64px;
      height: 64px;
      background: var(--primary-light);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: var(--primary);
    }
    .stat-icon-blob.accent { background: var(--accent-soft); color: var(--accent); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    .stat-icon-blob.warning { background: #FEF3C7; color: var(--warning); border-radius: 50% 50% 30% 70% / 50% 70% 30% 50%; }
    
    .stat-info-hand { display: flex; flex-direction: column; }
    .stat-value-hand { font-size: 2.25rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .stat-label-hand { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; margin-top: 4px; }
    
    .section-header-hand { margin-bottom: 2rem; }
    .section-title-hand { font-size: 1.5rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.5rem; }
    .title-underline { width: 40px; height: 4px; background: var(--primary); border-radius: 2px; }
    
    .action-buttons-hand { display: flex; gap: 1.5rem; flex-wrap: wrap; }
    .btn-icon { font-size: 1.25rem; }
  `]
})
export class ParentDashboardComponent implements OnInit {
  childrenCount = 0;
  activeBatchesCount = 0;
  totalPendingFees = 0;
  isLoading = true;
  userName = '';

  constructor(private parentService: ParentService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Parent';

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
