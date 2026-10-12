# Annam – Smart Food Distribution and Food Waste Reduction System

**Annam** is an intelligent food redistribution and logistics web platform connecting commercial food surplus providers (restaurants, hotels, college canteens, bakeries) with community shelters and food banks.

The platform combines **multi-constraint feasibility validation** with **Dijkstra's shortest-path algorithm** on an urban road network to guarantee food safety, prevent over-allocation, and maximize delivery efficiency.

---

## 🌟 Key Features

### 1. 3-Door Role Gateway (Light-Colored Modern UI)
- **Food Donor Portal**: Quick-switch or login as 5 registered commercial donors (restaurants, luxury banquets, university canteens, bakeries). List food with portion counts, condition, preparation times, strict use-by timestamps, and pickup sectors.
- **Recipient Shelter Portal**: Access for 12 verified shelters and community centers. Browse approved donations, filter by category/location, sort by earliest use-by time or nearest donor via Dijkstra distance, and request portions.
- **Super Admin Operations Center**: Unified logistics command dashboard. Approve/reject donations, run the multi-constraint feasibility wizard with vehicle allocation, monitor delivery fleet, and view distribution metrics (portions saved, kg food rescued, CO₂ emissions prevented).

### 2. Multi-Constraint Allocation & Feasibility Engine
The Super Admin cannot arbitrarily approve a booking. The engine validates:
1. **Portion Availability**: Demanded portions $\le$ Remaining portions (prevents over-allocation).
2. **Vehicle Capacity**: Vehicle capacity $\ge$ Demanded portions.
3. **Route Existence**: Shortest path calculated via Dijkstra algorithm on a 15-node road graph.
4. **Strict Perishability Threshold**:
   $$\text{Earliest Start} = \max(\text{Current Time}, \text{Prep Time})$$
   $$\text{Total Mission Time} = \text{Pickup Buffer (15m)} + \text{Transit Time} + \text{Handover Buffer (10m)}$$
   $$\text{Estimated Completion} = \text{Earliest Start} + \text{Total Mission Time}$$
   $$\text{Feasible} \iff \text{Estimated Completion} < \text{Use-By Deadline}$$

### 3. Interactive Road Graph & Dijkstra Visualizer
- 15 interconnected city sectors with bidirectional weighted edges (distance in km and transit duration in minutes).
- Interactive Canvas map with node halos, route highlighting, animated transit particles, and step-by-step turn-by-turn road segment breakdowns.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended; tested on v24)
- npm

### Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   *(Or for auto-reload during development: `npm run dev`)*

3. **Open the application**:
   Open your browser and navigate to:
   **[http://localhost:5000](http://localhost:5000)**

---

## 👥 Demo Accounts

### 1. Food Donors (5 Accounts)
| Donor Name | Sector | Type | Notes |
|---|---|---|---|
| **Spice Garden Restaurant** | LOC_01 (City Center) | Multi-Cuisine Dining | Meal boxes, curries, jeera rice |
| **Royal Palace Hotel & Banquets** | LOC_08 (Grand Avenue) | Luxury Hotel & Banquet | High-volume buffet feast surplus |
| **Green Leaf College Canteen** | LOC_07 (University Campus) | Educational Canteen | Lunch surplus, sambar & rice combos |
| **Annapurna Community Kitchen** | LOC_03 (North Market) | Catering & Social Kitchen | Nutritious khichdi & porridge |
| **Metro Artisan Bakery** | LOC_06 (West End) | Bakery & Confectionery | Whole wheat loaves & dinner rolls |

### 2. Recipient Shelters (12 Accounts)
1. **Hope Shelter for Homeless** (LOC_04 - South Riverside)
2. **Karuna Care Children Orphanage** (LOC_05 - East Gate)
3. **St. Jude Elderly Care Home** (LOC_03 - North Market)
4. **Sneha Community Relief Foundation** (LOC_13 - Suburban Colony)
5. **Anandha Nilayam Youth Shelter** (LOC_01 - City Center)
6. **Shanti Peace Food Pantry** (LOC_10 - Midtown)
7. **Sunrise Women & Child Refuge** (LOC_09 - Old Heritage)
8. **Grace Children Hope Home** (LOC_11 - Hill View)
9. **Mission Mercy Relief Center** (LOC_12 - Industrial Zone)
10. **Navjeevan Student Pantry** (LOC_07 - University)
11. **Mother Teresa Destitute Home** (LOC_08 - Grand Avenue)
12. **Sevak Kendra Crisis Haven** (LOC_06 - West End)

### 3. Super Admin
- **Email**: `admin@annam.org`
- Accessible directly from Door 3 on the Login Gateway.

### 4. Transport Fleet (3 Vehicles)
- **Eco-Van Alpha (EV-01)**: Capacity 60 portions, Speed factor 1.0x, Refrigerated.
- **City Express Heavy (TRK-02)**: Capacity 150 portions, Speed factor 0.9x, Insulated.
- **Rapid Cargo Bike (MOTO-03)**: Capacity 30 portions, Speed factor 1.25x, Agile urban delivery.

---

## 🧪 Step-by-Step Testing Walkthrough

1. **Test Donor Listing**:
   - On the Gateway, select **Spice Garden Restaurant** and click **Enter as Food Donor**.
   - Fill the **List Surplus Food Donation** form, pick "+6h" use-by deadline, and click **Submit Food Donation**.
   - Note that the newly created donation is marked `Pending` (awaiting admin verification).

2. **Test Admin Review & Feasibility Simulation**:
   - Click **🚪 Switch / Logout** in the header, then click **Enter as Super Admin**.
   - Under **Donation Approval Queue**, click **✓ Approve** on the pending donation.
   - Switch to **Booking Allocation Wizard**, find a pending booking, and click **⚡ Evaluate & Allocate**.
   - Choose a vehicle (e.g. `Eco-Van Alpha`) and click **Run Feasibility Simulation**.
   - Observe the multi-constraint check: Demand vs Stock, Vehicle Capacity, Dijkstra Route, and Perishability Deadline margin.
   - Click **✓ Approve & Allocate Delivery**. The delivery route will be locked and highlighted on the map!

3. **Test Recipient Catalog & Request**:
   - Log out and click **Enter as Recipient Shelter** (e.g. Hope Shelter).
   - Browse the catalog, filter by category or sort by **Nearest Donor (Dijkstra Distance)**.
   - Click **🍽️ Request Portions** on any approved food item. Enter portions needed and confirm.

4. **Test Dijkstra Interactive Map**:
   - Scroll to the **Urban Road Graph & Dijkstra Shortest Path Engine** section.
   - Select any Origin (e.g. `LOC_01 - City Center`) and Destination (e.g. `LOC_12 - Industrial Zone`).
   - Click **⚡ Calculate Dijkstra Route**. Observe the shortest path illuminated in green on the canvas and read the exact kilometers, transit duration, and hop sequence.

---

## 📚 Academic & Java Documentation
For your academic project and pure Java console application implementation, refer to:
**[ARCHITECTURE_AND_JAVA_GUIDE.md](ARCHITECTURE_AND_JAVA_GUIDE.md)**
which contains full Java class designs, Dijkstra `PriorityQueue` implementation, and business rule formulas.
