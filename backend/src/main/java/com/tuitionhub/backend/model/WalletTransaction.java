package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @Column(nullable = false)
    private Double amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type; // CREDIT, DEBIT

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionSource source; // TOPUP, REFERRAL, PROMO, SESSION_PAYMENT, REFUND

    private String description;

    @Builder.Default
    private Boolean isWithdrawable = false;

    private String referenceId; // External payment ID or Session ID

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum TransactionType {
        CREDIT, DEBIT
    }

    public enum TransactionSource {
        TOPUP, REFERRAL, PROMO, SESSION_PAYMENT, REFUND
    }
}
