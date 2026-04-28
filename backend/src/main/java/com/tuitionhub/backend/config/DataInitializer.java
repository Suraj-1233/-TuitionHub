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
        if (!userRepository.existsByEmail("admin@tuitionhub.com")) {
            User admin = User.builder()
                    .name("Super Admin")
                    .mobile("9999999999")
                    .email("admin@tuitionhub.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .isApproved(true)
                    .referralCode("TUI-ADMIN")
                    .build();
            userRepository.save(admin);
            walletService.getOrCreateWallet(admin.getId());
            log.info("✅ Admin created: email=admin@tuitionhub.com, password=admin123");
        }

        // 2. Main Super Admin
        if (!userRepository.existsByEmail("super@tuitionhub.com")) {
            User superAdmin = User.builder()
                    .name("Main Super Admin")
                    .mobile("1111111111")
                    .email("super@tuitionhub.com")
                    .password(passwordEncoder.encode("super123"))
                    .role(Role.SUPER_ADMIN)
                    .isActive(true)
                    .isApproved(true)
                    .referralCode("TUI-SUPER")
                    .build();
            userRepository.save(superAdmin);
            walletService.getOrCreateWallet(superAdmin.getId());
            log.info("✅ Main Super Admin created: email=super@tuitionhub.com, password=super123");
        }

        // 3. Demo Data for Showcasing Features
        User student = userRepository.findByEmail("student@tuitionhub.com").orElse(null);
        User teacher = userRepository.findByEmail("teacher@tuitionhub.com").orElse(null);
        if (student != null && teacher != null) {
            seedDemoSessions(student, teacher);
        }

        // 4. Assign referral codes to existing users
        userRepository.findAll().stream()
                .filter(u -> u.getReferralCode() == null || u.getReferralCode().isEmpty())
                .forEach(u -> {
                    String code = "TUI-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
                    u.setReferralCode(code);
                    userRepository.save(u);
                });

        // 5. Seed Default Subjects
        if (subjectRepository.count() == 0) {
            List.of(
                Subject.builder().name("Mathematics").icon("🔢").build(),
                Subject.builder().name("Physics").icon("🧪").build(),
                Subject.builder().name("Chemistry").icon("⚗️").build(),
                Subject.builder().name("Biology").icon("🧬").build(),
                Subject.builder().name("Computer Science").icon("💻").build(),
                Subject.builder().name("English").icon("📖").build(),
                Subject.builder().name("Social Studies").icon("🌍").build(),
                Subject.builder().name("Hindi").icon("🇮🇳").build()
            ).forEach(subjectRepository::save);
            log.info("📚 Default subjects seeded.");
        }
    }

    private void seedDemoSessions(User student, User teacher) {
        if (sessionRepository.count() < 2) {
            // 1. Paid Session (Shows Join Meet & Study Material)
            Session paidSession = Session.builder()
                    .student(student)
                    .teacher(teacher)
                    .startTime(LocalDateTime.now().plusHours(1))
                    .endTime(LocalDateTime.now().plusHours(2))
                    .amount(500.0)
                    .isPaid(true)
                    .status(Session.SessionStatus.CONFIRMED)
                    .build();
            sessionRepository.save(paidSession);

            // 2. Completed Session (Shows Feedback Button)
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
            
            log.info("✅ Demo sessions seeded for student@tuitionhub.com");
        }
    }
}
