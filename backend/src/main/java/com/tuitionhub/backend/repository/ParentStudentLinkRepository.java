package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.ParentStudentLink;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ParentStudentLinkRepository extends JpaRepository<ParentStudentLink, Long> {
    List<ParentStudentLink> findByParent(User parent);
    List<ParentStudentLink> findByStudent(User student);
}
