

package com.annam.service;

import com.annam.data.DataStore;
import com.annam.dto.AllocationSummary;
import com.annam.dto.DijkstraResult;
import com.annam.model.*;
import com.annam.policy.AllocationPolicy;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Orchestrator service coordinating multi-role operations: Donor, Recipient, and Admin.
 */
public class FoodDistributionService {
    private final DataStore dataStore;
    private final RoutingService routingService;
    private final AllocationService allocationService;

    public FoodDistributionService() {
        this.dataStore = new DataStore();
        this.routingService = new RoutingService(dataStore.getRoadNetwork());
        this.allocationService = new AllocationService(dataStore, routingService, new AllocationPolicy());
    }

    public DataStore getDataStore() {
        return dataStore;
    }

    public RoutingService getRoutingService() {
        return routingService;
    }

    public AllocationService getAllocationService() {
        return allocationService;
    }

    public LocalDateTime getCurrentSimulatedTime() {
        return dataStore.getCurrentSimulatedTime();
    }

    public void setSimulatedTime(LocalDateTime time) {
        dataStore.setCurrentSimulatedTime(time);
        checkAndExpireBatches();
    }

    public Collection<Donor> getDonors() {
        return dataStore.getAllDonors();
    }

    public Collection<Recipient> getRecipients() {
        return dataStore.getAllRecipients();
    }

    public Collection<FoodBatch> getFoodBatches() {
        return dataStore.getAllFoodBatches();
    }

    public Collection<DeliveryVehicle> getVehicles() {
        return dataStore.getAllVehicles();
    }

    public Collection<BookingRequest> getBookingRequests() {
        return dataStore.getAllBookingRequests();
    }

    public Collection<FoodAllocation> getAllocations() {
        return dataStore.getAllAllocations();
    }

    /**
     * [DONOR] Upload surplus food batch.
     */
    public FoodBatch uploadSurplusDonation(String donorId, String foodName, String category,
                                          int portionsTotal, String qualityCondition,
                                          int useByHoursAhead, String dietary,
                                          String storageReq, String notes) {
        Donor donor = dataStore.getDonor(donorId);
        if (donor == null) {
            throw new IllegalArgumentException("Donor not found with ID: " + donorId);
        }

        LocalDateTime now = dataStore.getCurrentSimulatedTime();
        LocalDateTime useBy = now.plusHours(useByHoursAhead);
        String batchId = dataStore.generateNextBatchId();

        FoodBatch batch = new FoodBatch(
                batchId,
                donor.getId(),
                donor.getName(),
                foodName,
                category,
                portionsTotal,
                portionsTotal,
                qualityCondition,
                now,
                useBy,
                donor.getLocationId(),
                FoodBatchStatus.PENDING_REVIEW,
                dietary,
                storageReq,
                notes
        );

        dataStore.addFoodBatch(batch);
        return batch;
    }

    /**
     * [ADMIN] Review pending food donation batch.
     */
    public boolean reviewFoodDonation(String batchId, boolean approve) {
        FoodBatch batch = dataStore.getFoodBatch(batchId);
        if (batch == null) {
            return false;
        }

        if (approve) {
            batch.setStatus(FoodBatchStatus.APPROVED);
        } else {
            batch.setStatus(FoodBatchStatus.REJECTED);
        }
        return true;
    }

    /**
     * [RECIPIENT] Submit a food booking request.
     */
    public BookingRequest submitBookingRequest(String recipientId, String foodBatchId, int portionsRequested) {
        Recipient recipient = dataStore.getRecipient(recipientId);
        if (recipient == null) {
            throw new IllegalArgumentException("Recipient not found: " + recipientId);
        }

        FoodBatch batch = dataStore.getFoodBatch(foodBatchId);
        if (batch == null) {
            throw new IllegalArgumentException("Food batch not found: " + foodBatchId);
        }

        if (portionsRequested <= 0) {
            throw new IllegalArgumentException("Requested portions must be greater than 0.");
        }

        String bookingId = dataStore.generateNextBookingId();
        BookingRequest request = new BookingRequest(
                bookingId,
                recipient.getId(),
                recipient.getName(),
                batch.getId(),
                batch.getFoodName(),
                portionsRequested,
                recipient.getLocationId(),
                dataStore.getCurrentSimulatedTime(),
                BookingStatus.PENDING_REVIEW
        );

        dataStore.addBookingRequest(request);
        return request;
    }

    /**
     * [ADMIN] Review pending booking request.
     */
    public boolean reviewBookingRequest(String bookingId, boolean approve, String rejectionReason) {
        BookingRequest request = dataStore.getBookingRequest(bookingId);
        if (request == null) {
            return false;
        }

        if (approve) {
            request.setStatus(BookingStatus.APPROVED);
            request.setRejectionReason("");
        } else {
            request.setStatus(BookingStatus.REJECTED);
            request.setRejectionReason(rejectionReason != null && !rejectionReason.isEmpty() ? rejectionReason : "Admin Rejected");
        }
        return true;
    }

    /**
     * Run smart allocation.
     */
    public AllocationSummary runSmartAllocation() {
        return allocationService.runSmartAllocation();
    }

    /**
     * [ADMIN] Confirm delivery of an allocation in transit.
     */
    public boolean confirmAllocationDelivery(String allocationId) {
        FoodAllocation allocation = dataStore.getAllocation(allocationId);
        if (allocation == null || allocation.getStatus() != AllocationStatus.IN_TRANSIT) {
            return false;
        }

        LocalDateTime now = dataStore.getCurrentSimulatedTime();
        allocation.setStatus(AllocationStatus.DELIVERED);
        allocation.setActualDeliveryTime(now);

        // Update booking request
        BookingRequest booking = dataStore.getBookingRequest(allocation.getBookingRequestId());
        if (booking != null) {
            booking.setStatus(BookingStatus.DELIVERED);
        }

        // Release vehicle and update its location to recipient destination
        DeliveryVehicle vehicle = dataStore.getVehicle(allocation.getVehicleId());
        if (vehicle != null) {
            vehicle.setStatus(DeliveryVehicle.VehicleStatus.AVAILABLE);
            vehicle.setCurrentLocationId(allocation.getDeliveryLocationId());
        }

        // Update recipient delivered portions
        Recipient recipient = dataStore.getRecipient(allocation.getRecipientId());
        if (recipient != null) {
            recipient.addReceivedPortions(allocation.getPortionsAllocated());
        }

        return true;
    }

    /**
     * Finds shortest route using Dijkstra algorithm.
     */
    public DijkstraResult findRoute(String sourceId, String destId, double speedMultiplier) {
        return routingService.findShortestRoute(sourceId, destId, speedMultiplier);
    }

    /**
     * Identifies and marks batches that have expired based on current simulated time.
     */
    public List<FoodBatch> checkAndExpireBatches() {
        LocalDateTime now = dataStore.getCurrentSimulatedTime();
        List<FoodBatch> expired = new ArrayList<>();

        for (FoodBatch batch : dataStore.getAllFoodBatches()) {
            if (batch.isExpired(now) && batch.getStatus() != FoodBatchStatus.FULLY_ALLOCATED
                    && batch.getStatus() != FoodBatchStatus.EXPIRED) {
                batch.setStatus(FoodBatchStatus.EXPIRED);
                expired.add(batch);
            }
        }
        return expired;
    }

    public List<FoodBatch> getExpiredBatches() {
        LocalDateTime now = dataStore.getCurrentSimulatedTime();
        return dataStore.getAllFoodBatches().stream()
                .filter(b -> b.isExpired(now) || b.getStatus() == FoodBatchStatus.EXPIRED)
                .collect(Collectors.toList());
    }
}
