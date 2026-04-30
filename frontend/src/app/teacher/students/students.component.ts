import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../shared/services/batch.service';
import { User, Batch } from '../../shared/models/models';

interface EnrolledStudent {
  id: number;
  name: string;
  city: string;
  country: string;
  batches: { name: string; timingFrom: string; timingTo: string }[];
}

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="page-header animate-slide">
        <h1 class="page-title">My Students</h1>
        <p class="text-secondary mt-1">Overview of all students currently enrolled in your active batches.</p>
      </div>

      <div class="card glass p-0 animate-fade">
        <div class="table-responsive">
          <table class="premium-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Location</th>
                <th>Enrolled Batches</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <ng-container *ngFor="let student of uniqueStudents">
                <tr class="animate-fade">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar-box">{{ student.name.charAt(0) | uppercase }}</div>
                      <div class="user-info">
                        <div class="user-primary">{{ student.name }}</div>
                        <div class="user-secondary text-xs">ID: #{{ student.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="location-cell">
                      <span class="city-text" *ngIf="student.city || student.country">
                        📍 {{ student.city }} {{ student.country ? '(' + student.country + ')' : '' }}
                      </span>
                      <span class="text-secondary text-sm" *ngIf="!student.city && !student.country">Not specified</span>
                    </div>
                  </td>
                  <td>
                    <div class="batches-wrap">
                      <div *ngFor="let b of student.batches" class="batch-pill">
                        <span class="b-name">{{ b.name }}</span>
                        <span class="b-time">{{ b.timingFrom }} - {{ b.timingTo }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="status-pill active">Active</span>
                  </td>
                </tr>
              </ng-container>

              <tr *ngIf="uniqueStudents.length === 0 && !isLoading">
                <td colspan="4">
                  <div class="empty-state">
                    <div class="text-4xl mb-4">👨‍🎓</div>
                    <h3>No Students Yet</h3>
                    <p>You don't have any students enrolled in your batches right now.</p>
                  </div>
                </td>
              </tr>
              
              <tr *ngIf="isLoading">
                <td colspan="4" class="text-center py-8">
                  <div class="spinner">⏳</div>
                  <p class="mt-2 text-secondary">Loading students...</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }

    .card { background: white; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); overflow: hidden; }
    .card.glass { background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px); }

    .table-responsive { width: 100%; overflow-x: auto; }
    .premium-table { width: 100%; border-collapse: separate; border-spacing: 0; }
    .premium-table th { padding: 1.25rem 1.5rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; background: #F8FAFC; border-bottom: 1px solid var(--border-color); text-align: left; }
    .premium-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border-color); vertical-align: middle; }
    .premium-table tr:last-child td { border-bottom: none; }
    .premium-table tr:hover { background: rgba(248, 250, 252, 0.5); }

    .user-cell { display: flex; align-items: center; gap: 1rem; }
    .user-avatar-box { width: 44px; height: 44px; border-radius: 12px; background: #EEF2FF; color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.125rem; }
    .user-primary { font-weight: 700; color: var(--text-primary); font-size: 0.9375rem; }
    .user-secondary { color: var(--text-secondary); }

    .city-text { font-size: 0.875rem; font-weight: 600; color: #475569; }

    .batches-wrap { display: flex; flex-direction: column; gap: 0.5rem; }
    .batch-pill { background: #F1F5F9; border: 1px solid #E2E8F0; padding: 0.4rem 0.75rem; border-radius: 8px; display: inline-flex; align-items: center; gap: 0.5rem; width: fit-content; }
    .b-name { font-weight: 700; font-size: 0.8rem; color: #1E293B; }
    .b-time { font-size: 0.7rem; color: #64748B; background: white; padding: 0.1rem 0.4rem; border-radius: 4px; border: 1px solid #E2E8F0; }

    .status-pill { font-size: 0.7rem; font-weight: 800; padding: 0.4rem 0.8rem; border-radius: 100px; display: inline-block; text-transform: uppercase; }
    .status-pill.active { background: #DCFCE7; color: #166534; }

    .empty-state { text-align: center; padding: 4rem 2rem; color: var(--text-secondary); }
    .empty-state h3 { font-size: 1.25rem; font-weight: 800; color: #1E293B; margin-bottom: 0.5rem; }
    
    .text-center { text-align: center; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    
    .spinner { animation: spin 2s linear infinite; display: inline-block; font-size: 2rem; }
    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class TeacherStudentsComponent implements OnInit {
  isLoading = true;
  uniqueStudents: EnrolledStudent[] = [];

  constructor(private batchService: BatchService) {}

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.batchService.getTeacherBatches().subscribe({
      next: (batches) => {
        const studentMap = new Map<number, EnrolledStudent>();

        batches.forEach(b => {
          if (b.students && b.students.length > 0) {
            b.students.forEach(s => {
              if (!studentMap.has(s.id)) {
                studentMap.set(s.id, {
                  id: s.id,
                  name: s.name,
                  city: s.city || '',
                  country: s.country || '',
                  batches: []
                });
              }
              const student = studentMap.get(s.id)!;
              student.batches.push({
                name: b.name,
                timingFrom: b.timingFrom,
                timingTo: b.timingTo
              });
            });
          }
        });

        this.uniqueStudents = Array.from(studentMap.values());
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
