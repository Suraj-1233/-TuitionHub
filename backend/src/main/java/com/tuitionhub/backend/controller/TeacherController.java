package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.*;
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

    @PutMapping("/profile")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('TEACHER')")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<User> updateProfile(
            @RequestBody User updatedProfile,
            @AuthenticationPrincipal User teacher) {
        
        teacher.setName(updatedProfile.getName());
        teacher.setCity(updatedProfile.getCity());
        
        TeacherProfile profile = teacher.getTeacherProfile();
        if (profile == null) {
            profile = new TeacherProfile();
            profile.setUser(teacher);
            teacher.setTeacherProfile(profile);
        }
        
        TeacherProfile updatedP = updatedProfile.getTeacherProfile();
        if (updatedP != null) {
            profile.setSubject(updatedP.getSubject());
            profile.setQualification(updatedP.getQualification());
            profile.setBio(updatedP.getBio());
            profile.setFees(updatedP.getFees());
            profile.setTimingFrom(updatedP.getTimingFrom());
            profile.setTimingTo(updatedP.getTimingTo());
            profile.setAvailableDays(updatedP.getAvailableDays());
        }

        return ResponseEntity.ok(userRepository.save(teacher));
    }
}
