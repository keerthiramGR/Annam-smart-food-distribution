package com.annam.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Record of an approved and scheduled food allocation from a batch to a recipient.
 */
public class FoodAllocation {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private String id;
    private String bookingRequestId;
    private String foodBatchId;
    private String foodName;
    private String donorId;
    private String donorName;
    private String recipientId;
    private String recipientName;
    private String vehicleId;
    private String vehicleName;
    private int portionsAllocated;
    private String pickupLocationId;
    private String deliveryLocationId;
    private List<String> routePath;
    private double totalDistanceKm;
    private double estimatedTransitMinutes;
    private LocalDateTime allocationTime;
    private LocalDateTime estimatedDeliveryTime;
    private LocalDateTime actualDeliveryTime;
    private AllocationStatus status;
    private long freshnessMarginMinutes;

    public FoodAllocation(String id, String bookingRequestId, String foodBatchId, String foodName,
                          String donorId, String donorName, String recipientId, String recipientName,
                          String vehicleId, String vehicleName, int portionsAllocated,
                          String pickupLocationId, String deliveryLocationId,
                          List<String> routePath, double totalDistanceKm, double estimatedTransitMinutes,
                          LocalDateTime allocationTime, LocalDateTime estimatedDeliveryTime,
                          AllocationStatus status, long freshnessMarginMinutes) {
        this.id = id;
        this.bookingRequestId = bookingRequestId;
        this.foodBatchId = foodBatchId;
        this.foodName = foodName;
        this.donorId = donorId;
        this.donorName = donorName;
        this.recipientId = recipientId;
        this.recipientName = recipientName;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.portionsAllocated = portionsAllocated;
        this.pickupLocationId = pickupLocationId;
        this.deliveryLocationId = deliveryLocationId;
        this.routePath = routePath;
        this.totalDistanceKm = totalDistanceKm;
        this.estimatedTransitMinutes = estimatedTransitMinutes;
        this.allocationTime = allocationTime;
        this.estimatedDeliveryTime = estimatedDeliveryTime;
        this.actualDeliveryTime = null;
        this.status = status;
        this.freshnessMarginMinutes = freshnessMarginMinutes;
    }

    public String getId() {
        return id;
    }

    public String getBookingRequestId() {
        return bookingRequestId;
    }

    public String getFoodBatchId() {
        return foodBatchId;
    }

    public String getFoodName() {
        return foodName;
    }

    public String getDonorId() {
        return donorId;
    }

    public String getDonorName() {
        return donorName;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public int getPortionsAllocated() {
        return portionsAllocated;
    }

    public String getPickupLocationId() {
        return pickupLocationId;
    }

    public String getDeliveryLocationId() {
        return deliveryLocationId;
    }

    public List<String> getRoutePath() {
        return routePath;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public double getEstimatedTransitMinutes() {
        return estimatedTransitMinutes;
    }

    public LocalDateTime getAllocationTime() {
        return allocationTime;
    }

    public LocalDateTime getEstimatedDeliveryTime() {
        return estimatedDeliveryTime;
    }

    public LocalDateTime getActualDeliveryTime() {
        return actualDeliveryTime;
    }

    public void setActualDeliveryTime(LocalDateTime actualDeliveryTime) {
        this.actualDeliveryTime = actualDeliveryTime;
    }

    public AllocationStatus getStatus() {
        return status;
    }

    public void setStatus(AllocationStatus status) {
        this.status = status;
    }

    public long getFreshnessMarginMinutes() {
        return freshnessMarginMinutes;
    }

    @Override
    public String toString() {
        String pathStr = routePath != null ? String.join(" -> ", routePath) : "Direct";
        return String.format("[%s] Batch: %-7s | %-24s -> %-24s | Portions: %3d | Veh: %-16s | ETA: %s | Dist: %.1f km | Margin: %d min | Status: %s\n      Route: %s",
                id, foodBatchId, donorName, recipientName, portionsAllocated, vehicleName,
                estimatedDeliveryTime.format(FORMATTER), totalDistanceKm, freshnessMarginMinutes, status, pathStr);
    }
}
