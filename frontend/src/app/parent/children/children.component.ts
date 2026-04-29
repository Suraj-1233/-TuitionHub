import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';

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
          </div>

          <div class="child-footer">
            <button class="btn btn-outline btn-block">View Progress</button>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 2rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.5rem; }

    .children-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
    .child-card { padding: 1.5rem; border-radius: 20px; border: 1px solid var(--border-color); }
    .child-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
    .avatar { width: 60px; height: 60px; border-radius: 15px; background: var(--gradient-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.5rem; }
    .info h3 { margin: 0; font-size: 1.25rem; color: var(--text-primary); }
    .info span { font-size: 0.85rem; color: var(--text-secondary); }

    .child-body { margin-bottom: 1.5rem; }
    .meta-row { display: flex; justify-content: space-between; font-size: 0.9rem; }
    .label { color: var(--text-secondary); }
    .value { color: var(--text-primary); font-weight: 600; }
  `]
})
export class ParentChildrenComponent implements OnInit {
  children: any[] = [];

  ngOnInit() {
    // Will be fetched from ParentService
  }
}
