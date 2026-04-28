package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/book")
    public ResponseEntity<Session> bookSession(@RequestBody Map<String, Object> request) {
        Long teacherId = Long.valueOf(request.get("teacherId").toString());
        Long studentId = Long.valueOf(request.get("studentId").toString());
        LocalDateTime startTime = LocalDateTime.parse(request.get("startTime").toString());
        LocalDateTime endTime = LocalDateTime.parse(request.get("endTime").toString());
        Double amount = Double.valueOf(request.get("amount").toString());

        return ResponseEntity.ok(sessionService.createSession(teacherId, studentId, startTime, endTime, amount));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Session> payForSession(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Session.PaymentMethod method = Session.PaymentMethod.valueOf(request.get("method"));
        return ResponseEntity.ok(sessionService.payForSession(id, method));
    }

    @PostMapping("/{id}/confirm-gateway")
    public ResponseEntity<Session> confirmGateway(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String ref = (String) request.get("paymentReference");
        Double amount = Double.valueOf(request.get("amount").toString());
        return ResponseEntity.ok(sessionService.confirmGatewayPayment(id, ref, amount));
    }

    @GetMapping("/student")
    public ResponseEntity<List<Session>> getStudentSessions(@RequestParam Long studentId) {
        return ResponseEntity.ok(sessionService.getStudentSessions(studentId));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<Session>> getTeacherSessions(@RequestParam Long teacherId) {
        return ResponseEntity.ok(sessionService.getTeacherSessions(teacherId));
    }
}
