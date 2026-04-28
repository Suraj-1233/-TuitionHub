package com.tuitionhub.backend.config;

import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.Subject;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.repository.SubjectRepository;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.repository.SessionRepository;
import com.tuitionhub.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final WalletService walletService;

    @Override
    public void run(String... args) {
        // 1. Super Admin
        createIfNotExists("admin@tuitionhub.com", "Super Admin", Role.ADMIN, "admin123", "TUI-ADMIN");
        createIfNotExists("super@tuitionhub.com", "Main Super Admin", Role.SUPER_ADMIN, "super123", "TUI-SUPER");
        
        // 2. Demo Teacher
        createIfNotExists("teacher@tuitionhub.com", "Dr. Amit Sharma", Role.TEACHER, "teacher123", "TUI-TEACH");

        // 3. Ensure your email exists as a Student
        createIfNotExists("surajkannujiya517@gmail.com", "Suraj Kannujiya", Role.STUDENT, "suraj123", "TUI-SURAJ");

        // 4. Demo Data for Showcasing Features
        User student = userRepository.findByEmail("surajkannujiya517@gmail.com").orElse(null);
        User teacher = userRepository.findByEmail("teacher@tuitionhub.com").orElse(null);
        if (student != null && teacher != null) {
            seedDemoSessions(student, teacher);
        }

        // 5. Seed Default Subjects
        if (subjectRepository.count() == 0) {
            List.of(
                Subject.builder().name("Mathematics").icon("🔢").build(),
                Subject.builder().name("Physics").icon("🧪").build(),
                Subject.builder().name("Chemistry").icon("⚗️").build(),
                Subject.builder().name("Biology").icon("🧬").build(),
                Subject.builder().name("Computer Science").icon("💻").build(),
                Subject.builder().name("English").icon("📖").build()
            ).forEach(subjectRepository::save);
        }
    }

    private void createIfNotExists(String email, String name, Role role, String password, String referral) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name)
                    .email(email)
                    .mobile("9876543210")
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .isActive(true)
                    .isApproved(true)
                    .referralCode(referral)
                    .build();
            userRepository.save(user);
            walletService.getOrCreateWallet(user.getId());
            log.info("✅ Created {}: {}", role, email);
        }
    }

    private void seedDemoSessions(User student, User teacher) {
        if (sessionRepository.count() < 2) {
            // Get a subject
            Subject physics = subjectRepository.findByNameIgnoreCase("Physics").orElse(null);

            // 1. Paid Session
            Session paidSession = Session.builder()
                    .student(student)
                    .teacher(teacher)
                    .startTime(LocalDateTime.now().plusHours(2))
                    .endTime(LocalDateTime.now().plusHours(3))
                    .amount(500.0)
                    .isPaid(true)
                    .status(Session.SessionStatus.CONFIRMED)
                    .build();
            sessionRepository.save(paidSession);

            // 2. Completed Session
            Session completedSession = Session.builder()
                    .student(student)
                    .teacher(teacher)
                    .startTime(LocalDateTime.now().minusDays(1))
                    .endTime(LocalDateTime.now().minusDays(1).plusHours(1))
                    .amount(400.0)
                    .isPaid(true)
                    .status(Session.SessionStatus.COMPLETED)
                    .build();
            sessionRepository.save(completedSession);
            
            log.info("✅ Demo sessions seeded for {}", student.getEmail());
        }
    }
}
