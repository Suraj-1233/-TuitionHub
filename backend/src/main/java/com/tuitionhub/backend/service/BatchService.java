package com.tuitionhub.backend.service;

import com.tuitionhub.backend.dto.BatchDto;
import com.tuitionhub.backend.exception.BadRequestException;
import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.*;
import com.tuitionhub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;
    private final UserRepository userRepository;
    private final BatchJoinRequestRepository joinRequestRepository;

    @Transactional
    public BatchDto.Response createBatch(BatchDto.CreateRequest request, User teacher) {
        Batch batch = Batch.builder()
                .name(request.getName())
                .description(request.getDescription())
                .subject(request.getSubject())
                .targetClass(request.getTargetClass())
                .maxStudents(request.getMaxStudents())
                .monthlyFees(request.getMonthlyFees())
                .timingFrom(request.getTimingFrom())
                .timingTo(request.getTimingTo())
                .days(request.getDays())
                .teacher(teacher)
                .isActive(true)
                .build();
        return mapToResponse(batchRepository.save(batch));
    }

    public List<BatchDto.Response> getAllActiveBatches() {
        return batchRepository.findByIsActive(true)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BatchDto.Response> getTeacherBatches(User teacher) {
        return batchRepository.findByTeacher(teacher)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<BatchDto.Response> getStudentBatches(User student) {
        return batchRepository.findByStudent(student)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public BatchDto.Response getBatchById(Long id) {
        return mapToResponse(findBatch(id));
    }

    @Transactional
    public BatchDto.Response updateLiveClassLink(Long batchId, BatchDto.UpdateLiveLink request, User teacher) {
        Batch batch = findBatch(batchId);
        if (!batch.getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("Not authorized to update this batch");
        }
        batch.setLiveClassLink(request.getLiveClassLink());
        batch.setLiveClassPlatform(request.getLiveClassPlatform());
        return mapToResponse(batchRepository.save(batch));
    }

    @Transactional
    public String requestJoin(Long batchId, User student) {
        Batch batch = findBatch(batchId);

        if (batch.getStudents().contains(student)) {
            throw new BadRequestException("Already enrolled in this batch");
        }

        boolean alreadyRequested = joinRequestRepository.existsByStudentAndBatchAndStatus(
                student, batch, BatchJoinRequest.RequestStatus.PENDING);
        if (alreadyRequested) {
            throw new BadRequestException("Join request already pending");
        }

        if (batch.getStudents().size() >= batch.getMaxStudents()) {
            throw new BadRequestException("Batch is full");
        }

        BatchJoinRequest req = BatchJoinRequest.builder()
                .student(student)
                .batch(batch)
                .status(BatchJoinRequest.RequestStatus.PENDING)
                .build();
        joinRequestRepository.save(req);
        return "Join request sent successfully";
    }

    @Transactional
    public String respondToJoinRequest(Long requestId, boolean approve, User teacher) {
        BatchJoinRequest req = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Request not found"));

        if (!req.getBatch().getTeacher().getId().equals(teacher.getId())) {
            throw new BadRequestException("Not authorized");
        }

        if (approve) {
            req.setStatus(BatchJoinRequest.RequestStatus.APPROVED);
            User student = req.getStudent();
            Batch batch = req.getBatch();
            batch.getStudents().add(student);
            // Auto-set batch currency from student's registered currency
            if (student.getCurrency() != null && !student.getCurrency().isEmpty()) {
                batch.setCurrency(student.getCurrency());
            }
            batchRepository.save(batch);
        } else {
            req.setStatus(BatchJoinRequest.RequestStatus.REJECTED);
        }
        req.setRespondedAt(LocalDateTime.now());
        joinRequestRepository.save(req);
        return approve ? "Student approved" : "Student rejected";
    }

    @Transactional
    public String leavesBatch(Long batchId, User student) {
        Batch batch = findBatch(batchId);
        batch.getStudents().remove(student);
        batchRepository.save(batch);
        return "Left batch successfully";
    }

    public List<BatchJoinRequest> getPendingRequests(User teacher) {
        return batchRepository.findByTeacher(teacher)
                .stream()
                .flatMap(b -> joinRequestRepository.findByBatchAndStatus(b, BatchJoinRequest.RequestStatus.PENDING).stream())
                .collect(Collectors.toList());
    }

    @Transactional
    public BatchDto.Response proposeReschedule(Long batchId, String newTiming, User user) {
        Batch batch = findBatch(batchId);
        // Only teacher or students in the batch can propose
        boolean isTeacher = batch.getTeacher().getId().equals(user.getId());
        boolean isStudent = batch.getStudents().stream().anyMatch(s -> s.getId().equals(user.getId()));

        if (!isTeacher && !isStudent) {
            throw new BadRequestException("Not authorized");
        }

        batch.setProposedTiming(newTiming);
        batch.setProposedByRole(isTeacher ? "TEACHER" : "STUDENT");
        batch.setIsTimeChangeProposed(true);
        return mapToResponse(batchRepository.save(batch));
    }

    @Transactional
    public BatchDto.Response respondToReschedule(Long batchId, boolean accept, User user) {
        Batch batch = findBatch(batchId);
        if (!batch.getIsTimeChangeProposed()) {
            throw new BadRequestException("No reschedule proposed");
        }

        if (accept) {
            batch.setTimingFrom(batch.getProposedTiming());
        }

        batch.setProposedTiming(null);
        batch.setProposedByRole(null);
        batch.setIsTimeChangeProposed(false);
        return mapToResponse(batchRepository.save(batch));
    }

    // ---- Mapper ----
    private BatchDto.Response mapToResponse(Batch batch) {
        BatchDto.Response res = new BatchDto.Response();
        res.setId(batch.getId());
        res.setName(batch.getName());
        res.setDescription(batch.getDescription());
        res.setSubject(batch.getSubject());
        res.setTargetClass(batch.getTargetClass());
        res.setMaxStudents(batch.getMaxStudents());
        res.setCurrentStudents(batch.getStudents().size());
        res.setMonthlyFees(batch.getMonthlyFees());
        res.setTimingFrom(batch.getTimingFrom());
        res.setTimingTo(batch.getTimingTo());
        res.setDays(batch.getDays());
        res.setLiveClassLink(batch.getLiveClassLink());
        res.setLiveClassPlatform(batch.getLiveClassPlatform());
        res.setProposedTiming(batch.getProposedTiming());
        res.setProposedByRole(batch.getProposedByRole());
        res.setIsTimeChangeProposed(batch.getIsTimeChangeProposed());
        res.setIsActive(batch.getIsActive());
        res.setCurrency(batch.getCurrency() != null ? batch.getCurrency() : "INR");

        BatchDto.TeacherSummary ts = new BatchDto.TeacherSummary();
        ts.setId(batch.getTeacher().getId());
        ts.setName(batch.getTeacher().getName());
        ts.setProfilePhoto(batch.getTeacher().getProfilePhoto());
        ts.setIsApproved(batch.getTeacher().getIsApproved());
        
        TeacherProfile profile = batch.getTeacher().getTeacherProfile();
        if (profile != null) {
            ts.setSubject(profile.getSubject());
            ts.setFees(profile.getFees());
            ts.setTimingFrom(profile.getTimingFrom());
            ts.setTimingTo(profile.getTimingTo());
        }
        
        res.setTeacher(ts);

        return res;
    }

    private Batch findBatch(Long id) {
        return batchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Batch not found with id: " + id));
    }
}
