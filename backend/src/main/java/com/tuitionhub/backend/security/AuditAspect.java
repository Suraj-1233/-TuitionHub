package com.tuitionhub.backend.security;

import com.tuitionhub.backend.model.AuditLog;
import com.tuitionhub.backend.repository.AuditRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditAspect {

    private final AuditRepository auditRepository;

    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void logAudit(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            String username = "SYSTEM";
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                username = auth.getName();
            }

            String details = "Method: " + joinPoint.getSignature().getName();
            
            AuditLog auditLog = AuditLog.builder()
                    .action(auditable.action())
                    .performedBy(username)
                    .details(details)
                    .build();

            auditRepository.save(auditLog);
            log.info("📝 Audit Log saved: {} by {}", auditable.action(), username);
        } catch (Exception e) {
            log.error("❌ Failed to save audit log: {}", e.getMessage());
        }
    }
}
