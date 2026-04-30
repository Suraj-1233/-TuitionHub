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
        <p class="subtitle">Monitor guardians and their linked learners.</p>
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
              <th>Linked Children</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let parent of parents">
              <tr class="main-row" [class.expanded]="expandedParentId === parent.id" (click)="toggleChildren(parent.id!)">
                <td>
                  <div class="user-info-cell">
                    <div class="user-avatar-mini">{{ parent.name.charAt(0) }}</div>
                    <span class="user-name-bold">{{ parent.name }}</span>
                  </div>
                </td>
                <td>{{ parent.email }}</td>
                <td>
                  <span class="children-count-badge">
                    {{ (parentChildren[parent.id!] || []).length }} Students
                  </span>
                </td>
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
                            (click)="toggleStatus($event, parent)">
                      {{ parent.isActive ? '🚫' : '✅' }}
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Children Section -->
              <tr *ngIf="expandedParentId === parent.id" class="detail-row animate-hand">
                <td colspan="6">
                  <div class="children-detail-pane glass-hand">
                    <h4 class="pane-title">Linked Learners</h4>
                    <div class="children-mini-list" *ngIf="(parentChildren[parent.id!] || []).length > 0">
                      <div *ngFor="let child of parentChildren[parent.id!]" class="child-mini-card">
                        <div class="c-avatar">{{ child.name.charAt(0) }}</div>
                        <div class="c-info">
                          <span class="c-name">{{ child.name }}</span>
                          <span class="c-meta">Grade {{ child.studentClass }} • {{ child.email }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="empty-mini" *ngIf="(parentChildren[parent.id!] || []).length === 0">
                      <p>No children linked yet.</p>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
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
      background: white; padding: 1.5rem 2.5rem; border-radius: 2rem;
      display: flex; align-items: center; gap: 1.5rem; border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
    }
    
    .stat-icon-blob {
      width: 50px; height: 50px; background: var(--primary-light);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: var(--primary);
    }
    
    .stat-info-hand { display: flex; flex-direction: column; }
    .stat-value-hand { font-size: 2rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); line-height: 1; }
    .stat-label-hand { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; margin-top: 4px; }

    .table-container-hand {
      background: white; border-radius: 2rem; padding: 1.5rem;
      border: 1px solid var(--border); box-shadow: var(--shadow-hand);
      overflow: hidden;
    }
    
    .main-row { cursor: pointer; transition: var(--transition-smooth); }
    .main-row:hover { background: #F8FAFC; }
    .main-row.expanded { background: var(--primary-light); }
    
    .children-count-badge {
      background: #E0E7FF; color: var(--primary);
      padding: 0.25rem 0.75rem; border-radius: 100px;
      font-size: 0.75rem; font-weight: 800;
    }

    .detail-row td { padding: 0 !important; border: none !important; }
    .children-detail-pane {
      margin: 1rem 2rem 2rem; padding: 2rem;
      border-radius: 1.5rem; border: 1px solid var(--primary-light);
    }
    .pane-title { font-size: 0.9rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); margin-bottom: 1.5rem; }
    
    .children-mini-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; }
    .child-mini-card {
      background: white; padding: 1rem; border-radius: 1rem;
      display: flex; align-items: center; gap: 1rem;
      border: 1px solid var(--border);
    }
    .c-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
    .c-info { display: flex; flex-direction: column; }
    .c-name { font-size: 0.875rem; font-weight: 700; color: var(--text-main); }
    .c-meta { font-size: 0.7rem; color: var(--text-muted); }

    .user-info-cell { display: flex; align-items: center; gap: 0.75rem; }
    .user-avatar-mini {
      width: 32px; height: 32px; background: var(--primary-light); color: var(--primary);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
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

    .empty-state-hand { text-align: center; padding: 4rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
    .empty-icon { font-size: 3rem; }
    .empty-mini { color: var(--text-muted); font-size: 0.875rem; }
  `]
})
export class AdminParentsComponent implements OnInit {
  parents: User[] = [];
  expandedParentId: number | null = null;
  parentChildren: Record<number, User[]> = {};

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadParents();
  }

  loadParents() {
    this.adminService.getAllParents().subscribe(p => {
      this.parents = p;
      // Pre-fetch counts if needed, or just fetch children on click
      p.forEach(parent => {
        this.adminService.getParentChildren(parent.id!).subscribe(children => {
          this.parentChildren[parent.id!] = children;
        });
      });
    });
  }

  toggleChildren(parentId: number) {
    if (this.expandedParentId === parentId) {
      this.expandedParentId = null;
    } else {
      this.expandedParentId = parentId;
      if (!this.parentChildren[parentId]) {
        this.adminService.getParentChildren(parentId).subscribe(children => {
          this.parentChildren[parentId] = children;
        });
      }
    }
  }

  toggleStatus(event: Event, parent: User) {
    event.stopPropagation(); // Prevent row expansion when clicking status
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
