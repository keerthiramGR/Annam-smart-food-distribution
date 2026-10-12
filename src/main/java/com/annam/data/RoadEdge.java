package com.annam.data;

/**
 * Weighted road edge between two nodes in the urban road graph.
 */
public class RoadEdge {
    private String fromId;
    private String toId;
    private double distanceKm;
    private double timeMinutes;

    public RoadEdge(String fromId, String toId, double distanceKm, double timeMinutes) {
        this.fromId = fromId;
        this.toId = toId;
        this.distanceKm = distanceKm;
        this.timeMinutes = timeMinutes;
    }

    public String getFromId() {
        return fromId;
    }

    public String getToId() {
        return toId;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public double getTimeMinutes() {
        return timeMinutes;
    }

    @Override
    public String toString() {
        return String.format("%s -> %s (%.1f km, %.1f min)", fromId, toId, distanceKm, timeMinutes);
    }
}
