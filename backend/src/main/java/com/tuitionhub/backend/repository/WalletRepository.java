package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Wallet;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserId(Long userId);
    Optional<Wallet> findByUser(User user);
}
