import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { Payment } from '../../shared/models/models';

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
          <span class="rev-value">₹{{ totalFilteredRevenue }}</span>
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
                <div class="amount-cell">₹{{ p.amount }}</div>
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
            </tr>
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
    .rev-card { background: #F8FAFC; border: 1px solid var(--border-color); padding: 1rem 1.5rem; border-radius: 14px; display: flex; flex-direction: column; width: fit-content; }
    .rev-label { font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
    .rev-value { font-size: 1.5rem; font-weight: 800; color: var(--secondary-color); }

    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .premium-table th { padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; background: #F8FAFC; border-bottom: 1px solid var(--border-color); }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
    .premium-table tr:hover { background: rgba(248, 250, 252, 0.5); }

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
  `]
})
export class AdminPaymentsComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];
  searchQuery = '';
  selectedStatus = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit() {
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
}
