package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String mobile;

    @Column(unique = true)
    private String email;

    private String name;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Student fields
    private String studentClass;   // e.g. "10"
    private String board;          // CBSE / ICSE / State

    // Teacher fields
    private String subject;
    private String qualification;
    private String bio;
    private Double fees;            // monthly fee
    private String timingFrom;      // e.g. "06:00 PM"
    private String timingTo;        // e.g. "08:00 PM"
    private String availableDays;   // "MON,TUE,WED,THU,FRI"

    // Common
    private String profilePhoto;
    private String city;
    private String country;

    @Builder.Default
    private String timezone = "Asia/Kolkata";

    @Builder.Default
    private String currency = "INR";

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isApproved = false;   // teachers need admin approval

    @JsonIgnore
    private String otp;

    @JsonIgnore
    private LocalDateTime otpExpiry;

    @JsonIgnore
    private String resetToken;

    @JsonIgnore
    private LocalDateTime resetTokenExpiry;


    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @JsonIgnore
    @ManyToMany(mappedBy = "students")
    @Builder.Default
    private List<Batch> batches = new ArrayList<>();

    // Parent-Student Relationship
    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "children", "batches"})
    private User parent;

    @OneToMany(mappedBy = "parent", fetch = jakarta.persistence.FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "parent", "batches"})
    @Builder.Default
    private List<User> children = new ArrayList<>();
}
