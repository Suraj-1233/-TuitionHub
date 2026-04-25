import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch } from '../../shared/models/models';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher-batches',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterLink],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="page-header flex justify-between items-center">
        <h1 class="page-title">My Teaching Classes</h1>
        <button class="btn btn-primary" (click)="showCreateModal = true">+ Setup New Class</button>
      </div>

      <div class="batches-grid">
        <div class="card" *ngFor="let batch of myBatches">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-semibold text-lg">{{ batch.name }}</h3>
            <span class="badge" [ngClass]="batch.isActive ? 'badge-success' : 'badge-danger'">
              {{ batch.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <p class="text-sm text-secondary mb-4">{{ batch.description || 'No description' }}</p>

          <div class="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <span class="text-secondary block">Subject</span>
              <span class="font-medium">{{ batch.subject }}</span>
            </div>
            <div>
              <span class="text-secondary block">Class</span>
              <span class="font-medium">{{ batch.targetClass }}</span>
            </div>
            <div>
              <span class="text-secondary block">Student</span>
              <span class="font-medium">{{ batch.students && batch.students.length > 0 ? batch.students[0].name : 'Not Assigned' }}</span>
            </div>
          </div>

          <div class="bg-light p-3 rounded mb-4 text-sm">
            <div>🕒 {{ batch.timingFrom }} - {{ batch.timingTo }}</div>
            <div>📅 {{ batch.days }}</div>
          </div>

          <div class="live-class-section">
            <h4 class="section-subtitle">Actions</h4>
            <div class="flex gap-2 mb-4">
              <button class="btn btn-primary flex-1" [routerLink]="['/teacher/classes', batch.id]">
                📚 Manage Content
              </button>
            </div>
            
            <h4 class="section-subtitle">Live Class Control</h4>
            <div class="input-group">
              <input type="url" class="form-control form-control-sm" 
                     [value]="batch.liveClassLink || ''" #linkInput placeholder="Paste or generate link...">
              <button class="btn btn-primary btn-sm" (click)="updateLink(batch.id, linkInput.value, 'ZOOM')">
                Save
              </button>
            </div>
            <div class="action-row">
              <button class="btn-generate" (click)="generateMeetLink(batch)">
                <span class="icon">📹</span> Generate Live Link
              </button>
              <a *ngIf="batch.liveClassLink" [href]="batch.liveClassLink" target="_blank" class="join-link">
                Join Now <span class="arrow">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Create Modal -->
      <div class="modal-overlay" *ngIf="showCreateModal">
        <div class="modal-content card">
          <h2 class="text-xl font-semibold mb-4">Setup New Class</h2>
          <form (ngSubmit)="createBatch()" #createForm="ngForm">
            <div class="form-group">
              <label class="form-label">Class Name</label>
              <input type="text" class="form-control" [(ngModel)]="newBatch.name" name="name" required placeholder="e.g. Maths for Class 10">
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Subject</label>
                <input type="text" class="form-control" [(ngModel)]="newBatch.subject" name="subject" required>
              </div>
              <div class="form-group">
                <label class="form-label">Target Class</label>
                <input type="text" class="form-control" [(ngModel)]="newBatch.targetClass" name="targetClass" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group" style="display: none;">
                <label class="form-label">Max Students</label>
                <input type="number" class="form-control" [(ngModel)]="newBatch.maxStudents" name="maxStudents" required min="1">
              </div>
              <div class="form-group">
                <label class="form-label">Monthly Fees (₹)</label>
                <input type="number" class="form-control" [(ngModel)]="newBatch.monthlyFees" name="monthlyFees" required min="0">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">From Time</label>
                <input type="time" class="form-control" [(ngModel)]="newBatch.timingFrom" name="timingFrom" required>
              </div>
              <div class="form-group">
                <label class="form-label">To Time</label>
                <input type="time" class="form-control" [(ngModel)]="newBatch.timingTo" name="timingTo" required>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Days (e.g. MON,WED,FRI)</label>
              <input type="text" class="form-control" [(ngModel)]="newBatch.days" name="days" required>
            </div>

            <div class="flex gap-2 justify-end mt-6">
              <button type="button" class="btn btn-outline" (click)="showCreateModal = false">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="createForm.invalid">Create Class</button>
            </div>
          </form>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .batches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); display: grid; }
    .gap-4 { gap: 1rem; }
    .bg-light { background-color: var(--bg-color); }
    .rounded { border-radius: var(--border-radius); }
    .p-3 { padding: 0.75rem; }
    
    .section-subtitle { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.75rem; letter-spacing: 0.05em; }
    
    .live-class-section { border-top: 1px solid var(--border-color); padding-top: 1.25rem; margin-top: auto; }
    
    .input-group { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .input-group .form-control { border-top-right-radius: 0; border-bottom-right-radius: 0; }
    
    .action-row { display: flex; justify-content: space-between; align-items: center; }
    
    .btn-generate { background: rgba(79, 70, 229, 0.05); border: 1px dashed var(--primary-color); color: var(--primary-color); padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.75rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
    .btn-generate:hover { background: rgba(79, 70, 229, 0.1); transform: translateY(-1px); }
    
    .join-link { font-size: 0.75rem; font-weight: 600; color: var(--secondary-color); text-decoration: none; display: flex; align-items: center; gap: 0.25rem; }
    .join-link:hover { text-decoration: underline; }
    .join-link .arrow { transition: transform 0.2s; }
    .join-link:hover .arrow { transform: translate(2px, -2px); }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 50; }
    .modal-content { width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease-out; }
    
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `]
})
export class TeacherBatchesComponent implements OnInit {
  myBatches: Batch[] = [];
  showCreateModal = false;

  newBatch: any = {
    name: '', subject: '', targetClass: '', maxStudents: 20,
    monthlyFees: 1000, timingFrom: '', timingTo: '', days: ''
  };

  constructor(private batchService: BatchService, private toast: ToastService) {}

  ngOnInit() {
    this.loadBatches();
  }

  loadBatches() {
    this.batchService.getTeacherBatches().subscribe(b => this.myBatches = b);
  }

  createBatch() {
    // Format times for display if they are just HH:MM (simple mapping for demo)
    let payload = {...this.newBatch};
    
    this.batchService.createBatch(payload).subscribe({
      next: () => {
        this.toast.success('Class created successfully');
        this.showCreateModal = false;
        this.loadBatches();
        // Reset form
        this.newBatch = {
          name: '', subject: '', targetClass: '', maxStudents: 50,
          monthlyFees: 1000, timingFrom: '', timingTo: '', days: ''
        };
      },
      error: (err) => this.toast.error(err.error?.message || 'Error creating class')
    });
  }

  generateMeetLink(batch: Batch) {
    const randomStr = (len: number) => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < len; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };
    // Using Jitsi Meet because it allows instant working links without API keys
    const roomName = `TuitionHub-${batch.id}-${randomStr(6)}`;
    const link = `https://meet.jit.si/${roomName}`;
    this.updateLink(batch.id, link, 'GOOGLE_MEET'); // Still labeling as Meet/Live in UI
  }

  updateLink(batchId: number, link: string, platform: string = 'ZOOM') {
    if(!link) return;
    this.batchService.updateLiveLink(batchId, { liveClassLink: link, liveClassPlatform: platform }).subscribe({
      next: () => {
        this.toast.success('Live link updated');
        this.loadBatches();
      },
      error: (err) => this.toast.error('Error updating link')
    });
  }
}
