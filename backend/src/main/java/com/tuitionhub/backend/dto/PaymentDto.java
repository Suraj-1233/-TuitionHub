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
    public static class Response {
        private Long id;
        private String studentName;
        private String batchName;
        private Double amount;
        private String forMonth;
        private String status;
        private String razorpayOrderId;
        private String razorpayPaymentId;
        private String paidAt;
    }
}
