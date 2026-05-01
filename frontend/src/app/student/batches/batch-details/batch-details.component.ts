import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../../shared/services/batch.service';
import { MaterialService, StudyMaterial } from '../../../shared/services/material.service';
import { AssignmentService, Assignment, Submission } from '../../../shared/services/assignment.service';
import { AuthService } from '../../../shared/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Batch } from '../../../shared/models/models';

import { LocalDatePipe } from '../../../shared/pipes/local-date.pipe';

@Component({
  selector: 'app-student-batch-details',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterModule, LocalDatePipe],
  template: `
    <app-dashboard-layout role="STUDENT">
      <div *ngIf="batch" class="animate-fade">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ batch.name }}</h1>
            <p class="subtitle">{{ batch.subject }} • Class {{ batch.targetClass }}</p>
            <div class="teacher-pill" *ngIf="batch.teacher">
              👨‍🏫 Teacher: <strong>{{ batch.teacher.name }}</strong>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline" routerLink="/student/batches">← Back to Batches</button>
            <a [href]="batch.liveClassLink" target="_blank" class="btn btn-primary animate-pulse" *ngIf="batch.liveClassLink">
              Join Live Class Now 🚀
            </a>
          </div>
        </div>

        <div class="tabs-container card glass p-0 mb-6">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab === 'content'" (click)="activeTab = 'content'">
              📚 Study Material
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
              📝 Homework
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'schedule'" (click)="activeTab = 'schedule'">
              🕒 Schedule
            </button>
          </div>
        </div>

        <!-- Schedule Tab -->
        <div *ngIf="activeTab === 'schedule'" class="animate-slide">
          <div class="max-w-2xl mx-auto">
            <div class="card glass">
              <div class="card-header"><h3 class="card-title">Class Schedule</h3></div>
              <div class="p-6">
                <div class="info-row">
                  <span class="label">Weekly Days:</span>
                  <span class="value">{{ batch.days }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Class Time:</span>
                  <span class="value">{{ batch.timingFrom }} - {{ batch.timingTo }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Timezone:</span>
                  <span class="value">{{ batch.timezone || 'Asia/Kolkata' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="activeTab === 'content'" class="animate-slide">
          <div class="materials-list">
            <h3 class="section-title">Study Materials & Notes</h3>
            <div *ngFor="let m of materials" class="material-card">
              <div class="material-icon">📄</div>
              <div class="material-info">
                <span class="material-name">{{ m.title }}</span>
                <span class="material-date">Added on {{ m.uploadedAt | localDate }}</span>
              </div>
              <a [href]="getFileUrl(m.url)" target="_blank" class="btn btn-sm btn-primary">View / Download</a>
            </div>
            <div *ngIf="materials.length === 0" class="empty-state">No study materials uploaded for this batch yet.</div>
          </div>
        </div>

        <!-- Assignments -->
        <div *ngIf="activeTab === 'assignments'" class="animate-slide">
           <h3 class="section-title">Homework & Assignments</h3>
           <div *ngFor="let a of assignments" class="assignment-card glass mb-4 p-5 flex flex-col md:flex-row justify-between items-start md:items-center animate-scale">
              <div class="flex-1">
                <h4 class="font-bold text-lg">{{ a.title }}</h4>
                <div class="flex gap-4 mt-1">
                  <span class="text-xs text-secondary">📅 Deadline: <strong>{{ a.dueDate | localDate }}</strong></span>
                  <span class="text-xs text-secondary">📝 Max Marks: {{ a.maxMarks }}</span>
                </div>
              </div>
              
              <div class="mt-4 md:mt-0 w-full md:w-auto">
                <div *ngIf="!mySubmissions[a.id!]" class="flex gap-2">
                  <input type="text" class="form-control" [(ngModel)]="submissionLinks[a.id!]" placeholder="Paste Google Drive/Doc link here">
                  <button class="btn btn-primary" (click)="submitHomework(a.id!)">Submit</button>
                </div>
                <div *ngIf="mySubmissions[a.id!]" class="status-badge success">
                  ✔ Submitted! {{ mySubmissions[a.id!].marksObtained !== null ? '(Graded: ' + mySubmissions[a.id!].marksObtained + ')' : '(Awaiting Review)' }}
                </div>
              </div>
           </div>
           <div *ngIf="assignments.length === 0" class="empty-state">No assignments posted yet. Enjoy!</div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-bottom: 0.5rem; }
    .teacher-pill { display: inline-flex; align-items: center; gap: 0.5rem; background: #EEF2FF; color: #6366F1; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.85rem; font-weight: 600; }
    
    .tabs { display: flex; gap: 2rem; border-bottom: 1px solid var(--border-color); }
    .tab-btn { padding: 1rem 0.5rem; background: none; border: none; font-weight: 700; cursor: pointer; color: var(--text-secondary); border-bottom: 3px solid transparent; transition: all 0.2s; }
    .tab-btn:hover { color: var(--primary-color); }
    .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }

    .card-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); }
    .card-title { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin: 0; }

    .info-row { display: flex; justify-content: space-between; margin-bottom: 1.25rem; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.75rem; }
    .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .info-row .label { font-weight: 600; color: var(--text-secondary); font-size: 0.9rem; }
    .info-row .value { font-weight: 700; color: var(--text-primary); font-size: 0.9rem; }

    .material-card { display: flex; align-items: center; gap: 1rem; background: white; padding: 1.25rem; border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 1rem; transition: all 0.2s; }
    .material-card:hover { transform: translateX(5px); border-color: var(--primary-color); box-shadow: var(--shadow-md); }
    .material-icon { font-size: 1.5rem; background: #F8FAFC; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 12px; }
    .material-info { flex: 1; }
    .material-name { display: block; font-weight: 700; color: var(--text-primary); }
    .material-date { font-size: 0.75rem; color: var(--text-secondary); }

    .status-badge { padding: 0.5rem 1rem; border-radius: 10px; font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; }
    .status-badge.success { background: #DCFCE7; color: #16A34A; }

    .bg-blue-50 { background-color: #EFF6FF; }
    .border-blue-100 { border-color: #DBEAFE; }
    .status-pill { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 6px; background: #E2E8F0; color: #64748B; }
    .status-pill.active { background: #6366F1; color: white; }

    .section-title { font-size: 1.25rem; font-weight: 800; color: #0F172A; margin: 2rem 0 1.25rem; }
    .empty-state { text-align: center; padding: 4rem 2rem; color: #94A3B8; font-style: italic; }
  `]
})
export class StudentBatchDetailsComponent implements OnInit {
  batch: Batch | null = null;
  activeTab: 'content' | 'assignments' | 'schedule' = 'content';
  newProposedTime = '';
  materials: StudyMaterial[] = [];
  assignments: Assignment[] = [];
  mySubmissions: Record<number, Submission> = {};
  submissionLinks: Record<number, string> = {};

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private batchService: BatchService,
    private materialService: MaterialService,
    private assignmentService: AssignmentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.batchService.getBatch(id).subscribe((b: Batch) => {
        this.batch = b;
        this.loadMaterials();
        this.loadAssignments();
      });
    }
  }

  loadMaterials() { if (this.batch) this.materialService.getMaterials(this.batch.id).subscribe(m => this.materials = m); }
  loadAssignments() {
    if (this.batch) {
      this.assignmentService.getAssignments(this.batch.id).subscribe(a => {
        this.assignments = a;
        a.forEach(assignment => this.loadMySubmission(assignment.id!));
      });
    }
  }
  loadMySubmission(assignmentId: number) {
    const student = this.authService.getCurrentUser();
    if (!student) return;
    this.assignmentService.getSubmissions(assignmentId).subscribe(subs => {
      const mySub = subs.find(s => s.studentId === student.userId);
      if (mySub) this.mySubmissions[assignmentId] = mySub;
    });
  }
  submitHomework(assignmentId: number) {
    const student = this.authService.getCurrentUser();
    const link = this.submissionLinks[assignmentId];
    if (!student || !link) return;
    this.assignmentService.submitAssignment(assignmentId, student.userId, link).subscribe(() => {
      this.toast.success('Submitted!');
      this.loadMySubmission(assignmentId);
    });
  }
  getFileUrl(url: string): string {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return url;
  }
}
