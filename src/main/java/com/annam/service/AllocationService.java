package com.annam.service;

import com.annam.data.DataStore;
import com.annam.dto.AllocationSummary;
import com.annam.dto.DijkstraResult;
import com.annam.dto.FeasibilityVerdict;
import com.annam.model.*;
import com.annam.policy.AllocationPolicy;
import com.annam.policy.PerishabilityRule;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service that executes smart food allocations applying Earliest Use-By First (FEFO)
 * and multi-constraint feasibility validation.
 */
public class AllocationService {
    private final DataStore dataStore;
    private final RoutingService routingService;
    private final AllocationPolicy allocationPolicy;

    public AllocationService(DataStore dataStore, RoutingService routingService, AllocationPolicy allocationPolicy) {
        this.dataStore = dataStore;
        this.routingService = routingService;
        this.allocationPolicy = allocationPolicy;
    }

    /**
     * Runs smart allocation across all pending/approved booking requests.
     */
    public AllocationSummary runSmartAllocation() {
        AllocationSummary summary = new AllocationSummary();
        LocalDateTime now = dataStore.getCurrentSimulatedTime();

        // 1. Gather all approved booking requests awaiting allocation
        List<BookingRequest> pendingBookings = dataStore.getAllBookingRequests().stream()
                .filter(b -> b.getStatus() == BookingStatus.APPROVED)
                .sorted(Comparator.comparing(BookingRequest::getRequestTime))
                .collect(Collectors.toList());

        if (pendingBookings.isEmpty()) {
            summary.addRejection("No approved booking requests waiting for allocation.");
            return summary;
        }

        // 2. Fetch and sort batches by Earliest Use-By First (FEFO)
        List<FoodBatch> activeBatches = dataStore.getAllFoodBatches().stream()
                .filter(b -> (b.getStatus() == FoodBatchStatus.APPROVED || b.getStatus() == FoodBatchStatus.PARTIALLY_ALLOCATED))
                .filter(b -> !b.isExpired(now))
                .filter(b -> b.getPortionsRemaining() > 0)
                .collect(Collectors.toList());

        List<FoodBatch> prioritizedBatches = PerishabilityRule.sortByEarliestUseByFirst(activeBatches);

        for (BookingRequest booking : pendingBookings) {
            summary.addEvaluation();

            // Find requested batch or best matching batch
            FoodBatch candidateBatch = null;
            if (booking.getFoodBatchId() != null) {
                candidateBatch = dataStore.getFoodBatch(booking.getFoodBatchId());
            }

            if (candidateBatch == null || candidateBatch.getPortionsRemaining() < booking.getPortionsRequested()) {
                // Look for alternative earliest use-by batch
                Optional<FoodBatch> alt = prioritizedBatches.stream()
                        .filter(b -> b.getPortionsRemaining() >= booking.getPortionsRequested())
                        .findFirst();
                if (alt.isPresent()) {
                    candidateBatch = alt.get();
                }
            }

            if (candidateBatch == null) {
                String reason = String.format("Request [%s] (%s): No food batch has sufficient stock for %d portions.",
                        booking.getId(), booking.getRecipientName(), booking.getPortionsRequested());
                booking.setRejectionReason(reason);
                summary.addRejection(reason);
                continue;
            }

            // Find available vehicle with sufficient capacity
            List<DeliveryVehicle> availableVehicles = dataStore.getAllVehicles().stream()
                    .filter(v -> v.getStatus() == DeliveryVehicle.VehicleStatus.AVAILABLE)
                    .filter(v -> v.getCapacityPortions() >= booking.getPortionsRequested())
                    .sorted(Comparator.comparingInt(DeliveryVehicle::getCapacityPortions)) // Best-fit capacity
                    .collect(Collectors.toList());

            if (availableVehicles.isEmpty()) {
                String reason = String.format("Request [%s] (%s): No available vehicle has capacity >= %d portions.",
                        booking.getId(), booking.getRecipientName(), booking.getPortionsRequested());
                booking.setRejectionReason(reason);
                summary.addRejection(reason);
                continue;
            }

            // Evaluate route and feasibility with best-fit vehicle
            DeliveryVehicle selectedVehicle = null;
            FeasibilityVerdict bestVerdict = null;
            DijkstraResult bestRoute = null;

            for (DeliveryVehicle vehicle : availableVehicles) {
                DijkstraResult route = routingService.findShortestRoute(
                        candidateBatch.getPickupLocationId(),
                        booking.getDeliveryLocationId(),
                        vehicle.getSpeedMultiplier()
                );

                FeasibilityVerdict verdict = allocationPolicy.evaluateFeasibility(
                        booking, candidateBatch, vehicle, route, now
                );

                if (verdict.isFeasible()) {
                    selectedVehicle = vehicle;
                    bestVerdict = verdict;
                    bestRoute = route;
                    break;
                } else {
                    bestVerdict = verdict; // Record failure reason
                }
            }

            if (selectedVehicle == null || bestVerdict == null || !bestVerdict.isFeasible()) {
                String reason = String.format("Request [%s] (%s): Feasibility check failed - %s",
                        booking.getId(), booking.getRecipientName(),
                        bestVerdict != null ? bestVerdict.getMessage() : "Unknown constraint failure");
                booking.setRejectionReason(reason);
                summary.addRejection(reason);
                continue;
            }

            // Success: execute atomic state changes
            int portionsToAllocate = booking.getPortionsRequested();
            candidateBatch.deductPortions(portionsToAllocate);
            selectedVehicle.setStatus(DeliveryVehicle.VehicleStatus.IN_TRANSIT);

            Donor donor = dataStore.getDonor(candidateBatch.getDonorId());
            String donorName = donor != null ? donor.getName() : candidateBatch.getDonorName();

            String allocId = dataStore.generateNextAllocationId();
            FoodAllocation allocation = new FoodAllocation(
                    allocId,
                    booking.getId(),
                    candidateBatch.getId(),
                    candidateBatch.getFoodName(),
                    candidateBatch.getDonorId(),
                    donorName,
                    booking.getRecipientId(),
                    booking.getRecipientName(),
                    selectedVehicle.getId(),
                    selectedVehicle.getName(),
                    portionsToAllocate,
                    candidateBatch.getPickupLocationId(),
                    booking.getDeliveryLocationId(),
                    bestRoute.getPath(),
                    bestRoute.getTotalDistanceKm(),
                    bestRoute.getTotalTimeMinutes(),
                    now,
                    bestVerdict.getEstimatedCompletionTime(),
                    AllocationStatus.IN_TRANSIT,
                    bestVerdict.getFreshnessMarginMinutes()
            );

            booking.setStatus(BookingStatus.ALLOCATED);
            booking.setAssignedAllocationId(allocId);
            booking.setRejectionReason("");
            dataStore.addAllocation(allocation);

            String logMsg = String.format("[SUCCESS] %s: Allocated %d portions of '%s' to %s via %s. Route: %s (ETA: %s, Margin: %d min)",
                    allocId, portionsToAllocate, candidateBatch.getFoodName(), booking.getRecipientName(),
                    selectedVehicle.getName(), String.join("->", bestRoute.getPath()),
                    bestVerdict.getEstimatedCompletionTime(), bestVerdict.getFreshnessMarginMinutes());

            summary.addSuccess(portionsToAllocate, logMsg);
        }

        return summary;
    }
}
