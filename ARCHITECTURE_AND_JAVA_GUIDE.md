# Annam – Smart Food Distribution & Waste Reduction System
## Architecture, Business Logic & Pure Java Implementation Guide

This guide is designed for your academic project and console Java implementation. It details the **business rules**, **data structures**, **multi-constraint allocation steps**, and **Dijkstra algorithm** used in the system, along with complete Java code snippets.

---

## 1. Domain Entities & Data Structures

In an Object-Oriented Java design, model the problem with the following classes:

### 1.1 Location & Graph Edge
```java
public class Location {
    private String id;          // e.g. "LOC_01"
    private String name;        // e.g. "Central City Center"
    private String sector;      // e.g. "Downtown"
    private double x, y;        // Coordinates for map display
    // Getters & constructor
}

public class RoadEdge {
    private String fromId;
    private String toId;
    private double distanceKm;
    private double timeMinutes;
    // Getters & constructor
}
```

### 1.2 Food Donation (`FoodBatch`)
```java
public enum DonationStatus {
    PENDING, APPROVED, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, REJECTED
}

public class FoodDonation {
    private String id;
    private String donorId;
    private String foodName;
    private String category;            // Cooked Meals, Bakery, Produce, etc.
    private int portionsTotal;
    private int portionsRemaining;
    private String qualityCondition;    // e.g. "Freshly Prepared Hot Food"
    private long preparationTimeMillis; // Unix epoch timestamp
    private long useByDeadlineMillis;   // Perishability threshold
    private String pickupLocationId;
    private DonationStatus status;
    // Getters, setters, portion deduction logic
}
```

### 1.3 Recipient Shelter & Booking Request
```java
public enum BookingStatus {
    PENDING, ALLOCATED, IN_TRANSIT, DELIVERED, REJECTED
}

public class BookingRequest {
    private String id;
    private String recipientId;
    private String donationId;
    private int portionsRequested;
    private String deliveryLocationId;
    private long requestTimeMillis;
    private BookingStatus status;
    private String assignedVehicleId;
    private String rejectionReason;
}
```

### 1.4 Transport Vehicle
```java
public enum VehicleStatus {
    AVAILABLE, IN_TRANSIT, MAINTENANCE
}

public class Vehicle {
    private String id;
    private String name;               // e.g. "Eco-Van Alpha"
    private int capacityPortions;      // e.g. 60, 150, 30
    private double speedMultiplier;    // e.g. 1.0, 0.9, 1.25
    private VehicleStatus status;
    private String currentLocationId;
}
```

---

## 2. Road Graph & Dijkstra Shortest Path Algorithm

The urban network consists of 15 nodes and weighted bidirectional edges.

### 2.1 Adjacency List Representation
```java
import java.util.*;

public class RoadNetworkGraph {
    private final Map<String, List<RoadEdge>> adjacencyList = new HashMap<>();

    public void addEdge(String from, String to, double distKm, double timeMin) {
        adjacencyList.computeIfAbsent(from, k -> new ArrayList<>())
                     .add(new RoadEdge(from, to, distKm, timeMin));
        adjacencyList.computeIfAbsent(to, k -> new ArrayList<>())
                     .add(new RoadEdge(to, from, distKm, timeMin));
    }
}
```

### 2.2 Dijkstra Algorithm in Java (PriorityQueue)

```java
public class DijkstraResult {
    public List<String> path;
    public double totalDistanceKm;
    public double totalTimeMinutes;
    public boolean found;
}

public DijkstraResult findShortestRoute(String sourceId, String targetId, double vehicleSpeedFactor) {
    if (sourceId.equals(targetId)) {
        DijkstraResult res = new DijkstraResult();
        res.path = Collections.singletonList(sourceId);
        res.totalDistanceKm = 0;
        res.totalTimeMinutes = 0;
        res.found = true;
        return res;
    }

    Map<String, Double> minTimes = new HashMap<>();
    Map<String, Double> minDists = new HashMap<>();
    Map<String, String> previousNode = new HashMap<>();

    // PriorityQueue sorted by minimum transit time
    PriorityQueue<NodeTime> pq = new PriorityQueue<>(Comparator.comparingDouble(nt -> nt.time));

    for (String nodeId : adjacencyList.keySet()) {
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

        if (visited.contains(u)) continue;
        visited.add(u);

        if (u.equals(targetId)) break;

        for (RoadEdge edge : adjacencyList.getOrDefault(u, Collections.emptyList())) {
            String v = edge.getToId();
            if (visited.contains(v)) continue;

            double newTime = minTimes.get(u) + edge.getTimeMinutes();
            double newDist = minDists.get(u) + edge.getDistanceKm();

            if (newTime < minTimes.get(v)) {
                minTimes.put(v, newTime);
                minDists.put(v, newDist);
                previousNode.put(v, u);
                pq.add(new NodeTime(v, newTime));
            }
        }
    }

    if (minTimes.get(targetId) == Double.POSITIVE_INFINITY) {
        DijkstraResult notFound = new DijkstraResult();
        notFound.found = false;
        return notFound;
    }

    // Reconstruct path
    LinkedList<String> path = new LinkedList<>();
    String curr = targetId;
    while (curr != null) {
        path.addFirst(curr);
        curr = previousNode.get(curr);
    }

    DijkstraResult result = new DijkstraResult();
    result.path = path;
    result.totalDistanceKm = minDists.get(targetId);
    // Adjusted by vehicle speed multiplier
    result.totalTimeMinutes = minTimes.get(targetId) / vehicleSpeedFactor;
    result.found = true;
    return result;
}

static class NodeTime {
    String nodeId;
    double time;
    NodeTime(String id, double t) { this.nodeId = id; this.time = t; }
}
```

---

## 3. Multi-Constraint Allocation Business Rules

Before the Super Admin approves an allocation, the system enforces **five strict operational constraints**:

```
[Booking Request]
       │
       ▼
1. Is Donation Approved & Active? ──(No)──> REJECT ("Donation not approved")
       │ (Yes)
       ▼
2. Portions Demanded <= Remaining? ──(No)──> REJECT ("Insufficient stock / Over-allocation")
       │ (Yes)
       ▼
3. Vehicle Capacity >= Demand? ────(No)──> REJECT ("Vehicle capacity exceeded")
       │ (Yes)
       ▼
4. Dijkstra Route Exists? ─────────(No)──> REJECT ("No connected road segment")
       │ (Yes)
       ▼
5. Strict Perishability Timing:
   Earliest Start = max(Now, PrepTime)
   Mission Time   = Pickup Buffer (15m) + Route Transit Time + Handover Buffer (10m)
   Est Completion = Earliest Start + Mission Time
   
   Is Est Completion < Use-By Deadline?
       │
       ├──(No)──> REJECT ("Perishability deadline violated by X minutes")
       │
       └──(Yes)─> APPROVE & ALLOCATE
                  - Deduct remaining portions atomically
                  - Mark vehicle as IN_TRANSIT
                  - Set booking status to ALLOCATED
                  - Store route itinerary and ETA
```

### 3.1 Timing Formula in Java
```java
public static final long PICKUP_LOADING_BUFFER_MS = 15 * 60 * 1000L;    // 15 mins
public static final long HANDOVER_UNLOADING_BUFFER_MS = 10 * 60 * 1000L; // 10 mins

public FeasibilityVerdict evaluateFeasibility(
    BookingRequest booking, 
    FoodDonation donation, 
    Vehicle vehicle, 
    DijkstraResult route,
    long currentTimestamp
) {
    // 1. Portion Check
    if (booking.getPortionsRequested() > donation.getPortionsRemaining()) {
        return FeasibilityVerdict.fail("Demanded portions exceed available remaining stock.");
    }

    // 2. Vehicle Capacity Check
    if (vehicle.getCapacityPortions() < booking.getPortionsRequested()) {
        return FeasibilityVerdict.fail("Vehicle capacity is lower than requested portions.");
    }

    // 3. Timing Check
    long earliestPickupStart = Math.max(currentTimestamp, donation.getPreparationTimeMillis());
    long travelDurationMs = (long) (route.totalTimeMinutes * 60 * 1000L);
    long totalMissionDurationMs = PICKUP_LOADING_BUFFER_MS + travelDurationMs + HANDOVER_UNLOADING_BUFFER_MS;
    long estimatedCompletionTimestamp = earliestPickupStart + totalMissionDurationMs;

    if (estimatedCompletionTimestamp >= donation.getUseByDeadlineMillis()) {
        long overdueMinutes = (estimatedCompletionTimestamp - donation.getUseByDeadlineMillis()) / (60 * 1000L);
        return FeasibilityVerdict.fail(
            "Perishability deadline violation: Delivery would complete at " +
            formatTime(estimatedCompletionTimestamp) + " which exceeds use-by time of " +
            formatTime(donation.getUseByDeadlineMillis()) + " by " + overdueMinutes + " minutes."
        );
    }

    long safetyMarginMinutes = (donation.getUseByDeadlineMillis() - estimatedCompletionTimestamp) / (60 * 1000L);
    return FeasibilityVerdict.pass("All constraints satisfied. Freshness safety margin: " + safetyMarginMinutes + " mins.");
}
```

---

## 4. Test Cases for Java Academic Project

When demonstrating your Java application, include these 4 automated test scenarios:

| Test Case | Scenario | Expected Outcome | Rationale |
|---|---|---|---|
| **TC-01** | Standard booking with ample use-by window (+6 hours) | **FEASIBLE / ALLOCATED** | Passes portions stock, vehicle capacity, and time constraint. |
| **TC-02** | Demand (80 portions) > Eco-Van Alpha capacity (60 portions) | **REJECTED** | Vehicle capacity violation. Prevents vehicle overload. |
| **TC-03** | Use-by time is within 15 mins (Total travel + buffers = 31 mins) | **REJECTED** | Delivery deadline violation. Prevents distributing spoiled/unsafe food. |
| **TC-04** | Two recipients request same donation (50 portions total stock) | **ATOMIC DEDUCTION** | Recipient 1 gets 30 portions; remaining becomes 20. If Recipient 2 asks 25, rejected for over-allocation. |

---

## 5. Summary Mapping Table

| Web Application (Node.js / Express) | Academic Java Application |
|---|---|
| `backend/services/graphData.js` | `com.annam.model.RoadNetworkGraph` |
| `backend/services/dijkstraService.js` | `com.annam.service.DijkstraRoutingEngine` |
| `backend/services/allocationService.js` | `com.annam.service.AllocationFeasibilityPolicy` |
| `backend/data/repository.js` | `com.annam.repository.DataStore` (or SQLite/JDBC) |
| `frontend/index.html` (3 Login Doors) | Console Menu: `1. Donor`, `2. Recipient`, `3. Super Admin` |
