package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.dto.ApiResponse;
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
    public ResponseEntity<ApiResponse<Session>> bookSession(@RequestBody Map<String, Object> request) {
        Long teacherId = Long.valueOf(request.get("teacherId").toString());
        Long studentId = Long.valueOf(request.get("studentId").toString());
        LocalDateTime startTime = LocalDateTime.parse(request.get("startTime").toString());
        LocalDateTime endTime = LocalDateTime.parse(request.get("endTime").toString());
        Double amount = Double.valueOf(request.get("amount").toString());

        Session session = sessionService.createSession(teacherId, studentId, startTime, endTime, amount);
        return ResponseEntity.ok(ApiResponse.success(session, "Session booked successfully"));
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Session>> payForSession(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Session.PaymentMethod method = Session.PaymentMethod.valueOf(request.get("method"));
        Session session = sessionService.payForSession(id, method);
        return ResponseEntity.ok(ApiResponse.success(session, "Payment processed"));
    }

    @PostMapping("/{id}/confirm-gateway")
    public ResponseEntity<ApiResponse<Session>> confirmGateway(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        String ref = (String) request.get("paymentReference");
        Double amount = Double.valueOf(request.get("amount").toString());
        Session session = sessionService.confirmGatewayPayment(id, ref, amount);
        return ResponseEntity.ok(ApiResponse.success(session, "Payment confirmed"));
    }

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<List<Session>>> getStudentSessions(@RequestParam Long studentId) {
        List<Session> sessions = sessionService.getStudentSessions(studentId);
        return ResponseEntity.ok(ApiResponse.success(sessions, "Student sessions fetched"));
    }

    @GetMapping("/teacher")
    public ResponseEntity<ApiResponse<List<Session>>> getTeacherSessions(@RequestParam Long teacherId) {
        List<Session> sessions = sessionService.getTeacherSessions(teacherId);
        return ResponseEntity.ok(ApiResponse.success(sessions, "Teacher sessions fetched"));
    }
}
