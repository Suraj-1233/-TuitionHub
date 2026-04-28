package com.tuitionhub.backend.config;

import com.tuitionhub.backend.model.Role;
import com.tuitionhub.backend.model.Subject;
import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.repository.SubjectRepository;
import com.tuitionhub.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.tuitionhub.backend.service.WalletService walletService;


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
            log.info("✅ Super Admin created: super@tuitionhub.com (Password: super123)");
        }

        // 3. Assign referral codes to existing users who don't have one
        userRepository.findAll().stream()
                .filter(u -> u.getReferralCode() == null || u.getReferralCode().isEmpty())
                .forEach(u -> {
                    String code = "TUI-" + java.util.UUID.randomUUID().toString().substring(0, 5).toUpperCase();
                    u.setReferralCode(code);
                    userRepository.save(u);
                    log.info("🎁 Assigned referral code {} to user {}", code, u.getEmail());
                });

        // 4. Seed Default Subjects
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
}
