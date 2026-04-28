package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.AssignmentRequest;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.AssignmentRequestRepository;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class StudentController {

    private final AssignmentRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/request-tuition")
    public ResponseEntity<?> requestTuition(@RequestBody Map<String, String> payload, @RequestHeader("Authorization") String token) {
        String email = tokenProvider.getEmailFromToken(token.substring(7));
        User student = userRepository.findByEmail(email).orElseThrow();

        AssignmentRequest request = AssignmentRequest.builder()
                .student(student)
                .subjects(payload.get("subjects"))
                .preferredTimings(payload.get("timings"))
                .additionalNotes(payload.get("notes"))
                .status(AssignmentRequest.RequestStatus.PENDING)
                .build();

        requestRepository.save(request);
        log.info("📩 New Tuition Request from Student: {}, Subjects: {}", student.getEmail(), request.getSubjects());
        return ResponseEntity.ok(Map.of("message", "Request submitted to Admin successfully"));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<AssignmentRequest>> getMyRequests(@RequestHeader("Authorization") String token) {
        String email = tokenProvider.getEmailFromToken(token.substring(7));
        User student = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(requestRepository.findByStudent(student));
    }

    @GetMapping("/referrals")
    public ResponseEntity<List<Map<String, Object>>> getReferrals(@RequestHeader("Authorization") String token) {
        String email = tokenProvider.getEmailFromToken(token.substring(7));
        User student = userRepository.findByEmail(email).orElseThrow();
        
        List<Map<String, Object>> referrals = userRepository.findByReferredBy(student).stream()
            .map(u -> Map.<String, Object>of(
                "name", u.getName(),
                "role", u.getRole().name(),
                "joinedAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "N/A",
                "isApproved", u.getIsApproved()
            )).toList();
            
        return ResponseEntity.ok(referrals);
    }
}
