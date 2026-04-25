package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Attendance;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByBatchAndAttendanceDate(Batch batch, LocalDate date);
    List<Attendance> findByStudentAndBatch(User student, Batch batch);
    boolean existsByStudentAndBatchAndAttendanceDate(User student, Batch batch, LocalDate date);
}
