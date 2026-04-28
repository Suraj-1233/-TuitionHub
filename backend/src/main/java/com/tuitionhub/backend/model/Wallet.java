package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    private Double balance = 0.0;

    @Builder.Default
    private Double promoBalance = 0.0; // Subset of balance that is non-withdrawable

    @Builder.Default
    private String currency = "INR";

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
