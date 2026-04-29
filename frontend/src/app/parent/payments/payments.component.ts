import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { ParentService } from '../../shared/services/parent.service';
import { ToastService } from '../../shared/services/toast.service';

declare var Razorpay: any;

@Component({
  selector: 'app-parent-payments',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Payment History</h1>
          <p class="subtitle">Securely manage and view tuition fee records</p>
        </div>
      </div>

      <div class="table-container glass animate-fade">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student</th>
              <th>Batch / Description</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments">
              <td>{{ p.createdAt | date:'shortDate' }}</td>
              <td><strong>{{ p.studentName }}</strong></td>
              <td>
                <div class="batch-info">
                  <span class="batch-name">{{ p.batchName || p.paymentMethod || 'Tuition Fee' }}</span>
                  <span class="month-label" *ngIf="p.forMonth">{{ p.forMonth | date:'MMMM yyyy' }}</span>
                </div>
              </td>
              <td class="font-bold">₹{{ p.amount }}</td>
              <td>
                <span class="badge" [class]="p.status.toLowerCase()">{{ p.status }}</span>
              </td>
              <td>
                <button *ngIf="p.status === 'PENDING'" class="btn btn-primary btn-sm" (click)="onPay(p)">Pay Now</button>
                <span *ngIf="p.status === 'PAID'" class="text-success">✔ Paid</span>
              </td>
            </tr>
            <tr *ngIf="payments.length === 0">
              <td colspan="6" class="text-center py-8">No payment records found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .font-bold { font-weight: 700; }
    .batch-info { display: flex; flex-direction: column; }
    .batch-name { font-weight: 600; color: var(--text-primary); }
    .month-label { font-size: 0.75rem; color: var(--text-secondary); }

    .badge { padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
    .badge.paid { background: #DCFCE7; color: #166534; }
    .badge.pending { background: #FEF3C7; color: #92400E; }
    .badge.failed { background: #FEE2E2; color: #991B1B; }
    
    .text-success { color: #10B981; font-weight: 700; font-size: 0.85rem; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
  `]
})
export class ParentPaymentsComponent implements OnInit {
  payments: any[] = [];
  isLoading = false;

  constructor(private parentService: ParentService, private toast: ToastService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.parentService.getPayments().subscribe(res => this.payments = res);
  }

  onPay(payment: any) {
    this.isLoading = true;
    this.parentService.getRazorpayKey().subscribe(keyRes => {
      this.initRazorpay(payment, keyRes.keyId);
    });
  }

  initRazorpay(payment: any, keyId: string) {
    const options = {
      key: keyId,
      amount: payment.amount * 100,
      currency: payment.currency || 'INR',
      name: 'TuitionHub',
      description: `Fees for ${payment.studentName} - ${payment.batchName}`,
      order_id: payment.razorpayOrderId,
      handler: (response: any) => {
        this.verifyPayment(payment.id, response);
      },
      prefill: {
        name: payment.studentName,
        email: ''
      },
      theme: {
        color: '#6366F1'
      },
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
        this.loadPayments();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('Payment verification failed');
        this.isLoading = false;
      }
    });
  }
}
