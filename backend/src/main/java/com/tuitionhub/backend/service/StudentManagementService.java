package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentManagementService {

    private final UserRepository userRepository;
    private final BatchRepository batchRepository;

    public List<User> getAllStudents() {
        return userRepository.findByRole(Role.STUDENT);
    }

    @Transactional
    public void assignStudentToBatch(Long batchId, Long studentId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (batch.getStudents().contains(student)) {
            throw new BadRequestException("Student already in this batch");
        }

        if (batch.getStudents().size() >= batch.getMaxStudents()) {
            throw new BadRequestException("Batch is full");
        }

        batch.getStudents().add(student);
        batchRepository.save(batch);
    }

    @Transactional
    public void removeStudentFromBatch(Long batchId, Long studentId) {
        Batch batch = batchRepository.findById(batchId)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        batch.getStudents().remove(student);
        batchRepository.save(batch);
    }

    @Transactional
    public void toggleUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIsActive(active);
        userRepository.save(user);
    }
}
