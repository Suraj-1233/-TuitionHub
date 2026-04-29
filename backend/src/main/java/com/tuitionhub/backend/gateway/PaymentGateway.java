package com.tuitionhub.backend.gateway;

import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.model.Payment;

public interface PaymentGateway {
    String createOrder(double amount, String currency, String receipt);
    boolean verifySignature(String orderId, String paymentId, String signature);
    void fetchAndPopulateExtraDetails(Payment payment);
    String getGatewayName();
    String getPublicKey();
}
