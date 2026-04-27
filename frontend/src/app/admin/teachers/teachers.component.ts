import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-admin-teachers',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <h1 class="page-title">Teacher Management</h1>
        <div class="header-actions">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, subject or city..." 
              [(ngModel)]="searchQuery"
              (input)="filterTeachers()"
            >
          </div>
        </div>
      </div>

      <div class="tabs-container animate-fade">
        <button class="tab-btn" [class.active]="activeTab === 'pending'" (click)="setTab('pending')">
          Pending Review
          <span class="count-pill" *ngIf="pendingTeachers.length > 0">{{ pendingTeachers.length }}</span>
        </button>
        <button class="tab-btn" [class.active]="activeTab === 'approved'" (click)="setTab('approved')">Active Educators</button>
      </div>

      <div class="card glass p-0 overflow-hidden animate-fade">
        <table class="premium-table">
          <thead>
            <tr>
               <th>Educator</th>
               <th>Expertise & City</th>
               <th>Timezone</th>
               <th>Contact Info</th>
               <th>Status</th>
               <th class="text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let teacher of filteredTeachers" class="animate-fade">
              <td>
                <div class="user-cell">
                  <div class="user-avatar-box">{{ teacher.name.charAt(0) }}</div>
                  <div class="user-info">
                    <div class="user-primary">{{ teacher.name }}</div>
                    <div class="user-secondary">{{ teacher.qualification }}</div>
                  </div>
                </div>
              </td>
               <td>
                 <div class="expertise-cell">
                   <span class="subject-tag">{{ teacher.subject }}</span>
                   <span class="city-text">📍 {{ teacher.city }}</span>
                 </div>
               </td>
               <td>
                 <div class="timezone-cell">
                   <span class="text-sm font-bold">🌍 {{ teacher.timezone || 'Not detected' }}</span>
                 </div>
               </td>
              <td>
                <div class="student-count-cell">
                  <div class="student-count-badge" [ngClass]="getTeacherStudentCount(teacher.id) === 0 ? 'zero' : 'has-students'">
                    {{ getTeacherStudentCount(teacher.id) }}
                    {{ getTeacherStudentCount(teacher.id) === 1 ? 'Student' : 'Students' }}
                  </div>
                  <div class="text-xs text-secondary mt-1">
                    {{ getTeacherBatchCount(teacher.id) }} Batches
                  </div>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <div class="phone-link">📱 {{ teacher.mobile }}</div>
                  <div class="email-text">✉️ {{ teacher.email }}</div>
                </div>
              </td>
              <td>
                <span class="status-pill" [ngClass]="{
                  'pending': !teacher.isApproved,
                  'active': teacher.isApproved && teacher.isActive,
                  'inactive': teacher.isApproved && !teacher.isActive
                }">
                  {{ !teacher.isApproved ? 'Pending Review' : (teacher.isActive ? 'Active' : 'Inactive') }}
                </span>
              </td>
              <td class="text-right">
                <div class="action-group">
                  <button class="btn-view" (click)="toggleExpand(teacher.id)">{{ expandedTeacherId === teacher.id ? '▲ Hide' : '▼ View Details' }}</button>
                  <ng-container *ngIf="activeTab === 'pending'">
                    <button class="btn-icon-success" (click)="approve(teacher.id)" title="Approve">✅ Approve</button>
                    <button class="btn-icon-danger" (click)="reject(teacher.id)" title="Reject">❌ Reject</button>
                  </ng-container>
                  <ng-container *ngIf="activeTab === 'approved'">
                    <button 
                      *ngIf="teacher.isActive"
                      class="btn-outline-danger" 
                      (click)="deactivate(teacher.id)"
                    >Deactivate</button>
                    <button 
                      *ngIf="!teacher.isActive"
                      class="btn-primary-sm" 
                      (click)="activate(teacher.id)"
                    >Activate Account</button>
                  </ng-container>
                </div>
              </td>
            </tr>
            <!-- Expanded Detail Row -->
            <tr *ngIf="expandedTeacherId === teacher.id" class="detail-row">
              <td colspan="7" class="detail-panel">
                <div class="detail-header">📊 {{ teacher.name }}'s Batches & Students</div>
                <div *ngIf="getTeacherBatches(teacher.id).length === 0" class="text-secondary p-3">No batches created yet.</div>
                <div *ngFor="let batch of getTeacherBatches(teacher.id)" class="batch-detail-card">
                  <div class="batch-detail-top">
                    <div>
                      <strong>📚 {{ batch.name }}</strong>
                      <span class="subject-mini">{{ batch.subject }}</span>
                    </div>
                    <div class="batch-meta">
                      <span>🕒 {{ batch.timingFrom }} – {{ batch.timingTo }}</span>
                      <span>📅 {{ batch.days }}</span>
                      <span>💰 ₹{{ batch.monthlyFees }}/mo</span>
                      <span class="student-mini-count">👤 {{ (batch.students || []).length }} Students</span>
                    </div>
                  </div>
                  <div class="students-in-batch" *ngIf="(batch.students || []).length > 0">
                    <div *ngFor="let s of batch.students" class="student-chip">
                      <span class="chip-avatar">{{ s.name.charAt(0) }}</span>
                      <span class="chip-name">{{ s.name }}</span>
                      <span class="chip-country">{{ s.country || 'IN' }}</span>
                    </div>
                  </div>
                  <div *ngIf="(batch.students || []).length === 0" class="text-xs text-secondary">No students enrolled yet.</div>
                </div>
              </td>
            </tr>
            <tr *ngIf="filteredTeachers.length === 0">
              <td colspan="5">
                <div class="empty-table-state">
                  <div class="icon">🔍</div>
                  <p>No educators found matching your criteria.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    
    .search-box { position: relative; width: 320px; }
    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); pointer-events: none; }
    .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border-radius: 12px; border: 1px solid var(--border-color); background: white; font-size: 0.875rem; transition: var(--transition); }
    .search-box input:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); outline: none; }

    .tabs-container { display: flex; gap: 0.5rem; background: #F1F5F9; padding: 0.4rem; border-radius: 12px; margin-bottom: 2rem; width: fit-content; }
    .tab-btn {
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: var(--transition);
    }
    .tab-btn.active { background: white; color: var(--primary-color); box-shadow: var(--shadow-sm); }
    .count-pill { background: var(--danger-color); color: white; font-size: 0.7rem; padding: 2px 8px; border-radius: 100px; }

    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .premium-table th { padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; background: #F8FAFC; border-bottom: 1px solid var(--border-color); }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
    .premium-table tr:last-child td { border-bottom: none; }
    .premium-table tr:hover { background: rgba(248, 250, 252, 0.5); }

    .user-cell { display: flex; align-items: center; gap: 1rem; }
    .user-avatar-box { width: 44px; height: 44px; border-radius: 12px; background: #EEF2FF; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.125rem; }
    .user-primary { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; }
    .user-secondary { font-size: 0.75rem; color: var(--text-secondary); }

    .subject-tag { background: rgba(99, 102, 241, 0.1); color: var(--primary-color); padding: 0.2rem 0.75rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; display: inline-block; margin-bottom: 0.25rem; }
    .city-text { display: block; font-size: 0.75rem; color: var(--text-secondary); }

    .phone-link { font-size: 0.875rem; color: var(--text-primary); font-weight: 600; margin-bottom: 0.25rem; }
    .email-text { font-size: 0.75rem; color: var(--text-secondary); }

    .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 100px; display: inline-block; text-transform: uppercase; }
    .status-pill.pending { background: #FEF3C7; color: #92400E; }
    .status-pill.active { background: #DCFCE7; color: #166534; }
    .status-pill.inactive { background: #FEE2E2; color: #991B1B; }

    .student-count-badge { display: inline-flex; align-items: center; padding: 0.3rem 0.9rem; border-radius: 100px; font-size: 0.75rem; font-weight: 800; }
    .student-count-badge.has-students { background: #DCFCE7; color: #166534; border: 1px solid #BBF7D0; }
    .student-count-badge.zero { background: #F1F5F9; color: #94A3B8; border: 1px solid #E2E8F0; }
    .student-count-cell { display: flex; flex-direction: column; }
    .mt-1 { margin-top: 0.25rem; }
    .btn-view { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; padding: 0.4rem 0.85rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; }
    .btn-view:hover { background: #4338CA; color: white; }
    .detail-row td { padding: 0 !important; }
    .detail-panel { background: #F8FAFC; border-top: 2px solid #C7D2FE; padding: 1.5rem !important; }
    .detail-header { font-size: 1rem; font-weight: 800; color: #312E81; margin-bottom: 1rem; }
    .batch-detail-card { background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1rem; margin-bottom: 0.75rem; }
    .batch-detail-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
    .subject-mini { background: #EEF2FF; color: #4338CA; font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 100px; margin-left: 0.5rem; }
    .batch-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748B; font-weight: 600; flex-wrap: wrap; }
    .student-mini-count { background: #DCFCE7; color: #166534; padding: 2px 8px; border-radius: 100px; font-weight: 700; }
    .students-in-batch { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .student-chip { display: flex; align-items: center; gap: 0.4rem; background: #F1F5F9; border: 1px solid #E2E8F0; border-radius: 100px; padding: 0.3rem 0.75rem; font-size: 0.75rem; }
    .chip-avatar { width: 20px; height: 20px; background: #6366F1; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.65rem; }
    .chip-name { font-weight: 700; color: #334155; }
    .chip-country { color: #94A3B8; font-size: 0.7rem; }
    .action-group { display: flex; gap: 0.5rem; justify-content: flex-end; }
    .btn-icon-success { background: #DCFCE7; color: #166534; border: none; padding: 0.5rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: var(--transition); }
    .btn-icon-danger { background: #FEE2E2; color: #991B1B; border: none; padding: 0.5rem 0.8rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: var(--transition); }
    .btn-primary-sm { background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; }
    .btn-outline-danger { background: transparent; border: 1px solid #FECACA; color: var(--danger-color); padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; }

    .empty-table-state { text-align: center; padding: 4rem; color: var(--text-secondary); }
    .empty-table-state .icon { font-size: 3rem; margin-bottom: 1rem; }
    .text-right { text-align: right; }
  `]
})
export class AdminTeachersComponent implements OnInit {
  activeTab = 'pending';
  searchQuery = '';
  pendingTeachers: User[] = [];
  approvedTeachers: User[] = [];
  filteredTeachers: User[] = [];
  allBatches: any[] = [];
  expandedTeacherId: number | null = null;

  toggleExpand(id: number) {
    this.expandedTeacherId = this.expandedTeacherId === id ? null : id;
  }

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getPendingTeachers().subscribe(t => {
      this.pendingTeachers = t;
      if (this.activeTab === 'pending') this.filterTeachers();
    });
    this.adminService.getAllTeachers().subscribe(t => {
      this.approvedTeachers = t.filter(x => x.isApproved);
      if (this.activeTab === 'approved') this.filterTeachers();
    });
    this.adminService.getAllBatches().subscribe(b => this.allBatches = b);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.filterTeachers();
  }

  filterTeachers() {
    const list = this.activeTab === 'pending' ? this.pendingTeachers : this.approvedTeachers;
    this.filteredTeachers = list.filter(t => 
      t.name.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
      t.mobile.includes(this.searchQuery) ||
      t.subject?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getTeacherBatches(teacherId: number) {
    return this.allBatches.filter(b => b.teacher?.id === teacherId);
  }

  getTeacherBatchCount(teacherId: number) {
    return this.getTeacherBatches(teacherId).length;
  }

  getTeacherStudentCount(teacherId: number) {
    const batches = this.getTeacherBatches(teacherId);
    const studentIds = new Set<number>();
    batches.forEach(b => (b.students || []).forEach((s: any) => studentIds.add(s.id)));
    return studentIds.size;
  }

  approve(id: number) {
    this.adminService.approveTeacher(id).subscribe({
      next: () => {
        this.toast.success('Teacher application approved');
        this.loadData();
      },
      error: () => this.toast.error('Error approving teacher')
    });
  }

  reject(id: number) {
    if(confirm('Are you sure you want to reject this teacher?')) {
      this.adminService.rejectTeacher(id).subscribe({
        next: () => {
          this.toast.info('Teacher application rejected');
          this.loadData();
        },
        error: () => this.toast.error('Error rejecting teacher')
      });
    }
  }

  deactivate(id: number) {
    if(confirm('Are you sure you want to deactivate this teacher?')) {
      this.adminService.deactivateUser(id).subscribe({
        next: () => {
          this.toast.warning('Account deactivated');
          this.loadData();
        },
        error: () => this.toast.error('Error deactivating account')
      });
    }
  }

  activate(id: number) {
    this.adminService.activateUser(id).subscribe({
      next: () => {
        this.toast.success('Account reactivated');
        this.loadData();
      },
      error: () => this.toast.error('Error activating account')
    });
  }
}
