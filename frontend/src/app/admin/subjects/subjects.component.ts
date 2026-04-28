import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-admin-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Manage Subjects 📚</h1>
          <p class="subtitle">Add or remove subjects offered on the platform.</p>
        </div>
      </div>

      <div class="dashboard-grid animate-fade">
        <!-- Add Subject Form -->
        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">Add New Subject</h2>
          </div>
          <form (ngSubmit)="addSubject()" #subjectForm="ngForm" class="p-4">
            <div class="form-group mb-4">
              <label class="form-label">Subject Name</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="newSubject.name" 
                name="name" 
                required 
                placeholder="e.g. Mathematics, Physics, Coding"
              >
            </div>
            <div class="form-group mb-4">
              <label class="form-label">Icon (Emoji)</label>
              <input 
                type="text" 
                class="form-control" 
                [(ngModel)]="newSubject.icon" 
                name="icon" 
                placeholder="e.g. 🔢, 🧪, 💻"
              >
            </div>
            <button type="submit" class="btn-primary-block" [disabled]="subjectForm.invalid || isLoading">
              {{ isLoading ? 'Adding...' : '➕ Add Subject' }}
            </button>
          </form>
        </div>

        <!-- Subjects List -->
        <div class="card glass">
          <div class="card-header">
            <h2 class="card-title">Existing Subjects</h2>
          </div>
          <div class="subjects-list">
            <div *ngIf="subjects.length === 0" class="empty-state">
              <p>No subjects added yet.</p>
            </div>
            <div *ngFor="let subject of subjects" class="subject-item animate-fade">
              <div class="subject-info">
                <span class="subject-icon">{{ subject.icon || '📚' }}</span>
                <span class="subject-name">{{ subject.name }}</span>
              </div>
              <button class="btn-delete" (click)="deleteSubject(subject.id!)" title="Delete Subject">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); margin: 0; }
    .subtitle { color: var(--text-secondary); font-size: 0.875rem; margin-top: 0.25rem; }

    .dashboard-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
    
    .form-group { margin-bottom: 1.25rem; }
    .form-label { display: block; font-weight: 700; font-size: 0.8125rem; color: #334155; margin-bottom: 0.5rem; }
    .form-control {
      width: 100%; padding: 0.75rem 1rem; border-radius: 10px;
      border: 1.5px solid #E2E8F0; font-size: 0.9375rem;
      transition: all 0.2s; box-sizing: border-box;
    }
    .form-control:focus { border-color: var(--primary-color); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); outline: none; }

    .btn-primary-block {
      width: 100%; background: var(--gradient-primary); color: white;
      padding: 0.85rem; border: none; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary-block:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
    .btn-primary-block:disabled { opacity: 0.6; cursor: not-allowed; }

    .subjects-list { display: flex; flex-direction: column; gap: 0.75rem; padding: 1rem; max-height: 500px; overflow-y: auto; }
    .subject-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 1rem; background: #F8FAFC; border-radius: 12px;
      border: 1px solid #E2E8F0; transition: all 0.2s;
    }
    .subject-item:hover { border-color: var(--primary-color); transform: translateX(5px); }
    .subject-info { display: flex; align-items: center; gap: 1rem; }
    .subject-icon { font-size: 1.5rem; }
    .subject-name { font-weight: 700; color: var(--text-primary); }

    .btn-delete {
      background: #FEE2E2; color: #991B1B; border: none;
      width: 36px; height: 36px; border-radius: 10px;
      cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
    }
    .btn-delete:hover { background: #EF4444; color: white; transform: scale(1.1); }

    .empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); }

    @media (max-width: 768px) {
      .dashboard-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminSubjectsComponent implements OnInit {
  subjects: any[] = [];
  newSubject = { name: '', icon: '' };
  isLoading = false;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadSubjects();
  }

  loadSubjects() {
    this.adminService.getSubjects().subscribe(s => this.subjects = s);
  }

  addSubject() {
    this.isLoading = true;
    this.adminService.addSubject(this.newSubject).subscribe({
      next: () => {
        this.toast.success('Subject added successfully');
        this.newSubject = { name: '', icon: '' };
        this.loadSubjects();
        this.isLoading = false;
      },
      error: (err) => {
        this.toast.error(err.error?.message || 'Error adding subject');
        this.isLoading = false;
      }
    });
  }

  deleteSubject(id: number) {
    if (confirm('Are you sure you want to delete this subject?')) {
      this.adminService.deleteSubject(id).subscribe({
        next: () => {
          this.toast.info('Subject deleted');
          this.loadSubjects();
        },
        error: () => this.toast.error('Error deleting subject')
      });
    }
  }
}
