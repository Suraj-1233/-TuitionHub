package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.StudyMaterial;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.StudyMaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaterialService {
    private final StudyMaterialRepository materialRepository;
    private final BatchRepository batchRepository;

    public StudyMaterial uploadMaterial(Long batchId, StudyMaterial material) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        material.setBatch(batch);
        return materialRepository.save(material);
    }

    public List<StudyMaterial> getMaterialsByBatch(Long batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        return materialRepository.findByBatch(batch);
    }

    public void deleteMaterial(Long materialId) {
        materialRepository.deleteById(materialId);
    }
}
