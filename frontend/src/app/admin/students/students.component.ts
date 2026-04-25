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

      <div class="card glass p-0 overflow-hidden animate-fade">
        <table class="premium-table">
          <thead>
            <tr>
               <th>Student</th>
               <th>Academic Info & Timezone</th>
               <th>Assigned Mentors</th>
               <th>Status</th>
               <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let student of filteredStudents" class="animate-fade">
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
                <div class="assigned-batches-list" *ngIf="getAssignedBatches(student.id).length > 0">
                  <div *ngFor="let batch of getAssignedBatches(student.id)" class="batch-assigned mb-2">
                    <span class="batch-name">👨‍🏫 {{ batch.teacher?.name }}</span>
                    <span class="teacher-name">📚 {{ batch.subject }}</span>
                    <button class="btn-text-danger" (click)="unassign(batch.id, student.id)">Remove</button>
                  </div>
                </div>
                <div *ngIf="getAssignedBatches(student.id).length === 0" class="text-sm text-secondary">
                  No assignments yet
                </div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="student.isActive ? 'active' : 'inactive'">
                  {{ student.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-group">
                  <button 
                    *ngIf="student.isActive"
                    class="btn-outline-danger" 
                    (click)="deactivate(student.id)"
                  >Deactivate</button>
                  <button 
                    *ngIf="!student.isActive"
                    class="btn-primary-sm" 
                    (click)="activate(student.id)"
                  >Activate</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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

    .batch-assigned { display: flex; flex-direction: column; gap: 2px; padding: 4px; background: #f8fafc; border-radius: 6px; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-2 { margin-top: 0.5rem; }
    .batch-name { font-weight: 700; font-size: 0.875rem; color: var(--text-primary); }
    .teacher-name { font-size: 0.75rem; color: var(--text-secondary); }
    .btn-text-danger { background: none; border: none; color: var(--danger-color); font-size: 0.7rem; text-align: left; padding: 0; cursor: pointer; text-decoration: underline; margin-top: 2px; }

    .assignment-control { display: flex; gap: 0.5rem; align-items: center; }
    .assign-select { padding: 0.4rem; border-radius: 8px; border: 1px solid var(--border-color); font-size: 0.75rem; flex: 1; max-width: 150px; }
    .btn-assign { background: var(--primary-color); color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; white-space: nowrap; }

    .status-pill { font-size: 0.65rem; font-weight: 800; padding: 0.3rem 0.8rem; border-radius: 100px; text-transform: uppercase; }
    .status-pill.active { background: #DCFCE7; color: #166534; }
    .status-pill.inactive { background: #FEE2E2; color: #991B1B; }

    .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn-primary-sm { background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .btn-outline-danger { background: transparent; border: 1px solid #FECACA; color: var(--danger-color); padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600; cursor: pointer; }
    .text-right { text-align: right; }
  `]
})
export class AdminStudentsComponent implements OnInit {
  students: User[] = [];
  batches: any[] = [];
  teachers: User[] = [];
  filteredStudents: User[] = [];
  searchQuery = '';

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
