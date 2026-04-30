package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.SessionFeedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionFeedbackRepository extends JpaRepository<SessionFeedback, Long> {
    Optional<SessionFeedback> findBySessionId(Long sessionId);

    @org.springframework.data.jpa.repository.Query("SELECT f FROM SessionFeedback f JOIN FETCH f.session s JOIN FETCH s.teacher JOIN FETCH s.student ORDER BY f.id DESC")
    java.util.List<SessionFeedback> findAllWithDetails();
}
