package com.annam.model;

/**
 * Community Centre recipient entity (Community kitchens, food pantries, relief foundations).
 */
public class CommunityCentre extends Recipient {
    private String communityDistrict;
    private String distributionHours;

    public CommunityCentre(String id, String name, String category, String email, String phone,
                           String locationId, String address, int dailyPortionCapacity,
                           String coordinator, boolean verified, String communityDistrict, String distributionHours) {
        super(id, name, category, email, phone, locationId, address, dailyPortionCapacity, coordinator, verified);
        this.communityDistrict = communityDistrict;
        this.distributionHours = distributionHours;
    }

    public String getCommunityDistrict() {
        return communityDistrict;
    }

    public String getDistributionHours() {
        return distributionHours;
    }
}
