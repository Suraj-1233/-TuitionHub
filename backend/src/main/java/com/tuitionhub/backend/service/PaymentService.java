package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BatchRepository batchRepository;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public PaymentDto.Response createPaymentOrder(PaymentDto.CreateOrderRequest request, User student) {
        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

        // Check if payment already exists for this month
        paymentRepository.findByStudentAndBatchAndForMonth(student, batch, request.getForMonth())
                .ifPresent(p -> {
                    if (p.getStatus() == Payment.PaymentStatus.PAID) {
                        throw new BadRequestException("Payment already done for this month");
                    }
                });

        // Generate mock Razorpay order id (replace with real Razorpay SDK call)
        String orderId = "order_" + System.currentTimeMillis();

        Payment payment = Payment.builder()
                .student(student)
                .batch(batch)
                .amount(batch.getMonthlyFees())
                .forMonth(request.getForMonth())
                .status(Payment.PaymentStatus.PENDING)
                .razorpayOrderId(orderId)
                .build();

        payment = paymentRepository.save(payment);
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentDto.Response verifyAndUpdatePayment(PaymentDto.VerifyRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        // Verify Razorpay signature
        if (verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature())) {
            payment.setStatus(Payment.PaymentStatus.PAID);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setPaidAt(LocalDateTime.now());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }

        return mapToResponse(paymentRepository.save(payment));
    }

    public List<PaymentDto.Response> getStudentPayments(User student) {
        return paymentRepository.findByStudent(student)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentDto.Response> getTeacherPayments(User teacher) {
        return paymentRepository.findByTeacherId(teacher.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentDto.Response> getAllPayments() {
        return paymentRepository.findAll()
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature verification failed", e);
            return false;
        }
    }

    private PaymentDto.Response mapToResponse(Payment p) {
        PaymentDto.Response res = new PaymentDto.Response();
        res.setId(p.getId());
        res.setStudentName(p.getStudent().getName());
        res.setBatchName(p.getBatch().getName());
        res.setAmount(p.getAmount());
        res.setForMonth(p.getForMonth() != null
                ? p.getForMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy")) : null);
        res.setStatus(p.getStatus().name());
        res.setRazorpayOrderId(p.getRazorpayOrderId());
        res.setRazorpayPaymentId(p.getRazorpayPaymentId());
        res.setPaidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        return res;
    }
}
