package com.tuitionhub.backend.config;

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
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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
                    .build();
            userRepository.save(admin);
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
                    .build();
            userRepository.save(superAdmin);
            log.info("✅ Super Admin created: super@tuitionhub.com (Password: super123)");
        }
    }
}
