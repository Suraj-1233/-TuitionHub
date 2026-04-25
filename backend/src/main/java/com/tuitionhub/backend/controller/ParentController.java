package com.tuitionhub.backend.controller;

import com.tuitionhub.backend.model.User;
import com.tuitionhub.backend.service.ParentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ParentController {
    private final ParentService parentService;

    @PostMapping("/link-child")
    public ResponseEntity<?> linkChild(@RequestBody Map<String, Object> request) {
        Long parentId = Long.valueOf(request.get("parentId").toString());
        String studentEmail = request.get("studentEmail").toString();
        parentService.linkChild(parentId, studentEmail);
        return ResponseEntity.ok(Map.of("message", "Child linked successfully"));
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<User>> getChildren(@PathVariable Long parentId) {
        return ResponseEntity.ok(parentService.getLinkedChildren(parentId));
    }
}
