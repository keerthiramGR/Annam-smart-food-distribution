package com.annam.model;

/**
 * Status lifecycle of a Recipient's Booking Request.
 */
public enum BookingStatus {
    PENDING_REVIEW,
    APPROVED,
    ALLOCATED,
    IN_TRANSIT,
    DELIVERED,
    REJECTED,
    CANCELLED
}
