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

### 3. Real Interactive Geographical Road Map & Dijkstra Visualizer (Erode, Tamil Nadu)
- Real Leaflet-powered geographical map centered at **Erode (11.3418° N, 77.7274° E)** and surroundings (Bhavani, Perundurai, Chithode, Pallipalayam, Modakkurichi).
- Map layer switcher: OpenStreetMap streets, CartoDB clean navigation, and Esri Satellite imagery.
- 15 interconnected real-world city sectors with bidirectional weighted edges (distance in km and transit duration in minutes) tracing real roads (Brough Road, Mettur Road, Perundurai Road SH 96, Salem-Kochi Expressway NH 544, Cauvery Bridges).
- Interactive donor (👨‍🍳) and recipient (🏠) pins with rich popups, one-click Origin/Destination selection, glowing Dijkstra route highlight, and real-time animated vehicle GPS tracking with live speedometer and turn HUD.

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
   **[http://localhost:3000](http://localhost:3000)**

---

## 👥 Demo Accounts (Erode Region)

### 1. Food Donors (5 Accounts)
| Donor Name | Sector | Type | Notes |
|---|---|---|---|
| **Junior Kuppanna & Annapoorna Dining** | LOC_01 (PS Park & Manikoondu) | Multi-Cuisine Restaurant | Kongu Paneer Ghee Rice & Sambar Meal Box |
| **Hotel Oxford & Grand Palace Banquets** | LOC_02 (Central Bus Stand & Mettur Rd) | Luxury Hotel & Convention | Grand Banquet Vegetable Dum Biryani Feast |
| **Kongu & Vellalar Campus Mega Canteen** | LOC_05 (Thindal - Perundurai Rd) | Educational Canteen | South Indian Sambar & Lemon Rice Combo |
| **Sri Krishna Annadhanam Social Kitchen** | LOC_04 (Collectorate & Sampath Nagar) | Social Kitchen Trust | Moong Dal Khichdi & Mixed Veg Porridge |
| **Bake Valley Artisan Bakery** | LOC_14 (Veerappanchatram & Sathy Rd) | Bakery & Confectionery | Whole wheat loaves & dinner rolls |

### 2. Recipient Shelters (12 Accounts)
1. **Karunai Illam Destitute & Homeless Shelter** (LOC_03 - Erode Junction Railway Station)
2. **Anbu Ashram Children Orphanage** (LOC_07 - Bhavani Kooduthurai)
3. **Mother Teresa Elder Care Home** (LOC_11 - Surampatti Valasu)
4. **Sneham Foundation Daily Worker Food Bank** (LOC_12 - Solar Bus Stand & Karur Rd)
5. **Nethaji Youth Guidance & Welfare Hostel** (LOC_01 - PS Park & Manikoondu)
6. **Cauvery Riverfront Community Food Pantry** (LOC_13 - Karungalpalayam Old Cauvery Bridge)
7. **Shanthi Nilayam Women & Children Refuge** (LOC_04 - District Collectorate & Sampath Nagar)
8. **Perundurai Patient Attendant Care Home** (LOC_06 - Perundurai Town & SIPCOT)
9. **Chithode Highway Migrant Support Haven** (LOC_08 - Chithode NH 544 Junction)
10. **Vellalar Students & Rural Youth Shelter** (LOC_05 - Thindal Educational Corridor)
11. **Pallipalayam Weavers Community Care Home** (LOC_09 - Pallipalayam Cauvery East Bank)
12. **Modakkurichi Rural Destitute Relief Center** (LOC_15 - Modakkurichi Agricultural Belt)

### 3. Super Admin
- **Email**: `admin@annam.org`
- Accessible directly from Door 3 on the Login Gateway.

### 4. Transport Fleet (3 Vehicles - TN-33 Erode Registered)
- **Eco-Van Alpha (EV-01)**: `TN-33-AX-2024`, Capacity 60 portions, Speed factor 1.0x, Refrigerated.
- **Kongu Express Heavy (TRK-02)**: `TN-33-TR-9988`, Capacity 150 portions, Speed factor 0.9x, Insulated.
- **Bhavani Rapid Cargo Bike (MOTO-03)**: `TN-33-BK-4512`, Capacity 30 portions, Speed factor 1.25x, Agile urban delivery.

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
