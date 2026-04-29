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
import org.springframework.jdbc.core.JdbcTemplate;
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
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("🚀 Initializing Demo Data...");

        // 0. Database Schema Fixes (Must run before inserts)
        try {
            log.info("🛠️ Applying database schema fix for payments and users table...");
            jdbcTemplate.execute("ALTER TABLE payments MODIFY batch_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
            log.info("✅ Database schema fix applied.");
        } catch (Exception e) {
            log.warn("⚠️ Could not apply database fix: {}", e.getMessage());
        }

        // 1. Core Accounts
        createIfNotExists("admin@tuitionhub.com", "Super Admin", Role.ADMIN, "admin123", "TUI-ADMIN", "INR", "9000000001");
        createIfNotExists("super@tuitionhub.com", "Main Super Admin", Role.SUPER_ADMIN, "super123", "TUI-SUPER", "USD", "9000000002");
        createIfNotExists("teacher@tuitionhub.com", "Dr. Amit Sharma", Role.TEACHER, "teacher123", "TUI-TEACH", "INR", "9000000003");
        createIfNotExists("surajkannujiya517@gmail.com", "Suraj Kannujiya", Role.STUDENT, "suraj123", "TUI-SURAJ", "USD", "9000000004");
        
        // Force refresh parent
        userRepository.findByEmail("parent@tuitionhub.com").ifPresent(u -> userRepository.delete(u));
        createIfNotExists("parent@tuitionhub.com", "Rajesh Kannujiya", Role.PARENT, "parent123", "TUI-PARENT", "INR", "9000000005");

        // Link Parent to Student
        User parent = userRepository.findByEmail("parent@tuitionhub.com").orElse(null);
        User student = userRepository.findByEmail("surajkannujiya517@gmail.com").orElse(null);
        if (parent != null && student != null) {
            student.setParent(parent);
            userRepository.save(student);
            log.info("👨‍👩‍👧‍👦 Linked Parent ({}) to Student ({})", parent.getEmail(), student.getEmail());
        }

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

    private void createIfNotExists(String email, String name, Role role, String password, String referral, String currency, String mobile) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                if (user.getRole() != role) {
                    user.setRole(role);
                    userRepository.save(user);
                    log.info("🔄 Updated role for {} to {}", email, role);
                }
            },
            () -> {
                User user = User.builder()
                        .name(name).email(email).mobile(mobile)
                        .password(passwordEncoder.encode(password))
                        .role(role).isActive(true).isApproved(true).referralCode(referral)
                        .currency(currency)
                        .build();
                userRepository.save(user);
                walletService.getOrCreateWallet(user.getId());
                log.info("👤 Created User: {} with currency: {}", email, currency);
            }
        );
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
