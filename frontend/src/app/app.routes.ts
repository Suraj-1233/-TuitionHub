import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { roleGuard } from './shared/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register.component').then(m => m.RegisterComponent)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
      }
    ]
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: 'STUDENT' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./student/dashboard/dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'mentors',
        loadComponent: () => import('./student/batches/batches.component').then(m => m.StudentBatchesComponent)
      },
      {
        path: 'mentors/:id',
        loadComponent: () => import('./student/batches/batch-details/batch-details.component').then(m => m.StudentBatchDetailsComponent)
      },
      {
        path: 'schedule',
        loadComponent: () => import('./student/schedule/schedule.component').then(m => m.StudentScheduleComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./student/payments/payments.component').then(m => m.StudentPaymentsComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./student/wallet/wallet.component').then(m => m.WalletComponent)
      },
      {
        path: 'sessions',
        loadComponent: () => import('./student/sessions/sessions.component').then(m => m.SessionsComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard],
    data: { role: 'TEACHER' },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./teacher/dashboard/dashboard.component').then(m => m.TeacherDashboardComponent)
      },
      {
        path: 'classes',
        loadComponent: () => import('./teacher/batches/batches.component').then(m => m.TeacherBatchesComponent)
      },
      {
        path: 'classes/:id',
        loadComponent: () => import('./teacher/batches/batch-details/batch-details.component').then(m => m.TeacherBatchDetailsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./teacher/students/students.component').then(m => m.TeacherStudentsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./teacher/profile/profile.component').then(m => m.TeacherProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: ['ADMIN', 'SUPER_ADMIN', 'ORG_ADMIN'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'teachers',
        loadComponent: () => import('./admin/teachers/teachers.component').then(m => m.AdminTeachersComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./admin/students/students.component').then(m => m.AdminStudentsComponent)
      },
      {
        path: 'requests',
        loadComponent: () => import('./admin/requests/requests.component').then(m => m.AdminRequestsComponent)
      },
      {
        path: 'payments',
        loadComponent: () => import('./admin/payments/payments.component').then(m => m.AdminPaymentsComponent)
      },
      {
        path: 'subjects',
        loadComponent: () => import('./admin/subjects/subjects.component').then(m => m.AdminSubjectsComponent)
      },
      {
        path: 'wallet',
        loadComponent: () => import('./admin/wallet/wallet.component').then(m => m.AdminWalletComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/auth/login' }
];
