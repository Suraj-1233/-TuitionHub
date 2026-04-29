package com.tuitionhub.backend.service;

import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReferralService {

    private final UserRepository userRepository;
    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    public String generateUniqueReferralCode() {
        Random rnd = new Random();
        String code;
        do {
            StringBuilder sb = new StringBuilder("TUI-");
            for (int i = 0; i < 5; i++) {
                sb.append(ALPHABET.charAt(rnd.nextInt(ALPHABET.length())));
            }
            code = sb.toString();
        } while (userRepository.existsByReferralCode(code));
        return code;
    }

    public void applyReferral(User user, String referralCode) {
        if (referralCode == null || referralCode.trim().isEmpty()) return;

        userRepository.findByReferralCode(referralCode.toUpperCase().trim())
                .ifPresent(referrer -> {
                    user.setReferredBy(referrer);
                    log.info("User {} referred by {}", user.getEmail(), referrer.getEmail());
                });
    }
}
