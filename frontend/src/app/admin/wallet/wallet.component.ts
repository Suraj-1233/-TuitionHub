import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-admin-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="admin-wallet">
        <header>
          <h1>Wallet Management</h1>
          <p>Monitor transactions and adjust user credits</p>
        </header>

        <section class="controls">
          <div class="card">
            <h3>Adjust User Wallet</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Select Student</label>
                <select [(ngModel)]="selectedUserId">
                  <option [value]="null">-- Select Student --</option>
                  <option *ngFor="let s of students" [value]="s.id">{{ s.name }} ({{ s.email }})</option>
                </select>
              </div>
              <div class="form-group">
                <label>Amount</label>
                <input type="number" [(ngModel)]="adjAmount" placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Action</label>
                <select [(ngModel)]="isCredit">
                  <option [ngValue]="true">Add Credit (Promo)</option>
                  <option [ngValue]="false">Deduct Balance</option>
                </select>
              </div>
              <div class="form-group">
                <label>Description</label>
                <input type="text" [(ngModel)]="adjDescription" placeholder="e.g. Promotional Bonus">
              </div>
            </div>
            <button class="apply-btn" (click)="applyAdjustment()">Apply Adjustment</button>
          </div>
        </section>

        <section class="logs">
          <h3>Global Wallet Transactions</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User ID</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of allTransactions">
                  <td>{{ tx.createdAt | date:'short' }}</td>
                  <td>{{ tx.wallet.user.name }}</td>
                  <td><span class="badge">{{ tx.source }}</span></td>
                  <td [class.text-success]="tx.type === 'CREDIT'" [class.text-danger]="tx.type === 'DEBIT'">
                    {{ tx.type }}
                  </td>
                  <td>{{ tx.amount }}</td>
                  <td>{{ tx.description }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .admin-wallet { animation: fadeIn 0.5s ease-out; }
    header h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    header p { color: #64748b; margin-bottom: 2rem; }

    .card { background: white; padding: 2rem; border-radius: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); margin-bottom: 3rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
    .form-group select, .form-group input { padding: 0.75rem; border-radius: 10px; border: 1px solid #e2e8f0; outline: none; }
    .form-group select:focus, .form-group input:focus { border-color: #6366f1; }

    .apply-btn { background: #6366f1; color: white; border: none; padding: 0.75rem 2rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
    
    .table-container { background: white; border-radius: 20px; overflow: hidden; border: 1px solid #f1f5f9; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.75rem; color: #64748b; }
    td { padding: 1rem; border-top: 1px solid #f1f5f9; font-size: 0.875rem; }
    
    .badge { background: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; }
    .text-success { color: #10b981; }
    .text-danger { color: #ef4444; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AdminWalletComponent implements OnInit {
  students: any[] = [];
  allTransactions: any[] = [];
  
  selectedUserId: number | null = null;
  adjAmount: number = 0;
  isCredit: boolean = true;
  adjDescription: string = '';

  constructor(
    private adminService: AdminService,
    private paymentService: PaymentService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAllStudents().subscribe(s => this.students = s);
    // Need a method to get all transactions in admin service
    this.adminService.getAllWalletTransactions().subscribe(txs => this.allTransactions = txs);
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
        this.loadData();
      },
      error: () => this.toastService.error('Adjustment failed')
    });
  }
}
