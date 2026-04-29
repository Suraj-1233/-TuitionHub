package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.ParentDto;
import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.PaymentRepository;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParentService {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public ParentDto.DashboardSummary getDashboardSummary(String token) {
        String email = jwtTokenProvider.getEmailFromToken(token);
        User parent = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Parent not found"));

        List<User> children = userRepository.findByParent(parent);
        
        List<ParentDto.ChildSummary> childSummaries = children.stream().map(child -> {
            // Find pending payments for this child
            List<Payment> pendingPayments = paymentRepository.findByStudentAndStatus(child, Payment.PaymentStatus.PENDING);
            double pendingFees = pendingPayments.stream().mapToDouble(Payment::getAmount).sum();

            List<ParentDto.BatchSummary> batches = child.getBatches().stream().map(batch -> 
                ParentDto.BatchSummary.builder()
                        .id(batch.getId())
                        .name(batch.getName())
                        .subject(batch.getSubject())
                        .monthlyFees(batch.getMonthlyFees())
                        .nextPaymentDue("1st of next month") // Mock for now
                        .build()
            ).collect(Collectors.toList());

            return ParentDto.ChildSummary.builder()
                    .id(child.getId())
                    .name(child.getName())
                    .studentClass(child.getStudentProfile() != null ? child.getStudentProfile().getStudentClass() : "N/A")
                    .board(child.getStudentProfile() != null ? child.getStudentProfile().getBoard() : "N/A")
                    .activeBatches(batches)
                    .pendingFees(pendingFees)
                    .build();
        }).collect(Collectors.toList());

        double totalPending = childSummaries.stream().mapToDouble(ParentDto.ChildSummary::getPendingFees).sum();
        int activeBatches = (int) childSummaries.stream().flatMap(c -> c.getActiveBatches().stream()).count();

        return ParentDto.DashboardSummary.builder()
                .childrenCount(children.size())
                .activeBatchesCount(activeBatches)
                .totalPendingFees(totalPending)
                .children(childSummaries)
                .build();
    }
}
