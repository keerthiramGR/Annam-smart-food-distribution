package com.annam;

import com.annam.data.RoadNode;
import com.annam.dto.AllocationSummary;
import com.annam.dto.DijkstraResult;
import com.annam.model.*;
import com.annam.service.FoodDistributionService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Main Interactive Console Application for Annam - Smart Food Distribution & Waste Reduction System.
 */
public class Main {
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final Scanner scanner = new Scanner(System.in);
    private static final FoodDistributionService service = new FoodDistributionService();

    public static void main(String[] args) {
        System.out.println("Starting Annam Console Application (Multi-Role Operations)...");
        System.out.println("==================================================================");
        System.out.println("   ANNAM - SMART FOOD DISTRIBUTION & WASTE REDUCTION SYSTEM       ");
        System.out.println("              Multi-Role Operations Console                       ");
        System.out.println("==================================================================");

        boolean running = true;
        while (running) {
            displayMenu();
            System.out.print("Enter choice (1-15): ");
            String input = scanner.nextLine().trim();

            switch (input) {
                case "1":
                    handleViewDonors();
                    break;
                case "2":
                    handleViewRecipients();
                    break;
                case "3":
                    handleViewFoodBatches();
                    break;
                case "4":
                    handleUploadDonation();
                    break;
                case "5":
                    handleReviewFoodDonation();
                    break;
                case "6":
                    handleSubmitBookingRequest();
                    break;
                case "7":
                    handleReviewBookingRequest();
                    break;
                case "8":
                    handleViewDeliveryFleet();
                    break;
                case "9":
                    handleRunSmartAllocation();
                    break;
                case "10":
                    handleConfirmAllocationDelivery();
                    break;
                case "11":
                    handleViewShortestDeliveryRoutes();
                    break;
                case "12":
                    handleViewAllocationHistory();
                    break;
                case "13":
                    handleViewExpiredBatches();
                    break;
                case "14":
                    handleChangeSimulatedTime();
                    break;
                case "15":
                    running = false;
                    System.out.println("\nThank you for using Annam - Smart Food Distribution & Waste Reduction System.");
                    System.out.println("Minimizing Hunger. Eliminating Food Waste. System Shutdown Complete.\n");
                    break;
                default:
                    System.out.println("\n[!] Invalid selection. Please enter a number between 1 and 15.\n");
            }
        }
    }

    private static void displayMenu() {
        String simTime = service.getCurrentSimulatedTime().format(TIME_FORMATTER);
        System.out.println();
        System.out.println("----------------------------- MENU -----------------------------");
        System.out.printf("  Simulated Time: %s%n", simTime);
        System.out.println("----------------------------------------------------------------");
        System.out.println(" 1. View Donors");
        System.out.println(" 2. View Recipients & Remaining Demand");
        System.out.println(" 3. View Food Batches");
        System.out.println(" 4. [DONOR] Upload Surplus Food Donation");
        System.out.println(" 5. [ADMIN] Review (Approve/Reject) Food Donation");
        System.out.println(" 6. [RECIPIENT] Submit Food Booking Request");
        System.out.println(" 7. [ADMIN] Review (Approve/Reject) Booking Request");
        System.out.println(" 8. View Delivery Fleet & Capacities");
        System.out.println(" 9. Run Smart Food Allocation (Earliest Use-By First)");
        System.out.println(" 10. [ADMIN] Confirm Allocation Delivery");
        System.out.println(" 11. View Shortest Delivery Routes (Dijkstra)");
        System.out.println(" 12. View Allocation History & Booking Requests");
        System.out.println(" 13. View Expired Batches");
        System.out.println(" 14. Change Simulated Current Time");
        System.out.println(" 15. Exit");
        System.out.println("----------------------------------------------------------------");
    }

    // 1. View Donors
    private static void handleViewDonors() {
        System.out.println("\n========== REGISTERED FOOD DONORS ==========");
        System.out.printf("%-10s | %-32s | %-22s | %-8s | %-20s | %s%n",
                "ID", "Donor Name", "Type", "Location", "Contact Person", "FSSAI License");
        System.out.println("--------------------------------------------------------------------------------------------------------------------");
        for (Donor d : service.getDonors()) {
            System.out.printf("%-10s | %-32s | %-22s | %-8s | %-20s | %s%n",
                    d.getId(), d.getName(), d.getType(), d.getLocationId(), d.getContactPerson(), d.getFssaiLicense());
        }
        System.out.println("============================================");
    }

    // 2. View Recipients & Remaining Demand
    private static void handleViewRecipients() {
        System.out.println("\n========== RECIPIENTS & REMAINING DEMAND ==========");
        System.out.printf("%-10s | %-34s | %-24s | %-8s | %-5s | %-5s | %-10s | %s%n",
                "ID", "Recipient Organization", "Category", "Location", "Cap", "Recv", "Rem Demand", "Verified");
        System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
        for (Recipient r : service.getRecipients()) {
            System.out.printf("%-10s | %-34s | %-24s | %-8s | %-5d | %-5d | %-10d | %s%n",
                    r.getId(), r.getName(), r.getCategory(), r.getLocationId(),
                    r.getDailyPortionCapacity(), r.getPortionsReceivedToday(),
                    r.getRemainingDemand(), r.isVerified() ? "YES" : "NO");
        }
        System.out.println("===================================================");
    }

    // 3. View Food Batches
    private static void handleViewFoodBatches() {
        System.out.println("\n========== SURPLUS FOOD BATCHES ==========");
        System.out.printf("%-8s | %-40s | %-16s | %-7s | %-16s | %-8s | %s%n",
                "ID", "Food Description", "Category", "Rem/Tot", "Use-By Deadline", "Location", "Status");
        System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
        for (FoodBatch b : service.getFoodBatches()) {
            String count = b.getPortionsRemaining() + "/" + b.getPortionsTotal();
            System.out.printf("%-8s | %-40s | %-16s | %-7s | %-16s | %-8s | %s%n",
                    b.getId(), b.getFoodName(), b.getCategory(), count,
                    b.getUseByDeadline().format(TIME_FORMATTER), b.getPickupLocationId(), b.getStatus());
        }
        System.out.println("==========================================");
    }

    // 4. [DONOR] Upload Surplus Food Donation
    private static void handleUploadDonation() {
        System.out.println("\n========== [DONOR] UPLOAD SURPLUS FOOD DONATION ==========");
        System.out.println("Select Registered Donor:");
        for (Donor d : service.getDonors()) {
            System.out.printf("  [%s] %s (%s)%n", d.getId(), d.getName(), d.getLocationId());
        }
        System.out.print("Enter Donor ID (e.g., donor_01): ");
        String donorId = scanner.nextLine().trim();
        Donor donor = service.getDataStore().getDonor(donorId);
        if (donor == null) {
            System.out.println("[!] Donor not found. Operation cancelled.");
            return;
        }

        System.out.print("Enter Food Item Name: ");
        String foodName = scanner.nextLine().trim();
        if (foodName.isEmpty()) foodName = "Nutritious Hot Meal Box";

        System.out.print("Enter Category [1: Cooked Meals, 2: Bakery, 3: Fresh Produce, 4: Dairy]: ");
        String catChoice = scanner.nextLine().trim();
        String category = "Cooked Meals";
        if ("2".equals(catChoice)) category = "Bakery & Breads";
        else if ("3".equals(catChoice)) category = "Fresh Produce";
        else if ("4".equals(catChoice)) category = "Dairy & Beverages";

        System.out.print("Enter Total Portions (e.g., 50): ");
        int portions = 50;
        try {
            portions = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException ignored) {}

        System.out.print("Enter Quality Condition (e.g., Freshly Prepared Hot Food): ");
        String condition = scanner.nextLine().trim();
        if (condition.isEmpty()) condition = "Freshly Prepared Hot Food";

        System.out.print("Enter Use-By Shelf Life in Hours from now (e.g., 5): ");
        int hours = 5;
        try {
            hours = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException ignored) {}

        System.out.print("Enter Dietary Type (e.g., Vegetarian / Halal / Eggless): ");
        String dietary = scanner.nextLine().trim();
        if (dietary.isEmpty()) dietary = "Vegetarian";

        System.out.print("Enter Storage Requirements (e.g., Keep Warm >65C / Insulated Box): ");
        String storage = scanner.nextLine().trim();
        if (storage.isEmpty()) storage = "Keep Warm (>65C)";

        System.out.print("Enter Additional Notes: ");
        String notes = scanner.nextLine().trim();
        if (notes.isEmpty()) notes = "Standard hygienic meal boxes with disposable spoons.";

        try {
            FoodBatch batch = service.uploadSurplusDonation(donorId, foodName, category, portions,
                    condition, hours, dietary, storage, notes);
            System.out.println("\n[SUCCESS] Surplus Food Donation Uploaded Successfully!");
            System.out.printf("  Batch ID       : %s%n", batch.getId());
            System.out.printf("  Item           : %s (%d portions)%n", batch.getFoodName(), batch.getPortionsTotal());
            System.out.printf("  Pickup Location: %s (%s)%n", batch.getPickupLocationId(), donor.getName());
            System.out.printf("  Use-By Time    : %s%n", batch.getUseByDeadline().format(TIME_FORMATTER));
            System.out.println("  Status         : PENDING_REVIEW (Awaiting Super Admin Quality Verification)");
        } catch (Exception e) {
            System.out.println("[!] Error creating donation batch: " + e.getMessage());
        }
        System.out.println("==========================================================");
    }

    // 5. [ADMIN] Review Food Donation
    private static void handleReviewFoodDonation() {
        System.out.println("\n========== [ADMIN] REVIEW PENDING FOOD DONATIONS ==========");
        List<FoodBatch> pending = new ArrayList<>();
        for (FoodBatch b : service.getFoodBatches()) {
            if (b.getStatus() == FoodBatchStatus.PENDING_REVIEW) {
                pending.add(b);
            }
        }

        if (pending.isEmpty()) {
            System.out.println("No pending food donations requiring review.");
            System.out.println("===========================================================");
            return;
        }

        for (FoodBatch b : pending) {
            System.out.printf("  [%s] %s | Donor: %s | Portions: %d | Use-By: %s | Loc: %s%n",
                    b.getId(), b.getFoodName(), b.getDonorName(), b.getPortionsTotal(),
                    b.getUseByDeadline().format(TIME_FORMATTER), b.getPickupLocationId());
        }

        System.out.print("\nEnter Food Batch ID to Review (or press ENTER to cancel): ");
        String batchId = scanner.nextLine().trim();
        if (batchId.isEmpty()) return;

        System.out.print("Decision [A: Approve, R: Reject]: ");
        String decision = scanner.nextLine().trim().toUpperCase();

        if ("A".equals(decision)) {
            boolean ok = service.reviewFoodDonation(batchId, true);
            if (ok) {
                System.out.printf("[SUCCESS] Batch '%s' APPROVED! It is now visible to recipients for booking.%n", batchId);
            } else {
                System.out.println("[!] Batch ID not found.");
            }
        } else if ("R".equals(decision)) {
            boolean ok = service.reviewFoodDonation(batchId, false);
            if (ok) {
                System.out.printf("[SUCCESS] Batch '%s' REJECTED.%n", batchId);
            } else {
                System.out.println("[!] Batch ID not found.");
            }
        } else {
            System.out.println("[!] Cancelled. Invalid choice.");
        }
        System.out.println("===========================================================");
    }

    // 6. [RECIPIENT] Submit Food Booking Request
    private static void handleSubmitBookingRequest() {
        System.out.println("\n========== [RECIPIENT] SUBMIT FOOD BOOKING REQUEST ==========");
        System.out.println("Select Verified Recipient Organization:");
        for (Recipient r : service.getRecipients()) {
            System.out.printf("  [%s] %-32s (Loc: %-7s, Rem Demand: %3d)%n",
                    r.getId(), r.getName(), r.getLocationId(), r.getRemainingDemand());
        }
        System.out.print("Enter Recipient ID (e.g., recip_01): ");
        String recipId = scanner.nextLine().trim();
        Recipient recip = service.getDataStore().getRecipient(recipId);
        if (recip == null) {
            System.out.println("[!] Recipient not found.");
            return;
        }

        System.out.println("\nAvailable Approved Food Batches:");
        List<FoodBatch> approvedBatches = new ArrayList<>();
        for (FoodBatch b : service.getFoodBatches()) {
            if ((b.getStatus() == FoodBatchStatus.APPROVED || b.getStatus() == FoodBatchStatus.PARTIALLY_ALLOCATED)
                    && b.getPortionsRemaining() > 0 && !b.isExpired(service.getCurrentSimulatedTime())) {
                approvedBatches.add(b);
                System.out.printf("  [%s] %-38s (Avail: %3d portions, Use-By: %s, Loc: %s)%n",
                        b.getId(), b.getFoodName(), b.getPortionsRemaining(),
                        b.getUseByDeadline().format(TIME_FORMATTER), b.getPickupLocationId());
            }
        }

        if (approvedBatches.isEmpty()) {
            System.out.println("No approved batches currently available for booking.");
            System.out.println("=============================================================");
            return;
        }

        System.out.print("\nEnter Food Batch ID to Book (e.g., don_01): ");
        String batchId = scanner.nextLine().trim();
        FoodBatch batch = service.getDataStore().getFoodBatch(batchId);
        if (batch == null) {
            System.out.println("[!] Food Batch not found.");
            return;
        }

        System.out.printf("Enter Portions Requested (Max available: %d, Org remaining demand: %d): ",
                batch.getPortionsRemaining(), recip.getRemainingDemand());
        int portions = 20;
        try {
            portions = Integer.parseInt(scanner.nextLine().trim());
        } catch (NumberFormatException ignored) {}

        try {
            BookingRequest req = service.submitBookingRequest(recipId, batchId, portions);
            System.out.println("\n[SUCCESS] Booking Request Submitted Successfully!");
            System.out.printf("  Request ID : %s%n", req.getId());
            System.out.printf("  Recipient  : %s (%s)%n", recip.getName(), recip.getLocationId());
            System.out.printf("  Food Batch : %s (%d portions)%n", batch.getFoodName(), portions);
            System.out.println("  Status     : PENDING_REVIEW (Awaiting Super Admin Approval)");
        } catch (Exception e) {
            System.out.println("[!] Error submitting booking request: " + e.getMessage());
        }
        System.out.println("=============================================================");
    }

    // 7. [ADMIN] Review Booking Request
    private static void handleReviewBookingRequest() {
        System.out.println("\n========== [ADMIN] REVIEW PENDING BOOKING REQUESTS ==========");
        List<BookingRequest> pending = new ArrayList<>();
        for (BookingRequest req : service.getBookingRequests()) {
            if (req.getStatus() == BookingStatus.PENDING_REVIEW) {
                pending.add(req);
            }
        }

        if (pending.isEmpty()) {
            System.out.println("No pending booking requests requiring admin review.");
            System.out.println("=============================================================");
            return;
        }

        for (BookingRequest req : pending) {
            System.out.printf("  [%s] Recipient: %-26s | Batch: %-7s | Portions: %3d | Dest: %-7s | Time: %s%n",
                    req.getId(), req.getRecipientName(), req.getFoodBatchId(), req.getPortionsRequested(),
                    req.getDeliveryLocationId(), req.getRequestTime().format(TIME_FORMATTER));
        }

        System.out.print("\nEnter Booking Request ID to Review (or press ENTER to cancel): ");
        String reqId = scanner.nextLine().trim();
        if (reqId.isEmpty()) return;

        System.out.print("Decision [A: Approve, R: Reject]: ");
        String decision = scanner.nextLine().trim().toUpperCase();

        if ("A".equals(decision)) {
            boolean ok = service.reviewBookingRequest(reqId, true, "");
            if (ok) {
                System.out.printf("[SUCCESS] Booking Request '%s' APPROVED! It will be evaluated in the next allocation run.%n", reqId);
            } else {
                System.out.println("[!] Booking Request ID not found.");
            }
        } else if ("R".equals(decision)) {
            System.out.print("Enter reason for rejection: ");
            String reason = scanner.nextLine().trim();
            boolean ok = service.reviewBookingRequest(reqId, false, reason);
            if (ok) {
                System.out.printf("[SUCCESS] Booking Request '%s' REJECTED.%n", reqId);
            } else {
                System.out.println("[!] Booking Request ID not found.");
            }
        } else {
            System.out.println("[!] Cancelled.");
        }
        System.out.println("=============================================================");
    }

    // 8. View Delivery Fleet & Capacities
    private static void handleViewDeliveryFleet() {
        System.out.println("\n========== DELIVERY FLEET & CAPACITIES ==========");
        System.out.printf("%-8s | %-28s | %-14s | %-5s | %-8s | %-5s | %-12s | %s%n",
                "ID", "Vehicle Name", "Plate Number", "Cap", "Location", "Speed", "Status", "Driver & Phone");
        System.out.println("-----------------------------------------------------------------------------------------------------------------------------");
        for (DeliveryVehicle v : service.getVehicles()) {
            String driverInfo = v.getDriverName() + " (" + v.getDriverPhone() + ")";
            System.out.printf("%-8s | %-28s | %-14s | %-5d | %-8s | %-4.2fx | %-12s | %s%n",
                    v.getId(), v.getName(), v.getPlateNumber(), v.getCapacityPortions(),
                    v.getCurrentLocationId(), v.getSpeedMultiplier(), v.getStatus(), driverInfo);
        }
        System.out.println("=================================================");
    }

    // 9. Run Smart Food Allocation (Earliest Use-By First)
    private static void handleRunSmartAllocation() {
        System.out.println("\n========== RUN SMART FOOD ALLOCATION (EARLIEST USE-BY FIRST) ==========");
        System.out.println("Executing Multi-Constraint Optimization Engine:");
        System.out.println("  1. Perishability Priority (Earliest Use-By First / FEFO)");
        System.out.println("  2. Atomic Stock Portion Reservation");
        System.out.println("  3. Vehicle Capacity Best-Fit Matching");
        System.out.println("  4. Dijkstra Shortest Route Time Calculation");
        System.out.println("  5. Freshness Safety Margin Verification (Buffers: 15m load + 10m unload)");
        System.out.println("------------------------------------------------------------------------");

        AllocationSummary summary = service.runSmartAllocation();

        System.out.println("\n--- Execution Audit Log ---");
        for (String log : summary.getAuditLogs()) {
            System.out.println(" * " + log);
        }

        System.out.println("\n--- Allocation Run Summary ---");
        System.out.printf(" Total Requests Evaluated : %d%n", summary.getEvaluatedRequestsCount());
        System.out.printf(" Successful Allocations   : %d%n", summary.getSuccessfulAllocationsCount());
        System.out.printf(" Rejected / Infeasible   : %d%n", summary.getRejectedRequestsCount());
        System.out.printf(" Total Portions Dispatched : %d%n", summary.getTotalPortionsAllocated());
        System.out.println("========================================================================");
    }

    // 10. [ADMIN] Confirm Allocation Delivery
    private static void handleConfirmAllocationDelivery() {
        System.out.println("\n========== [ADMIN] CONFIRM ALLOCATION DELIVERY ==========");
        List<FoodAllocation> inTransit = new ArrayList<>();
        for (FoodAllocation a : service.getAllocations()) {
            if (a.getStatus() == AllocationStatus.IN_TRANSIT) {
                inTransit.add(a);
            }
        }

        if (inTransit.isEmpty()) {
            System.out.println("No allocations currently in transit.");
            System.out.println("=========================================================");
            return;
        }

        for (FoodAllocation a : inTransit) {
            System.out.printf("  [%s] %d portions '%s' to %s via %s (Dest: %s, ETA: %s)%n",
                    a.getId(), a.getPortionsAllocated(), a.getFoodName(), a.getRecipientName(),
                    a.getVehicleName(), a.getDeliveryLocationId(), a.getEstimatedDeliveryTime().format(TIME_FORMATTER));
        }

        System.out.print("\nEnter Allocation ID to Confirm Delivery (or press ENTER to cancel): ");
        String allocId = scanner.nextLine().trim();
        if (allocId.isEmpty()) return;

        boolean success = service.confirmAllocationDelivery(allocId);
        if (success) {
            FoodAllocation a = service.getDataStore().getAllocation(allocId);
            System.out.printf("[SUCCESS] Allocation '%s' marked DELIVERED!%n", allocId);
            System.out.printf("  Recipient '%s' received %d portions.%n", a.getRecipientName(), a.getPortionsAllocated());
            System.out.printf("  Vehicle '%s' is now Available at location '%s'.%n", a.getVehicleName(), a.getDeliveryLocationId());
        } else {
            System.out.println("[!] Allocation ID not found or not in transit.");
        }
        System.out.println("=========================================================");
    }

    // 11. View Shortest Delivery Routes (Dijkstra)
    private static void handleViewShortestDeliveryRoutes() {
        System.out.println("\n========== SHORTEST DELIVERY ROUTES (DIJKSTRA ALGORITHM) ==========");
        System.out.println("Available Urban Road Network Nodes (15 Nodes):");
        for (RoadNode n : service.getDataStore().getRoadNetwork().getAllNodes()) {
            System.out.printf("  %-8s: %-26s (%s)%n", n.getId(), n.getName(), n.getSector());
        }

        System.out.print("\nEnter Origin / Pickup Node (e.g., LOC_01) [or default LOC_01]: ");
        String origin = scanner.nextLine().trim().toUpperCase();
        if (origin.isEmpty()) origin = "LOC_01";

        System.out.print("Enter Destination / Delivery Node (e.g., LOC_04) [or default LOC_04]: ");
        String dest = scanner.nextLine().trim().toUpperCase();
        if (dest.isEmpty()) dest = "LOC_04";

        DijkstraResult result = service.findRoute(origin, dest, 1.0);
        if (result.isFound()) {
            System.out.println("\n----------------- DIJKSTRA ROUTE COMPUTED -----------------");
            System.out.printf(" Origin Node         : %s (%s)%n", origin,
                    service.getDataStore().getRoadNetwork().getNode(origin) != null
                            ? service.getDataStore().getRoadNetwork().getNode(origin).getName() : origin);
            System.out.printf(" Destination Node    : %s (%s)%n", dest,
                    service.getDataStore().getRoadNetwork().getNode(dest) != null
                            ? service.getDataStore().getRoadNetwork().getNode(dest).getName() : dest);
            System.out.printf(" Optimal Road Path   : %s%n", String.join(" -> ", result.getPath()));
            System.out.printf(" Total Distance      : %.2f km%n", result.getTotalDistanceKm());
            System.out.printf(" Transit Time (Base) : %.1f minutes%n", result.getTotalTimeMinutes());
            System.out.printf(" Transit Time (Bike) : %.1f minutes (at 1.25x speed)%n", result.getTotalTimeMinutes() / 1.25);
            System.out.printf(" Transit Time (Truck): %.1f minutes (at 0.90x speed)%n", result.getTotalTimeMinutes() / 0.90);
            System.out.println("-----------------------------------------------------------");
        } else {
            System.out.println("\n[!] No connected road path found between selected nodes.");
        }
        System.out.println("===================================================================");
    }

    // 12. View Allocation History & Booking Requests
    private static void handleViewAllocationHistory() {
        System.out.println("\n========== ALLOCATION HISTORY & DISPATCH ITINERARIES ==========");
        Collection<FoodAllocation> allocs = service.getAllocations();
        if (allocs.isEmpty()) {
            System.out.println("No active or historical allocations dispatched yet.");
        } else {
            for (FoodAllocation a : allocs) {
                System.out.println(a);
            }
        }

        System.out.println("\n========== ALL RECIPIENT BOOKING REQUESTS ==========");
        Collection<BookingRequest> reqs = service.getBookingRequests();
        if (reqs.isEmpty()) {
            System.out.println("No booking requests submitted.");
        } else {
            for (BookingRequest r : reqs) {
                System.out.println(r);
            }
        }
        System.out.println("===============================================================");
    }

    // 13. View Expired Batches
    private static void handleViewExpiredBatches() {
        System.out.println("\n========== EXPIRED FOOD BATCHES & WASTE REDUCTION AUDIT ==========");
        List<FoodBatch> expired = service.getExpiredBatches();
        if (expired.isEmpty()) {
            System.out.println("[SAFE] No food batches have expired at current simulated time!");
            System.out.println("Zero food waste recorded so far. Excellent distribution efficiency.");
        } else {
            System.out.printf("Found %d expired batch(es):%n", expired.size());
            for (FoodBatch b : expired) {
                System.out.printf("  * [%s] %-36s | Portions Lost: %d/%d | Use-By was: %s%n",
                        b.getId(), b.getFoodName(), b.getPortionsRemaining(), b.getPortionsTotal(),
                        b.getUseByDeadline().format(TIME_FORMATTER));
            }
        }
        System.out.println("=================================================================");
    }

    // 14. Change Simulated Current Time
    private static void handleChangeSimulatedTime() {
        System.out.println("\n========== CHANGE SIMULATED CURRENT TIME ==========");
        LocalDateTime current = service.getCurrentSimulatedTime();
        System.out.printf("Current Simulated Time: %s%n", current.format(TIME_FORMATTER));
        System.out.println("Choose an action:");
        System.out.println("  1. Advance +1 hour");
        System.out.println("  2. Advance +2 hours");
        System.out.println("  3. Advance +4 hours");
        System.out.println("  4. Advance +6 hours");
        System.out.println("  5. Advance +24 hours (Next Day)");
        System.out.println("  6. Set specific Date & Time (yyyy-MM-dd HH:mm)");
        System.out.print("Enter choice (1-6) [or press ENTER to cancel]: ");
        String choice = scanner.nextLine().trim();

        LocalDateTime updated = null;
        switch (choice) {
            case "1":
                updated = current.plusHours(1);
                break;
            case "2":
                updated = current.plusHours(2);
                break;
            case "3":
                updated = current.plusHours(4);
                break;
            case "4":
                updated = current.plusHours(6);
                break;
            case "5":
                updated = current.plusDays(1);
                break;
            case "6":
                System.out.print("Enter target timestamp (yyyy-MM-dd HH:mm): ");
                String ts = scanner.nextLine().trim();
                try {
                    updated = LocalDateTime.parse(ts, TIME_FORMATTER);
                } catch (DateTimeParseException e) {
                    System.out.println("[!] Invalid format. Expected format: yyyy-MM-dd HH:mm");
                    return;
                }
                break;
            default:
                System.out.println("[!] Time change cancelled.");
                return;
        }

        if (updated != null) {
            service.setSimulatedTime(updated);
            System.out.printf("[SUCCESS] Simulated Time updated to: %s%n", updated.format(TIME_FORMATTER));
            List<FoodBatch> expired = service.checkAndExpireBatches();
            if (!expired.isEmpty()) {
                System.out.printf("[ALERT] %d food batch(es) reached their use-by deadline and were marked EXPIRED.%n",
                        expired.size());
            }
        }
        System.out.println("====================================================");
    }
}
