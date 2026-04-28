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
        log.info("🚀 Initializing Demo Data...");

        // 1. Core Accounts
        createIfNotExists("admin@tuitionhub.com", "Super Admin", Role.ADMIN, "admin123", "TUI-ADMIN");
        createIfNotExists("super@tuitionhub.com", "Main Super Admin", Role.SUPER_ADMIN, "super123", "TUI-SUPER");
        createIfNotExists("teacher@tuitionhub.com", "Dr. Amit Sharma", Role.TEACHER, "teacher123", "TUI-TEACH");
        createIfNotExists("surajkannujiya517@gmail.com", "Suraj Kannujiya", Role.STUDENT, "suraj123", "TUI-SURAJ");

        // 2. Default Subjects
        if (subjectRepository.count() == 0) {
            seedSubjects();
        }

        // 3. Demo Sessions
        seedSessionsForUser("surajkannujiya517@gmail.com", "teacher@tuitionhub.com");

        // 4. Maintenance: Ensure all users have referral codes
        userRepository.findAll().forEach(user -> {
            if (user.getReferralCode() == null || user.getReferralCode().isEmpty()) {
                String code = "TUI-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
                user.setReferralCode(code);
                userRepository.save(user);
                log.info("🎁 Generated missing referral code for: {}", user.getEmail());
            }
        });

        log.info("✅ Data Initialization Complete.");
    }

    private String generateUniqueReferralCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("TUI-");
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 5; i++) {
            sb.append(chars.charAt(rnd.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private void createIfNotExists(String email, String name, Role role, String password, String referral) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .name(name).email(email).mobile("9876543210")
                    .password(passwordEncoder.encode(password))
                    .role(role).isActive(true).isApproved(true).referralCode(referral)
                    .build();
            userRepository.save(user);
            walletService.getOrCreateWallet(user.getId());
            log.info("👤 Created User: {}", email);
        }
    }

    private void seedSubjects() {
        List.of(
                Subject.builder().name("Mathematics").icon("🔢").build(),
                Subject.builder().name("Physics").icon("🧪").build(),
                Subject.builder().name("Chemistry").icon("⚗️").build(),
                Subject.builder().name("Biology").icon("🧬").build(),
                Subject.builder().name("Computer Science").icon("💻").build()).forEach(subjectRepository::save);
        log.info("📚 Subjects seeded.");
    }

    private void seedSessionsForUser(String studentEmail, String teacherEmail) {
        User student = userRepository.findByEmail(studentEmail).orElse(null);
        User teacher = userRepository.findByEmail(teacherEmail).orElse(null);

        if (student != null && teacher != null && sessionRepository.count() < 2) {
            // Paid Upcoming Session
            sessionRepository.save(Session.builder()
                    .student(student).teacher(teacher)
                    .startTime(LocalDateTime.now().plusHours(2))
                    .endTime(LocalDateTime.now().plusHours(3))
                    .amount(500.0).isPaid(true)
                    .status(Session.SessionStatus.CONFIRMED).build());

            // Completed Past Session
            sessionRepository.save(Session.builder()
                    .student(student).teacher(teacher)
                    .startTime(LocalDateTime.now().minusDays(1))
                    .endTime(LocalDateTime.now().minusDays(1).plusHours(1))
                    .amount(400.0).isPaid(true)
                    .status(Session.SessionStatus.COMPLETED).build());

            log.info("📅 Demo sessions seeded for {}", studentEmail);
        }
    }
}
