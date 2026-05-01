package com.tuitionhub.backend.config;

import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.Subject;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Session;
import com.tuitionhub.backend.model.Payment;
import com.tuitionhub.backend.repository.SubjectRepository;
import com.tuitionhub.backend.repository.UserRepository;
import com.tuitionhub.backend.repository.SessionRepository;
import com.tuitionhub.backend.repository.PaymentRepository;

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
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        log.info("🚀 Initializing System Data...");

        // 0. Database Schema Fixes
        try {
            log.info("🛠️ Applying database schema fixes...");
            jdbcTemplate.execute("ALTER TABLE payments MODIFY batch_id BIGINT NULL");
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50)");
            log.info("✅ Database schema fix applied.");
        } catch (Exception e) {
            log.warn("⚠️ Schema fix warning: {}", e.getMessage());
        }

        // 1. Core Admin Account Only
        createIfNotExists("admin@tuitionhub.com", "System Admin", Role.ADMIN, "admin123", "TUI-ADMIN", "INR", "9000000001");
        
        // 2. Default Subjects
        if (subjectRepository.count() == 0) {
            seedSubjects();
        }

        log.info("✅ Data Initialization Complete. Database cleaned to 1 Admin.");
    }

    private void createIfNotExists(String email, String name, Role role, String password, String referral, String currency, String mobile) {
        userRepository.findByEmail(email).ifPresentOrElse(
            user -> {
                if (user.getRole() != role) {
                    user.setRole(role);
                    userRepository.save(user);
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

                log.info("👤 Created Admin User: {}", email);
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
}
