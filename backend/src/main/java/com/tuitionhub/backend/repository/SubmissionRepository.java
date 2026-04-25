package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Assignment;
import com.tuitionhub.backend.model.Submission;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    List<Submission> findByAssignment(Assignment assignment);
    Optional<Submission> findByAssignmentAndStudent(Assignment assignment, User student);
}
