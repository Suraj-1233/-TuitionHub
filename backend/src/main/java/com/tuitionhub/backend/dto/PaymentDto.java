package com.tuitionhub.backend.dto;

import lombok.Data;
import java.time.LocalDate;

public class PaymentDto {

    @Data
    public static class CreateOrderRequest {
        @jakarta.validation.constraints.NotNull(message = "Batch ID is required")
        private Long batchId;
        
        @jakarta.validation.constraints.NotNull(message = "Student ID is required")
        private Long studentId; // Required when parent is paying
        
        @jakarta.validation.constraints.NotNull(message = "Month is required")
        private LocalDate forMonth;
    }

    @Data
    public static class VerifyRequest {
        @jakarta.validation.constraints.NotNull(message = "Payment ID is required")
        private Long paymentId;
        
        @jakarta.validation.constraints.NotBlank(message = "Order ID is required")
        private String razorpayOrderId;
        
        @jakarta.validation.constraints.NotBlank(message = "Payment ID is required")
        private String razorpayPaymentId;
        
        @jakarta.validation.constraints.NotBlank(message = "Signature is required")
        private String razorpaySignature;
    }

    @Data
    public static class FailureRequest {
        @jakarta.validation.constraints.NotNull(message = "Payment ID is required")
        private Long paymentId;
        private String errorCode;
        private String errorDescription;
        private String errorReason;
        private String errorStep;
        private String errorSource;
    }

    @Data
    public static class Response {
        private Long id;
        private String studentName;
        private String batchName;
        private Double amount;
        private String currency;
        private String forMonth;
        private String status;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpayKeyId;
        private String gateway; // RAZORPAY
        private String paidAt;

        // Extra details
        private String paymentMethod;
        private String bankName;
        private String cardNetwork;

        private String upiVpa;
        private String payerEmail;
        private String payerContact;
        private Double gatewayFee;
        private Double gatewayTax;

        // Error details
        private String errorCode;
        private String errorDescription;
        private String errorReason;
        private String errorStep;
    }
}
