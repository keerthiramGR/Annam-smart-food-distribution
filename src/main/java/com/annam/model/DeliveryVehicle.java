package com.annam.model;

/**
 * Transport vehicle in the distribution fleet.
 */
public class DeliveryVehicle {
    public enum VehicleStatus {
        AVAILABLE,
        IN_TRANSIT,
        MAINTENANCE
    }

    private String id;
    private String name;
    private String plateNumber;
    private String type;
    private int capacityPortions;
    private VehicleStatus status;
    private String currentLocationId;
    private double speedMultiplier;
    private String driverName;
    private String driverPhone;
    private boolean temperatureControlled;

    public DeliveryVehicle(String id, String name, String plateNumber, String type,
                           int capacityPortions, VehicleStatus status, String currentLocationId,
                           double speedMultiplier, String driverName, String driverPhone,
                           boolean temperatureControlled) {
        this.id = id;
        this.name = name;
        this.plateNumber = plateNumber;
        this.type = type;
        this.capacityPortions = capacityPortions;
        this.status = status;
        this.currentLocationId = currentLocationId;
        this.speedMultiplier = speedMultiplier;
        this.driverName = driverName;
        this.driverPhone = driverPhone;
        this.temperatureControlled = temperatureControlled;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getPlateNumber() {
        return plateNumber;
    }

    public String getType() {
        return type;
    }

    public int getCapacityPortions() {
        return capacityPortions;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }

    public String getCurrentLocationId() {
        return currentLocationId;
    }

    public void setCurrentLocationId(String currentLocationId) {
        this.currentLocationId = currentLocationId;
    }

    public double getSpeedMultiplier() {
        return speedMultiplier;
    }

    public String getDriverName() {
        return driverName;
    }

    public String getDriverPhone() {
        return driverPhone;
    }

    public boolean isTemperatureControlled() {
        return temperatureControlled;
    }

    @Override
    public String toString() {
        return String.format("[%s] %-28s | Plate: %-14s | Cap: %3d | Loc: %-7s | Spd: %.2fx | Status: %-10s | Driver: %s (%s)",
                id, name, plateNumber, capacityPortions, currentLocationId, speedMultiplier,
                status, driverName, driverPhone);
    }
}
