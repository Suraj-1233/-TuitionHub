import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="wallet-container">
        <header class="wallet-header">
          <div>
            <h1>My Wallet</h1>
            <p>Manage your credits and transaction history</p>
          </div>
          <button class="topup-btn" (click)="showTopupModal = true">
            <span class="icon">➕</span> Add Money
          </button>
        </header>

        <div class="wallet-grid">
          <div class="balance-card">
            <div class="card-content">
              <span class="label">Total Balance</span>
              <h2 class="amount">{{ currencySymbol }} {{ wallet?.balance?.toFixed(2) }}</h2>
              <div class="balance-details">
                <div class="detail-item">
                  <span class="detail-label">Real Money</span>
                  <span class="detail-value">{{ currencySymbol }} {{ (wallet?.balance - wallet?.promoBalance).toFixed(2) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Promo Credits</span>
                  <span class="detail-value">{{ currencySymbol }} {{ wallet?.promoBalance?.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="referral-stats">
            <div class="card-content">
              <span class="label">Referral Earnings</span>
              <h2 class="amount">{{ currencySymbol }} {{ totalReferralEarnings.toFixed(2) }}</h2>
              
              <div class="referral-code-section">
                <span class="code-label">Your Referral Code</span>
                <div class="code-display">
                  <code>{{ referralCode }}</code>
                  <button class="copy-icon-btn" (click)="copyReferralCode()" title="Copy Code">📋</button>
                </div>
                <p class="hint">Share this code to earn rewards!</p>
              </div>
            </div>
          </div>
        </div>

        <section class="transactions-section">
          <h3>Transaction History</h3>
          <div class="table-container">
            <table class="transaction-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tx of transactions">
                  <td>{{ tx.createdAt | date:'medium' }}</td>
                  <td>{{ tx.description }}</td>
                  <td>
                    <span class="badge" [ngClass]="tx.source.toLowerCase()">
                      {{ tx.source }}
                    </span>
                  </td>
                  <td>
                    <span [ngClass]="tx.type === 'CREDIT' ? 'text-success' : 'text-danger'">
                      {{ tx.type }}
                    </span>
                  </td>
                  <td class="font-bold">
                    {{ tx.type === 'CREDIT' ? '+' : '-' }}{{ currencySymbol }} {{ tx.amount.toFixed(2) }}
                  </td>
                </tr>
                <tr *ngIf="transactions.length === 0">
                  <td colspan="5" class="empty-state">No transactions found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Topup Modal -->
        <div class="modal-overlay" *ngIf="showTopupModal" (click)="showTopupModal = false">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <h2>Add Money to Wallet</h2>
            <p>Enter the amount you want to add</p>
            <div class="input-group">
              <span class="prefix">{{ currencySymbol }}</span>
              <input type="number" [(ngModel)]="topupAmount" placeholder="0.00" [disabled]="loading">
            </div>
            
            <!-- Stripe Element Container -->
            <div id="stripe-container" [hidden]="!showStripeElement" class="mt-4 p-4 border rounded-xl bg-slate-50" style="margin-top: 1rem; padding: 1rem; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
              <label style="font-size: 0.875rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; display: block;">Card Details</label>
              <div id="card-element"></div>
              <div id="card-errors" role="alert" style="color: #ef4444; font-size: 0.75rem; margin-top: 0.5rem;"></div>
            </div>

            <div class="modal-actions">
              <button class="secondary-btn" (click)="showTopupModal = false">Cancel</button>
              <button class="primary-btn" (click)="handleTopup()" [disabled]="loading">
                <span *ngIf="!loading">Proceed to Pay</span>
                <span *ngIf="loading">Processing...</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .wallet-container { animation: fadeIn 0.5s ease-out; }
    .wallet-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .wallet-header h1 { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    .wallet-header p { color: #64748b; margin: 0.25rem 0 0 0; }

    .topup-btn {
      background: var(--gradient-primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
      transition: all 0.3s ease;
    }
    .topup-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }

    .wallet-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 3rem; }

    .balance-card, .referral-stats {
      background: white;
      border-radius: 24px;
      padding: 2rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
      border: 1px solid #f1f5f9;
      position: relative;
      overflow: hidden;
    }
    .balance-card::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      background: rgba(99, 102, 241, 0.1);
      border-radius: 50%;
    }

    .label { font-size: 0.875rem; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .amount { font-size: 2.5rem; font-weight: 800; color: #1e293b; margin: 0.5rem 0 1.5rem 0; }
    
    .balance-details { display: flex; gap: 2rem; border-top: 1px solid #f1f5f9; pt: 1.5rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
    .detail-label { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
    .detail-value { font-size: 1.125rem; font-weight: 700; color: #334155; }

    .transactions-section h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; }
    
    .table-container { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
    .transaction-table { width: 100%; border-collapse: collapse; }
    .transaction-table th { background: #f8fafc; padding: 1rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .transaction-table td { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; color: #475569; font-size: 0.875rem; }
    
    .badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-size: 0.7rem; font-weight: 700; }
    .badge.topup { background: #ecfdf5; color: #059669; }
    .badge.referral { background: #eff6ff; color: #2563eb; }
    .badge.promo { background: #faf5ff; color: #9333ea; }
    .badge.session_payment { background: #fff7ed; color: #ea580c; }
    
    .text-success { color: #10b981; font-weight: 600; }
    .text-danger { color: #ef4444; font-weight: 600; }
    .font-bold { font-weight: 700; color: #1e293b; }
    .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }

    .referral-code-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
    .code-label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; display: block; }
    .code-display { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .code-display code { font-family: 'Monaco', monospace; font-size: 1.1rem; font-weight: 800; color: #6366f1; }
    .copy-icon-btn { background: none; border: none; cursor: pointer; font-size: 1.2rem; transition: transform 0.2s; }
    .copy-icon-btn:hover { transform: scale(1.2); }
    .hint { font-size: 0.75rem; color: #94a3b8; margin-top: 0.5rem; }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
    .modal-content { background: white; padding: 2.5rem; border-radius: 24px; width: 400px; box-shadow: 0 20px 50px rgba(0,0,0,0.2); animation: slideUp 0.3s ease-out; }
    .modal-content h2 { margin-top: 0; }
    .input-group { display: flex; align-items: center; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 0.75rem 1rem; margin: 1.5rem 0; transition: border-color 0.3s; }
    .input-group:focus-within { border-color: #6366f1; }
    .input-group input { border: none; background: transparent; width: 100%; font-size: 1.25rem; font-weight: 700; color: #1e293b; outline: none; }
    .prefix { font-weight: 700; color: #64748b; margin-right: 0.5rem; }
    
    .modal-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .primary-btn { flex: 1; background: #6366f1; color: white; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .secondary-btn { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class WalletComponent implements OnInit {
  wallet: any;
  transactions: any[] = [];
  totalReferralEarnings = 0;
  referralCode = '';
  showTopupModal = false;
  topupAmount: number = 0;
  currencySymbol = '';
  loading = false;
  showStripeElement = false;
  stripe: any;
  card: any;
  originalHandleTopup: any;

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.currencySymbol = this.authService.getCurrencySymbol();
    this.authService.fetchExchangeRate().subscribe(() => {
      this.loadData();
    });
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.referralCode = user.referralCode || '';
      
      // If code is missing (e.g. legacy user), fetch it from server
      if (!this.referralCode) {
        this.authService.getProfile().subscribe(p => {
          this.referralCode = p.referralCode || '';
        });
      }

      this.paymentService.getWalletBalance(user.userId).subscribe(w => this.wallet = w);
      this.paymentService.getWalletTransactions(user.userId).subscribe(txs => {
        this.transactions = txs;
        this.totalReferralEarnings = txs
          .filter(t => t.source === 'REFERRAL' && t.type === 'CREDIT')
          .reduce((sum, t) => sum + t.amount, 0);
      });
    }
  }

  copyReferralCode() {
    navigator.clipboard.writeText(this.referralCode);
    this.toastService.success('Referral code copied!');
  }

  handleTopup() {
    if (this.topupAmount <= 0) {
      this.toastService.error('Please enter a valid amount');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.loading = true;
    // 1. Create order on backend
    this.paymentService.createTopupOrder(this.topupAmount).subscribe({
      next: (order: any) => {
        if (order.gateway === 'RAZORPAY') {
          this.openRazorpayCheckout(order, user);
        } else if (order.gateway === 'STRIPE') {
          this.initStripe(order);
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Failed to create topup order');
      }
    });
  }

  initStripe(order: any) {
    this.showStripeElement = true;
    this.loading = false; 
    
    // Use a timeout to ensure DOM is ready
    setTimeout(() => {
      if (!this.stripe) {
        // @ts-ignore
        this.stripe = Stripe(order.stripePublishableKey);
        const elements = this.stripe.elements();
        this.card = elements.create('card');
        this.card.mount('#card-element');
      }
      
      this.toastService.info('Please enter your card details below');
      
      // Store original method and swap
      if (!this.originalHandleTopup) {
        this.originalHandleTopup = this.handleTopup;
      }
      this.handleTopup = () => this.confirmStripePayment(order);
    }, 100);
  }

  confirmStripePayment(order: any) {
    this.loading = true;
    this.stripe.confirmCardPayment(order.stripeClientSecret, {
      payment_method: {
        card: this.card,
        billing_details: {
          name: this.authService.getCurrentUser()?.name,
          email: this.authService.getCurrentUser()?.email
        }
      }
    }).then((result: any) => {
      if (result.error) {
        this.toastService.error(result.error.message);
        this.loading = false;
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          this.verifyStripePayment(result.paymentIntent, order.id);
        }
      }
    });
  }

  verifyStripePayment(intent: any, paymentId: number) {
    this.toastService.success('Payment Succeeded!');
    setTimeout(() => window.location.reload(), 1500);
  }

  openRazorpayCheckout(order: any, user: any) {
    // Fetch key first
    this.authService.getProfile().subscribe(() => { // Dummy call to ensure auth
      this.paymentService.getRazorpayKey().subscribe((config: any) => {
        const options = {
          key: config.keyId,
          amount: order.amount * 100,
          currency: this.authService.getCurrency(),
          name: 'TuitionHub Wallet',
          description: 'Wallet Topup',
          order_id: order.razorpayOrderId,
          handler: (response: any) => {
            this.verifyTopup(response, order.id);
          },
          prefill: {
            name: user.name,
            email: user.email
          },
          theme: {
            color: '#6366f1'
          },
          modal: {
            ondismiss: () => {
              this.toastService.info('Topup cancelled');
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    });
  }

  verifyTopup(razorpayResponse: any, paymentId: number) {
    const verifyRequest = {
      paymentId: paymentId,
      razorpayOrderId: razorpayResponse.razorpay_order_id,
      razorpayPaymentId: razorpayResponse.razorpay_payment_id,
      razorpaySignature: razorpayResponse.razorpay_signature
    };

    this.paymentService.verifyTopup(verifyRequest).subscribe({
      next: () => {
        this.toastService.success('Wallet updated successfully!');
        this.showTopupModal = false;
        this.topupAmount = 0;
        this.loadData();
      },
      error: () => this.toastService.error('Verification failed. Please contact support.')
    });
  }
}
