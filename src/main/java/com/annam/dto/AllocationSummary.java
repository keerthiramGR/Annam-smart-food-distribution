package com.annam.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * Summary metrics of a smart food allocation run.
 */
public class AllocationSummary {
    private int evaluatedRequestsCount;
    private int successfulAllocationsCount;
    private int rejectedRequestsCount;
    private int totalPortionsAllocated;
    private final List<String> auditLogs = new ArrayList<>();

    public void addEvaluation() {
        this.evaluatedRequestsCount++;
    }

    public void addSuccess(int portions, String log) {
        this.successfulAllocationsCount++;
        this.totalPortionsAllocated += portions;
        this.auditLogs.add(log);
    }

    public void addRejection(String log) {
        this.rejectedRequestsCount++;
        this.auditLogs.add(log);
    }

    public int getEvaluatedRequestsCount() {
        return evaluatedRequestsCount;
    }

    public int getSuccessfulAllocationsCount() {
        return successfulAllocationsCount;
    }

    public int getRejectedRequestsCount() {
        return rejectedRequestsCount;
    }

    public int getTotalPortionsAllocated() {
        return totalPortionsAllocated;
    }

    public List<String> getAuditLogs() {
        return auditLogs;
    }
}
