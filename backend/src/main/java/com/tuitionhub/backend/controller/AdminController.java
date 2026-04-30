package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.ApiResponse;
import com.tuitionhub.backend.model.*;
import com.tuitionhub.backend.repository.*;
import com.tuitionhub.backend.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final TeacherManagementService teacherManagementService;
    private final StudentManagementService studentManagementService;
    private final AssignmentRequestService assignmentRequestService;
    private final SubjectService subjectService;
    private final WalletService walletService;

    // Repositories for simple fetch operations (can also be moved to services if
    // preferred)
    private final BatchRepository batchRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final SessionRepository sessionRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> data = Map.of(
                "totalStudents", userRepository.countByRole(Role.STUDENT),
                "totalTeachers", userRepository.countByRole(Role.TEACHER),
                "pendingTeacherApprovals", userRepository.countByRoleAndIsApproved(Role.TEACHER, false),
                "totalBatches", batchRepository.count(),
                "totalPayments", paymentRepository.count());
        return ResponseEntity.ok(ApiResponse.success(data, "Dashboard data fetched"));
    }

    // ==================== TEACHER MANAGEMENT ====================

    @GetMapping("/teachers")
    public ResponseEntity<ApiResponse<List<User>>> getAllTeachers() {
        return ResponseEntity.ok(ApiResponse.success(teacherManagementService.getAllTeachers(), "Teachers fetched"));
    }

    @GetMapping("/teachers/pending")
    public ResponseEntity<ApiResponse<List<User>>> getPendingTeachers() {
        return ResponseEntity
                .ok(ApiResponse.success(teacherManagementService.getPendingTeachers(), "Pending teachers fetched"));
    }

    @PutMapping("/teachers/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveTeacher(@PathVariable Long id) {
        teacherManagementService.approveTeacher(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Teacher approved successfully"));
    }

    @PutMapping("/teachers/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectTeacher(@PathVariable Long id) {
        teacherManagementService.rejectTeacher(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Teacher rejected"));
    }

    // ==================== STUDENT MANAGEMENT ====================

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<User>>> getAllStudents() {
        return ResponseEntity.ok(ApiResponse.success(studentManagementService.getAllStudents(), "Students fetched"));
    }

    @GetMapping("/parents")
    public ResponseEntity<ApiResponse<List<User>>> getAllParents() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findByRole(Role.PARENT), "Parents fetched"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        studentManagementService.toggleUserStatus(id, false);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated"));
    }

    @PutMapping("/users/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        studentManagementService.toggleUserStatus(id, true);
        return ResponseEntity.ok(ApiResponse.success(null, "User activated"));
    }

    // ==================== BATCH MANAGEMENT ====================

    @GetMapping("/batches")
    public ResponseEntity<ApiResponse<List<Batch>>> getAllBatches() {
        return ResponseEntity.ok(ApiResponse.success(batchRepository.findAll(), "Batches fetched"));
    }

    @PostMapping("/batches/{batchId}/students/{studentId}")
    public ResponseEntity<ApiResponse<Void>> assignStudentToBatch(@PathVariable Long batchId,
            @PathVariable Long studentId) {
        studentManagementService.assignStudentToBatch(batchId, studentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Student assigned to batch successfully"));
    }

    @DeleteMapping("/batches/{batchId}/students/{studentId}")
    public ResponseEntity<ApiResponse<Void>> removeStudentFromBatch(@PathVariable Long batchId,
            @PathVariable Long studentId) {
        studentManagementService.removeStudentFromBatch(batchId, studentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Student removed from batch"));
    }

    // ==================== ASSIGNMENT REQUESTS ====================

    @GetMapping("/assignment-requests")
    public ResponseEntity<ApiResponse<List<AssignmentRequest>>> getPendingRequests() {
        return ResponseEntity
                .ok(ApiResponse.success(assignmentRequestService.getPendingRequests(), "Pending requests fetched"));
    }

    @PutMapping("/requests/{requestId}/details")
    public ResponseEntity<ApiResponse<Void>> updateRequestDetails(
            @PathVariable Long requestId,
            @RequestBody Map<String, Object> body) {
        Double fees = Double.valueOf(body.get("negotiatedFees").toString());
        Boolean isIndividual = (Boolean) body.get("isIndividual");
        assignmentRequestService.updateRequestDetails(requestId, fees, isIndividual);
        return ResponseEntity.ok(ApiResponse.success(null, "Request details updated"));
    }

    @PostMapping("/requests/{requestId}/assign-teacher/{teacherId}")
    public ResponseEntity<ApiResponse<Void>> assignTeacher(@PathVariable Long requestId, @PathVariable Long teacherId) {
        String conflictMessage = assignmentRequestService.assignTeacher(requestId, teacherId);

        String message = "Teacher assigned successfully.";
        if (conflictMessage != null) {
            message += " ⚠️ Warning: " + conflictMessage;
        }
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }

    // ==================== SUBJECT MANAGEMENT ====================

    @GetMapping("/subjects")
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects() {
        return ResponseEntity.ok(ApiResponse.success(subjectService.getAllSubjects(), "Subjects fetched"));
    }

    @PostMapping("/subjects")
    public ResponseEntity<ApiResponse<Subject>> addSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(ApiResponse.success(subjectService.addSubject(subject), "Subject added"));
    }

    @DeleteMapping("/subjects/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Subject deleted"));
    }

    // ==================== WALLET & SESSION MANAGEMENT ====================

    @PostMapping("/wallet/adjust")
    public ResponseEntity<ApiResponse<Void>> adjustWallet(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Double amount = Double.valueOf(request.get("amount").toString());
        boolean isCredit = (boolean) request.getOrDefault("isCredit", true);
        String description = (String) request.getOrDefault("description", "Admin adjustment");

        if (isCredit) {
            walletService.addCredits(userId, amount, WalletTransaction.TransactionSource.PROMO, description, false);
        } else {
            walletService.deductBalance(userId, amount, description, "ADMIN_ADJ");
        }
        return ResponseEntity.ok(ApiResponse.success(null, "Wallet adjusted successfully"));
    }

    @GetMapping("/wallet/transactions")
    public ResponseEntity<ApiResponse<List<WalletTransaction>>> getAllWalletTransactions() {
        return ResponseEntity.ok(ApiResponse.success(walletTransactionRepository.findAll(), "Transactions fetched"));
    }

    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<List<Session>>> getAllSessions() {
        return ResponseEntity.ok(ApiResponse.success(sessionRepository.findAll(), "Sessions fetched"));
    }

    @PutMapping("/sessions/{id}/payout")
    public ResponseEntity<ApiResponse<Void>> updatePayoutStatus(@PathVariable Long id,
            @RequestBody Map<String, String> request) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new com.tuitionhub.backend.exception.ResourceNotFoundException("Session not found"));

        Session.PayoutStatus status = Session.PayoutStatus.valueOf(request.get("status"));
        session.setPayoutStatus(status);
        sessionRepository.save(session);

        return ResponseEntity.ok(ApiResponse.success(null, "Payout status updated to " + status));
    }
}
