package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.WalletTransaction;
import com.tuitionhub.backend.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByWalletOrderByCreatedAtDesc(Wallet wallet);
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId);
}
