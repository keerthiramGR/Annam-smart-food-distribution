package com.annam.model;

/**
 * Status lifecycle of a Food Donation Batch.
 */
public enum FoodBatchStatus {
    PENDING_REVIEW,
    APPROVED,
    PARTIALLY_ALLOCATED,
    FULLY_ALLOCATED,
    EXPIRED,
    REJECTED
}
