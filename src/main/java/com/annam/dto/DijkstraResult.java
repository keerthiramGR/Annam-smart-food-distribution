package com.annam.dto;

import java.util.Collections;
import java.util.List;

/**
 * Result data transfer object from Dijkstra shortest path search.
 */
public class DijkstraResult {
    private List<String> path;
    private double totalDistanceKm;
    private double totalTimeMinutes;
    private boolean found;

    public DijkstraResult(List<String> path, double totalDistanceKm, double totalTimeMinutes, boolean found) {
        this.path = path;
        this.totalDistanceKm = totalDistanceKm;
        this.totalTimeMinutes = totalTimeMinutes;
        this.found = found;
    }

    public static DijkstraResult notFound() {
        return new DijkstraResult(Collections.emptyList(), 0.0, 0.0, false);
    }

    public List<String> getPath() {
        return path;
    }

    public double getTotalDistanceKm() {
        return totalDistanceKm;
    }

    public double getTotalTimeMinutes() {
        return totalTimeMinutes;
    }

    public boolean isFound() {
        return found;
    }

    @Override
    public String toString() {
        if (!found) {
            return "No connected road route found";
        }
        return String.format("Route: %s | Distance: %.1f km | Time: %.1f mins",
                String.join(" -> ", path), totalDistanceKm, totalTimeMinutes);
    }
}
