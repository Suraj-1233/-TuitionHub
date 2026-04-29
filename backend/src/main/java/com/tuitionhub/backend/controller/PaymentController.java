package com.tuitionhub.backend.controller;

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
    public ResponseEntity<PaymentDto.Response> createOrder(
            @jakarta.validation.Valid @RequestBody PaymentDto.CreateOrderRequest request,
            @AuthenticationPrincipal User parent) {
        // Validation logic to ensure student belongs to parent can be in service or here
        return ResponseEntity.ok(paymentService.createPaymentOrder(request, null)); // Service will need to handle student lookup via request.batchId
    }

    @PostMapping("/api/parent/payments/verify")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<PaymentDto.Response> verifyPayment(@jakarta.validation.Valid @RequestBody PaymentDto.VerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyAndUpdatePayment(request));
    }

    @PostMapping("/api/parent/wallet/topup/create-order")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<PaymentDto.Response> createTopupOrder(
            @RequestParam Double amount,
            @AuthenticationPrincipal User parent) {
        return ResponseEntity.ok(paymentService.createTopupOrder(amount, parent));
    }

    @PostMapping("/api/parent/wallet/topup/verify")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<PaymentDto.Response> verifyTopup(
            @RequestBody PaymentDto.VerifyRequest request,
            @AuthenticationPrincipal User parent) {
        return ResponseEntity.ok(paymentService.verifyTopup(request, parent));
    }

    @PostMapping("/api/parent/payments/notify-failure")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<Void> notifyFailure(@RequestBody PaymentDto.FailureRequest request) {
        paymentService.handlePaymentFailure(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/parent/payments")
    @PreAuthorize("hasRole('PARENT')")
    public ResponseEntity<List<PaymentDto.Response>> getParentPayments(@AuthenticationPrincipal User parent) {
        // Returns all payments made by/for this parent's children
        return ResponseEntity.ok(paymentService.getParentPayments(parent));
    }

    @GetMapping("/api/teacher/payments")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<PaymentDto.Response>> getTeacherPayments(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(paymentService.getTeacherPayments(teacher));
    }

    @GetMapping("/api/admin/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentDto.Response>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @PostMapping("/api/admin/payments/{id}/mark-as-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentDto.Response> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) String remark) {
        return ResponseEntity.ok(paymentService.markAsPaid(id, remark));
    }

    @GetMapping("/api/config/razorpay-key")
    public ResponseEntity<java.util.Map<String, String>> getRazorpayKey() {
        return ResponseEntity.ok(java.util.Map.of("keyId", paymentService.getRazorpayKeyId()));
    }
}
