package com.tuitionhub.backend.dto;

import lombok.Data;
import java.time.LocalDate;

public class PaymentDto {

    @Data
    public static class CreateOrderRequest {
        private Long batchId;
        private LocalDate forMonth;
    }

    @Data
    public static class VerifyRequest {
        private Long paymentId;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String razorpaySignature;
    }

    @Data
    public static class FailureRequest {
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
        private String walletName;
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
