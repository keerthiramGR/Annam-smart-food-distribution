package com.annam.policy;

import com.annam.model.FoodBatch;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implements Earliest Use-By First (FEFO: First Expired, First Out) prioritization
 * and perishability boundary checks.
 */
public class PerishabilityRule {

    /**
     * Sorts batches by use-by deadline ascending to prioritize items closest to expiry.
     */
    public static List<FoodBatch> sortByEarliestUseByFirst(List<FoodBatch> batches) {
        return batches.stream()
                .sorted(Comparator.comparing(FoodBatch::getUseByDeadline))
                .collect(Collectors.toList());
    }

    /**
     * Checks if a food batch has expired relative to current simulated time.
     */
    public static boolean isExpired(FoodBatch batch, LocalDateTime currentTime) {
        return currentTime.isAfter(batch.getUseByDeadline());
    }
}
