package com.tuitionhub.backend.service;

import com.tuitionhub.backend.exception.ResourceNotFoundException;
import com.tuitionhub.backend.model.AssignmentRequest;
import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.AssignmentRequestRepository;
import com.tuitionhub.backend.repository.BatchRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentRequestService {

    private final AssignmentRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final BatchRepository batchRepository;
    private final ConflictService conflictService;

    public List<AssignmentRequest> getPendingRequests() {
        return requestRepository.findByStatus(AssignmentRequest.RequestStatus.PENDING);
    }

    @Transactional
    public String assignTeacher(Long requestId, Long teacherId) {
        AssignmentRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment request not found"));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        // Conflict Detection
        List<Batch> teacherBatches = batchRepository.findByTeacher(teacher);
        String conflictMessage = conflictService.checkConflicts(request.getPreferredTimings(), teacherBatches);

        request.setAssignedTeacher(teacher);
        request.setStatus(AssignmentRequest.RequestStatus.ASSIGNED);
        requestRepository.save(request);

        // Auto-create Batch logic
        createIndividualBatch(request, teacher);

        return conflictMessage;
    }

    private void createIndividualBatch(AssignmentRequest request, User teacher) {
        String tFrom = "04:00 PM";
        String tTo = "05:00 PM";
        if (request.getPreferredTimings() != null && request.getPreferredTimings().contains(" - ")) {
            String[] times = request.getPreferredTimings().split(" - ");
            tFrom = times[0].trim();
            tTo = times[1].trim();
        }

        Batch batch = Batch.builder()
                .name(request.getSubjects() + " - " + request.getStudent().getName())
                .subject(request.getSubjects())
                .teacher(teacher)
                .targetClass(request.getStudent().getStudentProfile() != null ? request.getStudent().getStudentProfile().getStudentClass() : "N/A")
                .timingFrom(tFrom)
                .timingTo(tTo)
                .days("Daily")
                .monthlyFees(10.0) 
                .maxStudents(1) 
                .liveClassLink("https://meet.jit.si/TuitionHub_" + teacher.getName().replace(" ", "") + "_" + request.getStudent().getName().replace(" ", ""))
                .liveClassPlatform("JITSI")
                .isActive(true)
                .students(new ArrayList<>(List.of(request.getStudent())))
                .build();
        
        batchRepository.save(batch);
    }
}
