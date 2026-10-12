package com.annam;

import com.annam.data.RoadNetworkGraph;
import com.annam.dto.DijkstraResult;
import com.annam.dto.FeasibilityVerdict;
import com.annam.model.*;
import com.annam.policy.AllocationPolicy;
import com.annam.service.RoutingService;

import java.time.LocalDateTime;

/**
 * Pure Java Test Suite verifying the 4 core academic test scenarios:
 * TC-01: Feasible standard allocation
 * TC-02: Vehicle capacity violation
 * TC-03: Perishability deadline violation
 * TC-04: Atomic portion deduction preventing over-allocation
 */
public class SmartAllocationTest {

    public static void main(String[] args) {
        System.out.println("Running Annam Multi-Constraint Allocation Test Cases...");
        System.out.println("==========================================================");

        int passed = 0;
        int failed = 0;

        if (testCase01_StandardFeasible()) passed++; else failed++;
        if (testCase02_VehicleCapacityViolation()) passed++; else failed++;
        if (testCase03_PerishabilityDeadlineViolation()) passed++; else failed++;
        if (testCase04_AtomicPortionDeduction()) passed++; else failed++;

        System.out.println("==========================================================");
        System.out.printf("Test Results: %d Passed, %d Failed.%n", passed, failed);
        if (failed == 0) {
            System.out.println("[ALL TESTS PASSED] System strictly adheres to all operational constraints.");
        }
    }

    // TC-01: Standard booking with ample use-by window (+6 hours) -> FEASIBLE
    private static boolean testCase01_StandardFeasible() {
        System.out.print("[TC-01] Standard Feasible Booking Test: ");
        LocalDateTime now = LocalDateTime.of(2026, 10, 15, 10, 0);

        FoodBatch batch = new FoodBatch("don_test1", "donor_01", "Spice Garden",
                "Rice Box", "Cooked Meals", 50, 50, "Hot Food",
                now.minusHours(1), now.plusHours(6), "LOC_01", FoodBatchStatus.APPROVED,
                "Vegetarian", "Hot", "Notes");

        BookingRequest booking = new BookingRequest("book_test1", "recip_01", "Hope Shelter",
                "don_test1", "Rice Box", 30, "LOC_04", now, BookingStatus.APPROVED);

        DeliveryVehicle vehicle = new DeliveryVehicle("veh_01", "Eco-Van Alpha", "KA-01-EV",
                "Van", 60, DeliveryVehicle.VehicleStatus.AVAILABLE, "LOC_01", 1.0,
                "Ramesh", "+91 99001", true);

        RoadNetworkGraph graph = new RoadNetworkGraph();
        RoutingService routingService = new RoutingService(graph);
        DijkstraResult route = routingService.findShortestRoute("LOC_01", "LOC_04", vehicle.getSpeedMultiplier());

        AllocationPolicy policy = new AllocationPolicy();
        FeasibilityVerdict verdict = policy.evaluateFeasibility(booking, batch, vehicle, route, now);

        if (verdict.isFeasible() && verdict.getFreshnessMarginMinutes() > 0) {
            System.out.println("PASSED (Feasible, Margin: " + verdict.getFreshnessMarginMinutes() + " mins)");
            return true;
        } else {
            System.out.println("FAILED: " + verdict.getMessage());
            return false;
        }
    }

    // TC-02: Demand (80 portions) > Eco-Van Alpha capacity (60 portions) -> REJECTED
    private static boolean testCase02_VehicleCapacityViolation() {
        System.out.print("[TC-02] Vehicle Capacity Violation Test: ");
        LocalDateTime now = LocalDateTime.of(2026, 10, 15, 10, 0);

        FoodBatch batch = new FoodBatch("don_test2", "donor_01", "Spice Garden",
                "Rice Box", "Cooked Meals", 100, 100, "Hot Food",
                now.minusHours(1), now.plusHours(6), "LOC_01", FoodBatchStatus.APPROVED,
                "Vegetarian", "Hot", "Notes");

        BookingRequest booking = new BookingRequest("book_test2", "recip_01", "Hope Shelter",
                "don_test2", "Rice Box", 80, "LOC_04", now, BookingStatus.APPROVED);

        DeliveryVehicle vehicle = new DeliveryVehicle("veh_01", "Eco-Van Alpha", "KA-01-EV",
                "Van", 60, DeliveryVehicle.VehicleStatus.AVAILABLE, "LOC_01", 1.0,
                "Ramesh", "+91 99001", true);

        RoadNetworkGraph graph = new RoadNetworkGraph();
        RoutingService routingService = new RoutingService(graph);
        DijkstraResult route = routingService.findShortestRoute("LOC_01", "LOC_04", vehicle.getSpeedMultiplier());

        AllocationPolicy policy = new AllocationPolicy();
        FeasibilityVerdict verdict = policy.evaluateFeasibility(booking, batch, vehicle, route, now);

        if (!verdict.isFeasible() && verdict.getMessage().contains("capacity")) {
            System.out.println("PASSED (Correctly rejected for vehicle capacity overload)");
            return true;
        } else {
            System.out.println("FAILED: Expected rejection due to capacity overload, but got: " + verdict.getMessage());
            return false;
        }
    }

    // TC-03: Use-by time is within 15 mins (Total travel + buffers = 31 mins) -> REJECTED
    private static boolean testCase03_PerishabilityDeadlineViolation() {
        System.out.print("[TC-03] Perishability Deadline Violation Test: ");
        LocalDateTime now = LocalDateTime.of(2026, 10, 15, 10, 0);

        // Use-by is only 15 minutes away
        FoodBatch batch = new FoodBatch("don_test3", "donor_01", "Spice Garden",
                "Rice Box", "Cooked Meals", 50, 50, "Hot Food",
                now.minusHours(1), now.plusMinutes(15), "LOC_01", FoodBatchStatus.APPROVED,
                "Vegetarian", "Hot", "Notes");

        BookingRequest booking = new BookingRequest("book_test3", "recip_01", "Hope Shelter",
                "don_test3", "Rice Box", 20, "LOC_04", now, BookingStatus.APPROVED);

        DeliveryVehicle vehicle = new DeliveryVehicle("veh_01", "Eco-Van Alpha", "KA-01-EV",
                "Van", 60, DeliveryVehicle.VehicleStatus.AVAILABLE, "LOC_01", 1.0,
                "Ramesh", "+91 99001", true);

        RoadNetworkGraph graph = new RoadNetworkGraph();
        RoutingService routingService = new RoutingService(graph);
        DijkstraResult route = routingService.findShortestRoute("LOC_01", "LOC_04", vehicle.getSpeedMultiplier());

        AllocationPolicy policy = new AllocationPolicy();
        FeasibilityVerdict verdict = policy.evaluateFeasibility(booking, batch, vehicle, route, now);

        if (!verdict.isFeasible() && verdict.getMessage().contains("Perishability")) {
            System.out.println("PASSED (Correctly rejected to prevent spoiled food distribution)");
            return true;
        } else {
            System.out.println("FAILED: Expected rejection for perishability deadline violation, but got: " + verdict.getMessage());
            return false;
        }
    }

    // TC-04: Two recipients request same donation (50 portions total stock) -> ATOMIC DEDUCTION
    private static boolean testCase04_AtomicPortionDeduction() {
        System.out.print("[TC-04] Atomic Portion Deduction Stock Test: ");
        LocalDateTime now = LocalDateTime.of(2026, 10, 15, 10, 0);

        FoodBatch batch = new FoodBatch("don_test4", "donor_01", "Spice Garden",
                "Rice Box", "Cooked Meals", 50, 50, "Hot Food",
                now.minusHours(1), now.plusHours(6), "LOC_01", FoodBatchStatus.APPROVED,
                "Vegetarian", "Hot", "Notes");

        boolean firstOk = batch.deductPortions(30);
        boolean secondOverAllocOk = batch.deductPortions(25); // only 20 left, requesting 25

        if (firstOk && batch.getPortionsRemaining() == 20 && !secondOverAllocOk) {
            System.out.println("PASSED (30 portions deducted atomically; over-allocation of 25 rejected)");
            return true;
        } else {
            System.out.println("FAILED: Remaining was " + batch.getPortionsRemaining() + ", secondOk=" + secondOverAllocOk);
            return false;
        }
    }
}
