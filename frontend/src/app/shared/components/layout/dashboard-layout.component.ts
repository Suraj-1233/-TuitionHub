import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="logo-box">TH</div>
          <div class="brand-text">
            <span class="brand-name">TuitionHub</span>
            <span class="brand-tag">Premium Learning</span>
          </div>
        </div>

        <div class="status-indicator animate-hand">
          <div class="status-dot"></div>
          <span class="status-text">System Online</span>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of navItems">
            <a [routerLink]="item.path" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-clocks glass-hand">
          <div class="clock-item">
            <span class="clock-label">Local Time</span>
            <span class="clock-value">{{ localTime }}</span>
          </div>
          <div class="clock-divider"></div>
          <div class="clock-item" *ngIf="userTimezone !== 'Asia/Kolkata'">
            <span class="clock-label">India (IST)</span>
            <span class="clock-value">{{ indiaTime }}</span>
          </div>
        </div>

        <div class="referral-box-hand" *ngIf="referralCode">
          <div class="ref-header">
            <span class="ref-icon">🎁</span>
            <span class="ref-title">Invite & Earn</span>
          </div>
          <div class="ref-body">
            <code class="ref-code">{{ referralCode }}</code>
            <button class="ref-copy" (click)="copyReferral()">Copy</button>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="user-card-hand">
            <div class="user-avatar-hand">{{ userInitial }}</div>
            <div class="user-meta-hand">
              <span class="u-name">{{ userName }}</span>
              <span class="u-role">{{ role.toLowerCase() }}</span>
            </div>
            <button class="logout-mini" (click)="logout()" title="Logout">🚪</button>
          </div>
        </div>
      </aside>

      <main class="main-content animate-fade">
        <div class="content-container">
          <ng-content></ng-content>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-layout { display: flex; min-height: 100vh; background: var(--bg-app); }
    .sidebar {
      width: 280px;
      padding: 2.5rem 1.5rem;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      background: white;
      border-right: 1px solid var(--border);
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 3rem;
      padding-left: 0.5rem;
    }
    .logo-box {
      background: var(--primary);
      color: white;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-family: var(--font-heading);
      box-shadow: 0 8px 16px rgba(67, 56, 202, 0.2);
    }
    .brand-text { display: flex; flex-direction: column; }
    .brand-name { font-size: 1.25rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .brand-tag { font-size: 0.65rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
    
    .status-indicator { display: flex; align-items: center; gap: 0.5rem; background: #F0FDF4; padding: 0.5rem 1rem; border-radius: 100px; width: fit-content; margin-bottom: 2.5rem; border: 1px solid #DCFCE7; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2); }
    .status-text { font-size: 0.7rem; font-weight: 800; color: #065F46; text-transform: uppercase; }

    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.75rem; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 0.875rem 1.25rem;
      border-radius: 1rem;
      color: var(--text-muted);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9375rem;
      transition: var(--transition-smooth);
    }
    .nav-link:hover { background: var(--primary-light); color: var(--primary); transform: translateX(5px); }
    .nav-link.active {
      background: var(--primary);
      color: white;
      box-shadow: 0 10px 20px -5px rgba(67, 56, 202, 0.4);
    }
    .nav-icon { font-size: 1.25rem; }
 
    .sidebar-clocks {
      margin: 2rem 0;
      padding: 1.25rem;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-around;
      text-align: center;
    }
    .clock-item { display: flex; flex-direction: column; gap: 2px; }
    .clock-label { font-size: 0.6rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .clock-value { font-size: 1.125rem; font-weight: 800; color: var(--primary); font-family: var(--font-heading); }
    .clock-divider { width: 1px; height: 30px; background: var(--border); }

    .referral-box-hand {
      margin-bottom: 2rem;
      padding: 1.25rem;
      background: var(--primary-light);
      border-radius: 1.25rem;
      border: 1px dashed var(--primary);
    }
    .ref-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .ref-icon { font-size: 1.25rem; }
    .ref-title { font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase; }
    .ref-body { display: flex; align-items: center; justify-content: space-between; background: white; padding: 0.5rem 0.75rem; border-radius: 10px; }
    .ref-code { font-family: 'Monaco', monospace; font-weight: 800; color: var(--text-main); font-size: 0.875rem; }
    .ref-copy { background: var(--primary); color: white; border: none; padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }

    .sidebar-footer { padding-top: 1.5rem; border-top: 1px solid var(--border); }
    .user-card-hand {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #F8FAFC;
      padding: 0.75rem;
      border-radius: 1.25rem;
      position: relative;
    }
    .user-avatar-hand {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 1.25rem;
      box-shadow: 0 4px 10px rgba(67, 56, 202, 0.2);
    }
    .user-meta-hand { display: flex; flex-direction: column; }
    .u-name { font-size: 0.875rem; font-weight: 800; color: var(--text-main); }
    .u-role { font-size: 0.65rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .logout-mini { position: absolute; right: 0.75rem; background: none; border: none; cursor: pointer; font-size: 1.25rem; opacity: 0.5; transition: var(--transition-smooth); }
    .logout-mini:hover { opacity: 1; transform: scale(1.1); }

    .main-content { flex: 1; padding: 3rem 4rem; overflow-y: auto; }
    .content-container { max-width: 1200px; margin: 0 auto; }
  `]
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  @Input() role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT' | 'SUPER_ADMIN' | 'ORG_ADMIN' = 'STUDENT';
  
  navItems: any[] = [];
  userName = 'User';
  userEmail = '';
  userInitial = 'U';
  localTime = '';
  indiaTime = '';
  userTimezone = '';
  userTimezoneName = '';
  referralCode = '';
  private timer: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.calculateNavItems();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
      this.referralCode = user.referralCode || '';
    }
    this.userTimezone = this.authService.getUserTimezone();
    this.userTimezoneName = this.userTimezone.replace(/_/g, ' ').split('/').pop() || this.userTimezone;
    this.updateClocks();
    this.timer = setInterval(() => this.updateClocks(), 60000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private updateClocks() {
    const now = new Date();
    
    // User's local time
    this.localTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // India Time (IST)
    this.indiaTime = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyReferral() {
    navigator.clipboard.writeText(this.referralCode);
    alert('Referral code copied to clipboard!');
  }

  private calculateNavItems() {
    if (this.role === 'STUDENT') {
      this.navItems = [
        { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/student/sessions', label: 'My Classes', icon: '📚' },
        { path: '/student/schedule', label: 'Schedule', icon: '⏰' }
      ];
    } else if (this.role === 'PARENT') {
      this.navItems = [
        { path: '/parent/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/parent/children', label: 'My Children', icon: '👨‍👩‍👧‍👦' },
        { path: '/parent/payments', label: 'Payments', icon: '💳' },
        { path: '/parent/wallet', label: 'Wallet', icon: '👛' }
      ];
    } else if (this.role === 'TEACHER') {
      this.navItems = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/teacher/classes', label: 'My Classes', icon: '📚' },
        { path: '/teacher/students', label: 'Students', icon: '👨‍🎓' },
        { path: '/teacher/profile', label: 'Profile Settings', icon: '⚙️' },
      ];
    } else {
      this.navItems = [
        { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
        { path: '/admin/requests', label: 'Tuition Requests', icon: '📩' },
        { path: '/admin/teachers', label: 'Teacher Directory', icon: '👨‍🏫' },
        { path: '/admin/students', label: 'Student Directory', icon: '👨‍🎓' },
        { path: '/admin/parents', label: 'Parent Directory', icon: '👨‍👩‍👧‍👦' },
        { path: '/admin/wallet', label: 'Wallet Management', icon: '👛' },
        { path: '/admin/payments', label: 'Global Revenue', icon: '💳' },
      ];
    }
  }

  logout() {
    this.authService.logout();
  }
}
