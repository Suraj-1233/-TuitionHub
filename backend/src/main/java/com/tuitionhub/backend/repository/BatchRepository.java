package com.tuitionhub.backend.repository;

import com.tuitionhub.backend.model.Batch;
import com.tuitionhub.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTeacher(User teacher);
    List<Batch> findByTeacherAndIsActive(User teacher, Boolean isActive);
    List<Batch> findByIsActive(Boolean isActive);

    @Query("SELECT b FROM Batch b JOIN b.students s WHERE s = :student")
    List<Batch> findByStudent(User student);

    @Query("SELECT b FROM Batch b WHERE b.teacher.id = :teacherId")
    List<Batch> findByTeacherId(Long teacherId);
}
