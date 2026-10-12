package com.annam.service;

import com.annam.data.RoadEdge;
import com.annam.data.RoadNetworkGraph;
import com.annam.dto.DijkstraResult;

import java.util.*;

/**
 * Routing service providing Dijkstra Shortest Path algorithm on the urban road network.
 */
public class RoutingService {
    private final RoadNetworkGraph roadNetwork;

    public RoutingService(RoadNetworkGraph roadNetwork) {
        this.roadNetwork = roadNetwork;
    }

    private static class NodeTime {
        String nodeId;
        double time;

        NodeTime(String nodeId, double time) {
            this.nodeId = nodeId;
            this.time = time;
        }
    }

    /**
     * Computes the shortest travel path between sourceId and targetId using Dijkstra's algorithm.
     * Transit time is adjusted by the vehicle's speed multiplier factor.
     */
    public DijkstraResult findShortestRoute(String sourceId, String targetId, double vehicleSpeedFactor) {
        if (sourceId == null || targetId == null) {
            return DijkstraResult.notFound();
        }

        if (sourceId.equals(targetId)) {
            return new DijkstraResult(Collections.singletonList(sourceId), 0.0, 0.0, true);
        }

        double speedFactor = vehicleSpeedFactor > 0 ? vehicleSpeedFactor : 1.0;

        Map<String, Double> minTimes = new HashMap<>();
        Map<String, Double> minDists = new HashMap<>();
        Map<String, String> previousNode = new HashMap<>();

        PriorityQueue<NodeTime> pq = new PriorityQueue<>(Comparator.comparingDouble(nt -> nt.time));

        for (String nodeId : roadNetwork.getAllNodeIds()) {
            minTimes.put(nodeId, Double.POSITIVE_INFINITY);
            minDists.put(nodeId, Double.POSITIVE_INFINITY);
        }

        minTimes.put(sourceId, 0.0);
        minDists.put(sourceId, 0.0);
        pq.add(new NodeTime(sourceId, 0.0));

        Set<String> visited = new HashSet<>();

        while (!pq.isEmpty()) {
            NodeTime current = pq.poll();
            String u = current.nodeId;

            if (visited.contains(u)) {
                continue;
            }
            visited.add(u);

            if (u.equals(targetId)) {
                break;
            }

            for (RoadEdge edge : roadNetwork.getEdgesFrom(u)) {
                String v = edge.getToId();
                if (visited.contains(v)) {
                    continue;
                }

                double edgeTime = edge.getTimeMinutes();
                double edgeDist = edge.getDistanceKm();

                double newTime = minTimes.get(u) + edgeTime;
                double newDist = minDists.get(u) + edgeDist;

                if (newTime < minTimes.get(v)) {
                    minTimes.put(v, newTime);
                    minDists.put(v, newDist);
                    previousNode.put(v, u);
                    pq.add(new NodeTime(v, newTime));
                }
            }
        }

        if (!minTimes.containsKey(targetId) || minTimes.get(targetId) == Double.POSITIVE_INFINITY) {
            return DijkstraResult.notFound();
        }

        // Reconstruct path
        LinkedList<String> path = new LinkedList<>();
        String curr = targetId;
        while (curr != null) {
            path.addFirst(curr);
            curr = previousNode.get(curr);
        }

        double totalDistance = minDists.get(targetId);
        double adjustedTimeMinutes = minTimes.get(targetId) / speedFactor;

        return new DijkstraResult(path, totalDistance, adjustedTimeMinutes, true);
    }

    public RoadNetworkGraph getRoadNetwork() {
        return roadNetwork;
    }
}
