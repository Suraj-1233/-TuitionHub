package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.gateway.PaymentGateway;
import com.tuitionhub.backend.mapper.PaymentMapper;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BatchRepository batchRepository;
    private final EmailService emailService;
    private final WalletService walletService;
    private final PaymentGateway paymentGateway;
    private final PaymentMapper paymentMapper;

    private static final String DEFAULT_CURRENCY = "INR";

    @Transactional
    public PaymentDto.Response createPaymentOrder(PaymentDto.CreateOrderRequest request, User student) {
        try {
            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

            // Check if any payment already exists for this month
            List<Payment> existingPayments = paymentRepository.findByStudentAndBatchAndForMonth(student, batch,
                    request.getForMonth());
            for (Payment p : existingPayments) {
                if (p.getStatus() == Payment.PaymentStatus.PAID) {
                    throw new BadRequestException("Payment already done for this month");
                }
                if (p.getStatus() == Payment.PaymentStatus.PENDING) {
                    log.info("Reusing existing PENDING payment: {}", p.getId());
                    return paymentMapper.mapToResponse(p);
                }
            }

            if (batch.getMonthlyFees() == null) {
                throw new BadRequestException("Batch monthly fees not set");
            }

            double amount = batch.getMonthlyFees();
            String receipt = "rcpt_" + System.currentTimeMillis();
            
            String gatewayOrderId = paymentGateway.createOrder(amount, DEFAULT_CURRENCY, receipt);

            Payment payment = Payment.builder()
                    .student(student)
                    .batch(batch)
                    .amount(amount)
                    .forMonth(request.getForMonth())
                    .currency(DEFAULT_CURRENCY)
                    .gateway(paymentGateway.getGatewayName())
                    .status(Payment.PaymentStatus.PENDING)
                    .razorpayOrderId(gatewayOrderId)
                    .build();

            payment = paymentRepository.save(payment);
            return paymentMapper.mapToResponse(payment);
        } catch (BadRequestException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error in createPaymentOrder: {}", e.getMessage(), e);
            throw new RuntimeException("An internal error occurred while processing payment: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto.Response createTopupOrder(Double amount, User student) {
        try {
            if (amount < 1) {
                throw new BadRequestException("Amount must be at least 1 INR");
            }

            String receipt = "topup_" + System.currentTimeMillis();
            String gatewayOrderId = paymentGateway.createOrder(amount, DEFAULT_CURRENCY, receipt);

            Payment payment = Payment.builder()
                    .student(student)
                    .amount(amount)
                    .currency(DEFAULT_CURRENCY)
                    .gateway(paymentGateway.getGatewayName())
                    .status(Payment.PaymentStatus.PENDING)
                    .paymentMethod("TOPUP")
                    .razorpayOrderId(gatewayOrderId)
                    .build();

            payment = paymentRepository.save(payment);
            return paymentMapper.mapToResponse(payment);
        } catch (Exception e) {
            log.error("Error creating topup order: {}", e.getMessage());
            throw new BadRequestException("Topup order failed: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto.Response verifyTopup(PaymentDto.VerifyRequest request, User student) {
        PaymentDto.Response response = verifyAndUpdatePayment(request);
        if ("PAID".equals(response.getStatus())) {
            walletService.addMoneyToWallet(student, response.getAmount(),
                    "Topup: " + response.getRazorpayPaymentId(), "TOPUP");
        }
        return response;
    }

    @Transactional
    public PaymentDto.Response verifyAndUpdatePayment(PaymentDto.VerifyRequest request) {
        try {
            Payment payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            log.info("Verifying payment {} for Order ID: {}", request.getPaymentId(), request.getRazorpayOrderId());

            boolean isValid = paymentGateway.verifySignature(
                    request.getRazorpayOrderId(), 
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature()
            );

            if (isValid) {
                log.info("Payment signature verified successfully for ID: {}", request.getPaymentId());
                payment.setStatus(Payment.PaymentStatus.PAID);
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setPaidAt(LocalDateTime.now());

                paymentGateway.fetchAndPopulateExtraDetails(payment);
                emailService.sendPaymentConfirmation(payment);

            } else {
                log.error("Signature verification FAILED for payment ID: {}", request.getPaymentId());
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
            }

            return paymentMapper.mapToResponse(paymentRepository.save(payment));
        } catch (Exception e) {
            log.error("Error in verifyAndUpdatePayment: {}", e.getMessage(), e);
            throw new BadRequestException("Verification failed: " + e.getMessage());
        }
    }

    public List<PaymentDto.Response> getStudentPayments(User student) {
        return paymentRepository.findByStudent(student)
                .stream().map(paymentMapper::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentDto.Response> getTeacherPayments(User teacher) {
        return paymentRepository.findByTeacherId(teacher.getId())
                .stream().map(paymentMapper::mapToResponse).collect(Collectors.toList());
    }

    public List<PaymentDto.Response> getAllPayments() {
        return paymentRepository.findAll()
                .stream().map(paymentMapper::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public PaymentDto.Response markAsPaid(Long paymentId, String adminRemark) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new BadRequestException("Payment is already in PAID status.");
        }

        log.info("Admin manually marking payment {} as PAID. Remark: {}", paymentId, adminRemark);
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setRazorpayPaymentId("MANUAL_BY_ADMIN");

        Payment saved = paymentRepository.save(payment);
        emailService.sendPaymentConfirmation(saved);

        return paymentMapper.mapToResponse(saved);
    }

    @Transactional
    public void handlePaymentFailure(PaymentDto.FailureRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        log.warn("Payment failed for ID: {}. Error: {}, Reason: {}",
                request.getPaymentId(), request.getErrorDescription(), request.getErrorReason());

        payment.setStatus(Payment.PaymentStatus.FAILED);
        payment.setErrorCode(request.getErrorCode());
        payment.setErrorDescription(request.getErrorDescription());
        payment.setErrorReason(request.getErrorReason());
        payment.setErrorStep(request.getErrorStep());

        paymentRepository.save(payment);
    }

    public String getRazorpayKeyId() {
        return paymentGateway.getPublicKey();
    }
}
