package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private Batch batch;

    @Column(nullable = false)
    private Double amount;

    private LocalDate forMonth;         // e.g. 2024-05-01 = "May 2024"

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    // Extra Details from Razorpay
    private String paymentMethod;      // e.g. upi, card, netbanking
    private String bankName;           // e.g. HDFC, ICICI
    private String cardNetwork;        // e.g. Visa, Mastercard
    private String walletName;         // e.g. AmazonPay
    private String upiVpa;             // e.g. user@okaxis
    private String payerEmail;
    private String payerContact;
    private Double gatewayFee;
    private Double gatewayTax;

    // Error Details for FAILED status
    private String errorCode;
    private String errorDescription;
    private String errorReason;
    private String errorStep;

    private String transactionNote;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime paidAt;

    public enum PaymentStatus {
        PENDING, PAID, FAILED, REFUNDED
    }
}
