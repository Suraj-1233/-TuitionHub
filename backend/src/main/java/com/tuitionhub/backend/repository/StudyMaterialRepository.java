package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findByBatch(Batch batch);
}
