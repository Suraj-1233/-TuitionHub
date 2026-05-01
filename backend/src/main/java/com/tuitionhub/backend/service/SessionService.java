package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.model.User;

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

        session.setPaymentMethod(Session.PaymentMethod.GATEWAY);
        return sessionRepository.save(session);
    }

    @Transactional
    public Session confirmGatewayPayment(Long sessionId, String paymentReference, Double amountPaid) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found"));

        session.setGatewayAmountPaid(amountPaid);
        session.setPaymentReference(paymentReference);
        
        if (amountPaid >= session.getAmount()) {
            session.setIsPaid(true);
            session.setStatus(Session.SessionStatus.CONFIRMED);
        }

        return sessionRepository.save(session);
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
