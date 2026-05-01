import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { RouterLink } from '@angular/router';
import { ParentService } from '../../shared/services/parent.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

declare var Razorpay: any;

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Parent Dashboard</h1>
          <p class="subtitle">Monitor and manage your children's learning</p>
        </div>
      </div>

      <div class="stats-grid animate-fade">
        <div class="stat-card card">
          <span class="stat-icon">👨‍👩‍👧‍👦</span>
          <div class="stat-info">
            <span class="stat-value">{{ childrenCount }}</span>
            <span class="stat-label">Children Enrolled</span>
          </div>
        </div>
        <div class="stat-card card">
          <span class="stat-icon">📚</span>
          <div class="stat-info">
            <span class="stat-value">{{ activeBatchesCount }}</span>
            <span class="stat-label">Active Batches</span>
          </div>
        </div>
        <div class="stat-card card" style="border-left: 4px solid #E11D48;">
          <span class="stat-icon">💳</span>
          <div class="stat-info">
            <span class="stat-value text-danger">₹{{ totalPendingFees }}</span>
            <span class="stat-label">Pending Fees</span>
          </div>
        </div>
      </div>

      <div class="dashboard-grid mt-8 animate-fade">
        <!-- Children & Their Classes -->
        <div class="main-column">
          <h2 class="section-title">My Children & Classes</h2>
          <div *ngFor="let child of children" class="child-overview-card card mb-4">
            <div class="child-header">
              <div class="flex items-center gap-3">
                <div class="avatar-mini">{{ child.name.charAt(0) }}</div>
                <div>
                  <h3 class="child-name">{{ child.name }}</h3>
                  <p class="child-meta">Grade {{ child.studentClass }} • {{ child.board }}</p>
                </div>
              </div>
              <span class="badge badge-success">Active</span>
            </div>

            <div class="batches-list mt-4">
              <div *ngIf="child.activeBatches.length === 0" class="empty-mini">
                No active classes for {{ child.name }} yet.
              </div>
              <div *ngFor="let batch of child.activeBatches" class="batch-item">
                <div class="batch-main">
                  <span class="batch-icon">📚</span>
                  <div class="batch-details">
                    <span class="b-name">{{ batch.name }}</span>
                    <span class="b-subj">{{ batch.subject }}</span>
                  </div>
                </div>
                <div class="batch-fee">
                  <span class="fee-amt">₹{{ batch.monthlyFees }} / month</span>
                  <button class="btn btn-primary btn-sm" (click)="payNow(child, batch)">
                    Pay Current Month
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="children.length === 0" class="empty-state card">
            <p>No children linked to your account. Ask your child to add your email ({{ parentEmail }}) during registration.</p>
          </div>
        </div>

        <!-- Sidebar / Actions -->
        <div class="side-column">
          <h2 class="section-title">Quick Actions</h2>
          <div class="action-list">
            <button class="action-item card" routerLink="/parent/children">
              <span class="act-icon">👨‍👩‍👧‍👦</span>
              <div class="act-info">
                <span class="act-title">Manage Children</span>
                <span class="act-desc">View profiles and progress</span>
              </div>
            </button>
            <button class="action-item card" routerLink="/parent/payments">
              <span class="act-icon">💳</span>
              <div class="act-info">
                <span class="act-title">Payment History</span>
                <span class="act-desc">View receipts and invoices</span>
              </div>
            </button>

          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: #0F172A; margin: 0; }
    .subtitle { color: #64748B; margin-top: 0.5rem; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
    .stat-icon { font-size: 2rem; }
    .stat-info { display: flex; flex-direction: column; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #6366F1; }
    .stat-label { font-size: 0.8rem; color: #64748B; font-weight: 600; }

    .dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; }
    .section-title { font-size: 1.1rem; font-weight: 800; color: #0F172A; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; }

    .child-overview-card { padding: 1.5rem; }
    .child-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F1F5F9; padding-bottom: 1rem; }
    .avatar-mini { width: 40px; height: 40px; border-radius: 12px; background: #EEF2FF; color: #6366F1; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .child-name { font-size: 1.1rem; font-weight: 700; color: #1E293B; margin: 0; }
    .child-meta { font-size: 0.8rem; color: #64748B; margin: 0; }

    .batch-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #F8FAFC; border-radius: 12px; margin-top: 0.75rem; border: 1px solid #F1F5F9; }
    .batch-main { display: flex; align-items: center; gap: 1rem; }
    .batch-icon { font-size: 1.25rem; }
    .b-name { display: block; font-weight: 700; color: #1E293B; font-size: 0.9rem; }
    .b-subj { font-size: 0.75rem; color: #64748B; font-weight: 600; }
    .batch-fee { text-align: right; }
    .fee-amt { display: block; font-weight: 800; color: #0F172A; font-size: 0.9rem; margin-bottom: 4px; }
    
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }

    .action-list { display: flex; flex-direction: column; gap: 1rem; }
    .action-item { 
      display: flex; align-items: center; gap: 1rem; padding: 1.25rem; text-align: left;
      width: 100%; cursor: pointer; transition: all 0.2s;
    }
    .action-item:hover { transform: translateX(5px); border-color: #6366F1; }
    .act-icon { font-size: 1.5rem; }
    .act-title { display: block; font-weight: 700; color: #1E293B; font-size: 0.9rem; }
    .act-desc { font-size: 0.75rem; color: #64748B; }

    .empty-state { padding: 3rem; text-align: center; color: #64748B; }
    .empty-mini { padding: 1rem; color: #64748B; font-size: 0.875rem; font-style: italic; }

    @media (max-width: 1024px) {
      .dashboard-grid { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ParentDashboardComponent implements OnInit {
  childrenCount = 0;
  activeBatchesCount = 0;
  totalPendingFees = 0;
  children: any[] = [];
  parentEmail = '';
  isLoading = false;

  constructor(
    private parentService: ParentService, 
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) this.parentEmail = user.email;
    this.loadData();
  }

  loadData() {
    this.parentService.getDashboardSummary().subscribe({
      next: (data) => {
        this.childrenCount = data.childrenCount;
        this.activeBatchesCount = data.activeBatchesCount;
        this.totalPendingFees = data.totalPendingFees;
        this.children = data.children;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  payNow(child: any, batch: any) {
    if (this.isLoading) return;
    this.isLoading = true;

    // Create payment order for current month
    const currentMonth = new Date().toISOString().substring(0, 7) + "-01";
    
    this.parentService.createOrder(child.id, batch.id, currentMonth).subscribe({
      next: (order) => {
        this.parentService.getRazorpayKey().subscribe(keyRes => {
          this.initRazorpay(order, keyRes.keyId, child.name, batch.name);
        });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to create payment order');
        this.isLoading = false;
      }
    });
  }

  initRazorpay(order: any, keyId: string, studentName: string, batchName: string) {
    const options = {
      key: keyId,
      amount: order.amount * 100,
      currency: order.currency || 'INR',
      name: 'TuitionHub',
      description: `Fees for ${studentName} - ${batchName}`,
      order_id: order.razorpayOrderId,
      handler: (response: any) => {
        this.verifyPayment(order.id, response);
      },
      theme: { color: '#6366F1' },
      modal: {
        ondismiss: () => {
          this.isLoading = false;
        }
      }
    };
    const rzp = new Razorpay(options);
    rzp.open();
  }

  verifyPayment(paymentId: number, razorpayResponse: any) {
    const verifyReq = {
      paymentId: paymentId,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    };

    this.parentService.verifyPayment(verifyReq).subscribe({
      next: () => {
        this.toast.success('Payment successful!');
        this.loadData();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Payment verification failed');
        this.isLoading = false;
      }
    });
  }
}
