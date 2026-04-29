import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { FormsModule } from '@angular/forms';
import { ParentService } from '../../shared/services/parent.service';
import { ToastService } from '../../shared/services/toast.service';

declare var Razorpay: any;

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
          <button class="btn btn-primary btn-block mt-4" (click)="onTopup()" [disabled]="isLoading">
            {{ isLoading ? 'Processing...' : 'Top-up Now' }}
          </button>
        </div>
      </div>

      <div class="transactions-section mt-8 animate-slide">
        <h2 class="section-title">Recent Transactions</h2>
        <div class="table-container glass">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Source</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tx of transactions">
                <td>{{ tx.createdAt | date:'short' }}</td>
                <td>{{ tx.description }}</td>
                <td><span class="badge">{{ tx.source }}</span></td>
                <td [class.text-success]="tx.amount > 0" [class.text-danger]="tx.amount < 0">
                  {{ tx.amount > 0 ? '+' : '' }}₹{{ tx.amount.toFixed(2) }}
                </td>
              </tr>
              <tr *ngIf="transactions.length === 0">
                <td colspan="4" class="text-center py-8">No transactions found</td>
              </tr>
            </tbody>
          </table>
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

    .topup-card { padding: 2rem; border-radius: 24px; border: 1px solid var(--border-color); background: white; }
    .amount-input-group { display: flex; align-items: center; background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px; padding: 0.5rem 1rem; }
    .currency { font-size: 1.25rem; font-weight: 700; color: var(--text-secondary); }
    .amount-input-group input { border: none; background: transparent; padding: 0.5rem; font-size: 1.25rem; font-weight: 700; width: 100%; outline: none; }

    .text-success { color: #10B981; font-weight: 700; }
    .text-danger { color: #EF4444; font-weight: 700; }
    .badge { padding: 0.25rem 0.5rem; background: #F1F5F9; border-radius: 6px; font-size: 0.75rem; font-weight: 700; color: #64748B; }
  `]
})
export class WalletComponent implements OnInit {
  balance = 0;
  topupAmount = 500;
  transactions: any[] = [];
  isLoading = false;

  constructor(private parentService: ParentService, private toast: ToastService) {}

  ngOnInit() {
    this.loadWalletData();
  }

  loadWalletData() {
    this.parentService.getWalletBalance().subscribe(w => {
      if (w) this.balance = w.balance || 0;
    });
    this.parentService.getWalletTransactions().subscribe(txs => {
      this.transactions = txs || [];
    });
  }

  onTopup() {
    if (this.topupAmount < 1) {
      this.toast.error('Please enter a valid amount');
      return;
    }

    this.isLoading = true;
    this.parentService.getRazorpayKey().subscribe(keyRes => {
      this.parentService.createTopupOrder(this.topupAmount).subscribe({
        next: (order) => {
          this.initRazorpay(order, keyRes.keyId);
        },
        error: (err) => {
          this.toast.error('Failed to create order');
          this.isLoading = false;
        }
      });
    });
  }

  initRazorpay(order: any, keyId: string) {
    const options = {
      key: keyId,
      amount: order.amount * 100,
      currency: order.currency,
      name: 'TuitionHub Wallet',
      description: 'Wallet Top-up',
      order_id: order.razorpayOrderId,
      handler: (response: any) => {
        this.verifyTopup(order.id, response);
      },
      prefill: {
        name: '',
        email: ''
      },
      theme: {
        color: '#6366F1'
      },
      modal: {
        ondismiss: () => {
          this.isLoading = false;
          // Report cancellation as failure
          this.parentService.notifyFailure({
            paymentId: order.id,
            errorDescription: 'Payment cancelled by user',
            errorReason: 'payment_cancelled'
          }).subscribe(() => this.loadWalletData());
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response: any) => {
      this.parentService.notifyFailure({
        paymentId: order.id,
        errorCode: response.error.code,
        errorDescription: response.error.description,
        errorReason: response.error.reason,
        errorStep: response.error.step
      }).subscribe(() => {
        this.loadWalletData();
        this.isLoading = false;
      });
    });
    rzp.open();
  }

  verifyTopup(paymentId: number, razorpayResponse: any) {
    const verifyReq = {
      paymentId: paymentId,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    };

    this.parentService.verifyTopup(verifyReq).subscribe({
      next: () => {
        this.toast.success('Wallet topped up successfully!');
        this.loadWalletData();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Payment verification failed');
        this.isLoading = false;
      }
    });
  }
}
