package com.annam.model;

/**
 * Shelter recipient entity (Homeless shelters, youth shelters, orphanages, women's refuges).
 */
public class Shelter extends Recipient {
    private int bedCapacity;
    private String residentDemographic; // e.g., "Homeless Adults", "Orphaned Children", "Crisis Families"

    public Shelter(String id, String name, String category, String email, String phone,
                   String locationId, String address, int dailyPortionCapacity,
                   String coordinator, boolean verified, int bedCapacity, String residentDemographic) {
        super(id, name, category, email, phone, locationId, address, dailyPortionCapacity, coordinator, verified);
        this.bedCapacity = bedCapacity;
        this.residentDemographic = residentDemographic;
    }

    public int getBedCapacity() {
        return bedCapacity;
    }

    public String getResidentDemographic() {
        return residentDemographic;
    }
}
