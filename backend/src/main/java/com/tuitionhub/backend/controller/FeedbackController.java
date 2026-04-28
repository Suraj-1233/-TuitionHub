package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.SessionFeedback;
import com.tuitionhub.backend.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {
    @Autowired
    private FeedbackService feedbackService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitFeedback(@RequestBody Map<String, Object> payload) {
        try {
            Long sessionId = Long.valueOf(payload.get("sessionId").toString());
            Integer rating = (Integer) payload.get("rating");
            String comment = (String) payload.get("comment");

            SessionFeedback feedback = feedbackService.submitFeedback(sessionId, rating, comment);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getFeedbackForSession(@PathVariable Long sessionId) {
        SessionFeedback feedback = feedbackService.getFeedbackForSession(sessionId);
        if (feedback == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(feedback);
    }
}
