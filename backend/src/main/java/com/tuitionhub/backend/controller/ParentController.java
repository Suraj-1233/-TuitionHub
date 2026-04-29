package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.ApiResponse;
import com.tuitionhub.backend.model.*;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/parent")
@PreAuthorize("hasRole('PARENT')")
@RequiredArgsConstructor
public class ParentController {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final PaymentService paymentService;

    @GetMapping("/children")
    public ResponseEntity<ApiResponse<List<User>>> getChildren(@AuthenticationPrincipal User parent) {
        // Refresh from DB to get children
        User dbParent = userRepository.findById(parent.getId()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(dbParent.getChildren(), "Children fetched successfully"));
    }

    @GetMapping("/children/{childId}/batches")
    public ResponseEntity<ApiResponse<List<Batch>>> getChildBatches(
            @PathVariable Long childId,
            @AuthenticationPrincipal User parent) {
        
        validateChildAccess(parent, childId);
        User child = userRepository.findById(childId).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(child.getBatches(), "Child batches fetched"));
    }

    @GetMapping("/children/{childId}/payments")
    public ResponseEntity<ApiResponse<List<com.tuitionhub.backend.dto.PaymentDto.Response>>> getChildPayments(
            @PathVariable Long childId,
            @AuthenticationPrincipal User parent) {
        
        validateChildAccess(parent, childId);
        User child = userRepository.findById(childId).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(paymentService.getStudentPayments(child), "Child payments fetched"));
    }

    private void validateChildAccess(User parent, Long childId) {
        User child = userRepository.findById(childId)
                .orElseThrow(() -> new com.tuitionhub.backend.exception.ResourceNotFoundException("Child not found"));
        
        if (child.getParent() == null || !child.getParent().getId().equals(parent.getId())) {
            throw new com.tuitionhub.backend.exception.BadRequestException("You do not have access to this student's data");
        }
    }
}
