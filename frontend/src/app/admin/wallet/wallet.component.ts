import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AdminService } from '../../shared/services/admin.service';
import { FeedbackService } from '../../shared/services/feedback.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-admin-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <h1 class="page-title">Wallet & Feedback</h1>
        <p class="text-secondary">Manage user credits and review student session feedback</p>
      </div>

      <!-- Tabs -->
      <div class="tabs-strip animate-fade">
        <button class="tab-btn" [class.active]="activeTab === 'wallet'" (click)="activeTab = 'wallet'">
          👛 Wallet Management
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'feedback'" (click)="activeTab = 'feedback'">
          ⭐ Class Feedback
          <span class="count-badge" *ngIf="feedbacks.length > 0">{{ feedbacks.length }}</span>
        </button>
      </div>

      <!-- ===== WALLET TAB ===== -->
      <ng-container *ngIf="activeTab === 'wallet'">
        <div class="card glass animate-fade">
          <h3 class="card-title-inner">💰 Adjust User Wallet</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Select Student</label>
              <div class="select-wrapper">
                <select [(ngModel)]="selectedUserId" class="form-control select">
                  <option [value]="null">-- Select Student --</option>
                  <option *ngFor="let s of students" [value]="s.id">{{ s.name }} ({{ s.email }})</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>
            <div class="form-group">
              <label>Amount</label>
              <input type="number" class="form-control" [(ngModel)]="adjAmount" placeholder="0.00">
            </div>
            <div class="form-group">
              <label>Action</label>
              <div class="select-wrapper">
                <select [(ngModel)]="isCredit" class="form-control select">
                  <option [ngValue]="true">➕ Add Credit (Promo)</option>
                  <option [ngValue]="false">➖ Deduct Balance</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>
            <div class="form-group">
              <label>Description</label>
              <input type="text" class="form-control" [(ngModel)]="adjDescription" placeholder="e.g. Promotional Bonus">
            </div>
          </div>
          <button class="apply-btn" (click)="applyAdjustment()">Apply Adjustment</button>
        </div>

        <div class="card glass p-0 mt-4 animate-fade">
          <div class="card-head-row">
            <h3 class="card-title-inner">📋 Global Wallet Transactions</h3>
          </div>
          <div class="table-responsive">
            <table class="premium-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of allTransactions">
                  <td class="text-sm text-secondary">{{ tx.createdAt | date:'d MMM, h:mm a' }}</td>
                  <td><strong>{{ tx.wallet?.user?.name || '—' }}</strong></td>
                  <td><span class="source-badge">{{ tx.source }}</span></td>
                  <td>
                    <span class="type-badge" [class.credit]="tx.type === 'CREDIT'" [class.debit]="tx.type === 'DEBIT'">
                      {{ tx.type === 'CREDIT' ? '▲' : '▼' }} {{ tx.type }}
                    </span>
                  </td>
                  <td class="amount-cell" [class.credit-text]="tx.type === 'CREDIT'" [class.debit-text]="tx.type === 'DEBIT'">
                    {{ tx.amount | number:'1.2-2' }}
                  </td>
                  <td class="text-sm text-secondary">{{ tx.description }}</td>
                </tr>
                <tr *ngIf="allTransactions.length === 0">
                  <td colspan="6" class="empty-row">No transactions yet.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ng-container>

      <!-- ===== FEEDBACK TAB ===== -->
      <ng-container *ngIf="activeTab === 'feedback'">
        <div class="feedback-stats animate-fade">
          <div class="stat-pill">
            <span class="stat-icon">📝</span>
            <div>
              <div class="stat-num">{{ feedbacks.length }}</div>
              <div class="stat-label">Total Feedbacks</div>
            </div>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">⭐</span>
            <div>
              <div class="stat-num">{{ avgRating }}</div>
              <div class="stat-label">Average Rating</div>
            </div>
          </div>
          <div class="stat-pill">
            <span class="stat-icon">🌟</span>
            <div>
              <div class="stat-num">{{ excellentCount }}</div>
              <div class="stat-label">5-Star Reviews</div>
            </div>
          </div>
        </div>

        <div class="feedback-grid animate-fade">
          <div class="feedback-card" *ngFor="let fb of feedbacks">
            <div class="fb-header">
              <div class="fb-avatar">{{ fb.session?.student?.name?.charAt(0) || 'S' }}</div>
              <div class="fb-meta">
                <div class="fb-student">{{ fb.session?.student?.name || 'Student' }}</div>
                <div class="fb-teacher">Session with <strong>{{ fb.session?.teacher?.name || 'Teacher' }}</strong></div>
              </div>
              <div class="fb-stars">
                <span *ngFor="let s of getStars(fb.rating)" class="star-filled">★</span>
                <span *ngFor="let s of getEmptyStars(fb.rating)" class="star-empty">★</span>
              </div>
            </div>
            <p class="fb-comment" *ngIf="fb.comment">{{ fb.comment }}</p>
            <p class="fb-no-comment" *ngIf="!fb.comment">No written feedback provided.</p>
          </div>

          <div class="empty-state" *ngIf="feedbacks.length === 0 && !isFeedbackLoading">
            <div class="empty-icon">⭐</div>
            <h3>No Feedback Yet</h3>
            <p>Students will rate their completed sessions here.</p>
          </div>

          <div *ngIf="isFeedbackLoading" class="text-center py-8">⏳ Loading feedback...</div>
        </div>
      </ng-container>

    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .text-secondary { color: var(--text-secondary); }
    .mt-4 { margin-top: 1.5rem; }

    .tabs-strip { display: flex; gap: 0.5rem; margin-bottom: 2rem; background: #F1F5F9; padding: 0.4rem; border-radius: 14px; width: fit-content; }
    .tab-btn { padding: 0.65rem 1.25rem; border-radius: 10px; border: none; background: none; font-weight: 700; font-size: 0.875rem; color: #64748B; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.5rem; }
    .tab-btn.active { background: white; color: var(--primary-color); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .count-badge { background: #6366F1; color: white; font-size: 0.65rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 100px; }

    .card { background: white; border-radius: 16px; border: 1px solid #E2E8F0; padding: 1.75rem; }
    .card.glass { backdrop-filter: blur(10px); }
    .card.p-0 { padding: 0; }
    .card-title-inner { font-size: 1rem; font-weight: 800; color: #1E293B; margin: 0 0 1.25rem 0; }
    .card-head-row { padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9; }
    .card-head-row .card-title-inner { margin: 0; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.25rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .form-group label { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
    .form-control { width: 100%; padding: 0.75rem 1rem; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #F8FAFC; font-size: 0.9rem; box-sizing: border-box; }
    .form-control:focus { border-color: var(--primary-color); outline: none; }
    .select-wrapper { position: relative; }
    .select { appearance: none; cursor: pointer; }
    .select-arrow { position: absolute; right: 0.9rem; top: 50%; transform: translateY(-50%); color: #64748B; pointer-events: none; font-size: 0.75rem; }

    .apply-btn { background: linear-gradient(135deg, #6366F1, #4F46E5); color: white; border: none; padding: 0.8rem 2rem; border-radius: 10px; font-weight: 800; cursor: pointer; transition: 0.2s; }
    .apply-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(99,102,241,0.3); }

    .table-responsive { overflow-x: auto; }
    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { padding: 1rem 1.25rem; font-size: 0.7rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; background: #F8FAFC; border-bottom: 1px solid #F1F5F9; text-align: left; }
    .premium-table td { padding: 1rem 1.25rem; border-bottom: 1px solid #F8FAFC; font-size: 0.875rem; }
    .premium-table tr:last-child td { border-bottom: none; }
    .text-sm { font-size: 0.8rem; }
    .source-badge { background: #F1F5F9; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; color: #475569; }
    .type-badge { font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.6rem; border-radius: 6px; }
    .type-badge.credit { background: #DCFCE7; color: #166534; }
    .type-badge.debit { background: #FEE2E2; color: #991B1B; }
    .amount-cell { font-weight: 800; }
    .credit-text { color: #16A34A; }
    .debit-text { color: #DC2626; }
    .empty-row { text-align: center; color: #94A3B8; padding: 2rem; }

    /* Feedback tab */
    .feedback-stats { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .stat-pill { background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 160px; }
    .stat-icon { font-size: 1.75rem; }
    .stat-num { font-size: 1.5rem; font-weight: 800; color: #1E293B; }
    .stat-label { font-size: 0.75rem; font-weight: 600; color: #94A3B8; }

    .feedback-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
    .feedback-card { background: white; border: 1px solid #E2E8F0; border-radius: 16px; padding: 1.5rem; transition: 0.2s; }
    .feedback-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
    .fb-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
    .fb-avatar { width: 40px; height: 40px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
    .fb-student { font-weight: 800; font-size: 0.9rem; color: #1E293B; }
    .fb-teacher { font-size: 0.75rem; color: #94A3B8; }
    .fb-stars { margin-left: auto; flex-shrink: 0; }
    .star-filled { color: #F59E0B; font-size: 1rem; }
    .star-empty { color: #E2E8F0; font-size: 1rem; }
    .fb-comment { font-size: 0.875rem; color: #475569; margin: 0; line-height: 1.6; background: #F8FAFC; border-radius: 10px; padding: 0.75rem; border-left: 3px solid #E2E8F0; }
    .fb-no-comment { font-size: 0.8rem; color: #CBD5E1; margin: 0; font-style: italic; }

    .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; background: #F8FAFC; border-radius: 16px; border: 2px dashed #E2E8F0; }
    .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
    .empty-state h3 { font-weight: 800; color: #1E293B; margin: 0 0 0.5rem; }
    .empty-state p { color: #94A3B8; margin: 0; }
    .text-center { text-align: center; }
    .py-8 { padding: 2rem 0; }
  `]
})
export class AdminWalletComponent implements OnInit {
  activeTab: 'wallet' | 'feedback' = 'wallet';

  // Wallet state
  students: any[] = [];
  allTransactions: any[] = [];
  selectedUserId: number | null = null;
  adjAmount: number = 0;
  isCredit: boolean = true;
  adjDescription: string = '';

  // Feedback state
  feedbacks: any[] = [];
  isFeedbackLoading = false;
  avgRating = '—';
  excellentCount = 0;

  constructor(
    private adminService: AdminService,
    private paymentService: PaymentService,
    private feedbackService: FeedbackService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadWalletData();
    this.loadFeedbacks();
  }

  loadWalletData() {
    this.adminService.getAllStudents().subscribe(s => this.students = s || []);
    this.adminService.getAllWalletTransactions().subscribe(txs => this.allTransactions = txs || []);
  }

  loadFeedbacks() {
    this.isFeedbackLoading = true;
    this.feedbackService.getAllFeedbacks().subscribe({
      next: (data) => {
        this.feedbacks = data || [];
        if (this.feedbacks.length > 0) {
          const total = this.feedbacks.reduce((sum, f) => sum + f.rating, 0);
          this.avgRating = (total / this.feedbacks.length).toFixed(1);
          this.excellentCount = this.feedbacks.filter(f => f.rating === 5).length;
        }
        this.isFeedbackLoading = false;
      },
      error: () => { this.isFeedbackLoading = false; }
    });
  }

  applyAdjustment() {
    if (!this.selectedUserId || this.adjAmount <= 0) {
      this.toastService.error('Please select a user and enter a valid amount');
      return;
    }
    this.adminService.adjustWallet({
      userId: this.selectedUserId,
      amount: this.adjAmount,
      isCredit: this.isCredit,
      description: this.adjDescription
    }).subscribe({
      next: () => {
        this.toastService.success('Wallet adjusted successfully');
        this.adjAmount = 0;
        this.adjDescription = '';
        this.loadWalletData();
      },
      error: () => this.toastService.error('Adjustment failed')
    });
  }

  getStars(n: number): number[] { return Array(Math.min(n, 5)).fill(0); }
  getEmptyStars(n: number): number[] { return Array(Math.max(5 - n, 0)).fill(0); }
}
