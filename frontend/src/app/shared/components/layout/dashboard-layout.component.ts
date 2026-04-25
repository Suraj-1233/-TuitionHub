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
      <aside class="sidebar glass">
        <div class="sidebar-brand">
          <div class="logo-box">TH</div>
          <span class="brand-name">TuitionHub</span>
        </div>

        <div class="sidebar-clocks glass">
          <div class="clock-item">
            <span class="clock-label">📍 Your Time ({{ userTimezoneName }})</span>
            <span class="clock-value">{{ localTime }}</span>
          </div>
          <div class="clock-item" *ngIf="userTimezone !== 'Asia/Kolkata'">
            <span class="clock-label">🇮🇳 India (IST)</span>
            <span class="clock-value">{{ indiaTime }}</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of navItems">
            <a [routerLink]="item.path" routerLinkActive="active" class="nav-link">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label">{{ item.label }}</span>
            </a>
          </ng-container>
        </nav>

        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">{{ userInitial }}</div>
            <div class="user-details">
              <span class="user-name">{{ userName }}</span>
              <span class="user-email">{{ userEmail }}</span>
              <span class="user-role">{{ role }}</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">
            <span class="icon">🚪</span> Logout
          </button>
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
    .dashboard-layout { display: flex; min-height: 100vh; background: var(--bg-color); }
    .sidebar {
      width: 280px;
      padding: 2rem 1.5rem;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid var(--border-color);
    }
    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 2.5rem;
      padding: 0 0.5rem;
    }
    .logo-box {
      background: var(--gradient-primary);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      box-shadow: var(--shadow-md);
    }
    .brand-name { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
    
    .sidebar-nav { flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem 1rem;
      border-radius: 0.75rem;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: var(--transition);
    }
    .nav-link:hover { background: rgba(99, 102, 241, 0.05); color: var(--primary-color); }
    .nav-link.active {
      background: var(--gradient-primary);
      color: white;
      box-shadow: var(--shadow-md);
    }
    .nav-icon { font-size: 1.25rem; }

    .sidebar-clocks {
      margin-bottom: 2rem;
      padding: 1rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.4);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .clock-item { display: flex; flex-direction: column; }
    .clock-label { font-size: 0.65rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
    .clock-value { font-size: 1.1rem; font-weight: 800; color: var(--primary-color); }

    .sidebar-footer { margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); }
    .user-profile { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem; }
    .user-avatar {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: #F1F5F9;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.125rem;
      border: 2px solid white;
      box-shadow: var(--shadow-sm);
    }
    .user-details { display: flex; flex-direction: column; }
    .user-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .user-email { font-size: 0.7rem; color: var(--text-secondary); width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .user-role { font-size: 0.75rem; color: var(--text-secondary); text-transform: capitalize; }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid rgba(239, 68, 68, 0.1);
      background: transparent;
      color: var(--danger-color);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
    }
    .logout-btn:hover { background: rgba(239, 68, 68, 0.05); border-color: var(--danger-color); }

    .main-content { flex: 1; padding: 2rem 3rem; overflow-y: auto; }
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
  private timer: any;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.calculateNavItems();
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || 'User';
      this.userEmail = user.email || '';
      this.userInitial = this.userName.charAt(0).toUpperCase();
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

  private calculateNavItems() {
    if (this.role === 'STUDENT') {
      this.navItems = [
        { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/student/mentors', label: 'My Mentors', icon: '👩‍🏫' },
        { path: '/student/schedule', label: 'Schedule', icon: '📅' },
        { path: '/student/payments', label: 'Payments', icon: '💳' },
      ];
    } else if (this.role === 'TEACHER') {
      this.navItems = [
        { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/teacher/classes', label: 'My Classes', icon: '📚' },
        { path: '/teacher/students', label: 'Students', icon: '👨‍🎓' },
        { path: '/teacher/profile', label: 'Profile Settings', icon: '⚙️' },
      ];
    } else if (this.role === 'PARENT') {
      this.navItems = [
        { path: '/parent/dashboard', label: 'Overview', icon: '📊' },
        { path: '/parent/children', label: 'Manage Children', icon: '👨‍👩‍👧' },
        { path: '/parent/payments', label: 'Fees & Invoices', icon: '💳' },
      ];
    } else {
      this.navItems = [
        { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
        { path: '/admin/requests', label: 'Tuition Requests', icon: '📩' },
        { path: '/admin/teachers', label: 'Teacher Directory', icon: '👨‍🏫' },
        { path: '/admin/students', label: 'Student Directory', icon: '👨‍🎓' },
        { path: '/admin/payments', label: 'Global Revenue', icon: '💳' },
      ];
    }
  }

  logout() {
    this.authService.logout();
  }
}
