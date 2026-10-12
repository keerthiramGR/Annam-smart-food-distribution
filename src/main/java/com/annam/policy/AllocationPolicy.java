package com.annam.policy;

import com.annam.dto.DijkstraResult;
import com.annam.dto.FeasibilityVerdict;
import com.annam.model.*;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Strict Multi-Constraint Feasibility Policy for Annam Food Allocations:
 * 1. Batch Approved & Active Status Check
 * 2. Available Stock Quantity Check
 * 3. Vehicle Capacity Check
 * 4. Dijkstra Network Route Existence Check
 * 5. Strict Freshness / Perishability Timing Check
 */
public class AllocationPolicy {

    public static final long PICKUP_LOADING_BUFFER_MINUTES = 15;   // 15 mins
    public static final long HANDOVER_UNLOADING_BUFFER_MINUTES = 10; // 10 mins
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /**
     * Evaluates whether an allocation can be safely and legally approved.
     */
    public FeasibilityVerdict evaluateFeasibility(BookingRequest booking,
                                                 FoodBatch batch,
                                                 DeliveryVehicle vehicle,
                                                 DijkstraResult route,
                                                 LocalDateTime currentSimulatedTime) {
        // Constraint 1: Batch Status
        if (batch.getStatus() != FoodBatchStatus.APPROVED && batch.getStatus() != FoodBatchStatus.PARTIALLY_ALLOCATED) {
            return FeasibilityVerdict.fail("Donation batch is not approved or not active for allocation (Current status: "
                    + batch.getStatus() + ").");
        }

        // Constraint 2: Stock Check
        if (booking.getPortionsRequested() > batch.getPortionsRemaining()) {
            return FeasibilityVerdict.fail(String.format(
                    "Demanded portions (%d) exceed available remaining stock (%d portions).",
                    booking.getPortionsRequested(), batch.getPortionsRemaining()));
        }

        // Constraint 3: Vehicle Capacity Check
        if (vehicle.getCapacityPortions() < booking.getPortionsRequested()) {
            return FeasibilityVerdict.fail(String.format(
                    "Vehicle '%s' capacity (%d) is lower than requested portions (%d).",
                    vehicle.getName(), vehicle.getCapacityPortions(), booking.getPortionsRequested()));
        }

        // Constraint 4: Dijkstra Route Check
        if (route == null || !route.isFound() || route.getPath().isEmpty()) {
            return FeasibilityVerdict.fail(String.format(
                    "No connected road segment found between pickup '%s' and delivery '%s'.",
                    batch.getPickupLocationId(), booking.getDeliveryLocationId()));
        }

        // Constraint 5: Strict Perishability Timing
        // Earliest Pickup Start = max(Now, PrepTime)
        LocalDateTime earliestPickupStart = currentSimulatedTime.isAfter(batch.getPreparationTime())
                ? currentSimulatedTime
                : batch.getPreparationTime();

        long travelMinutes = (long) Math.ceil(route.getTotalTimeMinutes());
        long totalMissionMinutes = PICKUP_LOADING_BUFFER_MINUTES + travelMinutes + HANDOVER_UNLOADING_BUFFER_MINUTES;
        LocalDateTime estimatedCompletion = earliestPickupStart.plusMinutes(totalMissionMinutes);

        if (estimatedCompletion.isAfter(batch.getUseByDeadline())) {
            long overdueMinutes = Duration.between(batch.getUseByDeadline(), estimatedCompletion).toMinutes();
            return FeasibilityVerdict.fail(String.format(
                    "Perishability deadline violated: Delivery completes at %s which exceeds use-by time of %s by %d minutes.",
                    estimatedCompletion.format(FORMATTER), batch.getUseByDeadline().format(FORMATTER), overdueMinutes));
        }

        long safetyMarginMinutes = Duration.between(estimatedCompletion, batch.getUseByDeadline()).toMinutes();
        String passMessage = String.format(
                "All constraints satisfied. Freshness safety margin: %d mins. ETA: %s (Total mission: %d mins).",
                safetyMarginMinutes, estimatedCompletion.format(FORMATTER), totalMissionMinutes);

        return FeasibilityVerdict.pass(passMessage, safetyMarginMinutes, route, estimatedCompletion);
    }
}
