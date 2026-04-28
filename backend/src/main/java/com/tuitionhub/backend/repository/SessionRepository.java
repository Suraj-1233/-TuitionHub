package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByStudentOrderByStartTimeDesc(User student);
    List<Session> findByTeacherOrderByStartTimeDesc(User teacher);
    List<Session> findByStudentAndIsPaidTrue(User student);
}
