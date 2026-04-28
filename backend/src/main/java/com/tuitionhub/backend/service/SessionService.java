package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Wallet;
import com.tuitionhub.backend.repository.SessionRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SessionService {

    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;

    public Session createSession(Long teacherId, Long studentId, LocalDateTime startTime, LocalDateTime endTime, Double amount) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Session session = Session.builder()
                .teacher(teacher)
                .student(student)
                .startTime(startTime)
                .endTime(endTime)
                .amount(amount)
                .status(Session.SessionStatus.PENDING)
                .isPaid(false)
                .build();

        return sessionRepository.save(session);
    }

    @Transactional
    public Session payForSession(Long sessionId, Session.PaymentMethod method) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        if (session.getIsPaid()) {
            throw new BadRequestException("Session is already paid.");
        }

        User student = session.getStudent();
        Double amount = session.getAmount();

        if (method == Session.PaymentMethod.WALLET) {
            walletService.deductBalance(student.getId(), amount, "Payment for session #" + sessionId, sessionId.toString());
            session.setIsPaid(true);
            session.setStatus(Session.SessionStatus.CONFIRMED);
            session.setPaymentMethod(Session.PaymentMethod.WALLET);
            session.setWalletAmountDeducted(amount);
            
            // Handle Referral Reward if this is the student's first paid session
            checkAndTriggerReferral(student);
        } else if (method == Session.PaymentMethod.PARTIAL) {
            Wallet wallet = walletService.getWalletByUserId(student.getId());
            Double walletBalance = wallet.getBalance();
            
            if (walletBalance <= 0) {
                throw new BadRequestException("No wallet balance available for partial payment.");
            }

            Double walletDeduction = Math.min(walletBalance, amount);
            Double remaining = amount - walletDeduction;

            walletService.deductBalance(student.getId(), walletDeduction, "Partial payment for session #" + sessionId, sessionId.toString());
            
            session.setWalletAmountDeducted(walletDeduction);
            session.setPaymentMethod(Session.PaymentMethod.PARTIAL);
            
            // Note: In a real app, we would now trigger a gateway payment for the 'remaining' amount.
            // For now, we'll assume the caller handles the gateway part and then calls 'confirmGatewayPayment'.
        } else {
            session.setPaymentMethod(Session.PaymentMethod.GATEWAY);
        }

        return sessionRepository.save(session);
    }

    @Transactional
    public Session confirmGatewayPayment(Long sessionId, String paymentReference, Double amountPaid) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setGatewayAmountPaid(amountPaid);
        session.setPaymentReference(paymentReference);
        
        Double totalPaid = (session.getWalletAmountDeducted() != null ? session.getWalletAmountDeducted() : 0.0) + amountPaid;
        
        if (totalPaid >= session.getAmount()) {
            session.setIsPaid(true);
            session.setStatus(Session.SessionStatus.CONFIRMED);
            
            // Handle Referral Reward if this is the student's first paid session
            checkAndTriggerReferral(session.getStudent());
        }

        return sessionRepository.save(session);
    }

    private void checkAndTriggerReferral(User student) {
        List<Session> paidSessions = sessionRepository.findByStudentAndIsPaidTrue(student);
        if (paidSessions.size() == 1) { // This was the first one
            walletService.handleReferralReward(student);
        }
    }

    public List<Session> getStudentSessions(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return sessionRepository.findByStudentOrderByStartTimeDesc(student);
    }

    public List<Session> getTeacherSessions(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        return sessionRepository.findByTeacherOrderByStartTimeDesc(teacher);
    }
}
