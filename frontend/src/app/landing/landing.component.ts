import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="landing-page">
      <!-- Navigation -->
      <nav class="top-nav animate-fade">
        <div class="nav-container">
          <div class="brand">
            <div class="logo">TH</div>
            <span class="brand-name">TuitionHub</span>
          </div>
          <div class="nav-links">
            <a routerLink="/auth/login" class="nav-link">Login</a>
            <a routerLink="/auth/register" class="btn-primary-small">Get Started</a>
          </div>
        </div>
      </nav>

      <!-- Hero Section -->
      <header class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-content container animate-slide">
          <h1 class="hero-title">Unlock Your Potential with <span class="highlight">1-on-1</span> Mentorship</h1>
          <p class="hero-subtitle">Connect with top-tier educators worldwide. Personalized learning, flexible scheduling, and global expertise at your fingertips.</p>
          <div class="hero-actions">
            <a routerLink="/auth/register" class="btn-hero-primary">Start Learning Now 🚀</a>
            <a routerLink="/auth/register" class="btn-hero-outline">Become a Mentor 👨‍🏫</a>
          </div>
        </div>
        <div class="hero-image-wrapper">
           <img src="assets/hero-banner.png" alt="TuitionHub Hero" class="hero-img animate-float">
        </div>
      </header>

      <!-- Features Section -->
      <section class="features-section container">
        <div class="section-header text-center animate-fade">
          <h2 class="section-title">Everything You Need to Succeed</h2>
          <p class="section-subtitle">A complete ecosystem designed for modern students and dedicated teachers.</p>
        </div>

        <div class="features-grid">
          <div class="feature-card glass animate-scale">
            <div class="feature-icon">🎓</div>
            <h3>1-on-1 Tutoring</h3>
            <p>No crowded classrooms. Get 100% attention from your mentor for deep conceptual clarity.</p>
          </div>
          <div class="feature-card glass animate-scale">
            <div class="feature-icon">⏰</div>
            <h3>Dynamic Scheduling</h3>
            <p>Life is busy. Propose and manage class timings that fit your personal routine seamlessly.</p>
          </div>
          <div class="feature-card glass animate-scale">
            <div class="feature-icon">💳</div>
            <h3>Secure Payments</h3>
            <p>Transparent billing via our secure payment gateway. Pay only for the sessions you attend.</p>
          </div>
          <div class="feature-card glass animate-scale">
            <div class="feature-icon">🌍</div>
            <h3>Global Timezones</h3>
            <p>Whether you're in India or Indiana, we sync schedules automatically across the globe.</p>
          </div>
          <div class="feature-card glass animate-scale">
            <div class="feature-icon">📚</div>
            <h3>Study Material</h3>
            <p>Access notes, assignments, and recordings directly from your personalized dashboard.</p>
          </div>

        </div>
      </section>

      <!-- Stats Section -->
      <section class="stats-section">
        <div class="container stats-flex">
          <div class="stat-item">
            <span class="stat-number">500+</span>
            <span class="stat-label">Expert Mentors</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">10k+</span>
            <span class="stat-label">Happy Students</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">4.9/5</span>
            <span class="stat-label">Avg. Rating</span>
          </div>
        </div>
      </section>

      <!-- CTA Footer -->
      <footer class="footer">
        <div class="container text-center">
          <h2>Ready to experience the future of tuition?</h2>
          <p class="mb-8">Join thousands of students who are already mastering their subjects with TuitionHub.</p>
          <a routerLink="/auth/register" class="btn-hero-primary">Create Your Account</a>
          <div class="footer-links mt-12">
            <p>© 2026 TuitionHub Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host { --primary: #6366f1; --primary-dark: #4f46e5; --accent: #f59e0b; --text-main: #1e293b; --text-muted: #64748b; }
    
    .landing-page { font-family: 'Inter', sans-serif; color: var(--text-main); background: #fafafa; overflow-x: hidden; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; }
    .text-center { text-align: center; }
    .mb-8 { margin-bottom: 2rem; }
    .mt-12 { margin-top: 3rem; }

    /* Nav */
    .top-nav { position: fixed; top: 0; width: 100%; z-index: 1000; background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border-bottom: 1px solid #e2e8f0; }
    .nav-container { max-width: 1200px; margin: 0 auto; height: 80px; display: flex; justify-content: space-between; align-items: center; padding: 0 1.5rem; }
    .brand { display: flex; align-items: center; gap: 0.75rem; }
    .logo { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .brand-name { font-size: 1.5rem; font-weight: 800; color: var(--text-main); }
    .nav-links { display: flex; align-items: center; gap: 1.5rem; }
    .nav-link { text-decoration: none; color: var(--text-main); font-weight: 600; transition: 0.2s; }
    .nav-link:hover { color: var(--primary); }
    .btn-primary-small { background: var(--primary); color: white; text-decoration: none; padding: 0.6rem 1.25rem; border-radius: 10px; font-weight: 700; transition: 0.2s; }
    .btn-primary-small:hover { background: var(--primary-dark); transform: translateY(-2px); }

    /* Hero */
    .hero-section { position: relative; padding: 160px 0 100px; background: #0f172a; min-height: 80vh; display: flex; align-items: center; color: white; overflow: hidden; }
    .hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15), transparent); }
    .hero-content { position: relative; z-index: 10; max-width: 700px; }
    .hero-title { font-size: 4rem; font-weight: 900; line-height: 1.1; margin-bottom: 1.5rem; }
    .highlight { background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-subtitle { font-size: 1.25rem; opacity: 0.8; margin-bottom: 2.5rem; line-height: 1.6; }
    .hero-actions { display: flex; gap: 1rem; }
    .btn-hero-primary { background: var(--primary); color: white; text-decoration: none; padding: 1.25rem 2.5rem; border-radius: 14px; font-weight: 800; font-size: 1.1rem; transition: 0.3s; box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4); }
    .btn-hero-primary:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px rgba(99, 102, 241, 0.5); }
    .btn-hero-outline { background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); color: white; text-decoration: none; padding: 1.25rem 2.5rem; border-radius: 14px; font-weight: 800; font-size: 1.1rem; transition: 0.3s; backdrop-filter: blur(5px); }
    .btn-hero-outline:hover { background: rgba(255,255,255,0.2); border-color: white; }

    .hero-image-wrapper { position: absolute; right: -5%; top: 55%; transform: translateY(-50%); width: 600px; z-index: 5; }
    .hero-img { width: 100%; border-radius: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.5); border: 8px solid rgba(255,255,255,0.05); }

    /* Features */
    .features-section { padding: 100px 0; }
    .section-header { margin-bottom: 4rem; }
    .section-title { font-size: 2.5rem; font-weight: 800; margin-bottom: 1rem; }
    .section-subtitle { font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin: 0 auto; }
    
    .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; }
    .feature-card { padding: 2.5rem; border-radius: 24px; background: white; border: 1px solid #f1f5f9; transition: 0.3s; }
    .feature-card:hover { transform: translateY(-10px); border-color: var(--primary); box-shadow: 0 20px 40px rgba(0,0,0,0.05); }
    .feature-icon { font-size: 2.5rem; margin-bottom: 1.5rem; display: block; }
    .feature-card h3 { font-size: 1.5rem; font-weight: 800; margin-bottom: 1rem; }
    .feature-card p { color: var(--text-muted); line-height: 1.6; }

    /* Stats */
    .stats-section { background: #f8fafc; padding: 80px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
    .stats-flex { display: flex; justify-content: space-around; align-items: center; }
    .stat-item { text-align: center; }
    .stat-number { font-size: 3.5rem; font-weight: 900; color: var(--primary); display: block; line-height: 1; }
    .stat-label { font-size: 1rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 0.5rem; }

    /* Footer */
    .footer { padding: 100px 0 50px; background: #0f172a; color: white; }
    .footer h2 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1.5rem; }
    .footer p { font-size: 1.1rem; opacity: 0.7; }

    /* Animations */
    .animate-fade { animation: fadeIn 1s ease-out; }
    .animate-slide { animation: slideUp 1s ease-out; }
    .animate-scale { animation: scaleIn 0.5s ease-out; }
    .animate-float { animation: float 6s ease-in-out infinite; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }

    @media (max-width: 1024px) {
      .hero-title { font-size: 3rem; }
      .hero-image-wrapper { display: none; }
      .features-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .features-grid { grid-template-columns: 1fr; }
      .hero-actions { flex-direction: column; }
      .stats-flex { flex-direction: column; gap: 3rem; }
    }
  `]
})
export class LandingComponent {}
