import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { Payment } from '../../shared/models/models';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Financial Records</h1>
          <p class="subtitle text-secondary">Monitor platform-wide transactions and revenue flows.</p>
        </div>
        <div class="header-actions">
          <div class="search-group">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search student or reference..." 
                [(ngModel)]="searchQuery"
                (input)="filterPayments()"
              >
            </div>
            <div class="filter-box">
              <select [(ngModel)]="selectedStatus" (change)="filterPayments()">
                <option value="">All Statuses</option>
                <option value="PAID">✅ Paid</option>
                <option value="PENDING">⏳ Pending</option>
                <option value="FAILED">❌ Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="revenue-summary animate-fade" *ngIf="filteredPayments.length > 0">
        <div class="rev-card">
          <span class="rev-label">Total Volume (Filtered)</span>
          <span class="rev-value">{{ authService.getCurrencySymbolFor(filteredPayments[0].currency) }}{{ totalFilteredRevenue }}</span>
        </div>
      </div>

      <div class="card glass p-0 overflow-hidden animate-fade">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Transaction Date</th>
              <th>Student Name</th>
              <th>Course / Batch</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Gateway Ref</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPayments" class="animate-fade">
              <td>
                <div class="date-cell">
                  <div class="d-main">{{ p.paidAt ? (p.paidAt | date:'mediumDate') : 'N/A' }}</div>
                  <div class="d-sub">{{ p.paidAt ? (p.paidAt | date:'shortTime') : '' }}</div>
                </div>
              </td>
              <td>
                <div class="student-cell">
                  <div class="s-name">{{ p.studentName }}</div>
                </div>
              </td>
              <td>
                <div class="batch-cell">
                  <div class="b-name">{{ p.batchName }}</div>
                  <div class="b-month">Period: {{ p.forMonth }}</div>
                </div>
              </td>
              <td>
                <div class="amount-cell">{{ getCurrencySymbol(p.currency) }}{{ p.amount }}</div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="{
                  'paid': p.status === 'PAID',
                  'pending': p.status === 'PENDING',
                  'failed': p.status === 'FAILED'
                }">{{ p.status }}</span>
              </td>
              <td>
                <div class="ref-cell">
                  <code>{{ p.razorpayPaymentId || '---' }}</code>
                </div>
              </td>
              <td>
                <div class="action-group">
                  <button class="btn-action primary" (click)="selectedPayment = p">
                    View Details
                  </button>
                  <button 
                    *ngIf="p.status !== 'PAID'"
                    class="btn-action success"
                    (click)="manualMarkAsPaid(p)"
                  >
                    Confirm Paid
                  </button>
                </div>
              </td>
            </tr>

            <!-- Payment Details Modal -->
            <div class="modal-overlay" *ngIf="selectedPayment" (click)="selectedPayment = null">
              <div class="modal-content glass animate-pop" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <div class="header-left">
                    <div class="modal-icon">💸</div>
                    <div>
                      <h3>Transaction Details</h3>
                      <p>Reference: {{ selectedPayment.razorpayPaymentId || 'N/A' }}</p>
                    </div>
                  </div>
                  <button class="close-btn" (click)="selectedPayment = null">×</button>
                </div>

                <div class="modal-body">
                  <div class="detail-grid">
                    <div class="detail-section">
                      <h4 class="section-title">Order Information</h4>
                      <div class="info-row">
                        <span class="label">Student</span>
                        <span class="value">{{ selectedPayment.studentName }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Batch / Course</span>
                        <span class="value">{{ selectedPayment.batchName }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">For Month</span>
                        <span class="value">{{ selectedPayment.forMonth }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Status</span>
                        <span class="status-pill" [ngClass]="selectedPayment.status.toLowerCase()">{{ selectedPayment.status }}</span>
                      </div>
                      <!-- Failure Reason -->
                      <div class="error-notice mt-4" *ngIf="selectedPayment.status === 'FAILED'">
                        <h5 class="text-danger mb-1">Failure Reason</h5>
                        <p class="text-xs m-0"><strong>Code:</strong> {{ selectedPayment.errorCode || 'N/A' }}</p>
                        <p class="text-xs m-0"><strong>Message:</strong> {{ selectedPayment.errorDescription || 'User cancelled or gateway issue' }}</p>
                      </div>
                    </div>

                    <div class="detail-section">
                      <h4 class="section-title">Payment Information</h4>
                      <div class="info-row">
                        <span class="label">Method</span>
                        <span class="value text-capitalize">{{ selectedPayment.paymentMethod || '---' }}</span>
                      </div>
                      <div class="info-row" *ngIf="selectedPayment.bankName">
                        <span class="label">Bank / Network</span>
                        <span class="value">{{ selectedPayment.bankName }} {{ selectedPayment.cardNetwork || '' }}</span>
                      </div>
                      <div class="info-row" *ngIf="selectedPayment.upiVpa">
                        <span class="label">UPI ID</span>
                        <span class="value">{{ selectedPayment.upiVpa }}</span>
                      </div>
                      <div class="info-row" *ngIf="selectedPayment.walletName">
                        <span class="label">Wallet</span>
                        <span class="value">{{ selectedPayment.walletName }}</span>
                      </div>
                      <div class="info-row">
                        <span class="label">Payer Contact</span>
                        <span class="value">{{ selectedPayment.payerEmail || '---' }}</span>
                      </div>
                    </div>

                    <div class="detail-section total-section">
                      <h4 class="section-title">Financial Breakdown</h4>
                      <div class="info-row">
                        <span class="label">Gross Amount</span>
                        <span class="value">{{ getCurrencySymbol(selectedPayment.currency) }}{{ selectedPayment.amount }}</span>
                      </div>
                      <div class="info-row text-danger" *ngIf="selectedPayment.gatewayFee">
                        <span class="label">Gateway Fee</span>
                        <span class="value">- {{ getCurrencySymbol(selectedPayment.currency) }}{{ selectedPayment.gatewayFee }}</span>
                      </div>
                      <div class="info-row text-danger" *ngIf="selectedPayment.gatewayTax">
                        <span class="label">GST / Tax</span>
                        <span class="value">- {{ getCurrencySymbol(selectedPayment.currency) }}{{ selectedPayment.gatewayTax }}</span>
                      </div>
                      <div class="info-row grand-total mt-4 pt-4 border-t">
                        <span class="label">Net Revenue</span>
                        <span class="value success-text">
                          {{ getCurrencySymbol(selectedPayment.currency) }}{{ (selectedPayment.amount - (selectedPayment.gatewayFee || 0) - (selectedPayment.gatewayTax || 0)) | number:'1.2-2' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <tr *ngIf="filteredPayments.length === 0">
              <td colspan="6">
                <div class="empty-table-state">
                  <div class="icon">💳</div>
                  <p>No financial records found matching your search.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { font-size: 0.875rem; margin-top: 0.25rem; }
    
    .search-group { display: flex; gap: 1rem; align-items: center; }
    .search-box { position: relative; width: 280px; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
    .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 12px; border: 1px solid var(--border-color); background: white; font-size: 0.875rem; transition: var(--transition); }
    .search-box input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); outline: none; }

    .filter-box select { padding: 0.75rem 1.5rem; border-radius: 12px; border: 1px solid var(--border-color); background: white; font-size: 0.875rem; font-weight: 600; color: var(--text-primary); cursor: pointer; }

    .revenue-summary { margin-bottom: 2rem; }
    .rev-card { background: white; border: 1px solid #E2E8F0; padding: 1rem 1.5rem; border-radius: 14px; display: flex; flex-direction: column; width: fit-content; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .rev-label { font-size: 0.75rem; font-weight: 600; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    .rev-value { font-size: 1.5rem; font-weight: 800; color: #1E293B; }

    .card.glass { background: white !important; backdrop-filter: none !important; border: 1px solid #E2E8F0 !important; }

    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .premium-table th { padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #F1F5F9; vertical-align: middle; }
    .premium-table tr:hover { background: #F8FAFC; }

    .date-cell { display: flex; flex-direction: column; }
    .d-main { font-weight: 700; color: var(--text-primary); font-size: 0.875rem; }
    .d-sub { font-size: 0.75rem; color: var(--text-secondary); }

    .student-cell .s-name { font-weight: 700; color: var(--text-primary); }

    .batch-cell .b-name { font-weight: 600; color: var(--primary-color); font-size: 0.875rem; }
    .batch-cell .b-month { font-size: 0.75rem; color: var(--text-secondary); }

    .amount-cell { font-weight: 800; color: var(--text-primary); font-size: 1rem; }

    .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 100px; display: inline-block; text-transform: uppercase; }
    .status-pill.paid { background: #DCFCE7; color: #166534; }
    .status-pill.pending { background: #FEF3C7; color: #92400E; }
    .status-pill.failed { background: #FEE2E2; color: #991B1B; }

    .ref-cell code { background: #F1F5F9; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); }

    .empty-table-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
    .empty-table-state .icon { font-size: 3rem; margin-bottom: 1rem; }

    .btn-action {
      padding: 0.5rem 0.75rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-action.primary { background: #EEF2FF; color: #6366F1; }
    .btn-action.primary:hover { background: #6366F1; color: white; }
    .btn-action.success { background: #DCFCE7; color: #166534; }
    .btn-action.success:hover { background: #166534; color: white; }
    
    .action-group { display: flex; gap: 0.5rem; }
    .text-capitalize { text-transform: capitalize; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-content { background: white; width: 100%; max-width: 800px; max-height: 90vh; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow-y: auto; position: relative; }
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .modal-icon { width: 44px; height: 44px; background: #EEF2FF; color: #6366F1; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0; }
    .modal-header p { font-size: 0.75rem; color: #64748B; margin: 4px 0 0; font-family: monospace; }
    .close-btn { background: #F1F5F9; border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 1.25rem; color: #64748B; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: #E2E8F0; color: #0F172A; transform: rotate(90deg); }

    .modal-body { padding: 2rem; }
    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
    .detail-section { display: flex; flex-direction: column; gap: 1rem; }
    .total-section { grid-column: span 2; background: #F8FAFC; padding: 1.5rem; border-radius: 16px; margin-top: 1rem; }
    .section-title { font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; border-bottom: 1px solid #E2E8F0; padding-bottom: 0.5rem; }
    
    .info-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.875rem; }
    .info-row .label { color: #64748B; font-weight: 500; }
    .info-row .value { color: #0F172A; font-weight: 700; }
    
    .grand-total { font-size: 1.125rem; }
    .success-text { color: #10B981; }
    .text-danger { color: #EF4444; }
    .border-t { border-top: 1px solid #E2E8F0; }
    .pt-4 { padding-top: 1rem; }
    
    @media (max-width: 640px) {
      .detail-grid { grid-template-columns: 1fr; }
      .total-section { grid-column: span 1; }
    }
  `]
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchQuery = '';
  selectedStatus = '';
  selectedPayment: Payment | null = null;

  constructor(
    private paymentService: PaymentService,
    private toast: ToastService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentService.getAllPayments().subscribe(p => {
      this.payments = p;
      this.filterPayments();
    });
  }

  filterPayments() {
    this.filteredPayments = this.payments.filter(p => {
      const matchesSearch = p.studentName.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                           p.razorpayPaymentId?.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus = !this.selectedStatus || p.status === this.selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }

  get totalFilteredRevenue() {
    return this.filteredPayments
      .filter(p => p.status === 'PAID')
      .reduce((acc, p) => acc + p.amount, 0);
  }

  manualMarkAsPaid(payment: Payment) {
    const remark = prompt('Enter payment remark (optional):', 'Cash payment received');
    if (remark === null) return; // Cancelled

    this.paymentService.markAsPaid(payment.id, remark).subscribe({
      next: () => {
        this.toast.success(`Payment #${payment.id} marked as PAID`);
        this.loadPayments();
      },
      error: (err: any) => {
        this.toast.error(err.error?.message || 'Update failed');
      }
    });
  }
}
