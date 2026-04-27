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
            <p class="subtitle">Teacher: {{ batch.teacher.name }} • {{ batch.subject }}</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline" routerLink="/student/batches">← Back</button>
            <a [href]="batch.liveClassLink" target="_blank" class="btn btn-primary" *ngIf="batch.liveClassLink">Join Live</a>
          </div>
        </div>

        <div class="tabs-container card glass p-0 mb-6">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab === 'content'" (click)="activeTab = 'content'">📚 Content</button>
            <button class="tab-btn" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">📝 Homework</button>
            <button class="tab-btn" [class.active]="activeTab === 'schedule'" (click)="activeTab = 'schedule'">🕒 Schedule</button>
          </div>
        </div>

        <!-- Schedule Tab -->
        <div *ngIf="activeTab === 'schedule'" class="animate-slide">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card glass p-6">
              <h3 class="card-title mb-4">Current Time: {{ batch.timingFrom }}</h3>
              <p class="text-sm text-secondary">Days: {{ batch.days }}</p>
            </div>
            <div class="card glass p-6">
              <h3 class="card-title mb-4">Propose New Time</h3>
              <div class="flex gap-2">
                <input type="text" class="form-control" [(ngModel)]="newProposedTime" placeholder="e.g. 5:00 PM">
                <button class="btn btn-primary" (click)="proposeReschedule()">Request</button>
              </div>
              <div *ngIf="batch.isTimeChangeProposed" class="mt-4 p-3 bg-light rounded border">
                <span class="text-xs font-bold uppercase text-primary">
                  {{ batch.proposedByRole === 'STUDENT' ? 'Your Request' : 'Teacher Proposal' }}
                </span>
                <div class="font-bold">New Time: {{ batch.proposedTiming }}</div>
                <div class="flex gap-2 mt-2" *ngIf="batch.proposedByRole === 'TEACHER'">
                  <button class="btn btn-xs btn-primary" (click)="respondToReschedule(true)">Accept</button>
                  <button class="btn btn-xs btn-outline text-danger" (click)="respondToReschedule(false)">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div *ngIf="activeTab === 'content'" class="animate-slide">
          <div class="materials-list">
            <div *ngFor="let m of materials" class="card glass material-item mb-3 p-4 flex justify-between items-center">
              <div class="flex flex-col">
                <span class="font-bold">📚 {{ m.title }}</span>
                <span class="text-xs text-secondary">Added: {{ m.uploadedAt | localDate }}</span>
              </div>
              <a [href]="getFileUrl(m.url)" target="_blank" class="btn btn-sm btn-primary">View</a>
            </div>
          </div>
        </div>

        <!-- Assignments -->
        <div *ngIf="activeTab === 'assignments'" class="animate-slide">
          <div *ngFor="let a of assignments" class="card glass mb-4 p-4">
             <h4 class="font-bold">{{ a.title }}</h4>
             <p class="text-xs text-secondary">Deadline: {{ a.dueDate | localDate }}</p>
             <div *ngIf="!mySubmissions[a.id!]" class="mt-4 flex gap-2">
               <input type="text" class="form-control flex-1" [(ngModel)]="submissionLinks[a.id!]" placeholder="Link">
               <button class="btn btn-primary" (click)="submitHomework(a.id!)">Submit</button>
             </div>
             <div *ngIf="mySubmissions[a.id!]" class="mt-4 text-success">Submitted!</div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .tabs { display: flex; gap: 1rem; padding: 0.5rem 1rem; border-bottom: 1px solid var(--border-color); }
    .tab-btn { background: none; border: none; padding: 0.75rem 1rem; font-weight: 700; cursor: pointer; }
    .tab-btn.active { color: var(--primary-color); border-bottom: 2px solid var(--primary-color); }
    .bg-light { background: #F8FAFC; }
    .flex-1 { flex: 1; }
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
      this.batchService.getBatch(id).subscribe(b => {
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
  proposeReschedule() {
    if (!this.newProposedTime || !this.batch) return;
    this.batchService.proposeReschedule(this.batch.id, this.newProposedTime).subscribe(b => {
      this.batch = b;
      this.toast.success('Requested');
      this.newProposedTime = '';
    });
  }
  respondToReschedule(accept: boolean) {
    if (!this.batch) return;
    this.batchService.respondToReschedule(this.batch.id, accept).subscribe(b => {
      this.batch = b;
      this.toast.info(accept ? 'Accepted' : 'Rejected');
    });
  }

  getFileUrl(url: string): string {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return url;
  }
}
