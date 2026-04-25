package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Assignment;
import com.tuitionhub.backend.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByBatch(Batch batch);
}
