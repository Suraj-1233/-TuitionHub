package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.BatchJoinRequest;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BatchJoinRequestRepository extends JpaRepository<BatchJoinRequest, Long> {
    List<BatchJoinRequest> findByBatch(Batch batch);
    List<BatchJoinRequest> findByStudent(User student);
    List<BatchJoinRequest> findByBatchAndStatus(Batch batch, BatchJoinRequest.RequestStatus status);
    Optional<BatchJoinRequest> findByStudentAndBatch(User student, Batch batch);
    boolean existsByStudentAndBatchAndStatus(User student, Batch batch, BatchJoinRequest.RequestStatus status);
}
