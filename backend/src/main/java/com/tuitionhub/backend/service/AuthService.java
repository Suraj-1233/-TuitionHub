package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.AuthDto;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final WalletService walletService;


    // ==================== EMAIL/PASSWORD LOGIN ====================

    public AuthDto.AuthResponse loginWithPassword(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email. Please register first."));

        if (!user.getIsActive()) {
            if (user.getOtp() != null) {
                throw new BadRequestException("Please verify your email first. An OTP was sent to you.");
            }
            throw new BadRequestException("Your account is deactivated. Please contact admin.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Incorrect password. Please try again.");
        }

        // Check if teacher is approved
        if (user.getRole() == Role.TEACHER && !user.getIsApproved()) {
            throw new BadRequestException("Your teacher account is pending admin approval. Please wait for approval.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved(), user.getReferralCode());
    }

    // ==================== REGISTRATION ====================

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user != null) {
            if (user.getIsActive()) {
                throw new BadRequestException("An account with this email already exists. Please login instead.");
            }
            log.info("Updating unverified account for: {}", request.getEmail());
        } else {
            // Check if mobile is already used by another ACTIVE user
            if (request.getMobile() != null && !request.getMobile().trim().isEmpty()) {
                if (userRepository.existsByMobile(request.getMobile())) {
                    throw new BadRequestException("This mobile number is already registered with another account.");
                }
            }
            user = new User();
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        boolean isTeacher = request.getRole() == Role.TEACHER;
        String otp = generateOtp();
        String encodedOtp = passwordEncoder.encode(otp);
        
        String mobile = (request.getMobile() == null || request.getMobile().trim().isEmpty()) ? null : request.getMobile();

        // Update fields
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setMobile(mobile);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStudentClass(request.getStudentClass());
        user.setBoard(request.getBoard());
        user.setSubject(request.getSubject());
        user.setQualification(request.getQualification());
        user.setBio(request.getBio());
        user.setFees(request.getFees());
        user.setTimingFrom(request.getTimingFrom());
        user.setTimingTo(request.getTimingTo());
        user.setAvailableDays(request.getAvailableDays());
        user.setCity(request.getCity());
        user.setCountry(request.getCountry());
        user.setTimezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Kolkata");
        
        // Referral System
        if (user.getReferralCode() == null) {
            user.setReferralCode(generateUniqueReferralCode());
        }
        
        if (request.getReferralCode() != null && !request.getReferralCode().trim().isEmpty()) {
            User referrer = userRepository.findByReferralCode(request.getReferralCode().toUpperCase().trim())
                    .orElse(null);
            if (referrer != null) {
                user.setReferredBy(referrer);
                log.info("User {} referred by {}", request.getEmail(), referrer.getEmail());
            }
        }

        user.setIsActive(false); 
        user.setIsApproved(!isTeacher);
        user.setOtp(encodedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        otpService.sendOtp(user.getEmail(), otp);
        return new AuthDto.AuthResponse(null, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), false, user.getReferralCode());
    }

    // Google Login Removed

    // ==================== FORGOT PASSWORD ====================

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email."));

        String otp = generateOtp();
        String encodedOtp = passwordEncoder.encode(otp);
        
        user.setOtp(encodedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        otpService.sendOtp(email, "Your password reset OTP is: " + otp);
        log.info("Password reset OTP for {}: {}", email, otp);
    }

    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null || LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new BadRequestException("OTP expired. Please request a new one.");
        }

        if (!passwordEncoder.matches(otp, user.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        log.info("Password reset successful with OTP for: {}", user.getEmail());
    }

    public AuthDto.AuthResponse verifyOtpAndLogin(AuthDto.VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new BadRequestException("OTP not sent. Please request OTP first.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new BadRequestException("OTP expired. Please request a new one.");
        }

        if (!passwordEncoder.matches(request.getOtp(), user.getOtp())) {
            throw new BadRequestException("Invalid OTP");
        }

        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setIsActive(true);
        userRepository.save(user);

        // Create wallet for the new user
        walletService.getOrCreateWallet(user.getId());

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved(), user.getReferralCode());
    }

    // ==================== TIMEZONE ====================

    public void updateTimezone(String token, String timezone) {
        try {
            String email = jwtTokenProvider.getEmailFromToken(token);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            user.setTimezone(timezone);
            userRepository.save(user);
            log.info("Updated timezone for {} to {}", email, timezone);
        } catch (Exception e) {
            log.warn("Could not update timezone: {}", e.getMessage());
        }
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private String generateUniqueReferralCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("TUI-");
        Random rnd = new Random();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        String code = sb.toString();
        // Rare case check if exists, but for now simple
        return code;
    }
}
