import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Fee Payments</h1>
          <p class="subtitle">Securely manage and pay tuition fees</p>
        </div>
      </div>

      <div class="payments-container glass animate-fade">
        <div class="empty-state">
          <div class="empty-icon">💳</div>
          <h3>No pending payments</h3>
          <p>All tuition fees for your children are up to date.</p>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }
    .payments-container { padding: 3rem; border-radius: 24px; border: 1px solid var(--border-color); }
    .empty-state { text-align: center; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
  `]
})
export class ParentPaymentsComponent implements OnInit {
  ngOnInit() {}
}
