package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByMobile(String mobile);
    Optional<User> findByEmail(String email);
    boolean existsByMobile(String mobile);
    boolean existsByEmail(String email);
    List<User> findByRoleAndIsApproved(Role role, Boolean isApproved);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByRoleAndIsApproved(Role role, Boolean isApproved);
    Optional<User> findByReferralCode(String referralCode);
    boolean existsByReferralCode(String referralCode);
    List<User> findByReferredBy(User referrer);
    List<User> findByParent(User parent);
    List<User> findByTempParentEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.teacherProfile WHERE u.role = :role")
    List<User> findByRoleWithProfile(@org.springframework.data.repository.query.Param("role") Role role);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.teacherProfile WHERE u.role = :role AND u.isApproved = :isApproved")
    List<User> findByRoleAndIsApprovedWithProfile(@org.springframework.data.repository.query.Param("role") Role role, @org.springframework.data.repository.query.Param("isApproved") Boolean isApproved);
}
