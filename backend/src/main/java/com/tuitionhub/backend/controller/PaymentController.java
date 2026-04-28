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

    @PostMapping("/api/student/payments/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentDto.Response> createOrder(
            @RequestBody PaymentDto.CreateOrderRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(paymentService.createPaymentOrder(request, student));
    }

    @PostMapping("/api/student/payments/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentDto.Response> verifyPayment(@RequestBody PaymentDto.VerifyRequest request) {
        return ResponseEntity.ok(paymentService.verifyAndUpdatePayment(request));
    }

    @PostMapping("/api/student/wallet/topup/create-order")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentDto.Response> createTopupOrder(
            @RequestParam Double amount,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(paymentService.createTopupOrder(amount, student));
    }

    @PostMapping("/api/student/wallet/topup/verify")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PaymentDto.Response> verifyTopup(
            @RequestBody PaymentDto.VerifyRequest request,
            @AuthenticationPrincipal User student) {
        return ResponseEntity.ok(paymentService.verifyTopup(request, student));
    }

    @PostMapping("/api/student/payments/notify-failure")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> notifyFailure(@RequestBody PaymentDto.FailureRequest request) {
        paymentService.handlePaymentFailure(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/student/payments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PaymentDto.Response>> getMyPayments(@AuthenticationPrincipal User student) {
        return ResponseEntity.ok(paymentService.getStudentPayments(student));
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
