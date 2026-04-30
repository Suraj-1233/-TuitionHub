import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <!-- Top Progress Bar -->
      <div class="progress-bar-track">
        <div class="progress-bar-fill"></div>
      </div>

      <!-- Full page overlay with spinner -->
      <div class="loading-overlay">
        <div class="spinner-card">
          <div class="ring-spinner">
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="ring"></div>
            <div class="dot"></div>
          </div>
          <p class="loading-text">Loading...</p>
        </div>
      </div>
    }
  `,
  styles: [`
    /* ===== TOP PROGRESS BAR ===== */
    .progress-bar-track {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background: transparent;
      z-index: 99999;
    }
    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7, #6366f1);
      background-size: 200% 100%;
      animation: progressSlide 1.5s ease-in-out infinite, shimmer 1.5s linear infinite;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.7), 0 0 20px rgba(139, 92, 246, 0.5);
      border-radius: 0 4px 4px 0;
    }

    @keyframes progressSlide {
      0%   { width: 0%; }
      20%  { width: 40%; }
      60%  { width: 75%; }
      80%  { width: 90%; }
      95%  { width: 95%; }
      100% { width: 100%; }
    }

    @keyframes shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }

    /* ===== OVERLAY ===== */
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(248, 250, 252, 0.75);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 99990;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeInOverlay 0.15s ease-out;
    }

    @keyframes fadeInOverlay {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    /* ===== SPINNER CARD ===== */
    .spinner-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.25rem;
      background: white;
      padding: 2.5rem 3rem;
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(99, 102, 241, 0.15), 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #E0E7FF;
      animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes popIn {
      from { opacity: 0; transform: scale(0.85); }
      to   { opacity: 1; transform: scale(1); }
    }

    /* ===== RING SPINNER ===== */
    .ring-spinner {
      display: inline-block;
      position: relative;
      width: 56px;
      height: 56px;
    }
    .ring {
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 4px solid transparent;
      animation: spinRing 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    }
    .ring:nth-child(1) {
      border-top-color: #6366f1;
      animation-delay: -0.45s;
    }
    .ring:nth-child(2) {
      border-top-color: #8b5cf6;
      animation-delay: -0.3s;
      width: 80%;
      height: 80%;
      top: 10%;
      left: 10%;
    }
    .ring:nth-child(3) {
      border-top-color: #a855f7;
      animation-delay: -0.15s;
      width: 60%;
      height: 60%;
      top: 20%;
      left: 20%;
    }
    .dot {
      position: absolute;
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 8px rgba(99, 102, 241, 0.6);
    }

    @keyframes spinRing {
      0%   { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .loading-text {
      font-size: 0.875rem;
      font-weight: 700;
      color: #6366f1;
      margin: 0;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.5; }
    }
  `]
})
export class LoadingBarComponent {
  protected loadingService = inject(LoadingService);
}
