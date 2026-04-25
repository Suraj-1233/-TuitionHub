package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final UserRepository userRepository;

    @GetMapping("/list")
    public ResponseEntity<List<User>> getApprovedTeachers() {
        return ResponseEntity.ok(userRepository.findByRoleAndIsApproved(Role.TEACHER, true));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getTeacherProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userRepository.findById(id)
                .orElseThrow(() -> new com.tuitionhub.backend.exception.ResourceNotFoundException("Teacher not found")));
    }

    @PutMapping("/api/teacher/profile")
    public ResponseEntity<User> updateProfile(
            @RequestBody User updatedProfile,
            @AuthenticationPrincipal User teacher) {
        teacher.setName(updatedProfile.getName());
        teacher.setSubject(updatedProfile.getSubject());
        teacher.setQualification(updatedProfile.getQualification());
        teacher.setBio(updatedProfile.getBio());
        teacher.setFees(updatedProfile.getFees());
        teacher.setTimingFrom(updatedProfile.getTimingFrom());
        teacher.setTimingTo(updatedProfile.getTimingTo());
        teacher.setAvailableDays(updatedProfile.getAvailableDays());
        teacher.setCity(updatedProfile.getCity());
        return ResponseEntity.ok(userRepository.save(teacher));
    }
}
