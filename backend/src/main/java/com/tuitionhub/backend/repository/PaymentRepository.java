package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByStudent(User student);
    List<Payment> findByStudentAndStatus(User student, Payment.PaymentStatus status);
    List<Payment> findByStudentParent(User parent);
    List<Payment> findByBatch(Batch batch);
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findByStudentAndBatchAndForMonth(User student, Batch batch, LocalDate forMonth);

    @Query("SELECT p FROM Payment p WHERE p.batch.teacher.id = :teacherId")
    List<Payment> findByTeacherId(Long teacherId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'PAID' AND p.batch.teacher.id = :teacherId")
    Double sumPaidAmountByTeacherId(Long teacherId);
}
