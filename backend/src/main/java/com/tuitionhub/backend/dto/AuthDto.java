package com.tuitionhub.backend.dto;

import com.tuitionhub.backend.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @NotBlank private String name;
        @NotBlank private String email;
        @NotBlank private String password;
        private String mobile;
        @NotNull private Role role;
        // Student fields
        private String studentClass;
        private String board;
        // Teacher fields
        private String subject;
        private String qualification;
        private String bio;
        private Double fees;
        private String timingFrom;
        private String timingTo;
        private String availableDays;
        private String city;
        private String country;
        private String timezone;
        private String referralCode;
    }

    @Data
    public static class SendOtpRequest {
        @NotBlank private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank private String email;
        @NotBlank private String otp;
    }

    @Data
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String otp;
    }

    @Data
    @NoArgsConstructor
    public static class AuthResponse {
        private String token;
        private String role;
        private Long userId;
        private String name;
        private String email;
        private Boolean isApproved;
        private String referralCode;

        public AuthResponse(String token, String role, Long userId, String name, String email, Boolean isApproved, String referralCode) {
            this.token = token;
            this.role = role;
            this.userId = userId;
            this.name = name;
            this.email = email;
            this.isApproved = isApproved;
            this.referralCode = referralCode;
        }
    }
}
