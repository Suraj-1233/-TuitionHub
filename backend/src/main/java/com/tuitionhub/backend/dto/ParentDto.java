package com.tuitionhub.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class ParentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private int childrenCount;
        private int activeBatchesCount;
        private double totalPendingFees;
        private List<ChildSummary> children;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChildSummary {
        private Long id;
        private String name;
        private String studentClass;
        private String board;
        private List<BatchSummary> activeBatches;
        private double pendingFees;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchSummary {
        private Long id;
        private String name;
        private String subject;
        private double monthlyFees;
        private String nextPaymentDue;
        private boolean isPaid;
    }
}
