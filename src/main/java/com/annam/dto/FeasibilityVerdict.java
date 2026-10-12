package com.annam.dto;

import java.time.LocalDateTime;

/**
 * Result of evaluating multi-constraint allocation feasibility.
 */
public class FeasibilityVerdict {
    private final boolean feasible;
    private final String message;
    private final long freshnessMarginMinutes;
    private final DijkstraResult route;
    private final LocalDateTime estimatedCompletionTime;

    private FeasibilityVerdict(boolean feasible, String message, long freshnessMarginMinutes,
                               DijkstraResult route, LocalDateTime estimatedCompletionTime) {
        this.feasible = feasible;
        this.message = message;
        this.freshnessMarginMinutes = freshnessMarginMinutes;
        this.route = route;
        this.estimatedCompletionTime = estimatedCompletionTime;
    }

    public static FeasibilityVerdict pass(String message, long freshnessMarginMinutes,
                                          DijkstraResult route, LocalDateTime estimatedCompletionTime) {
        return new FeasibilityVerdict(true, message, freshnessMarginMinutes, route, estimatedCompletionTime);
    }

    public static FeasibilityVerdict fail(String reason) {
        return new FeasibilityVerdict(false, reason, 0, null, null);
    }

    public boolean isFeasible() {
        return feasible;
    }

    public String getMessage() {
        return message;
    }

    public long getFreshnessMarginMinutes() {
        return freshnessMarginMinutes;
    }

    public DijkstraResult getRoute() {
        return route;
    }

    public LocalDateTime getEstimatedCompletionTime() {
        return estimatedCompletionTime;
    }

    @Override
    public String toString() {
        return (feasible ? "[PASS] " : "[FAIL] ") + message;
    }
}
