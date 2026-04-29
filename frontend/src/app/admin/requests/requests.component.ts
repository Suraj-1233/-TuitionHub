import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterLink],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Tuition Requests</h1>
          <p class="subtitle">Match students with the right mentors</p>
        </div>
      </div>

      <div class="requests-container animate-fade">
        <div *ngIf="requests.length === 0" class="empty-state glass">
          <div class="empty-icon">🎉</div>
          <h3>All caught up!</h3>
          <p>No pending assignment requests from students.</p>
        </div>

        <div class="request-grid">
          <div *ngFor="let req of requests" class="request-card glass animate-slide">
            <div class="card-badge">PENDING</div>
            <div class="student-profile">
              <div class="avatar">{{ req.student?.name?.charAt(0) }}</div>
              <div class="details">
                <h4>{{ req.student?.name }}</h4>
                <span>Grade: {{ req.student?.studentClass }}</span>
              </div>
            </div>

            <div class="request-content">
              <div class="info-row">
                <span class="label">Subjects:</span>
                <span class="value highlight">📚 {{ req.subjects }}</span>
              </div>
              <div class="info-row">
                <span class="label">Preferred Time:</span>
                <span class="value">🕒 {{ req.preferredTimings }}</span>
              </div>
              <div class="info-row" *ngIf="req.additionalNotes">
                <span class="label">Notes:</span>
                <span class="value note">"{{ req.additionalNotes }}"</span>
              </div>
            </div>

            <div class="card-footer">
              <button class="btn btn-primary btn-block" (click)="openAssignModal(req)">
                🎯 Assign Mentor Now
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Assign Modal -->
      <div class="modal-overlay" *ngIf="showAssignModal">
        <div class="modal-card glass animate-slide">
          <div class="modal-header">
            <h3>Assign Batch for {{ selectedRequest?.student?.name }}</h3>
            <button class="close-btn" (click)="showAssignModal = false">×</button>
          </div>
          <div class="modal-body">
            <p class="mb-4 text-sm text-secondary">
              Requested: <strong>{{ selectedRequest?.subjects }}</strong>
            </p>
            
            <div class="form-group">
              <label class="form-label">Select Mentor (Filtered by Subject)</label>
              <select [(ngModel)]="selectedTeacherId" class="modal-input">
                <option [value]="null" disabled>Select a Teacher</option>
                <option *ngFor="let t of getFilteredTeachers()" [value]="t.id">
                  {{ t.name }} - {{ t.subject }} ({{ t.qualification }})
                </option>
              </select>
            </div>

            <div class="form-row mt-4">
              <div class="form-group flex-1">
                <label class="form-label">Negotiated Monthly Fees (INR)</label>
                <input type="number" [(ngModel)]="negotiatedFees" class="modal-input" placeholder="e.g. 1500">
              </div>
              <div class="form-group flex-1">
                <label class="form-label">Learning Mode</label>
                <select [(ngModel)]="isIndividual" class="modal-input">
                  <option [ngValue]="true">1-on-1 (Individual)</option>
                  <option [ngValue]="false">Batch (Group)</option>
                </select>
              </div>
            </div>

            <div *ngIf="getFilteredTeachers().length === 0" class="error-text mt-2">
              ⚠️ No teachers found for this subject.
            </div>

            <button class="btn btn-primary btn-block mt-4" 
                    [disabled]="!selectedTeacherId || isAssigning"
                    (click)="confirmAssignment()">
              {{ isAssigning ? 'Assigning...' : 'Assign Teacher' }}
            </button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2.5rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .request-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 2rem; }
    .request-card { padding: 1.5rem; border-radius: 20px; position: relative; border: 1px solid var(--border-color); }
    
    .card-badge { position: absolute; top: 1.5rem; right: 1.5rem; background: #FEF3C7; color: #92400E; font-size: 0.65rem; font-weight: 800; padding: 4px 10px; border-radius: 100px; }

    .student-profile { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
    .avatar { width: 50px; height: 50px; border-radius: 15px; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.25rem; }
    .details h4 { margin: 0; color: var(--text-primary); }
    .details span { font-size: 0.8rem; color: var(--text-secondary); }

    .request-content { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
    .info-row { display: flex; flex-direction: column; gap: 2px; }
    .label { font-size: 0.7rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; }
    .value { font-size: 0.95rem; color: var(--text-primary); font-weight: 600; }
    .value.highlight { color: var(--primary-color); }
    .value.note { font-style: italic; color: var(--text-secondary); font-size: 0.85rem; }

    .empty-state { text-align: center; padding: 5rem; border-radius: 24px; }
    .empty-icon { font-size: 4rem; margin-bottom: 1.5rem; }

    /* Modal Styles */
    .modal-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(8px);
    }
    .modal-card { width: 95%; max-width: 500px; background: white; border-radius: 24px; padding: 2rem; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .modal-input { width: 100%; padding: 0.85rem; border-radius: 12px; border: 1.5px solid #E2E8F0; }
    .form-row { display: flex; gap: 1rem; }
    .flex-1 { flex: 1; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary); }
  `]
})
export class AdminRequestsComponent implements OnInit {
  requests: any[] = [];
  allTeachers: any[] = [];
  showAssignModal = false;
  selectedRequest: any = null;
  selectedTeacherId: number | null = null;
  negotiatedFees: number = 0;
  isIndividual: boolean = true;
  isAssigning = false;

  constructor(
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAssignmentRequests().subscribe(r => this.requests = r);
    this.adminService.getAllTeachers().subscribe(t => this.allTeachers = t);
  }

  openAssignModal(req: any) {
    this.selectedRequest = req;
    this.showAssignModal = true;
    this.selectedTeacherId = null;
    this.negotiatedFees = req.negotiatedFees || 0;
    this.isIndividual = req.isIndividual !== undefined ? req.isIndividual : true;
  }

  getFilteredTeachers() {
    if (!this.selectedRequest) return [];
    const subj = this.selectedRequest.subjects;
    if (subj === 'Other' || !subj) return this.allTeachers;
    
    return this.allTeachers.filter(t => 
      t.subject?.toLowerCase().includes(subj.toLowerCase())
    );
  }

  confirmAssignment() {
    if (!this.selectedTeacherId || !this.selectedRequest) return;
    
    this.isAssigning = true;
    // Step 1: Update details (fees and mode)
    this.adminService.updateRequestDetails(this.selectedRequest.id, this.negotiatedFees, this.isIndividual).subscribe({
      next: () => {
        // Step 2: Assign teacher
        this.adminService.assignTeacherToRequest(this.selectedRequest.id, this.selectedTeacherId!).subscribe({
          next: (res) => {
            this.toast.success(res.message);
            this.showAssignModal = false;
            this.isAssigning = false;
            this.loadData();
          },
          error: (err) => {
            this.toast.error(err.error?.message || 'Assignment failed');
            this.isAssigning = false;
          }
        });
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Failed to update request details');
        this.isAssigning = false;
      }
    });
  }
}
