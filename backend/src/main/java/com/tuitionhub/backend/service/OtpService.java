package com.tuitionhub.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailService emailService;

    /**
     * Sends OTP to an email address.
     */
    public void sendOtp(String email, String otp) {
        log.info("📧 Sending OTP to email {}: {}", email, otp);
        
        String subject = "Your TuitionHub OTP";
        String body = String.format("""
            Hello,
            
            Your OTP for TuitionHub login/registration is: %s
            
            This OTP is valid for 10 minutes.
            
            Regards,
            TuitionHub Team
            """, otp);
            
        emailService.sendSimpleEmail(email, subject, body);
    }
}
