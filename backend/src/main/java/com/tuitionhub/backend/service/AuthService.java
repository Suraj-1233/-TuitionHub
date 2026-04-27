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

    // ==================== EMAIL/PASSWORD LOGIN ====================

    public AuthDto.AuthResponse loginWithPassword(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email. Please register first."));

        if (!user.getIsActive()) {
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
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved());
    }

    // ==================== REGISTRATION ====================

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if (existing.getIsActive()) {
                throw new BadRequestException("An account with this email already exists. Please login instead.");
            }
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        boolean isTeacher = request.getRole() == Role.TEACHER;
        String otp = generateOtp();
        String encodedOtp = passwordEncoder.encode(otp);

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(false) // Mandatory verification
                .isApproved(!isTeacher)
                .otp(encodedOtp)
                .otpExpiry(LocalDateTime.now().plusMinutes(10))
                .build();

        userRepository.save(user);

        // Send OTP for verification
        otpService.sendOtp(user.getEmail(), otp);
        log.info("Registration OTP for {}: {}", user.getEmail(), otp);

        return new AuthDto.AuthResponse(null, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), false);
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

    // ==================== LEGACY OTP (kept for backward compat) ====================

    public void sendOtp(String email) {
        String otp = generateOtp();
        String encodedOtp = passwordEncoder.encode(otp);

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            user = User.builder()
                    .email(email)
                    .name("Pending")
                    .password(encodedOtp)
                    .role(Role.STUDENT)
                    .isActive(false)
                    .isApproved(false)
                    .otp(encodedOtp)
                    .otpExpiry(LocalDateTime.now().plusMinutes(10))
                    .build();
            userRepository.save(user);
        } else {
            user.setOtp(encodedOtp);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
            userRepository.save(user);
        }

        otpService.sendOtp(email, otp);
        log.info("OTP for {} : {}", email, otp);
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

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved());
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
}
