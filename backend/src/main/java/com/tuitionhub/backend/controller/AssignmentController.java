package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.Assignment;
import com.tuitionhub.backend.model.Submission;
import com.tuitionhub.backend.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AssignmentController {
    private final AssignmentService assignmentService;

    @PostMapping("/batch/{batchId}")
    public ResponseEntity<Assignment> create(@PathVariable Long batchId, @RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(batchId, assignment));
    }

    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<Assignment>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByBatch(batchId));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<Submission> submit(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Long studentId = Long.valueOf(request.get("studentId").toString());
        String contentUrl = request.get("contentUrl").toString();
        return ResponseEntity.ok(assignmentService.submitAssignment(id, studentId, contentUrl));
    }

    @PostMapping("/submissions/{submissionId}/grade")
    public ResponseEntity<Submission> grade(@PathVariable Long submissionId, @RequestBody Map<String, Object> request) {
        Integer marks = Integer.valueOf(request.get("marks").toString());
        String feedback = request.get("feedback").toString();
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, marks, feedback));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<Submission>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsForAssignment(id));
    }
}
