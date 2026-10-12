package com.annam.data;

/**
 * Node representing an urban location/sector in the road network graph.
 */
public class RoadNode {
    private String id;
    private String name;
    private String sector;
    private double x;
    private double y;
    private String description;

    public RoadNode(String id, String name, String sector, double x, double y, String description) {
        this.id = id;
        this.name = name;
        this.sector = sector;
        this.x = x;
        this.y = y;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSector() {
        return sector;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public String toString() {
        return String.format("[%s] %s (%s)", id, name, sector);
    }
}
