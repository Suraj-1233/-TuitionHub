package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.ParentStudentLink;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.ParentStudentLinkRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ParentService {
    private final ParentStudentLinkRepository linkRepository;
    private final UserRepository userRepository;

    public void linkChild(Long parentId, String studentEmail) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
        
        User student = userRepository.findByEmail(studentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Student with this email not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("The provided email does not belong to a student account");
        }

        // Check if already linked
        boolean exists = linkRepository.findByParent(parent).stream()
                .anyMatch(link -> link.getStudent().getId().equals(student.getId()));
        
        if (exists) {
            throw new RuntimeException("Child is already linked to your account");
        }

        ParentStudentLink link = ParentStudentLink.builder()
                .parent(parent)
                .student(student)
                .relationship("Parent")
                .build();
        
        linkRepository.save(link);
    }

    public List<User> getLinkedChildren(Long parentId) {
        User parent = userRepository.findById(parentId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent not found"));
        
        return linkRepository.findByParent(parent).stream()
                .map(ParentStudentLink::getStudent)
                .collect(Collectors.toList());
    }
}
