import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';
import { AdminService } from '../../shared/services/admin.service';
import { ToastService } from '../../shared/services/toast.service';
import { FormsModule } from '@angular/forms';
import { Batch } from '../../shared/models/models';

@Component({
  selector: 'app-admin-batches',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent, FormsModule],
  template: `
    <app-dashboard-layout role="ADMIN">
      <div class="page-header animate-slide">
        <div>
          <h1 class="page-title">Class Management</h1>
          <p class="subtitle">Monitor all active tuition sessions and manage negotiated fees.</p>
        </div>
      </div>

      <div class="table-container card animate-fade">
        <table class="data-table">
          <thead>
            <tr>
              <th>Batch Name / Subject</th>
              <th>Teacher</th>
              <th>Students</th>
              <th>Monthly Fee</th>
              <th>Timing</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of batches">
              <td>
                <div class="flex flex-col">
                  <span class="font-bold">{{ b.name }}</span>
                  <span class="text-xs text-secondary">{{ b.subject }}</span>
                </div>
              </td>
              <td>{{ b.teacher?.name }}</td>
              <td>
                <div class="student-avatars">
                  <div *ngFor="let s of b.students" class="avatar-mini" [title]="s.name">
                    {{ s.name?.charAt(0) }}
                  </div>
                </div>
              </td>
              <td>
                <div class="fee-badge" *ngIf="editingBatchId !== b.id">
                  ₹{{ b.monthlyFees }}
                </div>
                <div class="edit-fee-box" *ngIf="editingBatchId === b.id">
                  <input type="number" [(ngModel)]="editFeeValue" class="form-control" style="width: 100px;">
                </div>
              </td>
              <td>
                <span class="text-xs font-bold">{{ b.days }}</span><br>
                <span class="text-xs">{{ b.timingFrom }} - {{ b.timingTo }}</span>
              </td>
              <td>
                <div class="flex gap-2">
                  <button *ngIf="editingBatchId !== b.id" class="btn btn-outline btn-sm" (click)="startEdit(b)">
                    ✏️ Edit Fee
                  </button>
                  <ng-container *ngIf="editingBatchId === b.id">
                    <button class="btn btn-primary btn-sm" (click)="saveFee(b)">Save</button>
                    <button class="btn btn-outline btn-sm" (click)="editingBatchId = null">Cancel</button>
                  </ng-container>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-dashboard-layout>
  `,
  styles: [`
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.75rem; font-weight: 800; color: #0F172A; }
    .subtitle { color: #64748B; margin-top: 0.25rem; }

    .student-avatars { display: flex; gap: 4px; }
    .avatar-mini { 
      width: 24px; height: 24px; border-radius: 50%; background: #6366F1; color: white; 
      display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold;
    }

    .fee-badge { font-weight: 800; color: #0F172A; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.75rem; }
    .flex-col { display: flex; flex-direction: column; }
    .edit-fee-box { display: flex; align-items: center; gap: 0.5rem; }
  `]
})
export class AdminBatchesComponent implements OnInit {
  batches: Batch[] = [];
  editingBatchId: number | null = null;
  editFeeValue: number = 0;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.adminService.getAllBatches().subscribe(b => this.batches = b);
  }

  startEdit(batch: Batch) {
    this.editingBatchId = batch.id!;
    this.editFeeValue = batch.monthlyFees || 0;
  }

  saveFee(batch: Batch) {
    // We need an endpoint to update batch fee
    this.adminService.updateBatchFee(batch.id!, this.editFeeValue).subscribe({
      next: () => {
        this.toast.success('Fee updated successfully');
        this.editingBatchId = null;
        this.loadData();
      },
      error: () => this.toast.error('Failed to update fee')
    });
  }
}
