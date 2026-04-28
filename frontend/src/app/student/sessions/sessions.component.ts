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
          <h1>My Classes</h1>
          <p>Upcoming and past 1-on-1 tutoring sessions</p>
        </header>

        <div class="sessions-list">
          <div class="session-card" *ngFor="let session of sessions">
            <div class="class-card-header">
              <div class="subject-icon-box">
                <span class="icon">{{ session.batch?.subject?.icon || '📚' }}</span>
              </div>
              <div class="class-details">
                <span class="badge">1-on-1 Class</span>
                <h3>{{ session.batch?.subject?.name || 'Tutoring Session' }}</h3>
                <p class="instructor">with <strong>{{ session.teacher.name }}</strong></p>
                <div class="schedule-info">
                  <span>📅 {{ session.startTime | date:'EEEE, MMM dd' }}</span>
                  <span>🕒 {{ session.startTime | date:'shortTime' }} - {{ session.endTime | date:'shortTime' }}</span>
                </div>
              </div>
            </div>

            <div class="payment-status">
              <div class="action-buttons">
                <button class="join-meet-btn" (click)="joinMeet(session)">📹 Join Meet</button>
                <button class="material-btn" (click)="viewMaterial(session)">📚 Study Material</button>
              </div>
              <p class="status-hint">Manage fees in <strong>Payments</strong> section</p>
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
      border-radius: 24px;
      padding: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.04);
      border: 1px solid #f1f5f9;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin-bottom: 1.5rem;
      position: relative;
      overflow: hidden;
    }
    .session-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: #6366f1; }
    .session-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
 
    .class-card-header { display: flex; gap: 1.5rem; align-items: flex-start; }
    .subject-icon-box {
      width: 70px;
      height: 70px;
      background: #f8fafc;
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      border: 2px solid #e2e8f0;
    }
    
    .class-details .badge {
      background: #e0e7ff;
      color: #4338ca;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 0.25rem 0.75rem;
      border-radius: 99px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .class-details h3 { margin: 0.5rem 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    .class-details .instructor { margin: 0; color: #64748b; font-size: 0.95rem; }
    .class-details .instructor strong { color: #1e293b; }
    
    .schedule-info { display: flex; gap: 1rem; margin-top: 0.75rem; color: #94a3b8; font-size: 0.85rem; font-weight: 600; }
    .schedule-info span { display: flex; align-items: center; gap: 0.4rem; }

    .paid-badge { background: #ecfdf5; color: #059669; padding: 0.5rem 1rem; border-radius: 99px; font-weight: 700; font-size: 0.875rem; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05); }
    .paid-info-group { display: flex; flex-direction: column; gap: 0.5rem; align-items: flex-end; margin-top: 0.5rem; }
    .action-buttons { display: flex; gap: 0.75rem; margin-bottom: 0.75rem; }
    
    .join-meet-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.875rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
    .join-meet-btn.locked { background: #f1f5f9; color: #94a3b8; box-shadow: none; }
    .join-meet-btn:hover:not(.locked) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); }
    
    .material-btn { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 800; font-size: 0.875rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
    .material-btn.locked { background: #f1f5f9; color: #94a3b8; box-shadow: none; }
    .material-btn:hover:not(.locked) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4); }

    .feedback-btn { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .status-hint { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; text-align: right; }
    .feedback-btn:hover { background: #fef3c7; transform: scale(1.05); }
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
      // Filter only active/upcoming sessions for "My Classes"
      this.paymentService.getStudentSessions(user.userId).subscribe(s => {
        this.sessions = s.filter((session: any) => session.status !== 'COMPLETED');
      });
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
    if (!session.isPaid) {
      this.toastService.error('Please pay to unlock the meeting link');
      return;
    }
    if (session.batch?.liveClassLink) {
      window.open(session.batch.liveClassLink, '_blank');
    } else {
      this.toastService.info('Meeting link will be shared by mentor soon.');
    }
  }

  viewMaterial(session: any) {
    if (!session.isPaid) {
      this.toastService.error('Please pay to access study materials');
      return;
    }
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
