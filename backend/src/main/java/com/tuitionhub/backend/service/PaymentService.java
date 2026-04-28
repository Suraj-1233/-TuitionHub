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

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
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
    private final EmailService emailService;
    private final WalletService walletService;

    @Value("${app.razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${app.razorpay.key-secret}")
    private String razorpayKeySecret;

    @Transactional
    public PaymentDto.Response createPaymentOrder(PaymentDto.CreateOrderRequest request, User student) {
        try {
            Batch batch = batchRepository.findById(request.getBatchId())
                    .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));

            // Check if any payment already exists for this month
            List<Payment> existingPayments = paymentRepository.findByStudentAndBatchAndForMonth(student, batch, request.getForMonth());
            for (Payment p : existingPayments) {
                if (p.getStatus() == Payment.PaymentStatus.PAID) {
                    throw new BadRequestException("Payment already done for this month");
                }
                if (p.getStatus() == Payment.PaymentStatus.PENDING) {
                    // Reuse existing pending order
                    log.info("Reusing existing PENDING payment: {}", p.getId());
                    return mapToResponse(p);
                }
            }

            if (batch.getMonthlyFees() == null) {
                throw new BadRequestException("Batch monthly fees not set");
            }

            // Create real Razorpay order via SDK
            String orderId;
            String currency = (batch.getCurrency() != null && !batch.getCurrency().isEmpty()) ? batch.getCurrency() : "INR";
            try {
                log.info("Creating Razorpay order with KeyID: [{}]", razorpayKeyId.trim());
                RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId.trim(), razorpayKeySecret.trim());
                JSONObject orderRequest = new JSONObject();
                // Ensure amount is at least 100 paise
                int amountPaise = (int) (batch.getMonthlyFees() * 100);
                if (amountPaise < 100) {
                    throw new BadRequestException("Amount must be at least 1 INR (100 paise)");
                }
                orderRequest.put("amount", amountPaise);
                orderRequest.put("currency", currency);
                orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
                
                Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                orderId = razorpayOrder.get("id");
                log.info("Razorpay order created: {} for batch {}", orderId, batch.getName());
            } catch (RazorpayException e) {
                log.error("Razorpay SDK Error: {}", e.getMessage(), e);
                throw new BadRequestException("Razorpay Error: " + e.getMessage());
            }

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

            // Create real Razorpay order via SDK
            String orderId;
            try {
                RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId.trim(), razorpayKeySecret.trim());
                JSONObject orderRequest = new JSONObject();
                int amountPaise = (int) (amount * 100);
                orderRequest.put("amount", amountPaise);
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "topup_" + System.currentTimeMillis());
                
                Order razorpayOrder = razorpayClient.orders.create(orderRequest);
                orderId = razorpayOrder.get("id");
                log.info("Razorpay topup order created: {} for student {}", orderId, student.getEmail());
            } catch (RazorpayException e) {
                log.error("Razorpay SDK Error during topup: {}", e.getMessage());
                throw new BadRequestException("Razorpay Error: " + e.getMessage());
            }

            Payment payment = Payment.builder()
                    .student(student)
                    .amount(amount)
                    .status(Payment.PaymentStatus.PENDING)
                    .razorpayOrderId(orderId)
                    .paymentMethod("TOPUP")
                    .build();

            payment = paymentRepository.save(payment);
            return mapToResponse(payment);
        } catch (Exception e) {
            log.error("Error creating topup order: {}", e.getMessage());
            throw new BadRequestException("Topup order failed: " + e.getMessage());
        }
    }

    @Transactional
    public PaymentDto.Response verifyTopup(PaymentDto.VerifyRequest request, User student) {
        PaymentDto.Response response = verifyAndUpdatePayment(request);
        if ("PAID".equals(response.getStatus())) {
            // Update wallet balance
            walletService.addMoneyToWallet(student, response.getAmount(), "Razorpay Topup: " + response.getRazorpayPaymentId(), "TOPUP");
        }
        return response;
    }

    @Transactional
    public PaymentDto.Response verifyAndUpdatePayment(PaymentDto.VerifyRequest request) {
        try {
            Payment payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            log.info("Verifying payment {} for Order ID: {}", request.getPaymentId(), request.getRazorpayOrderId());
            
            // Verify Razorpay signature
            boolean isValid = verifySignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());
            
            if (isValid) {
                log.info("Payment signature verified successfully for ID: {}", request.getPaymentId());
                payment.setStatus(Payment.PaymentStatus.PAID);
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
                payment.setPaidAt(LocalDateTime.now());
                
                // Fetch full details from Razorpay API
                fetchAndPopulateExtraDetails(payment);

                // Send Email Confirmation
                sendPaymentConfirmationEmail(payment);
                
            } else {
                log.error("Signature verification FAILED for payment ID: {}", request.getPaymentId());
                payment.setStatus(Payment.PaymentStatus.FAILED);
                // We still save the IDs for record keeping even if it failed verification
                payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
                payment.setRazorpaySignature(request.getRazorpaySignature());
            }

            return mapToResponse(paymentRepository.save(payment));
        } catch (Exception e) {
            log.error("Error in verifyAndUpdatePayment: {}", e.getMessage(), e);
            throw new BadRequestException("Verification failed: " + e.getMessage());
        }
    }

    private void sendPaymentConfirmationEmail(Payment payment) {
        String to = payment.getStudent().getEmail();
        if (to == null || to.isEmpty()) return;

        String subject = "Payment Confirmation - " + payment.getBatch().getName();
        String htmlContent = String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #4CAF50;">Payment Successful!</h2>
                    <p>Hello <strong>%s</strong>,</p>
                    <p>Your payment for the batch <strong>%s</strong> has been received successfully.</p>
                    <table style="width: 100%%; border-collapse: collapse; margin: 20px 0;">
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">INR %s</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>For Month:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Transaction ID:</strong></td>
                            <td style="padding: 8px; border-bottom: 1px solid #eee;">%s</td>
                        </tr>
                    </table>
                    <p>Thank you for choosing TuitionHub.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 0.8em; color: #777;">This is an automated email. Please do not reply.</p>
                </div>
            </body>
            </html>
            """, 
            payment.getStudent().getName(), 
            payment.getBatch().getName(), 
            payment.getAmount(),
            payment.getForMonth() != null ? payment.getForMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy")) : "N/A",
            payment.getRazorpayPaymentId()
        );

        emailService.sendHtmlEmail(to, subject, htmlContent);
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

    private void fetchAndPopulateExtraDetails(Payment payment) {
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId.trim(), razorpayKeySecret.trim());
            com.razorpay.Payment rpPayment = razorpayClient.payments.fetch(payment.getRazorpayPaymentId());
            
            payment.setPaymentMethod(rpPayment.get("method"));
            payment.setBankName(rpPayment.get("bank"));
            payment.setCardNetwork(rpPayment.get("card_network"));
            payment.setWalletName(rpPayment.get("wallet"));
            payment.setUpiVpa(rpPayment.get("vpa"));
            payment.setPayerEmail(rpPayment.get("email"));
            payment.setPayerContact(rpPayment.get("contact"));
            
            // Note: Fees and Tax are available only after some delay or using payment.fetch_fees
            if (rpPayment.has("fee")) {
                payment.setGatewayFee(Double.valueOf(rpPayment.get("fee").toString()) / 100.0);
            }
            if (rpPayment.has("tax")) {
                payment.setGatewayTax(Double.valueOf(rpPayment.get("tax").toString()) / 100.0);
            }
            
            log.info("Fetched extra details for payment {}: method={}", payment.getId(), payment.getPaymentMethod());
        } catch (Exception e) {
            log.warn("Failed to fetch extra details from Razorpay for payment {}: {}", payment.getId(), e.getMessage());
        }
    }

    private boolean verifySignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            log.warn("Missing parameters for signature verification");
            return false;
        }
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
            
            String generatedSignature = hexString.toString();
            boolean matches = generatedSignature.equals(signature);
            
            if (!matches) {
                log.debug("Signature mismatch! Expected: {}, Received: {}", generatedSignature, signature);
            }
            
            return matches;
        } catch (Exception e) {
            log.error("Signature calculation error: {}", e.getMessage());
            return false;
        }
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
        payment.setRazorpayPaymentId("MANUAL_BY_ADMIN"); // Mark as manual
        
        Payment saved = paymentRepository.save(payment);
        
        // Send Email Confirmation
        sendPaymentConfirmationEmail(saved);
        
        return mapToResponse(saved);
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

    private PaymentDto.Response mapToResponse(Payment p) {
        PaymentDto.Response res = new PaymentDto.Response();
        res.setId(p.getId());
        res.setStudentName(p.getStudent().getName());
        res.setBatchName(p.getBatch().getName());
        res.setAmount(p.getAmount());
        res.setCurrency(p.getBatch().getCurrency() != null ? p.getBatch().getCurrency() : "INR");
        res.setForMonth(p.getForMonth() != null
                ? p.getForMonth().format(DateTimeFormatter.ofPattern("MMMM yyyy")) : null);
        res.setStatus(p.getStatus().name());
        res.setRazorpayOrderId(p.getRazorpayOrderId());
        res.setRazorpayPaymentId(p.getRazorpayPaymentId());
        res.setPaidAt(p.getPaidAt() != null ? p.getPaidAt().toString() : null);
        
        // Extra Details
        res.setPaymentMethod(p.getPaymentMethod());
        res.setBankName(p.getBankName());
        res.setCardNetwork(p.getCardNetwork());
        res.setWalletName(p.getWalletName());
        res.setUpiVpa(p.getUpiVpa());
        res.setPayerEmail(p.getPayerEmail());
        res.setPayerContact(p.getPayerContact());
        res.setGatewayFee(p.getGatewayFee());
        res.setGatewayTax(p.getGatewayTax());
        
        // Error Details
        res.setErrorCode(p.getErrorCode());
        res.setErrorDescription(p.getErrorDescription());
        res.setErrorReason(p.getErrorReason());
        res.setErrorStep(p.getErrorStep());
        
        return res;
    }

    public String getRazorpayKeyId() {
        return razorpayKeyId;
    }
}
