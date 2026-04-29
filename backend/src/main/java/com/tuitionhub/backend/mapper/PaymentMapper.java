package com.tuitionhub.backend.mapper;

import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.model.Payment;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class PaymentMapper {

    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMMM yyyy");

    public PaymentDto.Response mapToResponse(Payment p) {
        PaymentDto.Response res = new PaymentDto.Response();
        res.setId(p.getId());
        res.setStudentName(p.getStudent().getName());
        res.setBatchName(p.getBatch() != null ? p.getBatch().getName() : "Wallet Topup");
        res.setAmount(p.getAmount());
        res.setCurrency(p.getCurrency());
        res.setGateway(p.getGateway());

        res.setForMonth(p.getForMonth() != null ? p.getForMonth().format(MONTH_FORMATTER) : null);
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
}
