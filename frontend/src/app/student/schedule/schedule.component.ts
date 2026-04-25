import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { TimezoneService } from '../../shared/services/timezone.service';
import { Batch } from '../../shared/models/models';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Class Timetable 📅</h1>
          <p class="subtitle text-secondary">All times are shown in your local timezone: <strong>{{ userTz }}</strong></p>
        </div>
      </div>

      <div class="card glass p-0 overflow-hidden animate-fade">
        <div class="schedule-container">
          <div class="schedule-grid">
            <!-- Days Header -->
            <div class="schedule-header corner">Time ({{ userTzShort }})</div>
            <div class="schedule-header" *ngFor="let day of days">{{ day }}</div>

            <!-- Time Slots -->
            <ng-container *ngFor="let time of timeSlots">
              <div class="schedule-time">{{ time }}</div>
              <div class="schedule-cell" *ngFor="let day of days">
                <ng-container *ngFor="let batch of getBatchesForSlot(day, time)">
                  <div class="batch-card" [style.borderLeftColor]="getColor(batch.subject)" (click)="joinClass(batch)">
                    <div class="b-subject">{{ batch.subject }}</div>
                    <div class="b-name">{{ batch.name }}</div>
                    <div class="b-time">
                      {{ convertTime(batch.timingFrom, batch.timezone) }}
                    </div>
                    <div class="live-indicator" *ngIf="isLive(batch)">
                      <span class="dot"></span> LIVE
                    </div>
                  </div>
                </ng-container>
              </div>
            </ng-container>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .schedule-container { overflow-x: auto; background: white; }
    .schedule-grid {
      display: grid;
      grid-template-columns: 100px repeat(7, minmax(140px, 1fr));
      min-width: 1000px;
    }
    .schedule-header {
      background-color: #F8FAFC;
      padding: 1.25rem 1rem;
      font-weight: 700;
      text-align: center;
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      color: var(--text-secondary);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .schedule-header.corner { background: #F1F5F9; color: var(--primary-color); position: sticky; left: 0; z-index: 10; }
    
    .schedule-time {
      background-color: #F8FAFC;
      padding: 1.5rem 1rem;
      text-align: right;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-secondary);
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      left: 0;
      z-index: 5;
    }
    .schedule-cell {
      padding: 0.75rem;
      border-right: 1px solid var(--border-color);
      border-bottom: 1px solid var(--border-color);
      min-height: 120px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      background-image: radial-gradient(var(--border-color) 0.5px, transparent 0.5px);
      background-size: 20px 20px;
    }
    
    .batch-card {
      background: white;
      border-radius: 12px;
      padding: 0.875rem;
      border: 1px solid var(--border-color);
      border-left-width: 4px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-sm);
    }
    .batch-card:hover { transform: scale(1.02); box-shadow: var(--shadow-md); border-color: var(--primary-color); }
    
    .b-subject { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.25rem; }
    .b-name { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem; line-height: 1.2; }
    .b-time { font-size: 0.75rem; font-weight: 600; color: var(--primary-color); }

    .live-indicator { margin-top: 0.5rem; font-size: 0.65rem; font-weight: 800; color: #EF4444; display: flex; align-items: center; gap: 0.35rem; }
    .live-indicator .dot { width: 6px; height: 6px; background: #EF4444; border-radius: 50%; animation: pulse 1.5s infinite; }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.5; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class StudentScheduleComponent implements OnInit {
  days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  timeSlots = ['04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'];
  myBatches: Batch[] = [];

  colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  subjectColorMap: Record<string, string> = {};

  constructor(private batchService: BatchService, private tzService: TimezoneService) {}

  get userTz() { return this.tzService.getUserTimezoneLabel(); }
  get userTzShort() { return this.userTz.split('/')[1]?.replace('_', ' ') || 'Local'; }

  ngOnInit() {
    this.batchService.getMyBatches().subscribe(b => {
      this.myBatches = b;
      let colorIdx = 0;
      b.forEach(batch => {
        if (!this.subjectColorMap[batch.subject]) {
          this.subjectColorMap[batch.subject] = this.colors[colorIdx % this.colors.length];
          colorIdx++;
        }
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

  joinClass(batch: Batch) {
    if (batch.liveClassLink) {
      window.open(batch.liveClassLink, '_blank');
    }
  }

  getColor(subject: string) {
    return this.subjectColorMap[subject] || 'var(--primary-color)';
  }

  getBatchesForSlot(day: string, timeSlot: string): Batch[] {
    return this.myBatches.filter(b => {
      if (!b.days || !b.timingFrom) return false;
      const matchDay = b.days.includes(day);
      // Rough match for demo (e.g. 06:30 PM will show in 06:00 PM slot)
      const slotHour = timeSlot.substring(0, 2);
      const matchTime = b.timingFrom.startsWith(slotHour) && b.timingFrom.endsWith(timeSlot.substring(6));
      return matchDay && matchTime;
    });
  }
}
