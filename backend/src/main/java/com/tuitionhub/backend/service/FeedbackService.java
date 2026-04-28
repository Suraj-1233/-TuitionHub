package com.tuitionhub.backend.service;

import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.model.SessionFeedback;
import com.tuitionhub.backend.repository.SessionFeedbackRepository;
import com.tuitionhub.backend.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FeedbackService {
    @Autowired
    private SessionFeedbackRepository feedbackRepository;
    @Autowired
    private SessionRepository sessionRepository;

    @Transactional
    public SessionFeedback submitFeedback(Long sessionId, Integer rating, String comment) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getIsPaid()) {
            throw new RuntimeException("Cannot give feedback for unpaid sessions");
        }

        // Check if feedback already exists
        if (feedbackRepository.findBySessionId(sessionId).isPresent()) {
            throw new RuntimeException("Feedback already submitted for this session");
        }

        SessionFeedback feedback = new SessionFeedback();
        feedback.setSession(session);
        feedback.setRating(rating);
        feedback.setComment(comment);

        return feedbackRepository.save(feedback);
    }

    public SessionFeedback getFeedbackForSession(Long sessionId) {
        return feedbackRepository.findBySessionId(sessionId).orElse(null);
    }
}
