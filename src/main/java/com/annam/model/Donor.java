package com.annam.model;

/**
 * Donor organization providing surplus food.
 */
public class Donor {
    private String id;
    private String name;
    private String type; // Restaurant, Luxury Hotel, Educational Institution, etc.
    private String email;
    private String phone;
    private String locationId;
    private String address;
    private String contactPerson;
    private String fssaiLicense;
    private String description;

    public Donor(String id, String name, String type, String email, String phone,
                 String locationId, String address, String contactPerson,
                 String fssaiLicense, String description) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.email = email;
        this.phone = phone;
        this.locationId = locationId;
        this.address = address;
        this.contactPerson = contactPerson;
        this.fssaiLicense = fssaiLicense;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
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

    public String getContactPerson() {
        return contactPerson;
    }

    public String getFssaiLicense() {
        return fssaiLicense;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return String.format("[%s] %-32s | %-22s | Loc: %-7s | Contact: %s (%s)",
                id, name, type, locationId, contactPerson, phone);
    }
}
