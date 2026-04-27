package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;              // e.g. "Class 10 Maths"

    private String description;
    private String subject;

    @Column(nullable = false)
    private String targetClass;       // "10", "11", "12"

    @Column(nullable = false)
    private Integer maxStudents;

    @Column(nullable = false)
    private Double monthlyFees;

    @Builder.Default
    private String currency = "INR"; // INR, USD, GBP, EUR, CAD, AUD

    // Timing
    private String timingFrom;        // "06:00 PM"
    private String timingTo;          // "07:00 PM"
    private String days;              // "MON,WED,FRI"

    @Builder.Default
    private String timezone = "Asia/Kolkata";

    // Live class
    private String liveClassLink;
    private String liveClassPlatform; // "ZOOM" | "GOOGLE_MEET"

    // Rescheduling
    private String proposedTiming;
    private String proposedByRole; // "STUDENT" | "TEACHER"
    @Builder.Default
    private Boolean isTimeChangeProposed = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToMany
    @JoinTable(
        name = "batch_students",
        joinColumns = @JoinColumn(name = "batch_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    @JsonIgnoreProperties({"batches", "otp", "otpExpiry", "password"})
    @Builder.Default
    private List<User> students = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
