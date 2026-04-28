import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { ToastService } from '../../shared/services/toast.service';
import { Batch } from '../../shared/models/models';

@Component({
  selector: 'app-student-batches',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, RouterLink],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div class="page-header animate-slide">
        <h1 class="page-title">My Mentors & Classes</h1>
        <p class="subtitle">View your assigned mentors and class schedules.</p>
      </div>

      <div class="batches-grid animate-fade">
        <div class="batch-card glass enrolled animate-scale" *ngFor="let batch of myBatches">
          <div class="card-content">
            <div class="enrolled-status">👨‍🏫 Assigned Mentor</div>
            <h3 class="batch-title">{{ batch.teacher.name }}</h3>
            <p class="batch-desc" style="margin-bottom: 1rem; color: var(--primary-color); font-weight: 600;">📚 {{ batch.subject }}</p>
            
            <div class="batch-details">
              <span>🕒 {{ batch.timingFrom }} - {{ batch.timingTo }}</span>
              <span>📅 {{ batch.days }}</span>
            </div>

            <div class="my-actions">
              <button class="btn-primary-glow" [routerLink]="['/student/mentors', batch.id]">
                📚 Study Material
              </button>
              
              <a [href]="batch.liveClassLink?.startsWith('http') ? batch.liveClassLink : 'https://' + batch.liveClassLink" target="_blank" class="btn-video-glow">
                📹 Join Meet
              </a>
            </div>
          </div>
        </div>
        <div *ngIf="myBatches.length === 0" class="empty-placeholder">
          <div class="icon">👩‍🏫</div>
          <p>You have no assigned mentors yet.</p>
          <button class="btn-primary" routerLink="/student/requests">Request a Tuition</button>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); margin-top: 0.25rem; }

    .batches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 2rem; }
    .batch-card {
      border-radius: var(--border-radius);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: var(--transition);
    }
    .batch-card:hover { transform: translateY(-8px); box-shadow: var(--shadow-xl); }
    
    .card-image {
      height: 120px;
      background: var(--gradient-primary);
      position: relative;
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }
    .subject-badge { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(4px); color: white; padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; border: 1px solid rgba(255, 255, 255, 0.3); }
    .class-badge { background: var(--accent-color); color: white; padding: 0.25rem 0.75rem; border-radius: 100px; font-size: 0.75rem; font-weight: 700; }

    .card-content { padding: 1.5rem; flex: 1; display: flex; flex-direction: column; }
    .batch-title { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem; }
    .batch-desc { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 1.5rem; flex: 1; }

    .teacher-box { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; }
    .teacher-avatar { width: 40px; height: 40px; border-radius: 10px; background: #F1F5F9; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .teacher-details { display: flex; flex-direction: column; }
    .t-name { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
    .t-price { font-size: 0.75rem; color: var(--secondary-color); font-weight: 700; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; padding: 1rem; background: #F8FAFC; border-radius: 10px; }
    .info-item { font-size: 0.75rem; color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }
    .info-item.price { color: var(--primary-color); grid-column: span 2; border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: 0.25rem; font-size: 0.875rem; }

    .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .student-count { flex: 1; }
    .progress-bar { height: 6px; background: #E2E8F0; border-radius: 3px; margin-bottom: 0.4rem; overflow: hidden; }
    .progress { height: 100%; background: var(--secondary-color); border-radius: 3px; }
    .student-count span { font-size: 0.7rem; color: var(--text-secondary); font-weight: 600; }

    .btn-action {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.875rem;
      cursor: pointer;
      transition: var(--transition);
    }
    .btn-action:hover { background: var(--primary-hover); }
    .btn-action:disabled { background: #E2E8F0; color: var(--text-secondary); cursor: not-allowed; }

    .batch-card.enrolled .enrolled-status { color: var(--secondary-color); font-weight: 800; font-size: 0.75rem; margin-bottom: 0.5rem; }
    .my-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
    .btn-primary-glow { 
      background: var(--gradient-primary); 
      color: white; 
      text-decoration: none; 
      padding: 0.75rem 1rem; 
      border-radius: 0.75rem; 
      font-weight: 700; 
      text-align: center; 
      flex: 1; 
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); 
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .btn-video-glow {
      background: #10B981; 
      color: white; 
      text-decoration: none; 
      padding: 0.75rem 1rem; 
      border-radius: 0.75rem; 
      font-weight: 700; 
      text-align: center; 
      flex: 1; 
      border: none;
      cursor: pointer;
      font-size: 0.875rem;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: var(--transition);
    }
    .btn-video-glow:hover:not(.disabled) { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3); }
    .btn-video-glow.disabled { background: #E2E8F0; color: var(--text-secondary); cursor: not-allowed; box-shadow: none; }

    .empty-placeholder { grid-column: span 3; text-align: center; padding: 4rem; color: var(--text-secondary); }
    .empty-placeholder .icon { font-size: 3rem; margin-bottom: 1rem; }
  `]
})
export class StudentBatchesComponent implements OnInit {
  myBatches: Batch[] = [];

  constructor(private batchService: BatchService, private toast: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.batchService.getMyBatches().subscribe((b: Batch[]) => this.myBatches = b);
  }
}
