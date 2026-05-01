# 🚀 TuitionHub Platform - Features Chronicle

This document tracks the evolution of the TuitionHub platform, documenting all major features, architectural decisions, and milestones.

---

## 🏫 1. Payment System
Implemented a secure and scalable payment gateway integration.

- **Direct Gateway Payments**: All payments are processed directly via Razorpay, ensuring security and immediate settlement.
- **Parent-Centric Economy**: Financial responsibility shifted entirely to the **Parent Role**. Students focus on learning, while Parents manage fee payments for all linked children.
- **Automated Invoicing**: System tracks every transaction, referral, and course fee payment.
- **Transaction Logs**: Granular history for every gateway payment and course enrollment.

## 🎟️ 2. Flexible Learning Modes & Dynamic Pricing
Transitioned from fixed batch sizes to a flexible "Individual vs. Batch" model.

- **1-on-1 vs. Group**: Parents can choose high-priority 1-on-1 sessions or cost-effective group batches.
- **Negotiated Pricing**: Admin has the power to set custom, dynamic fees for each student based on the chosen mode and parent consultation.
- **Auto-Provisioning**: The system automatically creates dedicated batches and meeting links once the Admin confirms the negotiated terms.

- **Booking Workflow**: Sessions are created as `PENDING` and only `CONFIRMED` (unlocked) after successful payment.
- **Automated Payout Tracking**: System tracks teacher earnings per session, pending admin approval.
- **Session Feedback**: Students can rate (1-5 stars) and review sessions once they are marked as `COMPLETED`.
- **Smart Learning Schedule**: 
    - Real-time view of all scheduled 1-on-1 sessions.
    - Toggle between Calendar Grid and Upcoming List view.
    - Direct payment integration and "Launch Class" shortcuts.



## 🛡️ 4. Admin Command Center
Enhanced controls for platform administrators.


- **Revenue Dashboard**: Track global platform revenue and transaction flows.
- **Tutor Approval**: Multi-step verification for new teachers.
- **Session Oversight**: Track all tutoring sessions and manage payouts.

## 🛡️ 5. Enterprise-Grade Observability (Audit Logging)
Implemented a robust AOP-based Audit System to track sensitive operations across the platform.

- **@Auditable Annotation**: Custom annotation-driven logging for methods like payment approvals and role changes.
- **Tamper-Evident History**: Records who performed what action, when, and on which entity.

## 📡 6. Standardized Communication (API Contract)
Introduced a unified `ApiResponse<T>` wrapper for all backend communication.

- **Consistent JSON Contract**: Every response follows a predictable structure: `success`, `message`, `data`, `errors`, and `timestamp`.

---

## 🏗️ Architectural Overview
- **Backend**: Spring Boot 3.x, JPA/Hibernate, PostgreSQL, Spring Security.
- **Frontend**: Angular 17+ (Standalone Components), RxJS, Tailwind/Vanilla CSS.
- **Infrastructure**: Dockerized services for easy deployment.

---
*Updated on: 2026-04-28*
