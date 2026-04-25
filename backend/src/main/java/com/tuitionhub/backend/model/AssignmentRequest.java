package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assignment_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"batches", "password", "otp", "otpExpiry", "createdAt", "updatedAt", "hibernateLazyInitializer", "handler"})
    private User student;

    @Column(nullable = false)
    private String subjects; // e.g. "Maths, Science"

    private String preferredTimings;
    private String additionalNotes;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_teacher_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"batches", "password", "otp", "otpExpiry", "createdAt", "updatedAt", "hibernateLazyInitializer", "handler"})
    private User assignedTeacher;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum RequestStatus {
        PENDING, ASSIGNED, CANCELLED
    }
}
