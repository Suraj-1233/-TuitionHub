import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { User } from '../../shared/models/models';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-admin-parents',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header-hand animate-hand">
        <h1 class="page-title">Parent Network</h1>
        <p class="subtitle">Monitor and manage registered guardians and parents.</p>
      </div>

      <div class="stats-asymmetric animate-fade">
        <div class="stat-card-hand tilt">
          <div class="stat-icon-blob">👨‍👩‍👧‍👦</div>
          <div class="stat-info-hand">
            <span class="stat-value-hand">{{ parents.length }}</span>
            <span class="stat-label-hand">Total Parents</span>
          </div>
        </div>
      </div>

      <div class="table-container-hand animate-fade">
        <table class="premium-table">
          <thead>
            <tr>
              <th>Guardian</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let parent of parents">
              <td>
                <div class="user-info-cell">
                  <div class="user-avatar-mini">{{ parent.name.charAt(0) }}</div>
                  <span class="user-name-bold">{{ parent.name }}</span>
                </div>
              </td>
              <td>{{ parent.email }}</td>
              <td>{{ parent.mobile || 'N/A' }}</td>
              <td>{{ parent.city }}, {{ parent.country }}</td>
              <td>
                <span class="badge" [ngClass]="parent.isActive ? 'badge-success' : 'badge-danger'">
                  {{ parent.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>
                <div class="action-buttons-cell">
                  <button class="btn-icon-hand" 
                          [title]="parent.isActive ? 'Deactivate' : 'Activate'"
                          (click)="toggleStatus(parent)">
                    {{ parent.isActive ? '🚫' : '✅' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div *ngIf="parents.length === 0" class="empty-state-hand glass-hand">
           <div class="empty-icon">👥</div>
           <h3>No parents registered yet.</h3>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header-hand { margin-bottom: 3rem; }
    .stats-asymmetric { margin-bottom: 3rem; display: flex; gap: 2rem; }
    
    .stat-card-hand {
      background: white;
      padding: 1.5rem 2.5rem;
      border-radius: 2rem;
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
    }
    
    .stat-icon-blob {
      width: 50px;
      height: 50px;
      background: var(--primary-light);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--primary);
    }
    
    .stat-info-hand { display: flex; flex-direction: column; }
    .stat-value-hand { font-size: 2rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .stat-label-hand { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-top: 4px; }

    .table-container-hand {
      background: white;
      border-radius: 2rem;
      padding: 1.5rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      overflow-x: auto;
    }
    
    .user-info-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar-mini {
      width: 32px; height: 32px;
      background: var(--primary-light);
      color: var(--primary);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.8rem;
    }
    .user-name-bold { font-weight: 700; color: var(--text-main); }
    
    .action-buttons-cell { display: flex; gap: 0.5rem; }
    .btn-icon-hand {
      background: #F8FAFC; border: 1px solid var(--border);
      padding: 0.4rem; border-radius: 8px; cursor: pointer;
      transition: var(--transition-smooth); font-size: 1rem;
    }
    .btn-icon-hand:hover { background: white; border-color: var(--primary); transform: scale(1.1); }

    .empty-state-hand { 
      text-align: center; padding: 4rem; 
      display: flex; flex-direction: column; align-items: center; gap: 1rem; 
    }
    .empty-icon { font-size: 3rem; }
  `]
})
export class AdminParentsComponent implements OnInit {
  parents: User[] = [];

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadParents();
  }

  loadParents() {
    this.adminService.getAllParents().subscribe(p => this.parents = p);
  }

  toggleStatus(parent: User) {
    const action = parent.isActive ? this.adminService.deactivateUser(parent.id!) : this.adminService.activateUser(parent.id!);
    action.subscribe({
      next: () => {
        this.toast.success(`User ${parent.isActive ? 'deactivated' : 'activated'} successfully`);
        this.loadParents();
      },
      error: (err) => this.toast.error(err.error?.message || 'Action failed')
    });
  }
}
