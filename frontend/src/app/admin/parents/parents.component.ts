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
      <div class="page-header animate-fade">
        <h1 class="page-title">Parent Directory</h1>
        <p class="section-title">Monitor guardians and their linked learners.</p>
      </div>

      <div class="stats-grid animate-fade">
        <div class="stat-card card">
          <div class="stat-info">
            <div class="stat-value">{{ parents.length }}</div>
            <div class="stat-label">Total Registered Parents</div>
          </div>
        </div>
      </div>

      <div class="table-container animate-fade">
        <table class="data-table">
          <thead>
            <tr>
              <th>Guardian Name</th>
              <th>Email Address</th>
              <th>Linked Students</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let parent of parents">
              <tr class="main-row" [class.expanded]="expandedParentId === parent.id" (click)="toggleChildren(parent.id!)" style="cursor: pointer;">
                <td>
                  <div class="flex items-center gap-2">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366F1; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">
                      {{ parent.name.charAt(0) }}
                    </div>
                    <span style="font-weight: 600;">{{ parent.name }}</span>
                  </div>
                </td>
                <td>{{ parent.email }}</td>
                <td>
                  <span class="badge badge-primary">
                    {{ (parentChildren[parent.id!] || []).length }} Students
                  </span>
                </td>
                <td>{{ parent.city || 'N/A' }}, {{ parent.country || 'N/A' }}</td>
                <td>
                  <span class="badge" [ngClass]="parent.isActive ? 'badge-success' : 'badge-danger'">
                    {{ parent.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-2">
                    <button class="btn btn-outline" 
                            style="padding: 0.25rem 0.5rem;"
                            [title]="parent.isActive ? 'Deactivate' : 'Activate'"
                            (click)="toggleStatus($event, parent)">
                      {{ parent.isActive ? '🚫' : '✅' }}
                    </button>
                  </div>
                </td>
              </tr>
              
              <!-- Expandable Children Section -->
              <tr *ngIf="expandedParentId === parent.id" class="detail-row">
                <td colspan="6" style="padding: 0; background: #F8FAFC;">
                  <div style="margin: 1rem 2rem; padding: 1.5rem; background: white; border-radius: 12px; border: 1px solid #E2E8F0;">
                    <h4 style="font-size: 0.8rem; font-weight: 800; color: #6366F1; text-transform: uppercase; margin-bottom: 1rem;">Linked Learners</h4>
                    <div class="flex flex-col gap-2" *ngIf="(parentChildren[parent.id!] || []).length > 0">
                      <div *ngFor="let child of parentChildren[parent.id!]" 
                           style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 8px; border: 1px solid #F1F5F9; background: #FFF;">
                        <div style="width: 28px; height: 28px; border-radius: 6px; background: #6366F1; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold;">
                          {{ child.name.charAt(0) }}
                        </div>
                        <div>
                          <div style="font-size: 0.875rem; font-weight: 600;">{{ child.name }}</div>
                          <div style="font-size: 0.75rem; color: #64748B;">Grade {{ child.studentClass }} • {{ child.email }}</div>
                        </div>
                      </div>
                    </div>
                    <div *ngIf="(parentChildren[parent.id!] || []).length === 0" style="color: #64748B; font-size: 0.875rem;">
                      No children linked yet.
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
        
        <div *ngIf="parents.length === 0" class="text-center" style="padding: 3rem;">
           <h3 style="color: #64748B;">No parents registered yet.</h3>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .main-row:hover { background-color: #F1F5F9; }
    .main-row.expanded { background-color: rgba(99, 102, 241, 0.05); }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
    .stat-card { padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1rem; }
    .stat-value { font-size: 1.5rem; font-weight: 800; color: #0F172A; }
    .stat-label { font-size: 0.8rem; color: #64748B; font-weight: 600; }
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
    event.stopPropagation();
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
