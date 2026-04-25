package com.tuitionhub.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

public class BatchDto {

    @Data
    public static class CreateRequest {
        @NotBlank private String name;
        private String description;
        @NotBlank private String subject;
        @NotBlank private String targetClass;
        @NotNull private Integer maxStudents;
        @NotNull private Double monthlyFees;
        private String timingFrom;
        private String timingTo;
        private String days;
    }

    @Data
    public static class UpdateLiveLink {
        @NotBlank private String liveClassLink;
        private String liveClassPlatform;
    }

    @Data
    public static class Response {
        private Long id;
        private String name;
        private String description;
        private String subject;
        private String targetClass;
        private Integer maxStudents;
        private Integer currentStudents;
        private Double monthlyFees;
        private String timingFrom;
        private String timingTo;
        private String days;
        private String liveClassLink;
        private String liveClassPlatform;
        private String proposedTiming;
        private String proposedByRole;
        private Boolean isTimeChangeProposed;
        private TeacherSummary teacher;
        private Boolean isActive;
    }

    @Data
    public static class TeacherSummary {
        private Long id;
        private String name;
        private String subject;
        private String profilePhoto;
        private Double fees;
        private String timingFrom;
        private String timingTo;
        private Boolean isApproved;
    }
}
