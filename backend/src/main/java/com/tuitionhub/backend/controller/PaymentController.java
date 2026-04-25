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
}
