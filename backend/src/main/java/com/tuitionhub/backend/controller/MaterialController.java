package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.StudyMaterial;
import com.tuitionhub.backend.service.MaterialService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/materials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaterialController {
    private final MaterialService materialService;

    @PostMapping("/batch/{batchId}")
    public ResponseEntity<StudyMaterial> upload(@PathVariable Long batchId, @RequestBody StudyMaterial material) {
        return ResponseEntity.ok(materialService.uploadMaterial(batchId, material));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<StudyMaterial>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(materialService.getMaterialsByBatch(batchId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        materialService.deleteMaterial(id);
        return ResponseEntity.ok().build();
    }
}
