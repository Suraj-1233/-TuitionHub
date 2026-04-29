import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-parent-wallet',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">My Wallet</h1>
          <p class="subtitle">Manage your funds for quick tuition payments</p>
        </div>
      </div>

      <div class="wallet-grid animate-fade">
        <div class="wallet-card glass primary animate-slide">
          <div class="card-content">
            <span class="label">Total Balance</span>
            <h2 class="balance">₹{{ balance.toFixed(2) }}</h2>
          </div>
          <div class="card-icon">👛</div>
        </div>

        <div class="topup-card glass animate-slide">
          <h3>Add Money</h3>
          <div class="amount-input-group">
            <span class="currency">₹</span>
            <input type="number" [(ngModel)]="topupAmount" placeholder="Enter amount">
          </div>
          <button class="btn btn-primary btn-block mt-4" (click)="onTopup()">Top-up Now</button>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .wallet-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .wallet-card { padding: 2rem; border-radius: 24px; position: relative; overflow: hidden; display: flex; justify-content: space-between; align-items: center; }
    .wallet-card.primary { background: var(--gradient-primary); color: white; border: none; }
    .balance { font-size: 3rem; font-weight: 800; margin: 0.5rem 0 0; }
    .card-icon { font-size: 4rem; opacity: 0.2; }

    .topup-card { padding: 2rem; border-radius: 24px; border: 1px solid var(--border-color); }
    .amount-input-group { display: flex; align-items: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 0.5rem 1rem; }
    .currency { font-size: 1.25rem; font-weight: 700; color: var(--text-secondary); }
    .amount-input-group input { border: none; background: transparent; padding: 0.5rem; font-size: 1.25rem; font-weight: 700; width: 100%; outline: none; }
  `]
})
export class WalletComponent implements OnInit {
  balance = 0;
  topupAmount = 500;

  ngOnInit() {}

  onTopup() {
    alert('Top-up logic will be connected to Razorpay');
  }
}
