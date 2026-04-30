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
      <div class="page-header-hand animate-hand">
        <h1 class="page-title">My Little Learners</h1>
        <p class="subtitle">Track and nurture your children's educational growth.</p>
      </div>

      <div class="children-stack animate-fade">
        <div *ngFor="let child of children; let i = index" 
             class="child-card-premium" 
             [ngClass]="i % 2 === 0 ? 'tilt' : 'tilt-right'">
          
          <div class="card-inner">
            <div class="avatar-section">
              <div class="avatar-blob" [style.background-color]="getAvatarColor(i)">
                {{ child.name.charAt(0) }}
              </div>
              <div class="online-indicator"></div>
            </div>

            <div class="content-section">
              <div class="header-main">
                <h3 class="child-name">{{ child.name }}</h3>
                <span class="class-badge">Grade {{ child.studentClass || 'N/A' }}</span>
              </div>
              
              <div class="stats-mini-grid">
                <div class="mini-stat">
                  <span class="m-label">Email</span>
                  <span class="m-value">{{ child.email }}</span>
                </div>
                <div class="mini-stat">
                  <span class="m-label">Board</span>
                  <span class="m-value">{{ child.board || 'CBSE' }}</span>
                </div>
              </div>

              <div class="card-actions-hand">
                <button class="btn-hand btn-hand-primary btn-sm">
                  <span>Progress Report</span>
                  <span class="btn-icon">📊</span>
                </button>
                <button class="btn-hand btn-hand-outline btn-sm">
                  <span>Messages</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="children.length === 0" class="empty-state-hand glass-hand">
           <div class="empty-icon">🍃</div>
           <h3>No learners found</h3>
           <p>Your children will appear here once they are linked to your account.</p>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header-hand { margin-bottom: 4rem; }
    
    .children-stack { 
      display: flex; 
      flex-direction: column; 
      gap: 2.5rem; 
      max-width: 900px;
    }
    
    .child-card-premium {
      background: white;
      border-radius: 2.5rem;
      padding: 2.5rem;
      border: 1px solid var(--border);
      box-shadow: var(--shadow-hand);
      transition: var(--transition-smooth);
      position: relative;
      overflow: hidden;
    }
    
    .child-card-premium:hover {
      transform: translateY(-5px) rotate(0deg) !important;
      box-shadow: var(--shadow-float);
      border-color: var(--primary);
    }
    
    .card-inner { display: flex; gap: 3rem; align-items: flex-start; }
    
    .avatar-section { position: relative; }
    .avatar-blob {
      width: 100px;
      height: 100px;
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      font-weight: 800;
      color: white;
      font-family: var(--font-heading);
      box-shadow: 0 10px 20px rgba(0,0,0,0.1);
    }
    
    .online-indicator {
      position: absolute;
      bottom: 5px;
      right: 5px;
      width: 18px;
      height: 18px;
      background: #10B981;
      border: 3px solid white;
      border-radius: 50%;
    }
    
    .content-section { flex: 1; }
    
    .header-main { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border);
    }
    
    .child-name { font-size: 1.75rem; font-weight: 800; color: var(--text-main); font-family: var(--font-heading); margin: 0; }
    .class-badge { background: var(--primary-light); color: var(--primary); padding: 0.4rem 1rem; border-radius: 100px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; }
    
    .stats-mini-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; margin-bottom: 2rem; }
    .mini-stat { display: flex; flex-direction: column; gap: 4px; }
    .m-label { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .m-value { font-size: 1rem; font-weight: 600; color: var(--text-main); }
    
    .card-actions-hand { display: flex; gap: 1rem; }
    .btn-sm { padding: 0.5rem 1.25rem; font-size: 0.75rem; }
    
    .empty-state-hand { 
      text-align: center; 
      padding: 5rem; 
      border-radius: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .empty-state-hand h3 { font-family: var(--font-heading); font-weight: 800; margin: 0; }
    .empty-state-hand p { color: var(--text-muted); max-width: 300px; }

    @media (max-width: 768px) {
      .card-inner { flex-direction: column; gap: 2rem; align-items: center; text-align: center; }
      .header-main { flex-direction: column; gap: 1rem; }
      .stats-mini-grid { grid-template-columns: 1fr; gap: 1rem; }
      .card-actions-hand { justify-content: center; }
    }
  `]
})
export class ParentChildrenComponent implements OnInit {
  children: any[] = [];

  constructor(private parentService: ParentService) {}

  ngOnInit() {
    this.parentService.getChildren().subscribe(res => this.children = res);
  }

  getAvatarColor(index: number): string {
    const colors = ['#6366F1', '#F43F5E', '#10B981', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
  }
}
