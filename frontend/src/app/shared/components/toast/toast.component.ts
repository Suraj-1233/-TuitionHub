import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async" 
           [class]="'toast ' + toast.type" 
           (click)="remove(toast.id)">
        <span class="icon">{{ getIcon(toast.type) }}</span>
        <span class="message">{{ toast.message }}</span>
        <button class="close-btn">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      min-width: 300px;
      max-width: 400px;
      background: var(--surface-color);
      padding: 1rem;
      border-radius: var(--border-radius);
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-left: 4px solid var(--primary-color);
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      transition: all 0.2s;
    }
    .toast:hover { transform: translateX(-4px); }
    
    .toast.success { border-left-color: var(--secondary-color); }
    .toast.error { border-left-color: var(--danger-color); }
    .toast.warning { border-left-color: var(--accent-color); }
    .toast.info { border-left-color: var(--primary-color); }

    .icon { font-size: 1.25rem; }
    .message { font-size: 0.875rem; font-weight: 500; flex: 1; color: var(--text-primary); }
    .close-btn { background: none; border: none; color: var(--text-secondary); font-size: 1.25rem; cursor: pointer; }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
  toasts$ = this.toastService.toasts$;

  constructor(private toastService: ToastService) {}

  remove(id: number) {
    this.toastService.remove(id);
  }

  getIcon(type: Toast['type']) {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }
}
