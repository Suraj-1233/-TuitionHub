package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.AuthDto;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.mapper.UserMapper;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final WalletService walletService;
    private final ReferralService referralService;
    private final UserMapper userMapper;

    @Transactional
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

        log.info("User {} logged in with role: {} (isApproved: {})", user.getEmail(), user.getRole(), user.getIsApproved());

        if (user.getRole() == Role.TEACHER && !user.getIsApproved()) {
            throw new BadRequestException("Your teacher account is pending admin approval. Please wait for approval.");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return userMapper.mapToAuthResponse(user, token);
    }

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        
        if (user != null) {
            if (user.getIsActive()) {
                throw new BadRequestException("An account with this email already exists. Please login instead.");
            }
            log.info("Updating unverified account for: {}", request.getEmail());
        } else {
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

        String otp = generateOtp();
        String encodedOtp = passwordEncoder.encode(otp);
        
        userMapper.updateEntityFromRegisterRequest(request, user);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        if (user.getReferralCode() == null) {
            user.setReferralCode(referralService.generateUniqueReferralCode());
        }
        
        referralService.applyReferral(user, request.getReferralCode());

        user.setIsActive(false); 
        user.setIsApproved(user.getRole() != Role.TEACHER);
        user.setOtp(encodedOtp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));

        userRepository.save(user);

        // Immediate link if parent already exists
        User finalUser = user; 
        if (user.getRole() == Role.STUDENT && user.getTempParentEmail() != null) {
            userRepository.findByEmail(user.getTempParentEmail()).ifPresent(parent -> {
                if (parent.getRole() == Role.PARENT) {
                    finalUser.setParent(parent);
                    userRepository.save(finalUser);
                    log.info("Linked Student {} to existing Parent {}", finalUser.getEmail(), parent.getEmail());
                }
            });
        }

        otpService.sendOtp(user.getEmail(), otp);
        return userMapper.mapToAuthResponse(user, null);
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with this email."));

        String otp = generateOtp();
        user.setOtp(passwordEncoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        otpService.sendOtp(email, "Your password reset OTP is: " + otp);
        log.info("Password reset OTP sent to {}", email);
    }

    @Transactional
    public void resetPasswordWithOtp(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));

        validateOtp(user, otp);

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
        log.info("Password reset successful for: {}", user.getEmail());
    }

    public AuthDto.AuthResponse getUserProfile(String token) {
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.mapToAuthResponse(user, null);
    }

    @Transactional
    public AuthDto.AuthResponse verifyOtpAndLogin(AuthDto.VerifyOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        validateOtp(user, request.getOtp());

        user.setOtp(null);
        user.setOtpExpiry(null);
        user.setIsActive(true);
        userRepository.save(user);

        // Auto-link children if this is a newly verified parent
        if (user.getRole() == Role.PARENT) {
            List<User> students = userRepository.findByTempParentEmail(user.getEmail());
            for (User student : students) {
                student.setParent(user);
                student.setTempParentEmail(null); // Clear after linking
                userRepository.save(student);
                log.info("Auto-linked Student {} to new Parent {}", student.getEmail(), user.getEmail());
            }
        }

        walletService.getOrCreateWallet(user.getId());

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return userMapper.mapToAuthResponse(user, token);
    }

    @Transactional
    public void updateTimezone(String token, String timezone) {
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setTimezone(timezone);
        userRepository.save(user);
    }

    @Transactional
    public void updateCurrency(String token, String currency) {
        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setCurrency(currency);
        userRepository.save(user);
    }

    private void validateOtp(User user, String otp) {
        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            throw new BadRequestException("OTP not sent.");
        }
        if (LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            throw new BadRequestException("OTP expired.");
        }
        if (!passwordEncoder.matches(otp, user.getOtp())) {
            throw new BadRequestException("Invalid OTP.");
        }
    }

    private String generateOtp() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}
