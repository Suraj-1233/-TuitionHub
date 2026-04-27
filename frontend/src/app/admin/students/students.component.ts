import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-admin-students',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <h1 class="page-title">Student Onboarding & Management</h1>
        </div>

      <div class="card glass p-0 animate-fade">
        <div class="table-responsive" style="overflow-x: auto; width: 100%;">
        <table class="premium-table">
          <thead>
            <tr>
               <th>Student</th>
               <th>Academic Info & Timezone</th>
               <th>Batches Enrolled <span class="count-label">(count)</span></th>
               <th>Status</th>
               <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let student of filteredStudents">
            <tr class="animate-fade">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-box student">{{ student.name.charAt(0) }}</div>
                  <div class="user-info">
                    <div class="user-primary">{{ student.name }}</div>
                    <div class="user-secondary">✉️ {{ student.email }}</div>
                  </div>
                </div>
              </td>
               <td>
                 <div class="academic-cell">
                   <div class="mb-2">
                     <span class="class-tag">{{ student.studentClass || 'N/A' }}</span>
                     <span class="board-text">{{ student.board || 'No Board' }}</span>
                   </div>
                   <div class="text-xs font-bold text-primary">
                     🌍 {{ student.country || 'N/A' }} • {{ student.timezone || 'Not detected' }}
                   </div>
                 </div>
               </td>
              <td>
                <div class="batches-summary">
                  <div class="batch-count-badge" [ngClass]="getAssignedBatches(student.id).length === 0 ? 'zero' : 'has-batches'">
                    {{ getAssignedBatches(student.id).length }}
                    {{ getAssignedBatches(student.id).length === 1 ? 'Batch' : 'Batches' }}
                  </div>
                  <div class="assigned-batches-list" *ngIf="getAssignedBatches(student.id).length > 0">
                    <div *ngFor="let batch of getAssignedBatches(student.id)" class="batch-assigned mb-2">
                      <span class="batch-name">👨‍🏫 {{ batch.teacher?.name }}</span>
                      <span class="teacher-name">📚 {{ batch.subject }}</span>
                      <button class="btn-text-danger" (click)="unassign(batch.id, student.id)">Remove</button>
                    </div>
                  </div>
                  <div *ngIf="getAssignedBatches(student.id).length === 0" class="text-sm text-secondary">
                    Not enrolled yet
                  </div>
                </div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="student.isActive ? 'active' : 'inactive'">
                  {{ student.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-group">
                  <button class="btn-view" (click)="expandedStudent = student">
                    <span class="icon">🔍</span> View Details
                  </button>
                  <button 
                    *ngIf="student.isActive"
                    class="btn-outline-danger" 
                    (click)="$event.stopPropagation(); deactivate(student.id)"
                  >Deactivate</button>
                  <button 
                    *ngIf="!student.isActive"
                    class="btn-primary-sm" 
                    (click)="$event.stopPropagation(); activate(student.id)"
                  >Activate</button>
                </div>
              </td>
            </tr>
            </ng-container>

            <!-- Student Details Modal -->
            <div class="modal-overlay" *ngIf="expandedStudent" (click)="expandedStudent = null">
              <div class="modal-content glass animate-pop" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <div class="header-left">
                    <div class="modal-avatar student">{{ expandedStudent.name.charAt(0) }}</div>
                    <div>
                      <h3>{{ expandedStudent.name }}</h3>
                      <p>{{ expandedStudent.studentClass || 'N/A' }} • {{ expandedStudent.board || 'N/A' }}</p>
                    </div>
                  </div>
                  <button class="close-btn" (click)="expandedStudent = null">×</button>
                </div>

                <div class="modal-body">
                  <div class="detail-header-row">
                    <span class="icon-wrap">📋</span> Enrolled Batches
                  </div>
                  
                  <div *ngIf="getAssignedBatches(expandedStudent.id).length === 0" class="empty-state-mini">
                    <p>This student is not enrolled in any batches yet.</p>
                  </div>

                  <div class="batch-grid" *ngIf="getAssignedBatches(expandedStudent.id).length > 0">
                    <div *ngFor="let batch of getAssignedBatches(expandedStudent.id)" class="batch-premium-card">
                      <div class="batch-premium-top">
                        <div class="batch-title-group">
                          <div class="batch-name">{{ batch.name }}</div>
                          <span class="subject-pill">{{ batch.subject }}</span>
                        </div>
                        <div class="batch-price">₹{{ batch.monthlyFees }}<span>/mo</span></div>
                      </div>
                      
                      <div class="batch-info-grid">
                        <div class="info-item">
                          <span class="info-icon">👨‍🏫</span>
                          <div>
                            <div class="info-label">Mentor</div>
                            <div class="info-value">{{ batch.teacher?.name }}</div>
                          </div>
                        </div>
                        <div class="info-item">
                          <span class="info-icon">🕒</span>
                          <div>
                            <div class="info-label">Timing</div>
                            <div class="info-value">{{ batch.timingFrom }} - {{ batch.timingTo }}</div>
                          </div>
                        </div>
                        <div class="info-item">
                          <span class="info-icon">📅</span>
                          <div>
                            <div class="info-label">Days</div>
                            <div class="info-value">{{ batch.days }}</div>
                          </div>
                        </div>
                        <div class="info-item">
                          <span class="info-icon">🌍</span>
                          <div>
                            <div class="info-label">Timezone</div>
                            <div class="info-value">{{ batch.timezone || 'Asia/Kolkata' }}</div>
                          </div>
                        </div>
                      </div>

                      <div class="batch-action-footer">
                         <button class="btn-remove-batch" (click)="unassign(batch.id, expandedStudent.id)">
                           <span class="icon">🗑️</span> Remove Enrollment
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </tbody>
        </table>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    
    .search-group { display: flex; gap: 1rem; align-items: center; }
    .search-box { position: relative; width: 250px; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
    .search-box input { width: 100%; padding: 0.6rem 1rem 0.6rem 2.5rem; border-radius: 10px; border: 1px solid var(--border-color); }
    
    .filter-box select { padding: 0.6rem 1rem; border-radius: 10px; border: 1px solid var(--border-color); font-weight: 600; }

    .premium-table { width: 100%; border-collapse: collapse; }
    .premium-table th { text-align: left; padding: 1.25rem 1.5rem; background: #F8FAFC; border-bottom: 1px solid var(--border-color); font-size: 0.75rem; text-transform: uppercase; color: var(--text-secondary); }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }

    .user-cell { display: flex; align-items: center; gap: 1rem; }
    .user-avatar-box { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 700; background: #EEF2FF; color: var(--primary-color); }
    .user-primary { font-weight: 700; color: var(--text-primary); }
    .user-secondary { font-size: 0.75rem; color: var(--text-secondary); }

    .class-tag { background: rgba(99, 102, 241, 0.1); color: var(--primary-color); padding: 2px 10px; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }
    .board-text { display: block; font-size: 0.7rem; color: var(--text-secondary); margin-top: 2px; }

    .batch-count-badge { display: inline-flex; align-items: center; justify-content: center; padding: 0.3rem 0.9rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; margin-bottom: 0.5rem; }
    .batch-count-badge.has-batches { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; }
    .batch-count-badge.zero { background: #F1F5F9; color: #94A3B8; border: 1px solid #E2E8F0; }
    .count-label { font-size: 0.7rem; color: var(--text-secondary); font-weight: 400; }
    .batches-summary { display: flex; flex-direction: column; }
    .batch-assigned { display: flex; flex-direction: column; gap: 2px; padding: 4px; background: #f8fafc; border-radius: 6px; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .batch-name { font-weight: 700; font-size: 0.875rem; color: var(--text-primary); }
    .teacher-name { font-size: 0.75rem; color: var(--text-secondary); }
    .btn-text-danger { background: none; border: none; color: var(--danger-color); font-size: 0.7rem; text-align: left; padding: 0; cursor: pointer; text-decoration: underline; margin-top: 2px; }
    .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn-primary-sm { background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-view { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; padding: 0.45rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
    .btn-view:hover { background: #4338CA; color: white; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.2); }

    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-content { background: white; width: 100%; max-width: 1000px; max-height: 90vh; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow-y: auto; position: relative; border: 1px solid rgba(255,255,255,0.2); }
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; sticky: top; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .modal-avatar { width: 48px; height: 48px; border-radius: 14px; background: #EEF2FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; }
    .modal-avatar.student { background: #F0FDF4; color: #16A34A; }
    .modal-header h3 { font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 0; }
    .modal-header p { font-size: 0.875rem; color: #64748B; margin: 4px 0 0; }
    .close-btn { background: #F1F5F9; border: none; width: 36px; height: 36px; border-radius: 50%; font-size: 1.5rem; color: #64748B; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
    .close-btn:hover { background: #E2E8F0; color: #0F172A; transform: rotate(90deg); }

    .modal-body { padding: 2rem; }
    .detail-header-row { font-size: 1.125rem; font-weight: 800; color: #1E293B; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.75rem; }
    .icon-wrap { background: #F8FAFC; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .empty-state-mini { padding: 3rem; text-align: center; color: #64748B; background: #F8FAFC; border-radius: 16px; border: 1px dashed #CBD5E1; }
    
    .batch-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .batch-premium-card { background: white; border-radius: 16px; padding: 1.5rem; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); transition: all 0.3s ease; position: relative; overflow: hidden; }
    .batch-premium-card:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -5px rgba(0,0,0,0.08); border-color: #C7D2FE; }
    .batch-premium-card::before { content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(to bottom, #6366F1, #8B5CF6); }
    
    .batch-premium-top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px dashed #E2E8F0; padding-bottom: 1rem; margin-bottom: 1rem; }
    .batch-title-group { display: flex; flex-direction: column; gap: 0.4rem; }
    .batch-name { font-size: 1.125rem; font-weight: 800; color: #0F172A; }
    .subject-pill { background: #EEF2FF; color: #4338CA; font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 6px; width: fit-content; text-transform: uppercase; letter-spacing: 0.05em; }
    .batch-price { font-size: 1.25rem; font-weight: 800; color: #10B981; text-align: right; }
    .batch-price span { font-size: 0.75rem; color: #64748B; font-weight: 600; display: block; }
    
    .batch-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; background: #F8FAFC; padding: 1rem; border-radius: 12px; }
    .info-item { display: flex; align-items: center; gap: 0.75rem; }
    .info-icon { font-size: 1.25rem; }
    .info-label { font-size: 0.65rem; color: #64748B; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { font-size: 0.875rem; color: #334155; font-weight: 700; }

    .batch-action-footer { border-top: 1px solid #F1F5F9; padding-top: 1rem; display: flex; justify-content: flex-end; }
    .btn-remove-batch { display: flex; align-items: center; gap: 0.5rem; background: #FFF1F2; color: #E11D48; border: 1px solid #FECDD3; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-remove-batch:hover { background: #E11D48; color: white; transform: scale(1.02); }
    
    .btn-outline-danger { background: transparent; border: 1px solid #FECACA; color: var(--danger-color); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
    .text-right { text-align: right; }
  `]
})
export class AdminStudentsComponent implements OnInit {
  students: User[] = [];
  batches: any[] = [];
  teachers: User[] = [];
  filteredStudents: User[] = [];
  searchQuery = '';
  expandedStudent: User | null = null;

  toggleExpand(student: User) {
    this.expandedStudent = student;
  }

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAllStudents().subscribe(s => {
      this.students = s;
      this.filterStudents();
    });
    this.adminService.getAllBatches().subscribe(b => {
      this.batches = b;
      this.filterStudents();
    });
    this.adminService.getAllTeachers().subscribe(t => {
      this.teachers = t;
    });
  }

  filterStudents() {
    this.filteredStudents = this.students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
                           s.email?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesSearch;
    });
  }

  getAssignedBatches(studentId: number) {
    return this.batches.filter(b => b.students?.some((s: any) => s.id === studentId));
  }

  assign(batchIdStr: string, studentId: number) {
    if (!batchIdStr) return;
    const batchId = parseInt(batchIdStr);
    this.adminService.assignStudentToBatch(batchId, studentId).subscribe({
      next: () => {
        this.toast.success('Student assigned to teacher successfully');
        this.loadData();
      },
      error: (err) => this.toast.error(err.error?.message || 'Error assigning student')
    });
  }

  unassign(batchId: number, studentId: number) {
    if (confirm('Remove student from this mentor?')) {
      this.adminService.removeStudentFromBatch(batchId, studentId).subscribe({
        next: () => {
          this.toast.info('Assignment removed');
          this.loadData();
        },
        error: () => this.toast.error('Error removing assignment')
      });
    }
  }

  deactivate(id: number) {
    if(confirm('Are you sure you want to deactivate this student?')) {
      this.adminService.deactivateUser(id).subscribe({
        next: () => {
          this.toast.warning('Student account deactivated');
          this.loadData();
        },
        error: () => this.toast.error('Error deactivating account')
      });
    }
  }

  activate(id: number) {
    this.adminService.activateUser(id).subscribe({
      next: () => {
        this.toast.success('Student account reactivated');
        this.loadData();
      },
      error: () => this.toast.error('Error activating account')
    });
  }
}
