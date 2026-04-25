package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.AssignmentRequest;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRequestRepository extends JpaRepository<AssignmentRequest, Long> {
    List<AssignmentRequest> findByStudent(User student);
    List<AssignmentRequest> findByStatus(AssignmentRequest.RequestStatus status);
}
