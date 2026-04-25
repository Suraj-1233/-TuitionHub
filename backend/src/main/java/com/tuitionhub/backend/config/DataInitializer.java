package com.tuitionhub.backend.config;

import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
@org.springframework.context.annotation.Profile("!prod")
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final com.tuitionhub.backend.repository.BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private static long mobileCounter = 9000000000L;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@tuitionhub.com")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .mobile("9999999999")
                    .email("admin@tuitionhub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin created: email=admin@tuitionhub.com, password=admin123");
        }

        // Sample Teacher
        if (!userRepository.existsByEmail("ramesh@tuitionhub.com")) {
            User teacher = User.builder()
                    .name("Ramesh Kumar")
                    .mobile("8888888888")
                    .email("ramesh@tuitionhub.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.TEACHER)
                    .subject("Mathematics")
                    .qualification("M.Sc Mathematics, B.Ed")
                    .bio("10 years experience in teaching Maths for class 9-12")
                    .fees(1500.0)
                    .timingFrom("06:00 PM")
                    .timingTo("08:00 PM")
                    .availableDays("MON,TUE,WED,THU,FRI")
                    .city("Delhi")
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(teacher);
            log.info("✅ Sample teacher created: email=ramesh@tuitionhub.com, password=password123");
        }

        // Sample Student
        if (!userRepository.existsByEmail("priya@example.com")) {
            User student = User.builder()
                    .name("Priya Sharma")
                    .mobile("7777777777")
                    .email("priya@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.STUDENT)
                    .studentClass("10")
                    .board("CBSE")
                    .city("Delhi")
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(student);
            log.info("✅ Sample student created: email=priya@example.com, password=password123");
        }

        // New Roles for Phase 1
        if (!userRepository.existsByEmail("super@tuitionhub.com")) {
            User superAdmin = User.builder()
                    .name("Main Super Admin")
                    .mobile("1111111111")
                    .email("super@tuitionhub.com")
                    .password(passwordEncoder.encode("super123"))
                    .role(Role.SUPER_ADMIN)
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(superAdmin);
            log.info("✅ Super Admin created: super@tuitionhub.com");
        }

        if (!userRepository.existsByEmail("parent@example.com")) {
            User parent = User.builder()
                    .name("John Doe")
                    .mobile("2222222222")
                    .email("parent@example.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.PARENT)
                    .city("New York")
                    .timezone("America/New_York")
                    .currency("USD")
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(parent);
            log.info("✅ Sample Parent created: parent@example.com (US Timezone)");
        }

        // Add Dummy Teachers
        createTeacherIfNotExist("suresh@tuitionhub.com", "Suresh Raina", "Physics", "M.Tech", "Physics for JEE/NEET");
        createTeacherIfNotExist("sanya@tuitionhub.com", "Sanya Malhotra", "Biology", "M.Sc Bio", "Pre-medical Biology expert");
        createTeacherIfNotExist("amit@tuitionhub.com", "Amit Singh", "English", "MA English", "Spoken English & Literature");

        // Add Dummy Batches
        createBatchIfNotExist("Physics Advance 101", "Suresh Raina", "Physics", "12", 2000.0);
        createBatchIfNotExist("Biology Basics", "Sanya Malhotra", "Biology", "10", 1200.0);
        createBatchIfNotExist("Spoken English", "Amit Singh", "English", "All", 1000.0);
    }

    private void createTeacherIfNotExist(String email, String name, String subject, String qual, String bio) {
        if (!userRepository.existsByEmail(email)) {
            User teacher = User.builder()
                    .name(name)
                    .mobile(String.valueOf(mobileCounter++))
                    .email(email)
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.TEACHER)
                    .subject(subject)
                    .qualification(qual)
                    .bio(bio)
                    .fees(1500.0)
                    .timingFrom("04:00 PM")
                    .timingTo("06:00 PM")
                    .availableDays("MON,WED,FRI")
                    .city("Mumbai")
                    .isActive(true)
                    .isApproved(true)
                    .build();
            userRepository.save(teacher);
            log.info("✅ Dummy Teacher created: {}", email);
        }
    }

    private void createBatchIfNotExist(String batchName, String teacherName, String subject, String targetClass, Double fees) {
        if (!batchRepository.findAll().stream().anyMatch(b -> b.getName().equals(batchName))) {
            User teacher = userRepository.findByRole(Role.TEACHER).stream()
                    .filter(t -> t.getName().equals(teacherName))
                    .findFirst().orElse(null);
            
            if (teacher != null) {
                Batch batch = Batch.builder()
                        .name(batchName)
                        .subject(subject)
                        .targetClass(targetClass)
                        .maxStudents(30)
                        .monthlyFees(fees)
                        .timingFrom("05:00 PM")
                        .timingTo("06:00 PM")
                        .days("MON,WED,FRI")
                        .teacher(teacher)
                        .isActive(true)
                        .build();
                batchRepository.save(batch);
                log.info("✅ Dummy Batch created: {}", batchName);
            }
        }
    }
}
