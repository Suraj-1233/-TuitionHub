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
        // Check if email already exists and is active
        if (userRepository.existsByEmail(request.getEmail())) {
            User existing = userRepository.findByEmail(request.getEmail()).get();
            if (existing.getIsActive()) {
                throw new BadRequestException("An account with this email already exists. Please login instead.");
            }
        }

        // Validate password
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        boolean isTeacher = request.getRole() == Role.TEACHER;

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .mobile(request.getMobile())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .studentClass(request.getStudentClass())
                .board(request.getBoard())
                .subject(request.getSubject())
                .qualification(request.getQualification())
                .bio(request.getBio())
                .fees(request.getFees())
                .timingFrom(request.getTimingFrom())
                .timingTo(request.getTimingTo())
                .availableDays(request.getAvailableDays())
                .city(request.getCity())
                .country(request.getCountry())
                .timezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Kolkata")
                .isActive(true)
                .isApproved(!isTeacher)
                .build();

        userRepository.save(user);

        // If parent is registering, link to child if email provided
        if (request.getRole() == Role.PARENT) {
            if (request.getChildEmail() == null || request.getChildEmail().isEmpty()) {
                throw new BadRequestException("Child's email address is required for parent registration.");
            }
            
            User student = userRepository.findByEmail(request.getChildEmail())
                .orElseThrow(() -> new BadRequestException("No student found with email: " + request.getChildEmail()));

            if (student.getRole() != Role.STUDENT) {
                throw new BadRequestException("The email provided does not belong to a student.");
            }

            student.setParent(user);
            userRepository.save(student);
            log.info("Linked parent {} to student {}", user.getEmail(), student.getEmail());
        }

        if (isTeacher) {
            log.info("Teacher {} registered. Awaiting admin approval.", user.getEmail());
            // Return a response but with isApproved = false
            String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
            return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), false);
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved());
    }

    // ==================== GOOGLE LOGIN ====================

    public AuthDto.AuthResponse googleLogin(String googleEmail, String googleName, String role) {
        User user = userRepository.findByEmail(googleEmail).orElse(null);

        if (user == null) {
            // Auto-register via Google
            Role userRole = role != null ? Role.valueOf(role.toUpperCase()) : Role.STUDENT;
            boolean isTeacher = userRole == Role.TEACHER;

            user = User.builder()
                    .email(googleEmail)
                    .name(googleName)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString())) // random password for Google users
                    .role(userRole)
                    .isActive(true)
                    .isApproved(!isTeacher)
                    .build();
            userRepository.save(user);
            log.info("New Google user registered: {} as {}", googleEmail, userRole);

            if (isTeacher) {
                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
                return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), false);
            }
        }

        if (!user.getIsActive()) {
            throw new BadRequestException("Your account is deactivated.");
        }

        if (user.getRole() == Role.TEACHER && !user.getIsApproved()) {
            throw new BadRequestException("Your teacher account is pending admin approval.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthDto.AuthResponse(token, user.getRole().name(), user.getId(), user.getName(), user.getEmail(), user.getIsApproved());
    }

    // ==================== FORGOT PASSWORD ====================

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email."));

        String resetToken = UUID.randomUUID().toString();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // link valid for 1 hour
        userRepository.save(user);

        // Build reset link
        String resetLink = "http://localhost:4200/auth/reset-password?token=" + resetToken;
        log.info("Password reset link for {}: {}", email, resetLink);

        // Send email (mock in dev, real in prod)
        otpService.sendOtp(email, "Click to reset your password: " + resetLink);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findAll().stream()
                .filter(u -> token.equals(u.getResetToken()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset link."));

        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            throw new BadRequestException("Reset link has expired. Please request a new one.");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        log.info("Password reset successful for: {}", user.getEmail());
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
