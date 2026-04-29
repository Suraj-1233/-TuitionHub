package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherManagementService {

    private final UserRepository userRepository;

    public List<User> getAllTeachers() {
        return userRepository.findByRole(Role.TEACHER);
    }

    public List<User> getPendingTeachers() {
        return userRepository.findByRoleAndIsApproved(Role.TEACHER, false);
    }

    @Transactional
    @com.tuitionhub.backend.security.Auditable(action = "APPROVE_TEACHER")
    public void approveTeacher(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setIsApproved(true);
        userRepository.save(teacher);
    }

    @Transactional
    @com.tuitionhub.backend.security.Auditable(action = "REJECT_TEACHER")
    public void rejectTeacher(Long id) {
        User teacher = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        teacher.setIsApproved(false);
        teacher.setIsActive(false);
        userRepository.save(teacher);
    }
}
