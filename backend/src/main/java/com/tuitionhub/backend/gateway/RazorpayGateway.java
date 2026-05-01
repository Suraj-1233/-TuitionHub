package com.tuitionhub.backend.gateway;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.model.Payment;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Component
@Slf4j
public class RazorpayGateway implements PaymentGateway {

    @Value("${app.razorpay.key-id}")
    private String keyId;

    @Value("${app.razorpay.key-secret}")
    private String keySecret;

    @Override
    public String createOrder(double amount, String currency, String receipt) {
        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId.trim(), keySecret.trim());
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", (int) (amount * 100));
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);
            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            return razorpayOrder.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay Order Creation Failed: {}", e.getMessage());
            throw new BadRequestException("Razorpay Error: " + e.getMessage());
        }
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String data = orderId + "|" + paymentId;
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }

            return hexString.toString().equals(signature);
        } catch (Exception e) {
            log.error("Signature calculation error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void fetchAndPopulateExtraDetails(Payment payment) {
        try {
            RazorpayClient razorpayClient = new RazorpayClient(keyId.trim(), keySecret.trim());
            com.razorpay.Payment rpPayment = razorpayClient.payments.fetch(payment.getRazorpayPaymentId());

            payment.setPaymentMethod(rpPayment.get("method"));
            payment.setBankName(rpPayment.get("bank"));
            payment.setCardNetwork(rpPayment.get("card_network"));

            payment.setUpiVpa(rpPayment.get("vpa"));
            payment.setPayerEmail(rpPayment.get("email"));
            payment.setPayerContact(rpPayment.get("contact"));

            if (rpPayment.has("fee")) {
                payment.setGatewayFee(Double.valueOf(rpPayment.get("fee").toString()) / 100.0);
            }
            if (rpPayment.has("tax")) {
                payment.setGatewayTax(Double.valueOf(rpPayment.get("tax").toString()) / 100.0);
            }
        } catch (Exception e) {
            log.warn("Failed to fetch extra details from Razorpay: {}", e.getMessage());
        }
    }

    @Override
    public String getGatewayName() {
        return "RAZORPAY";
    }

    @Override
    public String getPublicKey() {
        return keyId;
    }
}
