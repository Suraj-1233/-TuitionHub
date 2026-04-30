package com.tuitionhub.backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "teacher_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherProfile {

    @Id
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private String subject;
    private String qualification;
    private String bio;
    private Double fees;            // monthly fee
    private String timingFrom;      // e.g. "06:00 PM"
    private String timingTo;        // e.g. "08:00 PM"
    private String availableDays;   // "MON,TUE,WED,THU,FRI"
}
