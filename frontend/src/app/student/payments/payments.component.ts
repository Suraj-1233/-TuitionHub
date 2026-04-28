import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-student-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="payments-wrapper animate-slide">
        <header class="page-header">
          <div>
            <h1 class="page-title">Fees & Payments 💳</h1>
            <p class="subtitle text-secondary">Manage your session fees and transaction history.</p>
          </div>
          <div class="wallet-summary glass">
            <span class="label">Wallet Balance</span>
            <span class="balance">{{ currencySymbol }}{{ walletBalance.toFixed(2) }}</span>
          </div>
        </header>

        <!-- Unpaid Sessions (Due Payments) -->
        <section class="due-section mt-4">
          <h2 class="section-title">💸 Pending Payments</h2>
          <div class="due-grid">
            <div *ngFor="let session of unpaidSessions" class="due-card glass animate-fade">
              <div class="due-info">
                <div class="subject-tag">{{ session.batch?.subject?.name || 'General' }}</div>
                <h3>1-on-1 with {{ session.teacher?.name }}</h3>
                <p class="time">📅 {{ session.startTime | date:'MMM dd, yyyy' }} at {{ session.startTime | date:'shortTime' }}</p>
                <div class="amount">{{ currencySymbol }}{{ session.amount }}</div>
              </div>
              <button class="btn-pay" (click)="openPaymentModal(session)">Pay Now</button>
            </div>
            <div *ngIf="unpaidSessions.length === 0" class="empty-due glass">
              <span class="icon">🎉</span>
              <p>Great! No pending payments for now.</p>
            </div>
          </div>
        </section>

        <!-- Transaction History -->
        <section class="history-section mt-5">
          <h2 class="section-title">📜 Payment History</h2>
          <div class="table-container glass">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Session/Teacher</th>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let session of sessions" class="hover-row">
                  <td>{{ session.startTime | date:'dd MMM, yyyy' }}</td>
                  <td>
                    <strong>{{ session.batch?.subject?.name || 'Tutoring' }}</strong>
                    <div class="text-xs text-secondary">with {{ session.teacher?.name }}</div>
                  </td>
                  <td><code>{{ session.paymentReference || '---' }}</code></td>
                  <td><strong>₹{{ session.amount }}</strong></td>
                  <td>
                    <span class="status-pill" [class.paid]="session.isPaid">
                      {{ session.isPaid ? 'PAID' : 'PENDING' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Payment Options Modal -->
        <div class="modal-overlay" *ngIf="selectedSession" (click)="selectedSession = null">
          <div class="modal-content animate-pop" (click)="$event.stopPropagation()">
            <h2>Complete Payment</h2>
            <p>Session Fee: <strong>{{ currencySymbol }}{{ selectedSession.amount }}</strong></p>
            
            <div class="payment-methods">
              <div class="method-card" [class.disabled]="walletBalance < selectedSession.amount" (click)="payViaWallet(selectedSession)">
                <div class="method-info">
                  <strong>Full Wallet Payment</strong>
                  <span>Use {{ currencySymbol }}{{ selectedSession.amount }} from wallet</span>
                </div>
                <span class="icon">👛</span>
              </div>

              <div class="method-card outline" *ngIf="walletBalance > 0 && walletBalance < selectedSession.amount" (click)="payPartial(selectedSession)">
                <div class="method-info">
                  <strong>Wallet + Gateway</strong>
                  <span>Use {{ currencySymbol }}{{ walletBalance.toFixed(2) }} from wallet & pay rest via Gateway</span>
                </div>
                <span class="icon">🌓</span>
              </div>

              <div class="method-card primary" (click)="payViaGateway(selectedSession)">
                <div class="method-info">
                  <strong>Direct Payment Gateway</strong>
                  <span>Pay full {{ currencySymbol }}{{ selectedSession.amount }} via Cards/UPI</span>
                </div>
                <span class="icon">💳</span>
              </div>
            </div>

            <button class="cancel-link" (click)="selectedSession = null">Cancel</button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .payments-wrapper { padding: 1.5rem; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    
    .wallet-summary { padding: 1rem 2rem; border-radius: 20px; text-align: right; border: 2px solid #e0e7ff; background: #fdfeff; }
    .wallet-summary .label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .wallet-summary .balance { font-size: 1.5rem; font-weight: 800; color: #6366f1; }

    .section-title { font-size: 1.25rem; font-weight: 800; margin-bottom: 1.5rem; color: #334155; }
    
    .due-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .due-card { padding: 1.5rem; border-radius: 20px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: white; transition: all 0.3s; }
    .due-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.06); }
    
    .subject-tag { font-size: 0.65rem; font-weight: 800; background: #e0e7ff; color: #4338ca; padding: 0.25rem 0.75rem; border-radius: 99px; display: inline-block; margin-bottom: 0.5rem; }
    .due-info h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
    .due-info .time { font-size: 0.85rem; color: #64748b; margin: 0.25rem 0; }
    .due-info .amount { font-size: 1.25rem; font-weight: 800; color: #6366f1; }
    
    .btn-pay { background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-pay:hover { background: #4f46e5; transform: scale(1.05); }

    .empty-due { grid-column: 1/-1; padding: 3rem; text-align: center; color: #10b981; border-radius: 24px; border: 2px dashed #bbf7d0; }
    .empty-due .icon { font-size: 3rem; display: block; margin-bottom: 1rem; }

    .table-container { background: white; border-radius: 24px; border: 1px solid #f1f5f9; overflow: hidden; }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { background: #f8fafc; padding: 1.25rem; text-align: left; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    .premium-table td { padding: 1.25rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
    .hover-row:hover { background: #f8fafc; }
    
    .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 99px; background: #f1f5f9; color: #94a3b8; }
    .status-pill.paid { background: #ecfdf5; color: #10b981; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 2.5rem; border-radius: 28px; width: 450px; text-align: center; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
    .payment-methods { display: flex; flex-direction: column; gap: 1rem; margin: 2rem 0; }
    .method-card { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem; border-radius: 16px; border: 2px solid #f1f5f9; cursor: pointer; transition: 0.2s; text-align: left; }
    .method-card:hover:not(.disabled) { border-color: #6366f1; background: #f5f7ff; }
    .method-card.disabled { opacity: 0.5; cursor: not-allowed; }
    .method-card.outline { border-color: #6366f1; color: #6366f1; }
    .method-card.outline:hover { background: #f5f7ff; }
    .method-card.primary { background: #6366f1; border-color: #6366f1; color: white; }
    .method-card.primary span { color: white; }
    .method-card .icon { font-size: 1.5rem; }
    .method-info strong { display: block; }
    .method-info span { font-size: 0.8rem; }
    
    .cancel-link { background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; }
  `]
})
export class StudentPaymentsComponent implements OnInit {
  sessions: any[] = [];
  unpaidSessions: any[] = [];
  walletBalance = 0;
  selectedSession: any = null;
  currencySymbol = '₹';

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    this.currencySymbol = this.authService.getCurrencySymbol();
    if (user) {
      this.paymentService.getStudentSessions(user.userId).subscribe((s: any[]) => {
        this.sessions = s.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
        this.unpaidSessions = s.filter((session: any) => !session.isPaid && session.status !== 'CANCELLED');
      });
      this.paymentService.getWalletBalance(user.userId).subscribe((w: any) => this.walletBalance = w.balance);
    }
  }

  openPaymentModal(session: any) {
    this.selectedSession = session;
  }

  payViaWallet(session: any) {
    if (this.walletBalance < session.amount) return;
    
    this.paymentService.payForSession(session.id, 'WALLET').subscribe({
      next: () => {
        this.toast.success('Paid successfully via Wallet!');
        this.selectedSession = null;
        this.loadData();
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Wallet payment failed')
    });
  }

  payViaGateway(session: any) {
    this.toast.info('Redirecting to Payment Gateway...');
    setTimeout(() => {
      this.paymentService.confirmGateway(session.id, 'REF_' + Math.random().toString(36).substring(7), session.amount).subscribe(() => {
        this.toast.success('Gateway Payment Successful!');
        this.selectedSession = null;
        this.loadData();
      });
    }, 2000);
  }

  payPartial(session: any) {
    this.paymentService.payForSession(session.id, 'PARTIAL').subscribe({
      next: () => {
        const remaining = session.amount - this.walletBalance;
        this.toast.info(`Wallet balance used. Now pay remaining ₹${remaining.toFixed(2)} via Gateway.`);
        // Follow with gateway flow for remaining amount
        this.payViaGateway({ ...session, amount: remaining });
      },
      error: (err: any) => this.toast.error(err.error?.message || 'Partial payment failed')
    });
  }
}
