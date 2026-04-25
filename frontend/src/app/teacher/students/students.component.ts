import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardLayoutComponent } from '../../shared/components/layout/dashboard-layout.component';

@Component({
  selector: 'app-teacher-students',
  standalone: true,
  imports: [CommonModule, DashboardLayoutComponent],
  template: `
    <app-dashboard-layout role="TEACHER">
      <div class="page-header">
        <h1 class="page-title">My Students</h1>
      </div>
      <div class="card p-8 text-center text-secondary">
        <div class="text-4xl mb-4">👨‍🎓</div>
        <h3>Student Management</h3>
        <p>This module will show all students enrolled across your batches, their attendance, and performance.</p>
        <p class="mt-2 text-sm">(Available in next iteration)</p>
      </div>
    </app-dashboard-layout>
  `
})
export class TeacherStudentsComponent {}
