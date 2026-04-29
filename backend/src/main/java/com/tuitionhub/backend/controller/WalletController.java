package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Wallet;
import com.tuitionhub.backend.model.WalletTransaction;
import com.tuitionhub.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<Wallet> getBalance(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(walletService.getOrCreateWallet(user.getId()));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransaction>> getTransactions(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(walletService.getTransactionHistory(user.getId()));
    }

    @PostMapping("/topup")
    public ResponseEntity<?> topup(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        String description = (String) request.getOrDefault("description", "Wallet topup");
        
        walletService.addCredits(userId, amount, WalletTransaction.TransactionSource.TOPUP, description, true);
        return ResponseEntity.ok(Map.of("message", "Topup successful"));
    }
}
