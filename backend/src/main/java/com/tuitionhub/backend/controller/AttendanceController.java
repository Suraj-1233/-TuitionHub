package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.Attendance;
import com.tuitionhub.backend.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<Attendance> markAttendance(
            @RequestParam Long batchId,
            @RequestParam Long studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Attendance.AttendanceStatus status,
            @RequestParam(required = false) String remark) {
        
        return ResponseEntity.ok(attendanceService.markAttendance(batchId, studentId, date, status, remark));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<Attendance>> getBatchAttendance(
            @PathVariable Long batchId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getBatchAttendance(batchId, date));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Attendance>> getStudentAttendance(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }
}
