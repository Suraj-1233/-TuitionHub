package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    @JsonIgnoreProperties({"students", "teacher"})
    private Batch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    @JsonIgnoreProperties({"batches", "otp", "otpExpiry", "password"})
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnoreProperties({"batches", "otp", "otpExpiry", "password"})
    private User student;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SessionStatus status = SessionStatus.PENDING;

    @Column(nullable = false)
    private Double amount;

    @Builder.Default
    private Boolean isPaid = false;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentMethod; // GATEWAY, MANUAL

    private Double gatewayAmountPaid;

    private String paymentReference; // Gateway payment ID

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PayoutStatus payoutStatus = PayoutStatus.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum SessionStatus {
        PENDING, CONFIRMED, COMPLETED, CANCELLED
    }

    public enum PaymentMethod {
        GATEWAY, MANUAL
    }

    public enum PayoutStatus {
        PENDING, APPROVED, PAID, REJECTED
    }
}
