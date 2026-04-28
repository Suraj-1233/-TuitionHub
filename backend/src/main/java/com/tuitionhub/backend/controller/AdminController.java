package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.repository.PaymentRepository;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.AssignmentRequestRepository;
import com.tuitionhub.backend.model.AssignmentRequest;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PaymentRepository paymentRepository;
    private final AssignmentRequestRepository requestRepository;
    private final com.tuitionhub.backend.repository.SubjectRepository subjectRepository;

    public AdminController(UserRepository userRepository, BatchRepository batchRepository, 
                           PaymentRepository paymentRepository, AssignmentRequestRepository requestRepository,
                           com.tuitionhub.backend.repository.SubjectRepository subjectRepository) {
        this.userRepository = userRepository;
        this.batchRepository = batchRepository;
        this.paymentRepository = paymentRepository;
        this.requestRepository = requestRepository;
        this.subjectRepository = subjectRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        long totalStudents = userRepository.countByRole(Role.STUDENT);
        long totalTeachers = userRepository.countByRole(Role.TEACHER);
        long pendingTeachers = userRepository.countByRoleAndIsApproved(Role.TEACHER, false);
        long totalBatches = batchRepository.count();
        long totalPayments = paymentRepository.count();

        return ResponseEntity.ok(Map.of(
                "totalStudents", totalStudents,
                "totalTeachers", totalTeachers,
                "pendingTeacherApprovals", pendingTeachers,
                "totalBatches", totalBatches,
                "totalPayments", totalPayments
        ));
    }

    @GetMapping("/teachers")
    public ResponseEntity<List<User>> getAllTeachers() {
        return ResponseEntity.ok(userRepository.findByRole(Role.TEACHER));
    }

    @GetMapping("/teachers/pending")
    public ResponseEntity<List<User>> getPendingTeachers() {
        return ResponseEntity.ok(userRepository.findByRoleAndIsApproved(Role.TEACHER, false));
    }

    @PutMapping("/teachers/{id}/approve")
    public ResponseEntity<Map<String, String>> approveTeacher(@PathVariable Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setIsApproved(true);
        userRepository.save(teacher);
        return ResponseEntity.ok(Map.of("message", "Teacher approved successfully"));
    }

    @PutMapping("/teachers/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectTeacher(@PathVariable Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setIsApproved(false);
        teacher.setIsActive(false);
        userRepository.save(teacher);
        return ResponseEntity.ok(Map.of("message", "Teacher rejected"));
    }

    @GetMapping("/students")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(userRepository.findByRole(Role.STUDENT));
    }

    @GetMapping("/batches")
    public ResponseEntity<?> getAllBatches() {
        return ResponseEntity.ok(batchRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(false);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User deactivated"));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(true);
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "User activated"));
    }
    @PostMapping("/batches/{batchId}/students/{studentId}")
    public ResponseEntity<Map<String, String>> assignStudentToBatch(@PathVariable Long batchId, @PathVariable Long studentId) {
        com.tuitionhub.backend.model.Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (batch.getStudents().contains(student)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Student already in this batch"));
        }

        if (batch.getStudents().size() >= batch.getMaxStudents()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Batch is full"));
        }

        batch.getStudents().add(student);
        batchRepository.save(batch);
        return ResponseEntity.ok(Map.of("message", "Student assigned to batch successfully"));
    }

    @DeleteMapping("/batches/{batchId}/students/{studentId}")
    public ResponseEntity<Map<String, String>> removeStudentFromBatch(@PathVariable Long batchId, @PathVariable Long studentId) {
        com.tuitionhub.backend.model.Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        batch.getStudents().remove(student);
        batchRepository.save(batch);
        return ResponseEntity.ok(Map.of("message", "Student removed from batch"));
    }

    @GetMapping("/assignment-requests")
    public ResponseEntity<List<AssignmentRequest>> getPendingRequests() {
        List<AssignmentRequest> requests = requestRepository.findByStatus(AssignmentRequest.RequestStatus.PENDING);
        return ResponseEntity.ok(requests);
    }

    @PostMapping("/requests/{requestId}/assign-teacher/{teacherId}")
    public ResponseEntity<Map<String, String>> assignTeacher(@PathVariable Long requestId, @PathVariable Long teacherId) {
        AssignmentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        // Conflict Detection
        List<com.tuitionhub.backend.model.Batch> teacherBatches = batchRepository.findByTeacher(teacher);
        String conflictMessage = checkConflicts(request.getPreferredTimings(), teacherBatches);

        request.setAssignedTeacher(teacher);
        request.setStatus(AssignmentRequest.RequestStatus.ASSIGNED);
        requestRepository.save(request);

        // Auto-create/join a Batch for this assignment so it shows in Student's "My Mentors"
        String tFrom = "04:00 PM";
        String tTo = "05:00 PM";
        if (request.getPreferredTimings() != null && request.getPreferredTimings().contains(" - ")) {
            try {
                String[] times = request.getPreferredTimings().split(" - ");
                tFrom = times[0];
                tTo = times[1];
            } catch (Exception e) {
                // handle error
            }
        }
        final String finalTimingFrom = tFrom;
        final String finalTimingTo = tTo;

        // ALWAYS create a NEW Batch for this assignment for Individual (1-on-1) classes
        com.tuitionhub.backend.model.Batch batch = com.tuitionhub.backend.model.Batch.builder()
                .name(request.getSubjects() + " - " + request.getStudent().getName())
                .subject(request.getSubjects())
                .teacher(teacher)
                .targetClass(request.getStudent().getStudentClass())
                .timingFrom(finalTimingFrom)
                .timingTo(finalTimingTo)
                .days("Daily")
                .monthlyFees(10.0) // Set to 10 for testing as requested
                .maxStudents(1) 
                .liveClassLink("https://meet.jit.si/TuitionHub_" + teacher.getName().replace(" ", "") + "_" + request.getStudent().getName().replace(" ", ""))
                .liveClassPlatform("JITSI")
                .isActive(true)
                .students(new java.util.ArrayList<>(java.util.List.of(request.getStudent())))
                .build();
        
        batchRepository.save(batch);

        String message = "Teacher assigned successfully.";
        if (conflictMessage != null) {
            message += " ⚠️ Warning: " + conflictMessage;
        }

        return ResponseEntity.ok(Map.of("message", message));
    }

    // ==================== SUBJECT MANAGEMENT ====================
    @GetMapping("/subjects")
    public ResponseEntity<List<com.tuitionhub.backend.model.Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectRepository.findAll());
    }

    @PostMapping("/subjects")
    public ResponseEntity<?> addSubject(@RequestBody com.tuitionhub.backend.model.Subject subject) {
        if (subjectRepository.existsByNameIgnoreCase(subject.getName())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Subject already exists"));
        }
        return ResponseEntity.ok(subjectRepository.save(subject));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<?> deleteSubject(@PathVariable Long id) {
        subjectRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Subject deleted"));
    }

    private String checkConflicts(String requestedTime, List<com.tuitionhub.backend.model.Batch> batches) {
        if (requestedTime == null || !requestedTime.contains("-")) return null;
        
        try {
            String[] times = requestedTime.split(" - ");
            java.time.LocalTime reqStart = java.time.LocalTime.parse(times[0]);
            java.time.LocalTime reqEnd = java.time.LocalTime.parse(times[1]);

            for (com.tuitionhub.backend.model.Batch b : batches) {
                if (b.getTimingFrom() == null || b.getTimingTo() == null) continue;
                
                java.time.LocalTime bStart = java.time.LocalTime.parse(b.getTimingFrom());
                java.time.LocalTime bEnd = java.time.LocalTime.parse(b.getTimingTo());

                // Overlap check: (StartA < EndB) and (EndA > StartB)
                if (reqStart.isBefore(bEnd) && reqEnd.isAfter(bStart)) {
                    return "Teacher already has a batch '" + b.getName() + "' at " + b.getTimingFrom() + "-" + b.getTimingTo();
                }
            }
        } catch (Exception e) {
            // handle error
        }
        return null;
    }
}
