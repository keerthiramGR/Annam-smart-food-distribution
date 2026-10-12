package com.annam.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Represents a batch of surplus food uploaded by a donor.
 */
public class FoodBatch {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private String id;
    private String donorId;
    private String donorName;
    private String foodName;
    private String category; // Cooked Meals, Bakery & Breads, Fresh Produce, Dairy, etc.
    private int portionsTotal;
    private int portionsRemaining;
    private String qualityCondition; // e.g., "Freshly Prepared Hot Food", "Oven-Fresh Today"
    private LocalDateTime preparationTime;
    private LocalDateTime useByDeadline;
    private String pickupLocationId;
    private FoodBatchStatus status;
    private String dietary;
    private String storageRequirements;
    private String notes;

    public FoodBatch(String id, String donorId, String donorName, String foodName, String category,
                     int portionsTotal, int portionsRemaining, String qualityCondition,
                     LocalDateTime preparationTime, LocalDateTime useByDeadline,
                     String pickupLocationId, FoodBatchStatus status,
                     String dietary, String storageRequirements, String notes) {
        this.id = id;
        this.donorId = donorId;
        this.donorName = donorName;
        this.foodName = foodName;
        this.category = category;
        this.portionsTotal = portionsTotal;
        this.portionsRemaining = portionsRemaining;
        this.qualityCondition = qualityCondition;
        this.preparationTime = preparationTime;
        this.useByDeadline = useByDeadline;
        this.pickupLocationId = pickupLocationId;
        this.status = status;
        this.dietary = dietary;
        this.storageRequirements = storageRequirements;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public String getDonorId() {
        return donorId;
    }

    public String getDonorName() {
        return donorName;
    }

    public String getFoodName() {
        return foodName;
    }

    public String getCategory() {
        return category;
    }

    public int getPortionsTotal() {
        return portionsTotal;
    }

    public int getPortionsRemaining() {
        return portionsRemaining;
    }

    public String getQualityCondition() {
        return qualityCondition;
    }

    public LocalDateTime getPreparationTime() {
        return preparationTime;
    }

    public LocalDateTime getUseByDeadline() {
        return useByDeadline;
    }

    public String getPickupLocationId() {
        return pickupLocationId;
    }

    public FoodBatchStatus getStatus() {
        return status;
    }

    public void setStatus(FoodBatchStatus status) {
        this.status = status;
    }

    public String getDietary() {
        return dietary;
    }

    public String getStorageRequirements() {
        return storageRequirements;
    }

    public String getNotes() {
        return notes;
    }

    public boolean isExpired(LocalDateTime currentTime) {
        return currentTime.isAfter(useByDeadline);
    }

    public synchronized boolean deductPortions(int portions) {
        if (portions <= 0 || portions > portionsRemaining) {
            return false;
        }
        this.portionsRemaining -= portions;
        if (this.portionsRemaining == 0) {
            this.status = FoodBatchStatus.FULLY_ALLOCATED;
        } else {
            this.status = FoodBatchStatus.PARTIALLY_ALLOCATED;
        }
        return true;
    }

    @Override
    public String toString() {
        return String.format("[%s] %-38s | %-16s | Rem/Tot: %3d/%3d | Use-By: %s | Loc: %-7s | Status: %-19s",
                id, foodName, category, portionsRemaining, portionsTotal,
                useByDeadline.format(FORMATTER), pickupLocationId, status);
    }
}
