package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Attendance;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.AttendanceRepository;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Transactional
    public Attendance markAttendance(Long batchId, Long studentId, LocalDate date, Attendance.AttendanceStatus status, String remark) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Attendance attendance = Attendance.builder()
                .batch(batch)
                .student(student)
                .attendanceDate(date)
                .status(status)
                .remark(remark)
                .build();

        attendance = attendanceRepository.save(attendance);

        if (status == Attendance.AttendanceStatus.ABSENT) {
            sendAbsenceNotification(attendance);
        }

        return attendance;
    }

    private void sendAbsenceNotification(Attendance attendance) {
        User student = attendance.getStudent();
        String to = student.getEmail();
        if (to == null || to.isEmpty()) return;

        String subject = "Absence Notification - " + attendance.getBatch().getName();
        String body = String.format("""
            Hello %s,
            
            This is to inform you that you were marked ABSENT for the class "%s" on %s.
            
            If this is a mistake, please contact your teacher.
            
            Regards,
            TuitionHub Team
            """, 
            student.getName(), 
            attendance.getBatch().getName(), 
            attendance.getAttendanceDate().toString()
        );

        emailService.sendSimpleEmail(to, subject, body);
        
        // Also notify parent if linked
        if (student.getParent() != null && student.getParent().getEmail() != null) {
            String parentSubject = "Attendance Alert: " + student.getName() + " was Absent";
            String parentBody = String.format("""
                Hello,
                
                Your child %s was marked ABSENT for the class "%s" on %s.
                
                Regards,
                TuitionHub Team
                """, 
                student.getName(), 
                attendance.getBatch().getName(), 
                attendance.getAttendanceDate().toString()
            );
            emailService.sendSimpleEmail(student.getParent().getEmail(), parentSubject, parentBody);
        }
    }

    public List<Attendance> getBatchAttendance(Long batchId, LocalDate date) {
        return attendanceRepository.findByBatchIdAndAttendanceDate(batchId, date);
    }

    public List<Attendance> getStudentAttendance(Long studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }
}
