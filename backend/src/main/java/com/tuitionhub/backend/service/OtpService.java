package com.tuitionhub.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OtpService {

    /**
     * Sends OTP to an email address.
     * In production, integrate with JavaMailSender or third-party (SendGrid, AWS SES).
     */
    public void sendOtp(String email, String otp) {
        log.info("========================================");
        log.info("📧 OTP for email {}: {}", email, otp);
        log.info("========================================");
        // TODO: Integrate with JavaMailSender
    }
}
