import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DashboardLayoutComponent } from '../../../shared/components/layout/dashboard-layout.component';
import { BatchService } from '../../../shared/services/batch.service';
import { MaterialService, StudyMaterial } from '../../../shared/services/material.service';
import { Batch, User } from '../../../shared/models/models';
import { AttendanceService, Attendance } from '../../../shared/services/attendance.service';
import { LocalDatePipe } from '../../../shared/pipes/local-date.pipe';
import { ToastService } from 'src/app/shared/services/toast.service';
import { Assignment, AssignmentService, Submission } from 'src/app/shared/services/assignment.service';

@Component({
  selector: 'app-teacher-batch-details',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule, RouterModule, LocalDatePipe],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div *ngIf="batch" class="animate-fade">
        <div class="page-header">
          <div>
            <h1 class="page-title">{{ batch.name }}</h1>
            <p class="subtitle">{{ batch.subject }} • Class {{ batch.targetClass }}</p>
            <div class="student-pill" *ngIf="batch.students?.length">
              👤 Student: <strong>{{ batch.students![0].name }}</strong>
            </div>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-outline" routerLink="/teacher/classes">← Back to Classes</button>
            <a [href]="batch.liveClassLink" target="_blank" class="btn btn-primary" *ngIf="batch.liveClassLink">
              Join Live Class
            </a>
          </div>
        </div>

        <div class="tabs-container card glass p-0 mb-6">
          <div class="tabs">
            <button class="tab-btn" [class.active]="activeTab === 'materials'" (click)="activeTab = 'materials'">
              📚 Study Material
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'assignments'" (click)="activeTab = 'assignments'">
              📝 Assignments
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'schedule'" (click)="activeTab = 'schedule'">
              🕒 Schedule
            </button>
          </div>
        </div>

        <!-- Materials Tab -->
        <div *ngIf="activeTab === 'materials'" class="animate-slide">
          <div class="card glass mb-6">
            <div class="card-header"><h3 class="card-title">Upload Study Material (PDF/Doc)</h3></div>
            <div class="p-6">
              <div class="upload-container">
                <div class="file-drop-zone" (click)="fileInput.click()">
                  <input type="file" #fileInput class="hidden" (change)="handleFileSelect($event)" accept=".pdf,.doc,.docx,.jpg,.png">
                  <div class="upload-content">
                    <span class="upload-icon">📁</span>
                    <p class="upload-text">{{ selectedFileName || 'Click here to select a PDF file from your computer' }}</p>
                    <p class="upload-hint" *ngIf="!selectedFileName">Max size: 10MB</p>
                  </div>
                </div>

                <div class="form-row mt-4">
                  <div class="flex-1">
                    <label class="form-label">Material Title</label>
                    <input type="text" class="form-control" [(ngModel)]="newMaterial.title" placeholder="e.g. Mathematics Chapter 1 Notes">
                  </div>
                  <div class="flex-none flex items-end">
                    <button class="btn btn-primary h-[42px] px-8" [disabled]="!selectedFile || !newMaterial.title || isUploading" (click)="uploadMaterial()">
                      {{ isUploading ? 'Uploading...' : '🚀 Start Upload' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="materials-list">
            <h3 class="section-title">Uploaded Materials</h3>
            <div *ngFor="let m of materials" class="material-card">
              <div class="material-icon">📄</div>
              <div class="material-info">
                <span class="material-name">{{ m.title }}</span>
                <span class="material-date">Uploaded on {{ m.uploadedAt | localDate }}</span>
              </div>
              <div class="material-actions">
                <a [href]="getFileUrl(m.url)" target="_blank" class="btn-icon" title="View">👁️</a>
                <button class="btn-icon delete" (click)="deleteMaterial(m.id!)" title="Delete">🗑️</button>
              </div>
            </div>
            <div *ngIf="materials.length === 0" class="empty-state">No materials uploaded yet.</div>
          </div>
        </div>

        <!-- Assignments Tab -->
        <div *ngIf="activeTab === 'assignments'" class="animate-slide">
           <div class="card glass mb-6 p-6">
              <h3 class="card-title mb-4">Create Homework / Assignment</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="form-group">
                  <label class="form-label">Assignment Title</label>
                  <input type="text" class="form-control" [(ngModel)]="newAssignment.title" placeholder="e.g. Chapter 1 Practice Set">
                </div>
                <div class="form-group">
                  <label class="form-label">Due Date <small class="text-secondary">(In your local time)</small></label>
                  <input type="datetime-local" class="form-control" [(ngModel)]="newAssignment.dueDate">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Instructions</label>
                <textarea class="form-control" rows="4" [(ngModel)]="newAssignment.description" placeholder="Write instructions for the student here..."></textarea>
              </div>
              <button class="btn btn-primary w-full mt-4" (click)="createAssignment()" [disabled]="!newAssignment.title">
                Send Homework to Student
              </button>
           </div>

           <div class="assignments-list">
              <h3 class="section-title">Sent Homework / Assignments</h3>
              <div *ngFor="let a of assignments" class="assignment-card glass mb-4 p-4 flex justify-between items-center animate-scale">
                <div class="flex-1">
                  <h4 class="font-bold text-lg">{{ a.title }}</h4>
                  <div class="flex gap-4 mt-1">
                    <span class="text-xs text-secondary">📅 Deadline: <strong>{{ a.dueDate | localDate }}</strong></span>
                    <span class="text-xs text-secondary">📝 Max Marks: {{ a.maxMarks }}</span>
                  </div>
                </div>
                <button class="btn btn-outline btn-sm" (click)="viewSubmissions(a)">
                  View Submissions 📊
                </button>
              </div>
              <div *ngIf="assignments.length === 0" class="empty-state">No homework sent yet.</div>
           </div>
        </div>


        <!-- Schedule Tab -->
        <div *ngIf="activeTab === 'schedule'" class="animate-slide">
           <!-- Schedule content ... -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="card glass">
              <div class="card-header"><h3 class="card-title">Class Schedule</h3></div>
              <div class="p-6">
                <div class="info-row"><span class="label">Days:</span><span class="value">{{ batch.days }}</span></div>
                <div class="info-row"><span class="label">Time:</span><span class="value">{{ batch.timingFrom }} - {{ batch.timingTo }}</span></div>
                <div class="info-row"><span class="label">Timezone:</span><span class="value">{{ batch.timezone || 'Asia/Kolkata' }}</span></div>
              </div>
            </div>
            <div class="card glass" *ngIf="batch.students?.length && batch.students![0]?.timezone && batch.students![0]?.timezone !== (batch.timezone || 'Asia/Kolkata')">
              <div class="card-header"><h3 class="card-title">🌍 Student's Local Time</h3></div>
              <div class="p-6">
                <div class="info-row"><span class="label">Student Timezone:</span><span class="value">{{ batch.students![0].timezone }}</span></div>
                <p class="text-sm text-secondary">The student sees class times converted to their local timezone automatically.</p>
              </div>
            </div>
           </div>
        </div>

        <!-- Submissions Modal (Outside Tabs) -->
        <div class="modal-overlay" *ngIf="showSubmissionsModal" (click)="showSubmissionsModal = false">
          <div class="modal-content submissions-modal animate-pop" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div>
                <h2 class="modal-title">Submissions: {{ selectedAssignmentForSub?.title }}</h2>
                <p class="text-xs text-secondary mt-1">Review and grade your students' homework.</p>
              </div>
              <button class="close-btn" (click)="showSubmissionsModal = false">✕</button>
            </div>
            
            <div class="submissions-list-container">
              <div *ngIf="isSubmissionsLoading" class="p-8 text-center">
                 <div class="spinner mx-auto mb-2"></div>
                 <p class="text-secondary">Fetching submissions...</p>
              </div>
              
              <div *ngIf="!isSubmissionsLoading && assignmentSubmissions.length === 0" class="empty-state">
                <span class="text-3xl block mb-2">📥</span>
                No submissions found for this assignment yet.
              </div>

              <div class="submission-card" *ngFor="let sub of assignmentSubmissions">
                <div class="sub-header">
                  <div class="sub-student">
                    <div class="avatar-sm">{{ sub.studentName?.charAt(0) || 'S' }}</div>
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800">{{ sub.studentName || 'Unknown Student' }}</span>
                      <span class="text-[10px] text-slate-400">Submitted on {{ sub.submittedAt | localDate }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="sub-body">
                  <!-- PDF View Card -->
                  <div class="homework-file-card" *ngIf="sub.contentUrl">
                    <div class="file-icon">📄</div>
                    <div class="file-info">
                      <span class="file-label">Homework Document</span>
                      <span class="file-type">PDF / File Submission</span>
                    </div>
                    <a [href]="getFileUrl(sub.contentUrl)" target="_blank" class="btn-view-file">
                      View File 👁️
                    </a>
                  </div>
                  
                  <div *ngIf="!sub.contentUrl" class="p-4 bg-slate-50 rounded-lg text-xs text-slate-400 italic text-center">
                    No file attached to this submission.
                  </div>
                </div>

                <div class="grading-panel">
                  <div class="grade-inputs">
                    <div class="input-group">
                      <label>Marks (Max: {{ selectedAssignmentForSub?.maxMarks }})</label>
                      <input type="number" class="grade-input" [(ngModel)]="sub.marksObtained" [max]="selectedAssignmentForSub?.maxMarks || 100">
                    </div>
                    <button class="btn-save-grade" (click)="saveGrade(sub)">
                      Save Grade & Feedback
                    </button>
                  </div>
                  <div class="input-group mt-3">
                    <label>Teacher's Feedback</label>
                    <textarea class="feedback-input" rows="2" [(ngModel)]="sub.feedback" placeholder="e.g. Excellent presentation! Keep it up."></textarea>
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
    .page-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: var(--text-primary); }
    .subtitle { color: var(--text-secondary); margin-bottom: 0.5rem; }
    .student-pill { display: inline-flex; align-items: center; gap: 0.5rem; background: #E2E8F0; padding: 0.4rem 1rem; border-radius: 100px; font-size: 0.85rem; }
    
    .tabs { display: flex; gap: 2rem; border-bottom: 1px solid var(--border-color); margin-bottom: 2rem; }
    .tab-btn { padding: 1rem 0.5rem; background: none; border: none; font-weight: 700; cursor: pointer; color: var(--text-secondary); border-bottom: 3px solid transparent; }
    .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }

    .file-drop-zone { border: 2px dashed #CBD5E1; border-radius: 1rem; padding: 3rem; text-align: center; cursor: pointer; transition: all 0.2s; background: #F8FAFC; }
    .file-drop-zone:hover { border-color: var(--primary-color); background: #EEF2FF; }
    .upload-icon { font-size: 2.5rem; display: block; margin-bottom: 1rem; }
    .upload-text { font-weight: 700; color: var(--text-primary); }
    .upload-hint { font-size: 0.75rem; color: var(--text-secondary); }
    .hidden { display: none; }

    .form-row { display: flex; gap: 1rem; align-items: stretch; }
    .section-title { font-size: 1.25rem; font-weight: 700; margin: 2rem 0 1rem; }

    .material-card { display: flex; align-items: center; gap: 1rem; background: white; padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color); margin-bottom: 1rem; transition: transform 0.2s; }
    .material-card:hover { transform: translateX(5px); border-color: var(--primary-color); }
    .material-icon { font-size: 1.5rem; background: #F1F5F9; width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; border-radius: 10px; }
    .material-info { flex: 1; display: flex; flex-direction: column; }
    .material-name { font-weight: 700; color: var(--text-primary); }
    .material-date { font-size: 0.75rem; color: var(--text-secondary); }
    .btn-icon { background: none; border: none; font-size: 1.25rem; cursor: pointer; padding: 0.5rem; border-radius: 8px; text-decoration: none; display: flex; align-items: center; justify-content: center; }
    .btn-icon:hover { background: #F1F5F9; }
    .btn-icon.delete:hover { background: #FEE2E2; }

    .info-row { display: flex; justify-content: space-between; margin-bottom: 1rem; border-bottom: 1px solid #F1F5F9; padding-bottom: 0.5rem; }
    .info-row .label { font-weight: 600; color: var(--text-secondary); }
    .info-row .value { font-weight: 700; color: var(--text-primary); }
    .empty-state { text-align: center; padding: 3rem; color: var(--text-secondary); font-style: italic; }

    /* Submissions Modal Redesign */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1100; }
    .submissions-modal { width: 700px; max-height: 90vh; background: white; border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); }
    .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #F1F5F9; display: flex; justify-content: space-between; align-items: center; background: #FFF; }
    .modal-title { font-size: 1.4rem; font-weight: 800; color: #0F172A; }
    .close-btn { background: #F1F5F9; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #64748B; font-weight: bold; transition: all 0.2s; }
    .close-btn:hover { background: #FEE2E2; color: #EF4444; }

    .submissions-list-container { flex: 1; overflow-y: auto; padding: 1.5rem 2rem; background: #F8FAFC; }
    .submission-card { background: white; border-radius: 20px; border: 1px solid #E2E8F0; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    
    .sub-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
    .sub-student { display: flex; align-items: center; gap: 1rem; }
    .avatar-sm { width: 40px; height: 40px; background: linear-gradient(135deg, #6366F1 0%, #4338CA 100%); color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; }
    
    .homework-file-card { background: #EEF2FF; border: 1px solid #C7D2FE; border-radius: 12px; padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; }
    .file-icon { font-size: 1.75rem; }
    .file-info { flex: 1; display: flex; flex-direction: column; }
    .file-label { font-weight: 800; color: #3730A3; font-size: 0.9rem; }
    .file-type { font-size: 0.7rem; color: #6366F1; font-weight: 600; }
    .btn-view-file { background: white; color: #4338CA; border: 1px solid #C7D2FE; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.8rem; text-decoration: none; transition: all 0.2s; }
    .btn-view-file:hover { background: #4338CA; color: white; transform: translateY(-1px); }

    .grading-panel { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px dashed #E2E8F0; }
    .grade-inputs { display: flex; gap: 1rem; align-items: flex-end; }
    .input-group { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; }
    .input-group label { font-size: 0.75rem; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.025em; }
    
    .grade-input { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.6rem 1rem; border-radius: 8px; font-weight: 700; color: #0F172A; }
    .feedback-input { background: #F8FAFC; border: 1px solid #E2E8F0; padding: 0.75rem 1rem; border-radius: 8px; width: 100%; resize: none; font-size: 0.85rem; }
    
    .btn-save-grade { background: #0F172A; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; }
    .btn-save-grade:hover { background: #334155; transform: translateY(-1px); }

    .spinner { width: 30px; height: 30px; border: 3px solid #E2E8F0; border-top-color: #6366F1; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class TeacherBatchDetailsComponent implements OnInit {
  batch: Batch | null = null;
  activeTab: 'materials' | 'assignments' | 'schedule' = 'materials';
  newProposedTime = '';
  selectedFileName = '';
  selectedFile: File | null = null;
  isUploading = false;

  materials: StudyMaterial[] = [];
  assignments: Assignment[] = [];

  newMaterial: StudyMaterial = { title: '', type: 'PDF', url: '' };
  newAssignment: Assignment = { title: '', dueDate: '', description: '', maxMarks: 100 };

  constructor(
    private route: ActivatedRoute,
    private batchService: BatchService,
    private materialService: MaterialService,
    private assignmentService: AssignmentService,
    private attendanceService: AttendanceService,
    private toast: ToastService
  ) { }

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
  loadAssignments() { if (this.batch) this.assignmentService.getAssignments(this.batch.id).subscribe(a => this.assignments = a); }

  handleFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      if (!this.newMaterial.title) {
        this.newMaterial.title = file.name.split('.')[0];
      }
    }
  }

  uploadMaterial() {
    if (!this.selectedFile || !this.newMaterial.title) return;

    this.isUploading = true;
    this.materialService.uploadFile(this.selectedFile).subscribe({
      next: (res) => {
        this.newMaterial.url = res.url;
        this.newMaterial.type = 'PDF';
        this.saveMaterial();
      },
      error: () => {
        this.toast.error('Upload failed. Please check backend connection.');
        this.isUploading = false;
      }
    });
  }

  private saveMaterial() {
    this.materialService.uploadMaterial(this.batch!.id, this.newMaterial).subscribe(() => {
      this.toast.success('Material uploaded successfully');
      this.loadMaterials();
      this.resetForm();
    });
  }

  private resetForm() {
    this.newMaterial = { title: '', type: 'PDF', url: '' };
    this.selectedFile = null;
    this.selectedFileName = '';
    this.isUploading = false;
  }

  deleteMaterial(id: number) {
    if (confirm('Delete this material?')) {
      this.materialService.deleteMaterial(id).subscribe(() => this.loadMaterials());
    }
  }

  createAssignment() {
    if (!this.newAssignment.title) return;

    // Ensure the date is sent in ISO format with local timezone info
    // HTML datetime-local provides YYYY-MM-DDTHH:mm, we need to make sure backend gets the full point in time
    const payload = { ...this.newAssignment };
    if (payload.dueDate) {
      const date = new Date(payload.dueDate);
      payload.dueDate = date.toISOString(); // Backend expects OffsetDateTime, ISO format works
    }

    this.assignmentService.createAssignment(this.batch!.id, payload).subscribe(() => {
      this.toast.success('Homework sent to student');
      this.loadAssignments();
      this.newAssignment = { title: '', dueDate: '', description: '', maxMarks: 100 };
    });
  }

  showSubmissionsModal = false;
  isSubmissionsLoading = false;
  assignmentSubmissions: Submission[] = [];
  selectedAssignmentForSub: Assignment | null = null;

  viewSubmissions(assignment: Assignment) {
    this.selectedAssignmentForSub = assignment;
    this.showSubmissionsModal = true;
    this.isSubmissionsLoading = true;
    this.assignmentSubmissions = [];

    this.assignmentService.getSubmissions(assignment.id!).subscribe({
      next: (subs) => {
        this.assignmentSubmissions = subs || [];
        this.isSubmissionsLoading = false;
      },
      error: () => {
        this.toast.error('Failed to load submissions');
        this.isSubmissionsLoading = false;
      }
    });
  }

  saveGrade(submission: Submission) {
    if (!submission.id) return;
    
    const marks = submission.marksObtained || 0;
    const feedback = submission.feedback || '';

    this.assignmentService.gradeSubmission(submission.id, marks, feedback).subscribe({
      next: () => {
        this.toast.success('Grade and feedback saved!');
      },
      error: () => {
        this.toast.error('Failed to save grade');
      }
    });
  }

  getFileUrl(url: string): string {
    if (!url) return '#';
    // If it's already a full URL or a relative path that we can just use directly
    if (url.startsWith('http')) return url;
    return url;
  }

}
