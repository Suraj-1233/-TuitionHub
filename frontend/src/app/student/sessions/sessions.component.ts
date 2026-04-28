import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { FeedbackService } from '../../shared/services/feedback.service';
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
              <div *ngIf="session.isPaid" class="paid-actions-group">
                <div class="paid-badge"><span class="icon">✅</span> Paid</div>
                <div class="action-buttons">
                  <button class="join-meet-btn" (click)="joinMeet(session)">📹 Join Meet</button>
                  <button class="material-btn" (click)="viewMaterial(session)">📚 Study Material</button>
                </div>
                <button *ngIf="session.status === 'COMPLETED'" class="feedback-btn" (click)="openFeedback(session)">Give Feedback</button>
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

        <!-- Feedback Modal -->
        <div class="modal-overlay" *ngIf="showFeedbackModal" (click)="showFeedbackModal = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>How was your session?</h2>
            <p>Rate your experience with {{ feedbackSession?.teacher?.name }}</p>
            
            <div class="rating-stars">
              <span *ngFor="let star of [1,2,3,4,5]" 
                    (click)="selectedRating = star"
                    [class.active]="selectedRating >= star">★</span>
            </div>

            <textarea [(ngModel)]="feedbackComment" placeholder="Write a short review..."></textarea>

            <div class="modal-actions">
              <button class="secondary-btn" (click)="showFeedbackModal = false">Later</button>
              <button class="primary-btn" [disabled]="!selectedRating" (click)="submitFeedback()">Submit Review</button>
            </div>
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

    .paid-badge { background: #ecfdf5; color: #059669; padding: 0.5rem 1rem; border-radius: 99px; font-weight: 700; font-size: 0.875rem; text-align: center; }
    .paid-actions-group { display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-end; }
    .action-buttons { display: flex; gap: 0.5rem; }
    
    .join-meet-btn { background: #10b981; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .join-meet-btn:hover { background: #059669; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
    
    .material-btn { background: #6366f1; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; font-size: 0.875rem; cursor: pointer; transition: all 0.2s; }
    .material-btn:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }

    .feedback-btn { background: #f8fafc; color: #64748b; border: 1px solid #e2e8f0; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .feedback-btn:hover { background: #f1f5f9; color: #1e293b; }
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

    .rating-stars { display: flex; justify-content: center; gap: 0.5rem; font-size: 2.5rem; margin: 1.5rem 0; }
    .rating-stars span { cursor: pointer; color: #e2e8f0; transition: color 0.2s; }
    .rating-stars span.active { color: #f59e0b; }
    
    textarea { width: 100%; height: 100px; border: 2px solid #e2e8f0; border-radius: 12px; padding: 1rem; font-family: inherit; resize: none; outline: none; }
    textarea:focus { border-color: #6366f1; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];
  walletBalance = 0;
  selectedSession: any = null;

  showFeedbackModal = false;
  feedbackSession: any = null;
  selectedRating = 0;
  feedbackComment = '';

  constructor(
    private paymentService: PaymentService,
    private feedbackService: FeedbackService,
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
      error: (err: any) => this.toastService.error(err.error?.message || 'Payment failed')
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
      error: (err: any) => this.toastService.error(err.error?.message || 'Partial payment failed')
    });
  }

  joinMeet(session: any) {
    if (session.batch?.liveClassLink) {
      window.open(session.batch.liveClassLink, '_blank');
    } else {
      this.toastService.info('Meeting link will be shared by mentor soon.');
    }
  }

  viewMaterial(session: any) {
    alert('Opening Study Materials for ' + (session.batch?.subject || 'Session'));
  }

  openFeedback(session: any) {
    this.feedbackSession = session;
    this.selectedRating = 0;
    this.feedbackComment = '';
    this.showFeedbackModal = true;
  }

  submitFeedback() {
    this.feedbackService.submitFeedback(this.feedbackSession.id, this.selectedRating, this.feedbackComment).subscribe({
      next: () => {
        this.toastService.success('Thank you for your feedback!');
        this.showFeedbackModal = false;
        this.loadData();
      },
      error: (err: any) => this.toastService.error(err.error?.message || 'Submission failed')
    });
  }
}
