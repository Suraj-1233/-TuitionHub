package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.AuthDto;
import com.tuitionhub.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    // ==================== EMAIL/PASSWORD LOGIN ====================

    @PostMapping("/login")
    public ResponseEntity<AuthDto.AuthResponse> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        log.info("Login attempt for: {}", email);
        AuthDto.AuthResponse response = authService.loginWithPassword(email, password);
        return ResponseEntity.ok(response);
    }

    // ==================== REGISTRATION ====================

    @PostMapping("/register")
    public ResponseEntity<AuthDto.AuthResponse> register(@RequestBody @Valid AuthDto.RegisterRequest request) {
        log.info("Register request for: {} as {}", request.getEmail(), request.getRole());
        return ResponseEntity.ok(authService.register(request));
    }

    // Google Login Removed

    // ==================== FORGOT & RESET PASSWORD ====================

    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        log.info("Forgot password request for: {}", email);
        authService.forgotPassword(email);
        return ResponseEntity.ok(Map.of("message", "Password reset link sent to " + email));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");
        String newPassword = body.get("password");
        authService.resetPasswordWithOtp(email, otp, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password reset successful. You can now login."));
    }

    // ==================== TIMEZONE ====================

    @PutMapping("/update-timezone")
    public ResponseEntity<Map<String, String>> updateTimezone(@RequestBody Map<String, String> body,
                                                               @RequestHeader("Authorization") String token) {
        String timezone = body.get("timezone");
        if (timezone != null && !timezone.isEmpty()) {
            authService.updateTimezone(token.replace("Bearer ", ""), timezone);
            return ResponseEntity.ok(Map.of("message", "Timezone updated to " + timezone));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Timezone is required"));
    }

    // ==================== LEGACY OTP (kept for backward compat) ====================

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody @Valid AuthDto.SendOtpRequest request) {
        log.info("Received send-otp request for email: {}", request.getEmail());
        authService.sendOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + request.getEmail()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthDto.AuthResponse> verifyOtp(@RequestBody @Valid AuthDto.VerifyOtpRequest request) {
        log.info("Received verify-otp request for email: {}", request.getEmail());
        AuthDto.AuthResponse response = authService.verifyOtpAndLogin(request);
        return ResponseEntity.ok(response);
    }
}
