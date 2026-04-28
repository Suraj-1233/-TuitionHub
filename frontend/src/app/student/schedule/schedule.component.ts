import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { PaymentService } from '../../shared/services/payment.service';
import { TimezoneService } from '../../shared/services/timezone.service';
import { AuthService } from '../../shared/services/auth.service';
import { Batch } from '../../shared/models/models';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="schedule-wrapper animate-slide">
        <header class="header-section">
          <div>
            <h1 class="page-title">My Learning Schedule 📅</h1>
            <p class="subtitle">Your 1-on-1 scheduled tutoring sessions.</p>
          </div>
          <div class="view-toggle">
            <button [class.active]="viewMode === 'calendar'" (click)="viewMode = 'calendar'">Calendar View</button>
            <button [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">Upcoming List</button>
          </div>
        </header>

        <div class="schedule-content glass" [class.list-view]="viewMode === 'list'">
          <!-- Calendar View -->
          <div class="calendar-grid" *ngIf="viewMode === 'calendar'">
            <div class="calendar-header corner">Time</div>
            <div class="calendar-header" *ngFor="let day of days">
              <span class="day-name">{{ day }}</span>
            </div>

            <ng-container *ngFor="let slot of timeSlots">
              <div class="time-slot">{{ slot }}</div>
              <div class="calendar-cell" *ngFor="let day of days">
                <!-- Combined Items (Batches + Sessions) -->
                <div class="event-card session-item" 
                     *ngFor="let item of getItemsForSlot(day, slot)"
                     [class.confirmed]="item.isPaid || item.status === 'CONFIRMED'"
                     [style.borderLeftColor]="getColor(item.subject || 'General')"
                     (click)="handleItemClick(item)">
                  <span class="type-tag">1-on-1 Session</span>
                  <div class="title">{{ item.batch?.name || 'Tutoring Session' }}</div>
                  <div class="time">{{ convertTime(item.startTime, item.timezone) }}</div>
                  <div class="status-indicator" *ngIf="item.isSession">
                    {{ item.isPaid ? '🟢 Paid' : '🟠 Pending' }}
                  </div>
                </div>
              </div>
            </ng-container>
          </div>

          <!-- List View (Better for Mobile) -->
          <div class="list-view-container" *ngIf="viewMode === 'list'">
            <div class="list-item glass is-session" *ngFor="let item of combinedItems">
              <div class="date-side">
                <span class="month">{{ item.startTime | date:'MMM' }}</span>
                <span class="day">{{ item.startTime | date:'dd' }}</span>
              </div>
              <div class="item-main">
                <span class="type-badge">1-on-1 Session</span>
                <h3>{{ item.batch?.name || 'Tutoring Session' }}</h3>
                <p class="instructor">with {{ item.teacher?.name }}</p>
                <div class="footer-meta">
                  <span>🕒 {{ item.startTime | date:'shortTime' }}</span>
                  <span class="status" [class.paid]="item.isPaid">{{ item.isPaid ? 'Payment Confirmed' : 'Payment Pending' }}</span>
                </div>
              </div>
              <button class="join-btn" (click)="handleItemClick(item)">
                {{ item.isPaid ? 'Launch Class' : 'Pay to Join' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .schedule-wrapper { padding: 1rem; animation: fadeIn 0.5s ease-out; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    .subtitle { color: #64748b; margin-top: 0.5rem; }

    .view-toggle { background: #f1f5f9; padding: 0.25rem; border-radius: 12px; display: flex; gap: 0.25rem; }
    .view-toggle button { border: none; padding: 0.5rem 1rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; background: transparent; color: #64748b; }
    .view-toggle button.active { background: white; color: #6366f1; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

    .schedule-content { background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
    
    /* Calendar View */
    .calendar-grid { display: grid; grid-template-columns: 80px repeat(7, 1fr); min-width: 900px; }
    .calendar-header { padding: 1.5rem 1rem; background: #f8fafc; font-weight: 800; font-size: 0.75rem; color: #64748b; text-align: center; text-transform: uppercase; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; }
    .calendar-header.corner { color: #6366f1; }
    
    .time-slot { padding: 1rem; background: #f8fafc; font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-align: right; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; }
    .calendar-cell { min-height: 150px; padding: 0.5rem; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 0.5rem; background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 20px 20px; }

    .event-card { background: white; border-radius: 10px; padding: 0.75rem; border: 1px solid #e2e8f0; border-left: 4px solid #6366f1; cursor: pointer; transition: all 0.2s; position: relative; }
    .event-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .event-card.session-item { background: #fdf2f2; border-color: #fecaca; }
    .event-card.confirmed { background: #f0fdf4; border-color: #bbf7d0; }
    
    .type-tag { font-size: 0.6rem; font-weight: 800; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.25rem; display: block; }
    .event-card .title { font-size: 0.8rem; font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .event-card .time { font-size: 0.7rem; font-weight: 600; color: #6366f1; }
    .status-indicator { font-size: 0.65rem; margin-top: 0.4rem; font-weight: 700; }

    /* List View */
    .list-view-container { padding: 2rem; display: flex; flex-direction: column; gap: 1rem; max-width: 800px; margin: 0 auto; }
    .list-item { display: flex; gap: 1.5rem; padding: 1.5rem; background: #f8fafc; border-radius: 20px; align-items: center; border: 1px solid #f1f5f9; transition: all 0.2s; }
    .list-item:hover { transform: translateX(10px); background: white; border-color: #6366f1; }
    
    .date-side { display: flex; flex-direction: column; align-items: center; min-width: 60px; }
    .date-side .month { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-transform: uppercase; }
    .date-side .day { font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    
    .item-main { flex: 1; }
    .type-badge { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: #64748b; background: #e2e8f0; padding: 0.2rem 0.5rem; border-radius: 4px; }
    .item-main h3 { margin: 0.5rem 0 0.25rem 0; font-size: 1.1rem; }
    .instructor { color: #64748b; font-size: 0.875rem; margin: 0; }
    
    .footer-meta { display: flex; gap: 1.5rem; margin-top: 0.75rem; font-size: 0.8rem; font-weight: 600; }
    .status { color: #f59e0b; }
    .status.paid { color: #10b981; }
    
    .join-btn { background: #6366f1; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .join-btn:hover { background: #4f46e5; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3); }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StudentScheduleComponent implements OnInit {
  days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  timeSlots = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
  
  viewMode: 'calendar' | 'list' = 'calendar';
  combinedItems: any[] = [];

  colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  subjectColorMap: Record<string, string> = {};

  constructor(
    private paymentService: PaymentService,
    private authService: AuthService,
    private tzService: TimezoneService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Load Sessions Only
    this.paymentService.getStudentSessions(user.userId).subscribe(s => {
      this.combinedItems = s.sort((a: any, b: any) => {
        return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      });
    });
  }

  convertTime(time: string, sourceTz?: string) {
    return this.tzService.convertTime(time, sourceTz || 'Asia/Kolkata');
  }

  isLive(batch: Batch): boolean {
    // Demo logic: If within current hour slot
    const now = new Date();
    const currentHour = now.getHours();
    const currentAmPm = currentHour >= 12 ? 'PM' : 'AM';
    const displayHour = currentHour % 12 || 12;
    const currentHourStr = (displayHour < 10 ? '0' : '') + displayHour + ':00 ' + currentAmPm;
    
    return batch.timingFrom.includes(currentHourStr.substring(0, 2)) && batch.timingFrom.includes(currentAmPm);
  }

  handleItemClick(item: any) {
    if (item.isSession) {
      if (!item.isPaid) {
        // Redirect to sessions page to pay
        window.location.href = '/student/sessions';
      } else {
        alert('Launching 1-on-1 Session...');
      }
    } else {
      if (item.liveClassLink) {
        window.open(item.liveClassLink, '_blank');
      }
    }
  }

  getColor(subject: string) {
    if (!this.subjectColorMap[subject]) {
      this.subjectColorMap[subject] = this.colors[Object.keys(this.subjectColorMap).length % this.colors.length];
    }
    return this.subjectColorMap[subject];
  }

  getItemsForSlot(day: string, timeSlot: string): any[] {
    return this.combinedItems.filter(item => {
      if (!item.startTime) return false;

      // Handle Session Date/Day
      const sessionDate = new Date(item.startTime);
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      if (dayNames[sessionDate.getDay()] !== day) return false;

      // Time Match (Rough)
      const slotHour = timeSlot.substring(0, 2);
      const isPM = timeSlot.includes('PM');
      const itemTimeStr = new Date(item.startTime).toLocaleTimeString();
      return itemTimeStr.startsWith(slotHour) && itemTimeStr.includes(isPM ? 'PM' : 'AM');
    });
  }
}
