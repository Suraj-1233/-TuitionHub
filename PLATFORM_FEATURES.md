# 🚀 TuitionHub Platform - Features Chronicle

This document tracks the evolution of the TuitionHub platform, documenting all major features, architectural decisions, and milestones.

---

## 🏫 1. Payment & Wallet System
Implemented a secure and scalable internal economy for students and tutors.

- **Internal Wallet**: Every user has a virtual wallet to store real currency (top-ups) and promotional credits.
- **Promo vs. Real Balance**: System distinguishes between withdrawable "Real Money" and non-withdrawable "Promo Credits".
- **Multi-Mode Payments**:
    - **Full Wallet Payment**: Pay using existing balance.
    - **Direct Gateway**: Pay via Razorpay.
    - **Partial Payment**: Use remaining wallet balance and pay the rest via gateway.
- **Transaction Logs**: Granular history for every credit, debit, referral, and top-up.

## 🎟️ 2. Pure 1-on-1 Session Management
Exclusively designed for individual tutoring. Students manage their assigned sessions directly through their private portal.

- **Booking Workflow**: Sessions are created as `PENDING` and only `CONFIRMED` (unlocked) after successful payment.
- **Automated Payout Tracking**: System tracks teacher earnings per session, pending admin approval.
- **Session Feedback**: Students can rate (1-5 stars) and review sessions once they are marked as `COMPLETED`.
- **Smart Learning Schedule**: 
    - Real-time view of all scheduled 1-on-1 sessions.
    - Toggle between Calendar Grid and Upcoming List view.
    - Direct payment integration and "Launch Class" shortcuts.

## 🎁 3. Advanced Referral System
A robust growth engine integrated with the wallet.

- **Unique Referral Codes**: Every user gets a personalized code (e.g., `TUI-XYZ12`).
- **Reward Trigger Logic**: Referral rewards are credited **only after** the referred user completes their first successful *paid* session.
- **Non-Withdrawable Rewards**: Referral bonuses go into "Promo Balance" and can only be used for booking sessions.

## 🛡️ 4. Admin Command Center
Enhanced controls for platform administrators.

- **Wallet Adjustments**: Admin can add/remove credits for promotional campaigns.
- **Revenue Dashboard**: Track global platform revenue and transaction flows.
- **Tutor Approval**: Multi-step verification for new teachers.
- **Session Oversight**: Track all tutoring sessions and manage payouts.

---

## 🏗️ Architectural Overview
- **Backend**: Spring Boot 3.x, JPA/Hibernate, PostgreSQL, Spring Security.
- **Frontend**: Angular 17+ (Standalone Components), RxJS, Tailwind/Vanilla CSS.
- **Infrastructure**: Dockerized services for easy deployment.

---
*Updated on: 2026-04-28*
