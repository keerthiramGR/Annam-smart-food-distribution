package com.annam.data;

import com.annam.model.*;

import java.time.LocalDateTime;
import java.util.*;

/**
 * In-memory repository store providing default state for Annam System.
 */
public class DataStore {
    private LocalDateTime currentSimulatedTime;
    private final RoadNetworkGraph roadNetwork;

    private final Map<String, Donor> donors = new LinkedHashMap<>();
    private final Map<String, Recipient> recipients = new LinkedHashMap<>();
    private final Map<String, DeliveryVehicle> vehicles = new LinkedHashMap<>();
    private final Map<String, FoodBatch> foodBatches = new LinkedHashMap<>();
    private final Map<String, BookingRequest> bookingRequests = new LinkedHashMap<>();
    private final Map<String, FoodAllocation> allocations = new LinkedHashMap<>();
    private final Map<String, UserAccount> userAccounts = new LinkedHashMap<>();

    private int nextDonationSeq = 6;
    private int nextBookingSeq = 4;
    private int nextAllocationSeq = 1;

    public DataStore() {
        this.currentSimulatedTime = LocalDateTime.of(2026, 10, 15, 10, 0);
        this.roadNetwork = new RoadNetworkGraph();
        seedData();
    }

    public LocalDateTime getCurrentSimulatedTime() {
        return currentSimulatedTime;
    }

    public void setCurrentSimulatedTime(LocalDateTime time) {
        this.currentSimulatedTime = time;
    }

    public RoadNetworkGraph getRoadNetwork() {
        return roadNetwork;
    }

    public Collection<Donor> getAllDonors() {
        return donors.values();
    }

    public Donor getDonor(String id) {
        return donors.get(id);
    }

    public Collection<Recipient> getAllRecipients() {
        return recipients.values();
    }

    public Recipient getRecipient(String id) {
        return recipients.get(id);
    }

    public Collection<DeliveryVehicle> getAllVehicles() {
        return vehicles.values();
    }

    public DeliveryVehicle getVehicle(String id) {
        return vehicles.get(id);
    }

    public Collection<FoodBatch> getAllFoodBatches() {
        return foodBatches.values();
    }

    public FoodBatch getFoodBatch(String id) {
        return foodBatches.get(id);
    }

    public void addFoodBatch(FoodBatch batch) {
        foodBatches.put(batch.getId(), batch);
    }

    public Collection<BookingRequest> getAllBookingRequests() {
        return bookingRequests.values();
    }

    public BookingRequest getBookingRequest(String id) {
        return bookingRequests.get(id);
    }

    public void addBookingRequest(BookingRequest request) {
        bookingRequests.put(request.getId(), request);
    }

    public Collection<FoodAllocation> getAllAllocations() {
        return allocations.values();
    }

    public FoodAllocation getAllocation(String id) {
        return allocations.get(id);
    }

    public void addAllocation(FoodAllocation allocation) {
        allocations.put(allocation.getId(), allocation);
    }

    public String generateNextBatchId() {
        return String.format("don_%02d", nextDonationSeq++);
    }

    public String generateNextBookingId() {
        return String.format("book_%02d", nextBookingSeq++);
    }

    public String generateNextAllocationId() {
        return String.format("alloc_%02d", nextAllocationSeq++);
    }

    private void seedData() {
        // 5 Donors
        donors.put("donor_01", new Donor("donor_01", "Spice Garden Restaurant", "Restaurant",
                "spicegarden@annam.org", "+91 98450 11223", "LOC_01", "42 Central Boulevard, City Center",
                "Chef Raghavendra Rao", "FSSAI-11223344556677", "Specializes in North Indian curries and steamed rice."));

        donors.put("donor_02", new Donor("donor_02", "Royal Palace Hotel & Banquets", "Luxury Hotel",
                "royalpalace@annam.org", "+91 98450 22334", "LOC_08", "108 Grand Avenue Boulevard",
                "Meera Nambiar (F&B Director)", "FSSAI-22334455667788", "Premium buffet and banquet surplus from summits."));

        donors.put("donor_03", new Donor("donor_03", "Green Leaf College Canteen", "Educational Institution",
                "greenleaf@annam.org", "+91 98450 33445", "LOC_07", "University Campus, Gate 4",
                "Prof. Ananya Sen", "FSSAI-33445566778899", "High-volume wholesome vegetarian lunch meals and rotis."));

        donors.put("donor_04", new Donor("donor_04", "Annapurna Community Kitchen", "Catering & Social Kitchen",
                "annapurna@annam.org", "+91 98450 44556", "LOC_03", "15 North Market Square",
                "Kalyan Sundaram", "FSSAI-44556677889900", "Nutritious large-pot khichdi, sambar rice, and pulao."));

        donors.put("donor_05", new Donor("donor_05", "Metro Artisan Bakery", "Bakery & Confectionery",
                "metrobakery@annam.org", "+91 98450 55667", "LOC_06", "77 West End Commercial Road",
                "Zoya Fernandes", "FSSAI-55667788990011", "Whole wheat bread loaves, dinner rolls, and buns."));

        // 12 Recipients (Shelters & Community Centres)
        recipients.put("recip_01", new Shelter("recip_01", "Hope Shelter for Homeless", "Homeless Shelter",
                "hope@annam.org", "+91 97400 11001", "LOC_04", "12 South Riverside Road", 85,
                "Sister Teresa Maria", true, 60, "Homeless Adults"));

        recipients.put("recip_02", new Shelter("recip_02", "Karuna Care Children Orphanage", "Orphanage & Child Welfare",
                "karuna@annam.org", "+91 97400 11002", "LOC_05", "88 East Gate Cross", 65,
                "Dr. Vigneshwar", true, 50, "Orphaned Children"));

        recipients.put("recip_03", new Shelter("recip_03", "St. Jude Elderly Care Home", "Elderly Care",
                "stjude@annam.org", "+91 97400 11003", "LOC_03", "3 North Market Lane", 45,
                "Father Thomas", true, 40, "Senior Citizens"));

        recipients.put("recip_04", new CommunityCentre("recip_04", "Sneha Community Relief Foundation", "Community Center",
                "sneha@annam.org", "+91 97400 11004", "LOC_13", "Suburban Colony Sector 2", 100,
                "Lakshmi Narayan", true, "Suburban South", "08:00 - 20:00"));

        recipients.put("recip_05", new Shelter("recip_05", "Anandha Nilayam Youth Shelter", "Youth Shelter",
                "anandha@annam.org", "+91 97400 11005", "LOC_01", "5 Civic Lane, Central City Center", 50,
                "Praveen Chander", true, 45, "Youth in Crisis"));

        recipients.put("recip_06", new CommunityCentre("recip_06", "Shanti Peace Food Pantry", "Food Pantry",
                "shanti@annam.org", "+91 97400 11006", "LOC_10", "Midtown Crossway Transit Block", 70,
                "Sardar Manpreet Singh", true, "Central Midtown", "09:00 - 18:00"));

        recipients.put("recip_07", new Shelter("recip_07", "Sunrise Women & Child Refuge", "Women's Shelter",
                "sunrise@annam.org", "+91 97400 11007", "LOC_09", "19 Heritage Square, Old City", 40,
                "Bhavani Shankar", true, 35, "Women and Children"));

        recipients.put("recip_08", new Shelter("recip_08", "Grace Children Hope Home", "Children Foster Care",
                "grace@annam.org", "+91 97400 11008", "LOC_11", "Hill View Ridge 2", 35,
                "Rosemary David", true, 30, "Foster Youth"));

        recipients.put("recip_09", new CommunityCentre("recip_09", "Mission Mercy Relief Center", "Migrant Support Hub",
                "mercy@annam.org", "+91 97400 11009", "LOC_12", "Industrial Logistic Yard 5", 120,
                "Balwinder Dhillon", true, "Southeast Industrial", "07:00 - 21:00"));

        recipients.put("recip_10", new CommunityCentre("recip_10", "Navjeevan Student Pantry", "Student Welfare Pantry",
                "navjeevan@annam.org", "+91 97400 11010", "LOC_07", "University Campus North Annex", 60,
                "Aditya Vardhan", true, "Campus Northwest", "10:00 - 19:00"));

        recipients.put("recip_11", new Shelter("recip_11", "Mother Teresa Destitute Home", "Destitute Shelter",
                "motherteresa@annam.org", "+91 97400 11011", "LOC_08", "Grand Avenue South Wing", 65,
                "Sister Agnes", true, 55, "Destitute & Homeless"));

        recipients.put("recip_12", new Shelter("recip_12", "Sevak Kendra Crisis Haven", "Crisis Relief Haven",
                "sevak@annam.org", "+91 97400 11012", "LOC_06", "West End Sector 4", 55,
                "Gopal Krishnan", true, 40, "Emergency Relief"));

        // 3 Vehicles
        vehicles.put("veh_01", new DeliveryVehicle("veh_01", "Eco-Van Alpha (EV-01)", "KA-01-EV-2024",
                "Electric Refrigerated Van", 60, DeliveryVehicle.VehicleStatus.AVAILABLE,
                "LOC_01", 1.0, "Ramesh Kumar", "+91 99001 23456", true));

        vehicles.put("veh_02", new DeliveryVehicle("veh_02", "City Express Heavy (TRK-02)", "KA-01-TR-9988",
                "Medium Insulated Truck", 150, DeliveryVehicle.VehicleStatus.AVAILABLE,
                "LOC_10", 0.9, "Suresh Patel", "+91 99002 34567", true));

        vehicles.put("veh_03", new DeliveryVehicle("veh_03", "Rapid Cargo Bike (MOTO-03)", "KA-01-BK-4512",
                "Rapid Cargo E-Bike", 30, DeliveryVehicle.VehicleStatus.AVAILABLE,
                "LOC_06", 1.25, "Vikram Das", "+91 99003 45678", false));

        // Initial Food Batches
        foodBatches.put("don_01", new FoodBatch("don_01", "donor_01", "Spice Garden Restaurant",
                "Paneer Butter Masala & Jeera Rice Meal Box", "Cooked Meals", 50, 50,
                "Freshly Prepared Hot Food",
                currentSimulatedTime.minusMinutes(90), currentSimulatedTime.plusHours(5).plusMinutes(30),
                "LOC_01", FoodBatchStatus.APPROVED, "Vegetarian", "Keep Warm (>65C)",
                "Packed in food-grade foil containers with disposable cutlery."));

        foodBatches.put("don_02", new FoodBatch("don_02", "donor_02", "Royal Palace Hotel & Banquets",
                "Grand Banquet Dum Biryani & Dal Makhani Feast", "Cooked Meals", 120, 120,
                "Pristine Surplus Buffet Food",
                currentSimulatedTime.minusHours(2), currentSimulatedTime.plusHours(6),
                "LOC_08", FoodBatchStatus.APPROVED, "Vegetarian & Halal Non-Veg", "Insulated Hot Container",
                "Surplus from corporate banquet. Inspected by executive chef."));

        foodBatches.put("don_03", new FoodBatch("don_03", "donor_05", "Metro Artisan Bakery",
                "Artisan Whole Wheat Loaves & Milk Dinner Rolls", "Bakery & Breads", 40, 40,
                "Oven-Fresh Today",
                currentSimulatedTime.minusHours(3), currentSimulatedTime.plusHours(24),
                "LOC_06", FoodBatchStatus.APPROVED, "Vegetarian (Eggless)", "Ambient / Dry Storage",
                "20 whole loaves and 80 fresh soft rolls in sealed kraft bags."));

        foodBatches.put("don_04", new FoodBatch("don_04", "donor_03", "Green Leaf College Canteen",
                "Nutritious South Indian Sambar & Lemon Rice Combo", "Cooked Meals", 75, 75,
                "Fresh Lunch Surplus",
                currentSimulatedTime.minusHours(1), currentSimulatedTime.plusHours(4),
                "LOC_07", FoodBatchStatus.APPROVED, "Vegetarian", "Insulated Stainless Steel Casks",
                "Healthy balanced meal boxes prepared under hygienic standards."));

        foodBatches.put("don_05", new FoodBatch("don_05", "donor_04", "Annapurna Community Kitchen",
                "Fresh Vegetable Pulao & Raita", "Cooked Meals", 60, 60,
                "Hot Freshly Cooked Batch",
                currentSimulatedTime.minusMinutes(30), currentSimulatedTime.plusHours(6).plusMinutes(30),
                "LOC_03", FoodBatchStatus.PENDING_REVIEW, "Vegetarian", "Keep Warm",
                "Awaiting Super Admin food safety and hygiene review."));

        // Initial Booking Requests
        bookingRequests.put("book_01", new BookingRequest("book_01", "recip_01", "Hope Shelter for Homeless",
                "don_01", "Paneer Butter Masala & Jeera Rice Meal Box", 30, "LOC_04",
                currentSimulatedTime.minusMinutes(45), BookingStatus.APPROVED));

        bookingRequests.put("book_02", new BookingRequest("book_02", "recip_02", "Karuna Care Children Orphanage",
                "don_04", "Nutritious South Indian Sambar & Lemon Rice Combo", 50, "LOC_05",
                currentSimulatedTime.minusMinutes(30), BookingStatus.APPROVED));

        bookingRequests.put("book_03", new BookingRequest("book_03", "recip_03", "St. Jude Elderly Care Home",
                "don_03", "Artisan Whole Wheat Loaves & Milk Dinner Rolls", 25, "LOC_03",
                currentSimulatedTime.minusMinutes(15), BookingStatus.PENDING_REVIEW));
    }
}
