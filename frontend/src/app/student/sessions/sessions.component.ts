import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="sessions-container">
        <header class="header">
          <h1>My Bookings</h1>
          <p>Upcoming and past tutoring sessions</p>
        </header>

        <div class="sessions-list">
          <div class="session-card" *ngFor="let session of sessions">
            <div class="session-info">
              <div class="date-badge">
                <span class="month">{{ session.startTime | date:'MMM' }}</span>
                <span class="day">{{ session.startTime | date:'dd' }}</span>
              </div>
              <div class="details">
                <h3>{{ session.batch?.name || 'Individual Session' }}</h3>
                <p class="teacher">with {{ session.teacher.name }}</p>
                <p class="time">🕒 {{ session.startTime | date:'shortTime' }} - {{ session.endTime | date:'shortTime' }}</p>
              </div>
            </div>

            <div class="payment-status">
              <div *ngIf="session.isPaid" class="paid-badge">
                <span class="icon">✅</span> Paid
              </div>
              <div *ngIf="!session.isPaid" class="unpaid-info">
                <span class="amount">{{ session.amount }} {{ session.teacher.currency || 'INR' }}</span>
                <button class="pay-btn" (click)="openPaymentOptions(session)">Pay to Unlock</button>
              </div>
            </div>
          </div>

          <div *ngIf="sessions.length === 0" class="empty-state">
            <p>No sessions booked yet.</p>
          </div>
        </div>

        <!-- Payment Options Modal -->
        <div class="modal-overlay" *ngIf="selectedSession" (click)="selectedSession = null">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>Payment for Session</h2>
            <p>Choose your payment method for {{ selectedSession.amount }} {{ selectedSession.teacher.currency }}</p>
            
            <div class="wallet-option" [class.disabled]="walletBalance < selectedSession.amount">
              <div class="info">
                <strong>Wallet Balance</strong>
                <span>Available: {{ walletBalance.toFixed(2) }}</span>
              </div>
              <button class="pay-option-btn" 
                      [disabled]="walletBalance < selectedSession.amount"
                      (click)="payViaWallet(selectedSession)">
                Pay via Wallet
              </button>
            </div>

            <div class="gateway-option">
              <div class="info">
                <strong>Direct Payment</strong>
                <span>Credit Card / UPI / PayPal</span>
              </div>
              <button class="pay-option-btn primary" (click)="payViaGateway(selectedSession)">
                Pay via Gateway
              </button>
            </div>

            <div class="partial-option" *ngIf="walletBalance > 0 && walletBalance < selectedSession.amount">
              <p class="hint">💡 You can use your wallet balance ({{ walletBalance.toFixed(2) }}) and pay the remaining ({{ (selectedSession.amount - walletBalance).toFixed(2) }}) via gateway.</p>
              <button class="pay-option-btn outline" (click)="payPartial(selectedSession)">
                Partial Wallet + Gateway
              </button>
            </div>

            <button class="close-btn" (click)="selectedSession = null">Close</button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .sessions-container { animation: fadeIn 0.5s ease-out; }
    .header h1 { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    .header p { color: #64748b; margin: 0.5rem 0 2rem 0; }

    .sessions-list { display: flex; flex-direction: column; gap: 1rem; }
    .session-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 6px rgba(0,0,0,0.02);
      border: 1px solid #f1f5f9;
      transition: transform 0.2s;
    }
    .session-card:hover { transform: scale(1.01); }

    .session-info { display: flex; gap: 1.5rem; align-items: center; }
    .date-badge {
      background: #f8fafc;
      border-radius: 12px;
      padding: 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;
      border: 1px solid #e2e8f0;
    }
    .date-badge .month { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-transform: uppercase; }
    .date-badge .day { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

    .details h3 { margin: 0; font-size: 1.125rem; color: #1e293b; }
    .details .teacher { margin: 0.25rem 0; color: #64748b; font-size: 0.875rem; }
    .details .time { margin: 0; color: #94a3b8; font-size: 0.875rem; }

    .paid-badge { background: #ecfdf5; color: #059669; padding: 0.5rem 1rem; border-radius: 99px; font-weight: 700; font-size: 0.875rem; }
    .unpaid-info { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
    .amount { font-weight: 800; color: #1e293b; font-size: 1.125rem; }
    .pay-btn { background: #6366f1; color: white; border: none; padding: 0.5rem 1.25rem; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
    .pay-btn:hover { background: #4f46e5; }

    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: white; padding: 2.5rem; border-radius: 24px; width: 450px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); }
    
    .wallet-option, .gateway-option {
      background: #f8fafc;
      padding: 1.25rem;
      border-radius: 16px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #e2e8f0;
    }
    .wallet-option.disabled { opacity: 0.6; }
    .info { display: flex; flex-direction: column; gap: 0.25rem; }
    .info strong { color: #1e293b; }
    .info span { font-size: 0.875rem; color: #64748b; }

    .pay-option-btn { padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid #e2e8f0; background: white; font-weight: 600; cursor: pointer; }
    .pay-option-btn.primary { background: #6366f1; color: white; border: none; }
    .pay-option-btn.outline { width: 100%; margin-top: 0.5rem; border-color: #6366f1; color: #6366f1; }
    .pay-option-btn:disabled { cursor: not-allowed; }

    .hint { font-size: 0.875rem; color: #6366f1; margin: 1rem 0; line-height: 1.4; }
    .close-btn { width: 100%; margin-top: 1.5rem; background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];
  walletBalance = 0;
  selectedSession: any = null;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.paymentService.getStudentSessions(user.userId).subscribe(s => this.sessions = s);
      this.paymentService.getWalletBalance(user.userId).subscribe(w => this.walletBalance = w.balance);
    }
  }

  openPaymentOptions(session: any) {
    this.selectedSession = session;
  }

  payViaWallet(session: any) {
    this.paymentService.payForSession(session.id, 'WALLET').subscribe({
      next: () => {
        this.toastService.success('Payment successful via Wallet!');
        this.selectedSession = null;
        this.loadData();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Payment failed')
    });
  }

  payViaGateway(session: any) {
    // In real app, trigger Razorpay/Stripe here
    this.toastService.info('Redirecting to Payment Gateway...');
    setTimeout(() => {
      this.paymentService.confirmGateway(session.id, 'REF_' + Math.random().toString(36).substring(7), session.amount).subscribe(() => {
        this.toastService.success('Gateway Payment Successful!');
        this.selectedSession = null;
        this.loadData();
      });
    }, 2000);
  }

  payPartial(session: any) {
    this.paymentService.payForSession(session.id, 'PARTIAL').subscribe({
      next: () => {
        const remaining = session.amount - this.walletBalance;
        this.toastService.info(`Wallet deducted. Now pay remaining ${remaining} via gateway.`);
        // Followed by gateway flow
        this.payViaGateway({ ...session, amount: remaining });
      },
      error: (err) => this.toastService.error(err.error?.message || 'Partial payment failed')
    });
  }
}
