package com.tuitionhub.backend.mapper;

import com.tuitionhub.backend.dto.AuthDto;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.StudentProfile;
import com.tuitionhub.backend.model.TeacherProfile;
import com.tuitionhub.backend.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public void updateEntityFromRegisterRequest(AuthDto.RegisterRequest request, User user) {
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setMobile((request.getMobile() == null || request.getMobile().trim().isEmpty()) ? null : request.getMobile());
        user.setRole(request.getRole());
        user.setCity(request.getCity());
        user.setCountry(request.getCountry());
        user.setTimezone(request.getTimezone() != null ? request.getTimezone() : "Asia/Kolkata");

        if (request.getRole() == Role.STUDENT) {
            StudentProfile profile = user.getStudentProfile() != null ? user.getStudentProfile() : new StudentProfile();
            profile.setUser(user);
            profile.setStudentClass(request.getStudentClass());
            profile.setBoard(request.getBoard());
            user.setStudentProfile(profile);
            user.setTempParentEmail(request.getParentEmail());
        } else if (request.getRole() == Role.TEACHER) {
            TeacherProfile profile = user.getTeacherProfile() != null ? user.getTeacherProfile() : new TeacherProfile();
            profile.setUser(user);
            profile.setSubject(request.getSubject());
            profile.setQualification(request.getQualification());
            profile.setBio(request.getBio());
            profile.setFees(request.getFees());
            profile.setTimingFrom(request.getTimingFrom());
            profile.setTimingTo(request.getTimingTo());
            profile.setAvailableDays(request.getAvailableDays());
            user.setTeacherProfile(profile);
        }
    }

    public AuthDto.AuthResponse mapToAuthResponse(User user, String token) {
        return new AuthDto.AuthResponse(
                token,
                user.getRole().name(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getIsApproved(),
                user.getReferralCode()
        );
    }
}
