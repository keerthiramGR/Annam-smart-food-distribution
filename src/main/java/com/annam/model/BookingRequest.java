package com.annam.model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Request submitted by a verified recipient organization to book food portions from a batch.
 */
public class BookingRequest {
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private String id;
    private String recipientId;
    private String recipientName;
    private String foodBatchId;
    private String foodName;
    private int portionsRequested;
    private String deliveryLocationId;
    private LocalDateTime requestTime;
    private BookingStatus status;
    private String rejectionReason;
    private String assignedAllocationId;

    public BookingRequest(String id, String recipientId, String recipientName, String foodBatchId,
                          String foodName, int portionsRequested, String deliveryLocationId,
                          LocalDateTime requestTime, BookingStatus status) {
        this.id = id;
        this.recipientId = recipientId;
        this.recipientName = recipientName;
        this.foodBatchId = foodBatchId;
        this.foodName = foodName;
        this.portionsRequested = portionsRequested;
        this.deliveryLocationId = deliveryLocationId;
        this.requestTime = requestTime;
        this.status = status;
        this.rejectionReason = "";
        this.assignedAllocationId = null;
    }

    public String getId() {
        return id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public String getFoodBatchId() {
        return foodBatchId;
    }

    public String getFoodName() {
        return foodName;
    }

    public int getPortionsRequested() {
        return portionsRequested;
    }

    public String getDeliveryLocationId() {
        return deliveryLocationId;
    }

    public LocalDateTime getRequestTime() {
        return requestTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public String getAssignedAllocationId() {
        return assignedAllocationId;
    }

    public void setAssignedAllocationId(String assignedAllocationId) {
        this.assignedAllocationId = assignedAllocationId;
    }

    @Override
    public String toString() {
        String info = String.format("[%s] Recipient: %-26s | Batch: %-8s | Req: %3d portions | Dest: %-7s | Time: %s | Status: %s",
                id, recipientName, foodBatchId, portionsRequested, deliveryLocationId,
                requestTime.format(FORMATTER), status);
        if (rejectionReason != null && !rejectionReason.isEmpty()) {
            info += " (Reason: " + rejectionReason + ")";
        }
        return info;
    }
}
