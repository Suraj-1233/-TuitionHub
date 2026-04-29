package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.PaymentDto;
import com.tuitionhub.backend.gateway.PaymentGateway;
import com.tuitionhub.backend.mapper.PaymentMapper;
import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.PaymentRepository;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Batch;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private PaymentGateway paymentGateway;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private EmailService emailService;

    @Mock
    private WalletService walletService;

    @InjectMocks
    private PaymentService paymentService;

    private Payment payment;
    private PaymentDto.Response responseDto;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .id(1L)
                .amount(100.0)
                .currency("INR")
                .status(Payment.PaymentStatus.PENDING)
                .build();

        responseDto = new PaymentDto.Response();
        responseDto.setId(1L);
        responseDto.setStatus("PENDING");
    }

    @Test
    void createPaymentOrder_Success() {
        PaymentDto.CreateOrderRequest request = new PaymentDto.CreateOrderRequest();
        request.setBatchId(1L);
        request.setForMonth(LocalDate.now());

        User student = new User();
        student.setId(1L);
        
        Batch batch = new Batch();
        batch.setId(1L);
        batch.setMonthlyFees(100.0);

        when(batchRepository.findById(1L)).thenReturn(Optional.of(batch));
        when(paymentGateway.createOrder(anyDouble(), anyString(), anyString())).thenReturn("order_123");
        when(paymentGateway.getGatewayName()).thenReturn("RAZORPAY");
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.mapToResponse(any(Payment.class))).thenReturn(responseDto);

        PaymentDto.Response result = paymentService.createPaymentOrder(request, student);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    void verifyPayment_Success() {
        PaymentDto.VerifyRequest verifyRequest = new PaymentDto.VerifyRequest();
        verifyRequest.setPaymentId(1L);
        verifyRequest.setRazorpayOrderId("order_123");
        verifyRequest.setRazorpayPaymentId("pay_123");
        verifyRequest.setRazorpaySignature("sig_123");

        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentGateway.verifySignature(any(), any(), any())).thenReturn(true);
        when(paymentRepository.save(any(Payment.class))).thenReturn(payment);
        when(paymentMapper.mapToResponse(any(Payment.class))).thenReturn(responseDto);

        PaymentDto.Response result = paymentService.verifyAndUpdatePayment(verifyRequest);

        assertNotNull(result);
        verify(emailService, times(1)).sendPaymentConfirmation(any());
    }
}
