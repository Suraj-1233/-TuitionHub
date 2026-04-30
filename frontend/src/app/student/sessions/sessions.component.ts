import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { Router } from '@angular/router';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { FeedbackService } from '../../shared/services/feedback.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="sessions-container animate-slide">
        <header class="header">
          <h1>My Classes</h1>
          <p>Your 1-on-1 tutoring sessions — active and completed</p>
        </header>

        <!-- Active Sessions -->
        <div class="section-label" *ngIf="activeSessions.length > 0">
          <span class="dot dot-green"></span> Active Sessions
        </div>
        <div class="sessions-list">
          <div class="session-card animate-fade" *ngFor="let session of activeSessions">
            <div class="card-left">
              <div class="session-avatar">{{ session.teacher?.name?.charAt(0) || 'T' }}</div>
              <div class="session-info">
                <span class="session-badge active-badge">Live</span>
                <h3>Session with <strong>{{ session.teacher?.name || 'Teacher' }}</strong></h3>
                <div class="schedule-row">
                  <span>📅 {{ session.startTime | date:'EEE, MMM d' }}</span>
                  <span>🕒 {{ session.startTime | date:'shortTime' }} – {{ session.endTime | date:'shortTime' }}</span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <button class="join-btn" (click)="joinMeet(session)">📹 Join Meet</button>
              <button class="material-btn" (click)="viewMaterial(session)">📚 Materials</button>
            </div>
          </div>

          <div *ngIf="activeSessions.length === 0 && !isLoading" class="empty-section">
            <span>📭</span> No active sessions right now.
          </div>
        </div>

        <!-- Completed Sessions -->
        <div class="section-label mt-6" *ngIf="completedSessions.length > 0">
          <span class="dot dot-gray"></span> Completed Sessions
        </div>
        <div class="sessions-list">
          <div class="session-card completed-card animate-fade" *ngFor="let session of completedSessions">
            <div class="card-left">
              <div class="session-avatar gray">{{ session.teacher?.name?.charAt(0) || 'T' }}</div>
              <div class="session-info">
                <span class="session-badge done-badge">Completed</span>
                <h3>Session with <strong>{{ session.teacher?.name || 'Teacher' }}</strong></h3>
                <div class="schedule-row">
                  <span>📅 {{ session.startTime | date:'EEE, MMM d' }}</span>
                  <span>🕒 {{ session.startTime | date:'shortTime' }}</span>
                </div>
              </div>
            </div>
            <div class="card-right">
              <ng-container *ngIf="!session._feedbackDone">
                <button class="feedback-btn" (click)="openFeedback(session)">
                  ⭐ Rate Session
                </button>
              </ng-container>
              <ng-container *ngIf="session._feedbackDone">
                <div class="feedback-done">
                  <span>✅ Rated</span>
                  <div class="stars-display">
                    <span *ngFor="let s of getStars(session._feedbackRating)">⭐</span>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
        </div>

        <div *ngIf="isLoading" class="text-center py-8">
          <span class="spinner">⏳</span> Loading sessions...
        </div>
      </div>

      <!-- ===== FEEDBACK MODAL ===== -->
      <div class="modal-overlay" *ngIf="feedbackSession" (click)="closeFeedback()">
        <div class="feedback-modal animate-pop" (click)="$event.stopPropagation()">
          
          <div class="modal-top">
            <div class="modal-avatar">{{ feedbackSession.teacher?.name?.charAt(0) || 'T' }}</div>
            <div>
              <h3 class="modal-title">Rate Your Session</h3>
              <p class="modal-sub">with <strong>{{ feedbackSession.teacher?.name }}</strong></p>
            </div>
            <button class="modal-close" (click)="closeFeedback()">✕</button>
          </div>

          <div class="stars-section">
            <p class="stars-label">How was your experience?</p>
            <div class="star-row">
              <button 
                *ngFor="let s of [1,2,3,4,5]"
                class="star-btn"
                [class.selected]="feedbackRating >= s"
                (mouseenter)="hoverRating = s"
                (mouseleave)="hoverRating = 0"
                [class.hovered]="hoverRating >= s && feedbackRating < s"
                (click)="feedbackRating = s">
                ★
              </button>
            </div>
            <p class="rating-label">{{ getRatingLabel() }}</p>
          </div>

          <div class="comment-section">
            <label>Your Feedback <span class="optional">(optional)</span></label>
            <textarea 
              [(ngModel)]="feedbackComment"
              rows="3"
              placeholder="Share what you liked or what could be improved..."
              class="comment-box"></textarea>
          </div>

          <div class="modal-actions">
            <button class="cancel-btn" (click)="closeFeedback()">Cancel</button>
            <button class="submit-btn" (click)="submitFeedback()" [disabled]="feedbackRating === 0 || isSubmitting">
              <span *ngIf="!isSubmitting">✅ Submit Feedback</span>
              <span *ngIf="isSubmitting">Submitting...</span>
            </button>
          </div>
        </div>
      </div>

    </app-dashboard-layout>
  `,
  styles: [`
    .sessions-container { padding: 0.5rem; }
    .header h1 { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    .header p { color: #64748b; margin: 0.4rem 0 1.5rem 0; }

    .section-label { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
    .dot-green { background: #10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.2); }
    .dot-gray { background: #94a3b8; }
    .mt-6 { margin-top: 2.5rem; }

    .sessions-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }

    .session-card {
      background: white; border-radius: 20px; padding: 1.5rem 2rem;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;
      transition: all 0.3s; position: relative; overflow: hidden;
    }
    .session-card::before { content: ''; position: absolute; top: 0; left: 0; width: 5px; height: 100%; background: #6366f1; border-radius: 4px 0 0 4px; }
    .session-card:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.08); }
    .completed-card::before { background: #94a3b8; }
    .completed-card { opacity: 0.92; }

    .card-left { display: flex; align-items: center; gap: 1.25rem; }
    .session-avatar { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; }
    .session-avatar.gray { background: linear-gradient(135deg, #94a3b8, #64748b); }
    .session-info { display: flex; flex-direction: column; gap: 0.35rem; }
    .session-info h3 { font-size: 1rem; color: #1e293b; margin: 0; }
    .schedule-row { display: flex; gap: 1.25rem; font-size: 0.82rem; color: #94a3b8; font-weight: 600; }

    .session-badge { font-size: 0.65rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 100px; text-transform: uppercase; width: fit-content; }
    .active-badge { background: #DCFCE7; color: #166534; }
    .done-badge { background: #F1F5F9; color: #64748B; }

    .card-right { display: flex; gap: 0.75rem; align-items: center; flex-shrink: 0; }
    .join-btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 0.7rem 1.25rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
    .join-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16,185,129,0.3); }
    .material-btn { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; padding: 0.7rem 1.25rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; }
    .feedback-btn { background: linear-gradient(135deg, #F59E0B, #D97706); color: white; border: none; padding: 0.7rem 1.4rem; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: 0.2s; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
    .feedback-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.4); }

    .feedback-done { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .feedback-done span { font-size: 0.75rem; font-weight: 700; color: #10b981; }
    .stars-display { font-size: 0.85rem; }

    .empty-section { color: #94a3b8; font-size: 0.9rem; padding: 1.5rem; text-align: center; background: #F8FAFC; border-radius: 12px; }
    .text-center { text-align: center; }
    .py-8 { padding: 2rem 0; }
    .spinner { font-size: 1.5rem; }

    /* ===== FEEDBACK MODAL ===== */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .feedback-modal { background: white; border-radius: 28px; width: 100%; max-width: 480px; padding: 2rem; box-shadow: 0 30px 60px rgba(0,0,0,0.2); animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
    @keyframes popIn { from { opacity: 0; transform: scale(0.85) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .modal-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; }
    .modal-avatar { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; font-weight: 800; flex-shrink: 0; }
    .modal-title { font-size: 1.25rem; font-weight: 800; color: #1e293b; margin: 0; }
    .modal-sub { font-size: 0.85rem; color: #64748b; margin: 0.2rem 0 0; }
    .modal-close { margin-left: auto; background: #F1F5F9; border: none; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.85rem; color: #64748b; transition: 0.2s; }
    .modal-close:hover { background: #E2E8F0; transform: rotate(90deg); }

    .stars-section { text-align: center; margin-bottom: 1.5rem; background: #FFFBEB; border-radius: 16px; padding: 1.5rem; border: 1px solid #FDE68A; }
    .stars-label { font-size: 0.875rem; font-weight: 600; color: #92400E; margin: 0 0 1rem; }
    .star-row { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .star-btn { background: none; border: none; font-size: 2.5rem; cursor: pointer; color: #D1D5DB; transition: all 0.15s; line-height: 1; padding: 0.1rem; }
    .star-btn.selected { color: #F59E0B; transform: scale(1.1); }
    .star-btn.hovered { color: #FCD34D; }
    .rating-label { font-size: 0.875rem; font-weight: 700; color: #92400E; margin: 0; height: 1.2rem; }

    .comment-section { margin-bottom: 1.5rem; }
    .comment-section label { display: block; font-size: 0.8rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .optional { color: #94a3b8; font-weight: 400; text-transform: none; letter-spacing: 0; }
    .comment-box { width: 100%; padding: 0.875rem 1rem; border-radius: 12px; border: 1.5px solid #E2E8F0; background: #F8FAFC; font-size: 0.9rem; font-family: inherit; resize: vertical; transition: 0.2s; box-sizing: border-box; }
    .comment-box:focus { border-color: #6366F1; outline: none; background: white; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

    .modal-actions { display: flex; gap: 0.75rem; }
    .cancel-btn { flex: 1; background: #F1F5F9; color: #475569; border: none; padding: 0.875rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .cancel-btn:hover { background: #E2E8F0; }
    .submit-btn { flex: 2; background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border: none; padding: 0.875rem; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 12px rgba(99,102,241,0.3); }
    .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.4); }
    .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  `]
})
export class SessionsComponent implements OnInit {
  activeSessions: any[] = [];
  completedSessions: any[] = [];
  isLoading = true;

  // Feedback modal state
  feedbackSession: any = null;
  feedbackRating = 0;
  hoverRating = 0;
  feedbackComment = '';
  isSubmitting = false;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private toastService: ToastService,
    private feedbackService: FeedbackService,
    private router: Router
  ) {}

  ngOnInit() { this.loadData(); }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.paymentService.getStudentSessions(user.userId).subscribe({
        next: (sessions: any[]) => {
          this.activeSessions = (sessions || []).filter((s: any) => s.status !== 'COMPLETED');
          this.completedSessions = (sessions || []).filter((s: any) => s.status === 'COMPLETED');
          this.completedSessions.forEach((s: any) => {
            s._feedbackDone = false;
            s._feedbackRating = 0;
            // Check if already rated
            this.feedbackService.getFeedbackForSession(s.id).subscribe({
              next: (fb) => { if (fb) { s._feedbackDone = true; s._feedbackRating = fb.rating; } },
              error: () => {}
            });
          });
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    }
  }

  openFeedback(session: any) {
    this.feedbackSession = session;
    this.feedbackRating = 0;
    this.hoverRating = 0;
    this.feedbackComment = '';
  }

  closeFeedback() {
    this.feedbackSession = null;
  }

  submitFeedback() {
    if (this.feedbackRating === 0) return;
    this.isSubmitting = true;

    this.feedbackService.submitFeedback(this.feedbackSession.id, this.feedbackRating, this.feedbackComment).subscribe({
      next: () => {
        this.feedbackSession._feedbackDone = true;
        this.feedbackSession._feedbackRating = this.feedbackRating;
        this.isSubmitting = false;
        this.toastService.success('Thank you for your feedback! 🎉');
        this.closeFeedback();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Could not submit feedback. Please try again.');
      }
    });
  }

  getRatingLabel(): string {
    const r = this.feedbackRating;
    if (r === 0) return 'Tap a star to rate';
    if (r === 1) return '😞 Needs Improvement';
    if (r === 2) return '😐 Below Average';
    if (r === 3) return '🙂 Good';
    if (r === 4) return '😊 Very Good';
    return '🤩 Excellent!';
  }

  getStars(n: number): number[] { return Array(n).fill(0); }

  joinMeet(session: any) {
    if (session.batch?.liveClassLink) window.open(session.batch.liveClassLink, '_blank');
    else this.toastService.info('Meeting link will be shared by mentor soon.');
  }

  viewMaterial(session: any) {
    if (session.batch?.id) this.router.navigate(['/student/mentors', session.batch.id]);
    else this.toastService.error('Batch information not found');
  }
}
