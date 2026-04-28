package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Wallet;
import com.tuitionhub.backend.model.WalletTransaction;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.repository.WalletRepository;
import com.tuitionhub.backend.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public Wallet getOrCreateWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    Wallet wallet = Wallet.builder()
                            .user(user)
                            .balance(0.0)
                            .promoBalance(0.0)
                            .currency(user.getCurrency() != null ? user.getCurrency() : "INR")
                            .build();
                    return walletRepository.save(wallet);
                });
    }

    public Wallet getWalletByUserId(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found for user ID: " + userId));
    }

    @Transactional
    public void addCredits(Long userId, Double amount, WalletTransaction.TransactionSource source, String description, boolean isWithdrawable) {
        Wallet wallet = getOrCreateWallet(userId);
        
        wallet.setBalance(wallet.getBalance() + amount);
        if (!isWithdrawable) {
            wallet.setPromoBalance(wallet.getPromoBalance() + amount);
        }
        
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(WalletTransaction.TransactionType.CREDIT)
                .source(source)
                .description(description)
                .isWithdrawable(isWithdrawable)
                .build();
        
        transactionRepository.save(transaction);
        log.info("Credited {} {} to wallet of user {}. Source: {}", amount, wallet.getCurrency(), userId, source);
    }

    @Transactional
    public void deductBalance(Long userId, Double amount, String description, String referenceId) {
        Wallet wallet = getWalletByUserId(userId);

        if (wallet.getBalance() < amount) {
            throw new BadRequestException("Insufficient wallet balance.");
        }

        // Logic for deducting promo balance first or proportionally?
        // Usually, non-withdrawable (promo) credits are used first.
        double promoToDeduct = Math.min(wallet.getPromoBalance(), amount);
        wallet.setPromoBalance(wallet.getPromoBalance() - promoToDeduct);
        wallet.setBalance(wallet.getBalance() - amount);
        
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(WalletTransaction.TransactionType.DEBIT)
                .source(WalletTransaction.TransactionSource.SESSION_PAYMENT)
                .description(description)
                .referenceId(referenceId)
                .build();
        
        transactionRepository.save(transaction);
        log.info("Deducted {} {} from wallet of user {}. Reference: {}", amount, wallet.getCurrency(), userId, referenceId);
    }

    public List<WalletTransaction> getTransactionHistory(Long userId) {
        Wallet wallet = getWalletByUserId(userId);
        return transactionRepository.findByWalletOrderByCreatedAtDesc(wallet);
    }

    @Transactional
    public void handleReferralReward(User newUser) {
        User referrer = newUser.getReferredBy();
        if (referrer != null) {
            // Check if this is the first paid session of the newUser (handled in PaymentService/SessionService)
            // But let's provide the method here
            double bonusAmount = 50.0; // Default bonus, can be dynamic
            addCredits(referrer.getId(), bonusAmount, WalletTransaction.TransactionSource.REFERRAL, 
                    "Referral bonus for " + newUser.getName(), false);
            
            // Optionally reward the new user too
            double joiningBonus = 20.0;
            addCredits(newUser.getId(), joiningBonus, WalletTransaction.TransactionSource.PROMO, 
                    "Welcome bonus", false);
        }
    }
}
