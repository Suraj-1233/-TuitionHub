package com.tuitionhub.backend.controller;

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
    public ResponseEntity<Wallet> getBalance(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.getOrCreateWallet(userId));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransaction>> getTransactions(@RequestParam Long userId) {
        return ResponseEntity.ok(walletService.getTransactionHistory(userId));
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
