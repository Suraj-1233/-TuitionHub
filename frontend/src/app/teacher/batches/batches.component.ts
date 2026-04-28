import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch as Class } from '../../shared/models/models';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher-classes',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterLink],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">My Teaching Classes 📚</h1>
          <p class="subtitle text-secondary">Manage your 1-on-1 active classes and live sessions.</p>
        </div>
        <button class="btn-setup" (click)="showCreateModal = true">+ Setup New Class</button>
      </div>

      <div class="classes-grid">
        <div class="class-card glass animate-fade" *ngFor="let cls of myClasses">
          <div class="card-header">
            <div class="subject-info">
              <span class="subject-tag">{{ cls.subject }}</span>
              <h3 class="class-name">{{ cls.name }}</h3>
            </div>
            <span class="status-pill" [class.active]="cls.isActive">
              {{ cls.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <p class="description">{{ cls.description || 'No description provided' }}</p>

          <div class="details-grid">
            <div class="detail-item">
              <span class="label">Target Class</span>
              <span class="value">{{ cls.targetClass }}</span>
            </div>
            <div class="detail-item">
              <span class="label">Assigned Student</span>
              <span class="value">{{ cls.students && cls.students.length > 0 ? cls.students[0].name : 'Pending' }}</span>
            </div>
            <div class="detail-item full">
              <span class="label">Weekly Schedule</span>
              <span class="value">🕒 {{ cls.timingFrom }} - {{ cls.timingTo }} | 📅 {{ cls.days }}</span>
            </div>
          </div>

          <div class="actions-section">
            <button class="btn-manage" [routerLink]="['/teacher/classes', cls.id]">
              📖 Manage Content
            </button>
            
            <div class="live-control">
              <div class="link-bar">
                <input type="text" [value]="cls.liveClassLink || ''" #linkInput placeholder="Meet link...">
                <button (click)="updateLink(cls.id, linkInput.value)">Save</button>
              </div>
              <button class="btn-generate" (click)="generateMeetLink(cls)">
                📹 Auto-Generate Link
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Setup Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal" (click)="showCreateModal = false">
        <div class="modal-content glass animate-pop" (click)="$event.stopPropagation()">
          <h2>Setup New 1-on-1 Class</h2>
          <form (ngSubmit)="createClass()" #createForm="ngForm">
            <div class="form-group">
              <label>Class Name</label>
              <input type="text" [(ngModel)]="newClass.name" name="name" required placeholder="e.g. Advanced Physics 101">
            </div>
            
            <div class="row">
              <div class="form-group">
                <label>Subject</label>
                <input type="text" [(ngModel)]="newClass.subject" name="subject" required>
              </div>
              <div class="form-group">
                <label>Grade/Class</label>
                <input type="text" [(ngModel)]="newClass.targetClass" name="targetClass" required>
              </div>
            </div>

            <div class="row">
              <div class="form-group">
                <label>From Time</label>
                <input type="time" [(ngModel)]="newClass.timingFrom" name="timingFrom" required>
              </div>
              <div class="form-group">
                <label>To Time</label>
                <input type="time" [(ngModel)]="newClass.timingTo" name="timingTo" required>
              </div>
            </div>

            <div class="form-group">
              <label>Working Days (e.g. MON, WED, FRI)</label>
              <input type="text" [(ngModel)]="newClass.days" name="days" required>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-cancel" (click)="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn-submit" [disabled]="createForm.invalid">Create Class</button>
            </div>
          </form>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; padding: 1.5rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: #1e293b; margin: 0; }
    .btn-setup { background: #6366f1; color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; }
    .btn-setup:hover { background: #4f46e5; transform: translateY(-2px); }

    .classes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2rem; padding: 0 1.5rem; }
    .class-card { background: white; border-radius: 28px; padding: 2rem; border: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 1.5rem; transition: 0.3s; }
    .class-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.06); }
    
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .subject-tag { background: #e0e7ff; color: #4338ca; font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 99px; text-transform: uppercase; }
    .class-name { margin: 0.5rem 0 0 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
    
    .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.25rem 0.75rem; border-radius: 99px; background: #fee2e2; color: #991b1b; }
    .status-pill.active { background: #dcfce7; color: #166534; }

    .description { color: #64748b; font-size: 0.95rem; line-height: 1.5; margin: 0; }
    
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; background: #f8fafc; padding: 1.25rem; border-radius: 20px; }
    .detail-item .label { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
    .detail-item .value { font-weight: 700; color: #334155; }
    .detail-item.full { grid-column: 1 / -1; }

    .actions-section { display: flex; flex-direction: column; gap: 1rem; border-top: 1px solid #f1f5f9; padding-top: 1.5rem; }
    .btn-manage { background: #f1f5f9; color: #475569; border: none; padding: 0.75rem; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s; width: 100%; }
    .btn-manage:hover { background: #e2e8f0; }

    .live-control { display: flex; flex-direction: column; gap: 0.75rem; }
    .link-bar { display: flex; gap: 0.5rem; }
    .link-bar input { flex: 1; padding: 0.6rem; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 0.85rem; }
    .link-bar button { background: #1e293b; color: white; border: none; padding: 0 1rem; border-radius: 10px; font-weight: 600; cursor: pointer; }
    .btn-generate { background: none; border: 1.5px dashed #6366f1; color: #6366f1; padding: 0.6rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; cursor: pointer; }

    /* Modal */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal-content { background: white; padding: 2.5rem; border-radius: 28px; width: 500px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #64748b; margin-bottom: 0.5rem; }
    .form-group input { width: 100%; padding: 0.8rem; border: 2px solid #f1f5f9; border-radius: 12px; font-family: inherit; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
    .btn-cancel { background: none; border: none; color: #94a3b8; font-weight: 700; cursor: pointer; }
    .btn-submit { background: #6366f1; color: white; border: none; padding: 0.8rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; }
  `]
})
export class TeacherClassesComponent implements OnInit {
  myClasses: Class[] = [];
  showCreateModal = false;
  newClass: any = { name: '', subject: '', targetClass: '', timingFrom: '', timingTo: '', days: '' };

  constructor(private batchService: BatchService, private toast: ToastService) {}

  ngOnInit() {
    this.loadClasses();
  }

  loadClasses() {
    this.batchService.getTeacherBatches().subscribe((c: Class[]) => this.myClasses = c);
  }

  createClass() {
    this.batchService.createBatch(this.newClass).subscribe({
      next: () => {
        this.toast.success('1-on-1 Class setup successfully');
        this.showCreateModal = false;
        this.loadClasses();
        this.newClass = { name: '', subject: '', targetClass: '', timingFrom: '', timingTo: '', days: '' };
      },
      error: (err) => this.toast.error(err.error?.message || 'Error setting up class')
    });
  }

  generateMeetLink(cls: Class) {
    const roomName = `TuitionHub-${cls.id}-${Math.random().toString(36).substring(7)}`;
    const link = `https://meet.jit.si/${roomName}`;
    this.updateLink(cls.id, link);
  }

  updateLink(classId: number, link: string) {
    if(!link) return;
    this.batchService.updateLiveLink(classId, { liveClassLink: link, liveClassPlatform: 'JITSI' }).subscribe({
      next: () => {
        this.toast.success('Live link updated');
        this.loadClasses();
      },
      error: () => this.toast.error('Error updating link')
    });
  }
}
