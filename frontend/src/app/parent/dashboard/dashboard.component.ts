import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AuthService } from '../../shared/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { environment } from '../../../environments/environment';
import { User } from '../../shared/models/models';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterLink],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="welcome-banner animate-slide">
        <div class="welcome-text">
          <h1 class="page-title">Parent Portal 👨‍👩‍👧</h1>
          <p class="subtitle">Monitor your child's learning journey and manage enrollments.</p>
        </div>
      </div>

      <div class="stats-grid animate-fade">
        <div class="stat-card glass">
          <div class="stat-icon primary">👥</div>
          <div class="stat-info">
            <div class="stat-value">{{ children.length }}</div>
            <div class="stat-label">Children Linked</div>
          </div>
        </div>
      </div>

      <div class="dashboard-content animate-fade">
        <div class="content-left">
          <div class="card glass mb-4 animate-slide" *ngIf="showAddChildForm">
            <div class="card-header">
              <h2 class="card-title">Link Your Child</h2>
              <button class="btn-close" (click)="showAddChildForm = false">✕</button>
            </div>
            <div class="p-4 flex gap-4">
              <input type="email" class="form-control flex-1" placeholder="child@example.com" [(ngModel)]="childEmail">
              <button class="btn btn-primary" [disabled]="!childEmail || isLoading" (click)="confirmLinkChild()">
                {{ isLoading ? 'Linking...' : 'Link Account' }}
              </button>
            </div>
          </div>

          <div class="card glass">
            <div class="card-header">
              <h2 class="card-title">Children Overview</h2>
              <button class="btn btn-primary btn-sm" (click)="showAddChildForm = true" *ngIf="!showAddChildForm">+ Add Child</button>
            </div>
            
            <div *ngIf="children.length === 0" class="empty-state">
              <div class="empty-icon">🐣</div>
              <p>No children linked yet.</p>
            </div>

            <div class="children-list" *ngIf="children.length > 0">
              <div class="child-group mb-6" *ngFor="let child of children">
                <div class="child-header-row flex justify-between items-center p-4 bg-light rounded-xl mb-2">
                  <div>
                    <div class="child-name font-bold">{{ child.name }}</div>
                    <div class="child-meta text-xs text-secondary">{{ child.email }} • Class {{ child.studentClass }}</div>
                  </div>
                  <button class="btn btn-outline btn-sm">Reports</button>
                </div>

                <div class="child-batches mt-2">
                  <div *ngIf="childBatches[child.id]" class="batch-mini-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="batch-mini-card p-3 border rounded-xl" *ngFor="let batch of childBatches[child.id]">
                      <div class="flex justify-between font-bold text-sm">
                        <span>📚 {{ batch.name }}</span>
                        <span class="text-primary">{{ batch.timingFrom }}</span>
                      </div>
                      <div class="text-xs text-secondary">Mentor: {{ batch.teacher?.name }}</div>
                      <div *ngIf="batch.isTimeChangeProposed" class="reschedule-alert mt-2 p-2 bg-warning-light text-[10px] font-bold rounded">
                        ⚠️ {{ batch.proposedByRole === 'STUDENT' ? 'Child' : 'Teacher' }} requested change: {{ batch.proposedTiming }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .welcome-banner { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 20px; padding: 2.5rem; color: white; margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; margin: 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
    .stat-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; border-radius: 20px; }
    .stat-icon { width: 50px; height: 50px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: rgba(99, 102, 241, 0.1); color: #4F46E5; }
    .bg-light { background: #F8FAFC; }
    .bg-warning-light { background: #FFFBEB; color: #92400E; }
    .btn-close { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .flex-1 { flex: 1; }
  `]
})
export class ParentDashboardComponent implements OnInit {
  children: User[] = [];
  childBatches: Record<number, any[]> = {};
  showAddChildForm = false;
  childEmail = '';
  isLoading = false;
  private apiUrl = environment.apiUrl;

  constructor(private authService: AuthService, private http: HttpClient, private toast: ToastService) {}

  ngOnInit() { this.loadChildren(); }

  loadChildren() {
    const parent = this.authService.getCurrentUser();
    if (!parent) return;
    this.http.get<User[]>(`${this.apiUrl}/parent/${parent.userId}/children`).subscribe({
      next: (data) => {
        this.children = data;
        data.forEach(child => this.loadBatchesForChild(child.id));
      },
      error: () => this.toast.error('Failed to load children')
    });
  }

  loadBatchesForChild(childId: number) {
    this.http.get<any[]>(`${this.apiUrl}/admin/students/${childId}/batches`).subscribe(b => {
      this.childBatches[childId] = b;
    });
  }

  confirmLinkChild() {
    const parent = this.authService.getCurrentUser();
    if (!parent) return;
    this.isLoading = true;
    this.http.post(`${this.apiUrl}/parent/link-child`, {
      parentId: parent.userId,
      studentEmail: this.childEmail
    }).subscribe({
      next: () => {
        this.toast.success('Linked!');
        this.isLoading = false;
        this.showAddChildForm = false;
        this.loadChildren();
      },
      error: () => this.isLoading = false
    });
  }
}
