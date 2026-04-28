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

      <div class="card glass p-0 animate-fade">
        <div class="table-responsive" style="overflow-x: auto; width: 100%;">
        <table class="premium-table">
          <thead>
            <tr>
               <th>Educator</th>
               <th>Expertise & City</th>
               <th>Timezone</th>
               <th>Students 👥</th>
               <th>Contact Info</th>
               <th>Status</th>
               <th class="text-right">Manage</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let teacher of filteredTeachers">
            <tr class="animate-fade">
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
                  <button class="btn-view" (click)="expandedTeacher = teacher">
                    <span class="icon">🔍</span> View Details
                  </button>
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
            </ng-container>

            <!-- Teacher Details Modal -->
            <div class="modal-overlay" *ngIf="expandedTeacher" (click)="expandedTeacher = null">
              <div class="modal-content glass animate-pop" (click)="$event.stopPropagation()">
                <div class="modal-header">
                  <div class="header-left">
                    <div class="modal-avatar">{{ expandedTeacher.name.charAt(0) }}</div>
                    <div>
                      <h3>{{ expandedTeacher.name }}</h3>
                      <p>{{ expandedTeacher.qualification }} • {{ expandedTeacher.subject }}</p>
                    </div>
                  </div>
                  <button class="close-btn" (click)="expandedTeacher = null">×</button>
                </div>

                <div class="modal-body">
                  <div class="detail-header-row">
                    <span class="icon-wrap">📋</span> Assigned Batches & Students
                  </div>
                  
                  <div *ngIf="getTeacherBatches(expandedTeacher.id).length === 0" class="empty-state-mini">
                    <p>No batches created yet by this educator.</p>
                  </div>

                  <div class="batch-grid" *ngIf="getTeacherBatches(expandedTeacher.id).length > 0">
                    <div *ngFor="let batch of getTeacherBatches(expandedTeacher.id)" class="batch-premium-card">
                      <div class="batch-premium-top">
                        <div class="batch-title-group">
                          <div class="batch-name">{{ batch.name }}</div>
                          <span class="subject-pill">{{ batch.subject }}</span>
                        </div>
                        <div class="batch-price">{{ getCurrencySymbol(batch.currency) }}{{ batch.monthlyFees }}<span>/mo</span></div>
                      </div>
                      
                      <div class="batch-info-grid">
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
                      </div>

                      <div class="batch-students-section">
                        <div class="section-title">
                          Enrolled Students <span class="badge">{{ (batch.students || []).length }}</span>
                        </div>
                        <div class="students-wrap" *ngIf="(batch.students || []).length > 0">
                          <div *ngFor="let s of batch.students" class="student-pill">
                            <div class="sp-avatar">{{ s.name.charAt(0) }}</div>
                            <div class="sp-name">{{ s.name }}</div>
                            <div class="sp-country" *ngIf="s.country">{{ s.country }}</div>
                          </div>
                        </div>
                        <div *ngIf="(batch.students || []).length === 0" class="no-students-text">
                          No students enrolled.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
    .btn-view { background: #EEF2FF; color: #4338CA; border: 1px solid #C7D2FE; padding: 0.45rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.75rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; }
    .btn-view:hover { background: #4338CA; color: white; transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(67, 56, 202, 0.2); }
    
    /* Modal Styles */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
    .modal-content { background: white; width: 100%; max-width: 1000px; max-height: 90vh; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow-y: auto; position: relative; border: 1px solid rgba(255,255,255,0.2); }
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #E2E8F0; display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; sticky: top; }
    .header-left { display: flex; align-items: center; gap: 1rem; }
    .modal-avatar { width: 48px; height: 48px; border-radius: 14px; background: #EEF2FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; }
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
    
    .batch-students-section { margin-top: 1rem; }
    .section-title { font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .section-title .badge { background: #E2E8F0; color: #475569; padding: 0.1rem 0.5rem; border-radius: 100px; font-size: 0.7rem; }
    .students-wrap { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .student-pill { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #E2E8F0; padding: 0.25rem 0.75rem 0.25rem 0.25rem; border-radius: 100px; font-size: 0.8rem; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
    .sp-avatar { width: 24px; height: 24px; background: #F1F5F9; color: #64748B; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.65rem; }
    .sp-name { font-weight: 600; color: #334155; }
    .sp-country { font-size: 0.65rem; color: #94A3B8; font-weight: 700; background: #F1F5F9; padding: 2px 6px; border-radius: 4px; }
    .no-students-text { font-size: 0.8rem; color: #94A3B8; font-style: italic; }
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
  expandedTeacher: User | null = null;

  getCurrencySymbol(currency?: string): string {
    if (!currency) return '₹';
    switch (currency.toUpperCase()) {
      case 'USD': return '$';
      case 'GBP': return '£';
      case 'EUR': return '€';
      case 'CAD': return 'C$';
      case 'AUD': return 'A$';
      default: return '₹';
    }
  }

  toggleExpand(teacher: User) {
    this.expandedTeacher = teacher;
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
