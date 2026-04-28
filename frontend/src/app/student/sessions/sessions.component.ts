import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { PaymentService } from '../../shared/services/payment.service';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="sessions-container animate-slide">
        <header class="header">
          <h1>My Classes</h1>
          <p>Upcoming and active 1-on-1 tutoring sessions</p>
        </header>

        <div class="sessions-list">
          <div class="session-card animate-fade" *ngFor="let session of sessions">
            <div class="class-card-header">
              <div class="subject-icon-box">
                <span class="icon">{{ session.batch?.subject?.icon || '📚' }}</span>
              </div>
              <div class="class-details">
                <span class="badge">1-on-1 Class</span>
                <h3>{{ session.batch?.subject?.name || 'Tutoring Session' }}</h3>
                <p class="instructor">with <strong>{{ session.teacher.name }}</strong></p>
                <div class="schedule-info">
                  <span>📅 {{ session.startTime | date:'EEEE, MMM dd' }}</span>
                  <span>🕒 {{ session.startTime | date:'shortTime' }} - {{ session.endTime | date:'shortTime' }}</span>
                </div>
              </div>
            </div>

            <div class="action-section">
              <div class="action-buttons">
                <button class="join-meet-btn" (click)="joinMeet(session)">📹 Join Meet</button>
                <button class="material-btn" (click)="viewMaterial(session)">📚 Study Material</button>
              </div>
              <p class="status-hint">Manage fees in <strong>Payments</strong> section</p>
            </div>
          </div>

          <div *ngIf="sessions.length === 0" class="empty-state glass">
            <span class="icon">📭</span>
            <p>No active classes found. Check your schedule or payments.</p>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .sessions-container { padding: 1.5rem; }
    .header h1 { font-size: 2.25rem; font-weight: 800; color: #1e293b; margin: 0; }
    .header p { color: #64748b; margin: 0.5rem 0 2.5rem 0; font-size: 1.1rem; }

    .sessions-list { display: flex; flex-direction: column; gap: 1.5rem; }
    .session-card {
      background: white; border-radius: 28px; padding: 2rem;
      display: flex; justify-content: space-between; align-items: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.04); border: 1px solid #f1f5f9;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative; overflow: hidden;
    }
    .session-card::before { content: ''; position: absolute; top: 0; left: 0; width: 6px; height: 100%; background: #6366f1; }
    .session-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,0.08); }

    .class-card-header { display: flex; gap: 1.5rem; align-items: flex-start; }
    .subject-icon-box { width: 75px; height: 75px; background: #f8fafc; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; border: 2px solid #e2e8f0; }
    
    .class-details .badge { background: #e0e7ff; color: #4338ca; font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 99px; text-transform: uppercase; letter-spacing: 0.05em; }
    .class-details h3 { margin: 0.6rem 0 0.3rem 0; font-size: 1.6rem; font-weight: 800; color: #1e293b; }
    .class-details .instructor { color: #64748b; font-size: 1rem; margin: 0; }
    .class-details .instructor strong { color: #1e293b; }
    
    .schedule-info { display: flex; gap: 1.2rem; margin-top: 1rem; color: #94a3b8; font-size: 0.9rem; font-weight: 600; }

    .action-section { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
    .action-buttons { display: flex; gap: 0.75rem; }
    
    .join-meet-btn { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2); }
    .join-meet-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4); }
    
    .material-btn { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; border: none; padding: 0.8rem 1.6rem; border-radius: 14px; font-weight: 800; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.2); }
    .material-btn:hover { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4); }

    .status-hint { font-size: 0.8rem; color: #94a3b8; font-weight: 600; }
    .empty-state { padding: 4rem; text-align: center; border-radius: 30px; border: 2px dashed #e2e8f0; }
    .empty-state .icon { font-size: 3.5rem; display: block; margin-bottom: 1rem; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class SessionsComponent implements OnInit {
  sessions: any[] = [];

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.paymentService.getStudentSessions(user.userId).subscribe(s => {
        this.sessions = s.filter((session: any) => session.status !== 'COMPLETED');
      });
    }
  }

  joinMeet(session: any) {
    if (session.batch?.liveClassLink) {
      window.open(session.batch.liveClassLink, '_blank');
    } else {
      this.toastService.info('Meeting link will be shared by mentor soon.');
    }
  }

  viewMaterial(session: any) {
    alert('Opening Study Materials for ' + (session.batch?.subject?.name || 'Class'));
  }
}
