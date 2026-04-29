package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.model.Subject;
import com.tuitionhub.backend.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Transactional
    public Subject addSubject(Subject subject) {
        if (subjectRepository.existsByNameIgnoreCase(subject.getName())) {
            throw new BadRequestException("Subject already exists");
        }
        return subjectRepository.save(subject);
    }

    @Transactional
    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
}
