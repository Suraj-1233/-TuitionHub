import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { Payment, Batch } from '../../shared/models/models';
import { BatchService } from '../../shared/services/batch.service';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../shared/services/toast.service';

declare var Razorpay: any;

@Component({
  selector: 'app-student-payments',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="page-header animate-slide">
        <h1 class="page-title">Fee Payments</h1>
        <p class="subtitle text-secondary">Manage your course fees and view transaction history.</p>
      </div>

      <!-- Due Payments Section -->
      <h2 class="section-title mt-4 mb-4">💳 Due Payments</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade">
        <div *ngFor="let batch of pendingBatches" class="due-card shadow-sm">
          <div class="due-info">
            <div class="batch-name">{{ batch.name }}</div>
            <div class="due-month">{{ currentMonthName }} Fees</div>
            <div class="amount text-primary">₹{{ batch.monthlyFees }}</div>
          </div>
          <button class="btn-pay" (click)="payForBatch(batch)" [disabled]="isProcessing">
            {{ isProcessing ? '...' : 'Pay Now' }}
          </button>
        </div>
        <div *ngIf="pendingBatches.length === 0" class="card glass p-6 text-center text-success w-full" style="grid-column: 1/-1">
          ✨ Excellent! All your fees are currently up to date.
        </div>
      </div>

      <h2 class="section-title mb-4">📜 Payment History</h2>
      <div class="card glass p-0 overflow-hidden shadow-sm animate-fade">
        <table class="premium-table w-full">
          <thead>
            <tr>
              <th style="width: 15%">Date & Time</th>
              <th style="width: 25%">Course / Batch</th>
              <th style="width: 25%">Reference (ID)</th>
              <th style="width: 15%">Amount</th>
              <th style="width: 20%">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments" class="hover-row cursor-pointer" (click)="selectedPayment = p">
              <td>
                <div class="date-cell">
                   <span class="d-main">{{ p.paidAt ? (p.paidAt | date:'dd MMM yyyy') : 'N/A' }}</span>
                   <span class="d-sub text-xs text-secondary">{{ p.paidAt ? (p.paidAt | date:'hh:mm a') : '' }}</span>
                </div>
              </td>
              <td>
                <div class="batch-cell">
                  <span class="b-name font-bold">{{ p.batchName }}</span>
                  <div class="text-xs text-secondary">{{ p.forMonth }}</div>
                </div>
              </td>
              <td>
                <code class="text-xs bg-slate-100 p-1 rounded">{{ p.razorpayPaymentId || '---' }}</code>
              </td>
              <td><span class="amount-cell font-bold text-primary">₹{{ p.amount }}</span></td>
              <td>
                <span class="status-pill" [ngClass]="{
                  'paid': p.status === 'PAID',
                  'pending': p.status === 'PENDING',
                  'failed': p.status === 'FAILED'
                }">{{ p.status }}</span>
              </td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="5" class="p-12 text-center text-secondary">
                <div class="empty-state">
                  <span class="icon" style="font-size: 2rem">📭</span>
                  <p class="mt-2">No payment history found yet.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Transaction Details Modal -->
      <div class="modal-overlay" *ngIf="selectedPayment" (click)="selectedPayment = null">
        <div class="modal-content animate-pop" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="m-0">Transaction Receipt</h3>
            <button class="btn-close" (click)="selectedPayment = null">&times;</button>
          </div>
          <div class="receipt-body">
            <div class="receipt-item">
              <label>Status</label>
              <span class="status-pill" [ngClass]="selectedPayment.status.toLowerCase()">{{ selectedPayment.status }}</span>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-item">
              <label>Amount Paid</label>
              <div class="receipt-amount">₹{{ selectedPayment.amount }}</div>
            </div>
            <div class="receipt-grid">
              <div class="receipt-item">
                <label>Date</label>
                <span>{{ selectedPayment.paidAt ? (selectedPayment.paidAt | date:'medium') : 'N/A' }}</span>
              </div>
              <div class="receipt-item">
                <label>Batch</label>
                <span>{{ selectedPayment.batchName }}</span>
              </div>
              <div class="receipt-item">
                <label>Billing Month</label>
                <span>{{ selectedPayment.forMonth }}</span>
              </div>
              <div class="receipt-item">
                <label>Student</label>
                <span>{{ selectedPayment.studentName }}</span>
              </div>
            </div>
            <div class="receipt-divider"></div>
            <div class="receipt-item">
              <label>Payment Reference (ID)</label>
              <code class="ref-code">{{ selectedPayment.razorpayPaymentId || 'N/A' }}</code>
            </div>
            <div class="receipt-item">
              <label>Order ID</label>
              <code class="ref-code">{{ selectedPayment.razorpayOrderId || 'N/A' }}</code>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-print" (click)="window.print()">Print Receipt</button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: #1E293B; margin: 0; }
    .subtitle { font-size: 0.875rem; color: #64748B; }
    .section-title { font-size: 1.125rem; font-weight: 700; color: #334155; }

    .due-card {
      background: white; border-radius: 1rem; padding: 1.5rem;
      display: flex; justify-content: space-between; align-items: center;
      border: 1px solid #E2E8F0; transition: all 0.3s ease;
    }
    .due-card:hover { transform: translateY(-3px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); }
    .due-info .batch-name { font-weight: 700; color: #1E293B; }
    .due-info .due-month { font-size: 0.75rem; color: #64748B; text-transform: uppercase; letter-spacing: 0.025em; }
    .due-info .amount { font-size: 1.25rem; font-weight: 800; margin-top: 0.25rem; }
    
    .btn-pay {
      background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
      color: white; border: none; padding: 0.6rem 1.25rem;
      border-radius: 0.75rem; font-weight: 700; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-pay:hover:not(:disabled) { transform: scale(1.05); filter: brightness(1.1); }
    
    /* Premium Table Styles */
    .premium-table { width: 100%; border-collapse: collapse; background: white; }
    .premium-table th { 
      text-align: left; padding: 1rem 1.5rem; background: #F8FAFC;
      color: #64748B; font-size: 0.75rem; font-weight: 700; 
      text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E2E8F0;
    }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
    .hover-row:hover { background-color: #F8FAFC; }

    .date-cell { display: flex; flex-direction: column; }
    .d-main { font-size: 0.875rem; font-weight: 600; color: #1E293B; }
    .status-pill {
      font-size: 0.7rem; font-weight: 800; padding: 0.35rem 0.75rem;
      border-radius: 100px; text-transform: uppercase; display: inline-block;
    }
    .status-pill.paid { background: #DCFCE7; color: #166534; }
    .status-pill.pending { background: #FEF3C7; color: #92400E; }
    .status-pill.failed { background: #FEE2E2; color: #991B1B; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-content {
      background: white; width: 90%; max-width: 450px; border-radius: 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden;
    }
    .modal-header {
      padding: 1.5rem; border-bottom: 1px solid #F1F5F9;
      display: flex; justify-content: space-between; align-items: center;
    }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: #64748B; cursor: pointer; }
    
    .receipt-body { padding: 2rem; }
    .receipt-item { margin-bottom: 1.25rem; }
    .receipt-item label { display: block; font-size: 0.7rem; font-weight: 700; color: #64748B; text-transform: uppercase; margin-bottom: 0.25rem; }
    .receipt-item span { font-weight: 600; color: #1E293B; }
    .receipt-amount { font-size: 2.5rem; font-weight: 800; color: #4F46E5; }
    .receipt-divider { height: 1px; background: #F1F5F9; margin: 1.5rem 0; border-style: dashed; border-width: 1px 0 0 0; }
    .receipt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .ref-code { background: #F8FAFC; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.8rem; color: #475569; display: block; border: 1px solid #E2E8F0; }
    
    .modal-footer { padding: 1.5rem; background: #F8FAFC; text-align: center; }
    .btn-print { 
      background: white; border: 1px solid #E2E8F0; padding: 0.5rem 1.5rem; 
      border-radius: 0.75rem; font-weight: 600; color: #475569; cursor: pointer;
    }
    .btn-print:hover { background: #F1F5F9; }

    .grid { display: grid; }
    .gap-6 { gap: 1.5rem; }
    @media (min-width: 768px) { .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); } }
  `]
})
export class StudentPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  myBatches: Batch[] = [];
  isProcessing = false;
  selectedPayment: any = null;
  window = window;

  get currentMonth() {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
  }

  get currentMonthName() {
    return new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  }

  get pendingBatches() {
    // Current month identifier
    const targetMonth = this.currentMonth;

    // Find batches that don't have a successful payment for this month
    return this.myBatches.filter(batch => {
      const hasPaid = this.payments.some(p =>
        p.batchName === batch.name &&
        (p.forMonth.includes(targetMonth) || p.forMonth === this.currentMonthName) &&
        p.status === 'PAID'
      );
      return !hasPaid;
    });
  }

  constructor(
    private paymentService: PaymentService, 
    private batchService: BatchService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadPayments();
    this.batchService.getMyBatches().subscribe(b => this.myBatches = b);
  }

  loadPayments() {
    this.paymentService.getStudentPayments().subscribe(p => this.payments = p);
  }

  payForBatch(batch: Batch) {
    this.isProcessing = true;
    this.paymentService.createOrder(batch.id!, this.currentMonth + '-01').subscribe({
      next: (order) => this.openRazorpay(order),
      error: (err) => {
        alert(err.error?.message || 'Error creating payment order');
        this.isProcessing = false;
      }
    });
  }

  openRazorpay(order: Payment) {
    const currency = (order as any).currency || 'INR';
    const options = {
      key: environment.razorpayKey,
      amount: order.amount * (currency === 'INR' ? 100 : 100), // Razorpay always needs smallest unit
      currency: currency,
      name: 'TuitionHub',
      description: 'Fee Payment - ' + order.forMonth,
      order_id: order.razorpayOrderId,
      handler: (response: any) => {
        this.verifyPayment(order.id, response);
      },
      prefill: {
        name: order.studentName,
      },
      theme: {
        color: '#4F46E5'
      }
    };

    if (environment.production) {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        this.toast.error('Payment Failed! ' + response.error.description);
        this.paymentService.notifyFailure(order.id).subscribe(() => {
          this.loadPayments();
        });
        this.isProcessing = false;
      });
      rzp.open();
    } else {
      // In Dev mode, we can still simulate or use test keys
      console.log('Production mode is OFF. Simulating payment for dev.');
      setTimeout(() => {
        this.verifyPayment(order.id, {
          razorpay_order_id: order.razorpayOrderId,
          razorpay_payment_id: 'pay_dev_mock_' + Date.now(),
          razorpay_signature: 'dev_mock_sig'
        });
      }, 1000);
    }
  }

  verifyPayment(paymentId: number, rzpData: any) {
    this.paymentService.verifyPayment({
      paymentId,
      razorpayOrderId: rzpData.razorpay_order_id,
      razorpayPaymentId: rzpData.razorpay_payment_id,
      razorpaySignature: rzpData.razorpay_signature || 'mock'
    }).subscribe({
      next: () => {
        alert('Payment Successful!');
        this.loadPayments();
        this.isProcessing = false;
      },
      error: () => {
        // Since backend strictly verifies signature, mock will fail in backend unless we mock backend too.
        // For this UI demo, we will just reload to see status (it might be failed)
        alert('Payment verification failed (Mock mode). Check backend logs.');
        this.loadPayments();
        this.isProcessing = false;
      }
    });
  }
}
