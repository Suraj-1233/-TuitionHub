package com.tuitionhub.backend.controller;

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
    public ResponseEntity<List<BatchDto.Response>> getAllBatches() {
        return ResponseEntity.ok(batchService.getAllActiveBatches());
    }

    @GetMapping("/api/batches/{id}")
    public ResponseEntity<BatchDto.Response> getBatch(@PathVariable Long id) {
        return ResponseEntity.ok(batchService.getBatchById(id));
    }

    // ---- Teacher ----
    @PostMapping("/api/teacher/batches")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<BatchDto.Response> createBatch(
            @RequestBody BatchDto.CreateRequest request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(batchService.createBatch(request, teacher));
    }

    @GetMapping("/api/teacher/batches")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<BatchDto.Response>> getMyBatches(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(batchService.getTeacherBatches(teacher));
    }

    @PutMapping("/api/teacher/batches/{id}/live-link")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<BatchDto.Response> updateLiveLink(
            @PathVariable Long id,
            @RequestBody BatchDto.UpdateLiveLink request,
            @AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(batchService.updateLiveClassLink(id, request, teacher));
    }

    @GetMapping("/api/teacher/join-requests")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<BatchJoinRequest>> getPendingRequests(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(batchService.getPendingRequests(teacher));
    }

    @PostMapping("/api/teacher/join-requests/{requestId}/respond")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> respondToRequest(
            @PathVariable Long requestId,
            @RequestParam boolean approve,
            @AuthenticationPrincipal User teacher) {
        String msg = batchService.respondToJoinRequest(requestId, approve, teacher);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // ---- Student ----
    @GetMapping("/api/student/batches")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<BatchDto.Response>> getStudentBatches(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(batchService.getStudentBatches(student));
    }

    @PostMapping("/api/student/batches/{batchId}/join")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> joinBatch(
            @PathVariable Long batchId,
            @AuthenticationPrincipal User student) {
        String msg = batchService.requestJoin(batchId, student);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    @DeleteMapping("/api/student/batches/{batchId}/leave")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> leaveBatch(
            @PathVariable Long batchId,
            @AuthenticationPrincipal User student) {
        String msg = batchService.leavesBatch(batchId, student);
        return ResponseEntity.ok(Map.of("message", msg));
    }

    // ---- Rescheduling (Mutual) ----
    @PostMapping("/api/batches/{id}/propose-reschedule")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    public ResponseEntity<BatchDto.Response> proposeReschedule(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(batchService.proposeReschedule(id, payload.get("newTiming"), user));
    }

    @PostMapping("/api/batches/{id}/respond-reschedule")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    public ResponseEntity<BatchDto.Response> respondReschedule(
            @PathVariable Long id,
            @RequestParam boolean accept,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(batchService.respondToReschedule(id, accept, user));
    }
}
