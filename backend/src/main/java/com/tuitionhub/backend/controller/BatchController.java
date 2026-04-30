package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.ApiResponse;
import com.tuitionhub.backend.dto.BatchDto;
import com.tuitionhub.backend.model.BatchJoinRequest;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BatchController {

    private final BatchService batchService;

    // ---- Public ----
    @GetMapping("/api/batches")
    public ResponseEntity<ApiResponse<List<BatchDto.Response>>> getAllBatches() {
        return ResponseEntity.ok(ApiResponse.success(batchService.getAllActiveBatches(), "Batches fetched"));
    }

    @GetMapping("/api/batches/{id}")
    public ResponseEntity<ApiResponse<BatchDto.Response>> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getBatchById(id), "Batch fetched"));
    }

    // ---- Teacher ----
    @PostMapping("/api/teacher/batches")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<BatchDto.Response>> createBatch(
            @RequestBody BatchDto.CreateRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.success(batchService.createBatch(request, teacher), "Batch created"));
    }

    @GetMapping("/api/teacher/batches")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<BatchDto.Response>>> getMyBatches(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getTeacherBatches(teacher), "Teacher batches fetched"));
    }

    @PutMapping("/api/teacher/batches/{id}/live-link")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<BatchDto.Response>> updateLiveLink(
            @PathVariable Long id,
            @RequestBody BatchDto.UpdateLiveLink request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.success(batchService.updateLiveClassLink(id, request, teacher), "Live link updated"));
    }

    @GetMapping("/api/teacher/join-requests")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<BatchJoinRequest>>> getPendingRequests(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getPendingRequests(teacher), "Join requests fetched"));
    }

    @PostMapping("/api/teacher/join-requests/{requestId}/respond")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> respondToRequest(
            @PathVariable Long requestId,
            @RequestParam boolean approve,
            @AuthenticationPrincipal User teacher) {
        String msg = batchService.respondToJoinRequest(requestId, approve, teacher);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", msg), "Response sent"));
    }

    // ---- Student ----
    @GetMapping("/api/student/batches")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<BatchDto.Response>>> getStudentBatches(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(batchService.getStudentBatches(student), "Student batches fetched"));
    }

    @PostMapping("/api/student/batches/{batchId}/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, String>>> joinBatch(
            @PathVariable Long batchId,
            @AuthenticationPrincipal User student) {
        String msg = batchService.requestJoin(batchId, student);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", msg), "Join request sent"));
    }

    @DeleteMapping("/api/student/batches/{batchId}/leave")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, String>>> leaveBatch(
            @PathVariable Long batchId,
            @AuthenticationPrincipal User student) {
        String msg = batchService.leavesBatch(batchId, student);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", msg), "Left batch"));
    }

    // ---- Rescheduling (Mutual) ----
    @PostMapping("/api/batches/{id}/propose-reschedule")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<BatchDto.Response>> proposeReschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(batchService.proposeReschedule(id, payload.get("newTiming"), user), "Reschedule proposed"));
    }

    @PostMapping("/api/batches/{id}/respond-reschedule")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    public ResponseEntity<ApiResponse<BatchDto.Response>> respondReschedule(
            @PathVariable Long id,
            @RequestParam boolean accept,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(batchService.respondToReschedule(id, accept, user), "Reschedule response sent"));
    }
}
