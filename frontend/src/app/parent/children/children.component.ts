import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { ParentService } from '../../shared/services/parent.service';

@Component({
  selector: 'app-parent-children',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="PARENT">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">My Children</h1>
          <p class="subtitle">Manage and track your children's performance</p>
        </div>
      </div>

      <div class="children-grid animate-fade">
        <div *ngFor="let child of children" class="child-card glass animate-slide">
          <div class="child-header">
            <div class="avatar">{{ child.name.charAt(0) }}</div>
            <div class="info">
              <h3>{{ child.name }}</h3>
              <span>Class: {{ child.studentClass || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="child-body">
            <div class="meta-row">
              <span class="label">Email:</span>
              <span class="value">{{ child.email }}</span>
            </div>
            <div class="meta-row mt-2">
              <span class="label">Status:</span>
              <span class="value text-success">Active</span>
            </div>
          </div>

          <div class="child-footer">
            <button class="btn btn-outline btn-block">View Progress</button>
          </div>
        </div>

        <div *ngIf="children.length === 0" class="empty-state glass py-12">
           <p class="text-secondary">No children linked to your account yet.</p>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .children-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
    .child-card { padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); background: white; }
    .child-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .avatar { width: 60px; height: 60px; border-radius: 15px; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; }
    .info h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
    .info span { font-size: 0.85rem; color: var(--text-secondary); }

    .child-body { margin-bottom: 1.5rem; padding: 1rem; background: #F8FAFC; border-radius: 12px; }
    .meta-row { display: flex; justify-content: space-between; font-size: 0.85rem; }
    .label { color: var(--text-secondary); }
    .value { color: var(--text-primary); font-weight: 600; }
    .text-success { color: #10B981; }
    .mt-2 { margin-top: 0.5rem; }
    .empty-state { text-align: center; grid-column: 1 / -1; }
  `]
})
export class ParentChildrenComponent implements OnInit {
  children: any[] = [];

  constructor(private parentService: ParentService) {}

  ngOnInit() {
    this.parentService.getChildren().subscribe(res => this.children = res);
  }
}
