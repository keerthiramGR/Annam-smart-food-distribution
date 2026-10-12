package com.annam.model;

/**
 * Base recipient entity representing food distribution destinations such as shelters,
 * community kitchens, orphanages, and relief organizations.
 */
public class Recipient {
    protected String id;
    protected String name;
    protected String category;
    protected String email;
    protected String phone;
    protected String locationId;
    protected String address;
    protected int dailyPortionCapacity; // Target daily demand
    protected int portionsReceivedToday;
    protected String coordinator;
    protected boolean verified;

    public Recipient(String id, String name, String category, String email, String phone,
                     String locationId, String address, int dailyPortionCapacity,
                     String coordinator, boolean verified) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.email = email;
        this.phone = phone;
        this.locationId = locationId;
        this.address = address;
        this.dailyPortionCapacity = dailyPortionCapacity;
        this.portionsReceivedToday = 0;
        this.coordinator = coordinator;
        this.verified = verified;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCategory() {
        return category;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getLocationId() {
        return locationId;
    }

    public String getAddress() {
        return address;
    }

    public int getDailyPortionCapacity() {
        return dailyPortionCapacity;
    }

    public int getPortionsReceivedToday() {
        return portionsReceivedToday;
    }

    public int getRemainingDemand() {
        return Math.max(0, dailyPortionCapacity - portionsReceivedToday);
    }

    public void addReceivedPortions(int portions) {
        this.portionsReceivedToday += portions;
    }

    public String getCoordinator() {
        return coordinator;
    }

    public boolean isVerified() {
        return verified;
    }

    @Override
    public String toString() {
        return String.format("[%s] %-34s | %-20s | Loc: %-7s | Cap: %3d | Recv: %3d | Rem Demand: %3d | %s",
                id, name, category, locationId, dailyPortionCapacity, portionsReceivedToday,
                getRemainingDemand(), verified ? "Verified" : "Unverified");
    }
}
