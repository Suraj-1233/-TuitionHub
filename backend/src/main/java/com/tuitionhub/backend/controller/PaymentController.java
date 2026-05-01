package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.ApiResponse;
import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/api/parent/payments/create-order")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> createOrder(
            @jakarta.validation.Valid @RequestBody PaymentDto.CreateOrderRequest request,
            @AuthenticationPrincipal User parent) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.createPaymentOrder(request, parent), "Order created"));
    }

    @PostMapping("/api/parent/payments/verify")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> verifyPayment(@jakarta.validation.Valid @RequestBody PaymentDto.VerifyRequest request) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.verifyAndUpdatePayment(request), "Payment verified"));
    }

    @PostMapping("/api/student/sessions/{sessionId}/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> createSessionOrder(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.createSessionOrder(sessionId, student), "Session order created"));
    }



    @PostMapping("/api/parent/payments/notify-failure")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<Void>> notifyFailure(@RequestBody PaymentDto.FailureRequest request) {
        paymentService.handlePaymentFailure(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Failure recorded"));
    }

    @GetMapping("/api/parent/payments")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<ApiResponse<List<PaymentDto.Response>>> getParentPayments(@AuthenticationPrincipal User parent) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getParentPayments(parent), "Payments fetched"));
    }

    @GetMapping("/api/teacher/payments")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<ApiResponse<List<PaymentDto.Response>>> getTeacherPayments(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getTeacherPayments(teacher), "Payments fetched"));
    }

    @GetMapping("/api/admin/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentDto.Response>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getAllPayments(), "All payments fetched"));
    }

    @PostMapping("/api/admin/payments/{id}/mark-as-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentDto.Response>> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) String remark) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.markAsPaid(id, remark), "Payment marked as paid"));
    }

    @GetMapping("/api/config/razorpay-key")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> getRazorpayKey() {
        return ResponseEntity.ok(ApiResponse.success(java.util.Map.of("keyId", paymentService.getRazorpayKeyId()), "Key fetched"));
    }
}
