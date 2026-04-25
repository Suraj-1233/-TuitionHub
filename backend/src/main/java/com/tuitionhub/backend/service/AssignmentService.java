package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Assignment;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.Submission;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.AssignmentRepository;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.SubmissionRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    public Assignment createAssignment(Long batchId, Assignment assignment) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        assignment.setBatch(batch);
        return assignmentRepository.save(assignment);
    }

    public List<Assignment> getAssignmentsByBatch(Long batchId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        return assignmentRepository.findByBatch(batch);
    }

    public Submission submitAssignment(Long assignmentId, Long studentId, String contentUrl) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Submission submission = submissionRepository.findByAssignmentAndStudent(assignment, student)
                .orElse(Submission.builder().assignment(assignment).student(student).build());
        
        submission.setContentUrl(contentUrl);
        return submissionRepository.save(submission);
    }

    public Submission gradeSubmission(Long submissionId, Integer marks, String feedback) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found"));
        submission.setMarksObtained(marks);
        submission.setFeedback(feedback);
        return submissionRepository.save(submission);
    }

    public List<Submission> getSubmissionsForAssignment(Long assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));
        return submissionRepository.findByAssignment(assignment);
    }
}
