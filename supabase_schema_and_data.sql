-- =====================================================================
-- Annam - Smart Food Distribution and Waste Reduction System
-- Complete Supabase (PostgreSQL) Schema & Initial Dataset
-- Project: https://supabase.com/dashboard/project/swflvqzzcvkwfgmmjmeo
-- =====================================================================

-- Clean up existing tables if they exist
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS delivery_vehicles CASCADE;
DROP TABLE IF EXISTS recipients CASCADE;
DROP TABLE IF EXISTS donors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS road_edges CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- 1. LOCATIONS TABLE (15 City Sector Nodes for Dijkstra Graph)
CREATE TABLE locations (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    sector VARCHAR(60) NOT NULL,
    x_coord INT NOT NULL,
    y_coord INT NOT NULL,
    description TEXT
);

-- 2. ROAD EDGES TABLE (Weighted Graph Connections for Dijkstra Routing)
CREATE TABLE road_edges (
    id SERIAL PRIMARY KEY,
    from_id VARCHAR(20) REFERENCES locations(id) ON DELETE CASCADE,
    to_id VARCHAR(20) REFERENCES locations(id) ON DELETE CASCADE,
    distance_km NUMERIC(5,2) NOT NULL,
    time_minutes INT NOT NULL
);

-- 3. USERS / AUTH GATEWAY TABLE
CREATE TABLE users (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('DONOR', 'RECIPIENT', 'SUPER_ADMIN')),
    entity_id VARCHAR(40)
);

-- 4. DONORS TABLE (5 Commercial Providers)
CREATE TABLE donors (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    type VARCHAR(80) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(30),
    location_id VARCHAR(20) REFERENCES locations(id),
    address TEXT,
    contact_person VARCHAR(100),
    fssai_license VARCHAR(60),
    avatar TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RECIPIENTS TABLE (12 Verified Community Shelters & Food Banks)
CREATE TABLE recipients (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(30),
    location_id VARCHAR(20) REFERENCES locations(id),
    address TEXT,
    capacity INT DEFAULT 50,
    coordinator VARCHAR(100),
    verified BOOLEAN DEFAULT TRUE,
    avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. DELIVERY VEHICLES TABLE (Transport Fleet)
CREATE TABLE delivery_vehicles (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    plate_number VARCHAR(40) NOT NULL,
    type VARCHAR(80) NOT NULL,
    capacity_portions INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Available' CHECK (status IN ('Available', 'In-Transit', 'Maintenance')),
    current_location_id VARCHAR(20) REFERENCES locations(id),
    speed_multiplier NUMERIC(4,2) DEFAULT 1.0,
    driver_name VARCHAR(100),
    driver_phone VARCHAR(30),
    temperature_controlled BOOLEAN DEFAULT TRUE
);

-- 7. DONATIONS TABLE (Surplus Food Batches)
CREATE TABLE donations (
    id VARCHAR(40) PRIMARY KEY,
    donor_id VARCHAR(40) REFERENCES donors(id) ON DELETE CASCADE,
    donor_name VARCHAR(150),
    food_name VARCHAR(180) NOT NULL,
    category VARCHAR(80) NOT NULL,
    photo_url TEXT,
    portions_total INT NOT NULL,
    portions_remaining INT NOT NULL,
    quality_condition VARCHAR(120),
    preparation_date_time TIMESTAMPTZ NOT NULL,
    use_by_date_time TIMESTAMPTZ NOT NULL,
    pickup_location_id VARCHAR(20) REFERENCES locations(id),
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Allocated', 'Rejected', 'Expired')),
    dietary VARCHAR(100),
    storage_req VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. BOOKINGS / ALLOCATIONS TABLE
CREATE TABLE bookings (
    id VARCHAR(40) PRIMARY KEY,
    donation_id VARCHAR(40) REFERENCES donations(id) ON DELETE CASCADE,
    recipient_id VARCHAR(40) REFERENCES recipients(id) ON DELETE CASCADE,
    recipient_name VARCHAR(150),
    portions_requested INT NOT NULL,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Allocated', 'In-Transit', 'Delivered', 'Rejected')),
    delivery_location_id VARCHAR(20) REFERENCES locations(id),
    vehicle_id VARCHAR(40) REFERENCES delivery_vehicles(id),
    special_instructions TEXT,
    rejection_reason TEXT,
    route_path TEXT,
    travel_distance_km NUMERIC(5,2),
    travel_time_minutes INT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id VARCHAR(40) PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(60),
    details TEXT
);

-- =====================================================================
-- ENABLE ROW LEVEL SECURITY & PUBLIC ACCESS POLICIES
-- =====================================================================
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE road_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for locations" ON locations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for road_edges" ON road_edges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for donors" ON donors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for recipients" ON recipients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for delivery_vehicles" ON delivery_vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for donations" ON donations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for bookings" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access for audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- SEED DATA INSERTION
-- =====================================================================

-- 1. SEED LOCATIONS (15 Nodes)
INSERT INTO locations (id, name, sector, x_coord, y_coord, description) VALUES
('LOC_01', 'Central City Center', 'Downtown', 350, 250, 'Central commercial and civic plaza'),
('LOC_02', 'Downtown Commercial Hub', 'Downtown', 480, 220, 'High-density office and hotel district'),
('LOC_03', 'North Market Square', 'North', 330, 120, 'Traditional market and community hall'),
('LOC_04', 'South Riverside Park', 'South', 360, 400, 'Riverfront community and shelter zone'),
('LOC_05', 'East Gate Junction', 'East', 580, 310, 'Major transit crossway and welfare centers'),
('LOC_06', 'West End District', 'West', 180, 260, 'Residential and commercial bakery belt'),
('LOC_07', 'University Campus', 'Northwest', 190, 140, 'Higher education institutions and youth hostels'),
('LOC_08', 'Grand Avenue Boulevard', 'Northeast', 490, 110, 'Hotels, convention centers and banquets'),
('LOC_09', 'Old Heritage Quarter', 'Southwest', 240, 360, 'Dense historic quarter with relief homes'),
('LOC_10', 'Midtown Crossway', 'Central-East', 430, 320, 'Centrally accessible transit nexus'),
('LOC_11', 'Hill View Enclave', 'Far Northwest', 110, 80, 'Outlying community shelters and care homes'),
('LOC_12', 'Industrial Logistic Zone', 'Far Southeast', 620, 430, 'Warehouses and migrant worker communities'),
('LOC_13', 'Suburban Colony West', 'Far Southwest', 120, 430, 'Suburban outreach and family relief trusts'),
('LOC_14', 'Tech Park Innovation Hub', 'East Outer', 600, 180, 'Corporate canteens and tech campuses'),
('LOC_15', 'Harbor Port Terminal', 'South Coast', 470, 460, 'Coastal distribution and community kitchens');

-- 2. SEED ROAD EDGES (23 Bidirectional Connections)
INSERT INTO road_edges (from_id, to_id, distance_km, time_minutes) VALUES
('LOC_01', 'LOC_02', 3.2, 8),
('LOC_01', 'LOC_03', 2.8, 7),
('LOC_01', 'LOC_06', 3.5, 9),
('LOC_01', 'LOC_10', 2.5, 6),
('LOC_02', 'LOC_05', 3.8, 10),
('LOC_02', 'LOC_08', 3.0, 8),
('LOC_02', 'LOC_14', 4.1, 11),
('LOC_03', 'LOC_07', 3.4, 9),
('LOC_03', 'LOC_08', 3.1, 8),
('LOC_04', 'LOC_01', 4.2, 11),
('LOC_04', 'LOC_09', 2.9, 8),
('LOC_04', 'LOC_10', 2.6, 7),
('LOC_04', 'LOC_15', 3.7, 10),
('LOC_05', 'LOC_10', 3.3, 9),
('LOC_05', 'LOC_12', 4.5, 12),
('LOC_06', 'LOC_07', 3.0, 8),
('LOC_06', 'LOC_09', 3.1, 8),
('LOC_06', 'LOC_13', 4.0, 11),
('LOC_07', 'LOC_11', 3.6, 10),
('LOC_08', 'LOC_14', 3.3, 9),
('LOC_09', 'LOC_13', 3.5, 9),
('LOC_10', 'LOC_15', 3.9, 10),
('LOC_12', 'LOC_15', 4.2, 11),
('LOC_14', 'LOC_12', 6.0, 16);

-- 3. SEED DONORS (5 Commercial Providers)
INSERT INTO donors (id, name, type, email, phone, location_id, address, contact_person, fssai_license, avatar, description) VALUES
('donor_01', 'Spice Garden Restaurant', 'Restaurant', 'spicegarden@annam.org', '+91 98450 11223', 'LOC_01', '42 Central Boulevard, City Center', 'Chef Raghavendra Rao', 'FSSAI-11223344556677', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80', 'Specializes in North Indian curries, steamed rice, and tandoori breads.'),
('donor_02', 'Royal Palace Hotel & Banquets', 'Luxury Hotel', 'royalpalace@annam.org', '+91 98450 22334', 'LOC_08', '108 Grand Avenue Boulevard', 'Meera Nambiar (F&B Director)', 'FSSAI-22334455667788', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80', 'Premium buffet and banquet surplus from weddings and corporate summits.'),
('donor_03', 'Green Leaf College Canteen', 'Educational Institution', 'greenleaf@annam.org', '+91 98450 33445', 'LOC_07', 'University Campus, Gate 4', 'Prof. Ananya Sen', 'FSSAI-33445566778899', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80', 'High-volume wholesome vegetarian lunch meals, dal, rotis, and seasonal vegetables.'),
('donor_04', 'Annapurna Community Kitchen', 'Catering & Social Kitchen', 'annapurna@annam.org', '+91 98450 44556', 'LOC_03', '15 North Market Square', 'Kalyan Sundaram', 'FSSAI-44556677889900', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80', 'Large-pot nutritious khichdi, sambar rice, and vegetable pulao.'),
('donor_05', 'Metro Artisan Bakery', 'Bakery & Confectionery', 'metrobakery@annam.org', '+91 98450 55667', 'LOC_06', '77 West End Commercial Road', 'Zoya Fernandes', 'FSSAI-55667788990011', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80', 'Whole wheat bread loaves, dinner rolls, buns, and baked tea cakes.');

-- 4. SEED RECIPIENTS (12 Shelters)
INSERT INTO recipients (id, name, category, email, phone, location_id, address, capacity, coordinator, verified, avatar) VALUES
('recip_01', 'Hope Shelter for Homeless', 'Homeless Shelter', 'hope@annam.org', '+91 97400 11001', 'LOC_04', '12 South Riverside Road', 85, 'Sister Teresa Maria', TRUE, 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80'),
('recip_02', 'Karuna Care Children Orphanage', 'Orphanage & Child Welfare', 'karuna@annam.org', '+91 97400 11002', 'LOC_05', '88 East Gate Cross', 65, 'Dr. Vigneshwar', TRUE, 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'),
('recip_03', 'St. Jude Elderly Care Home', 'Elderly Care', 'stjude@annam.org', '+91 97400 11003', 'LOC_03', '3 North Market Lane', 45, 'Father Thomas', TRUE, 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=150&auto=format&fit=crop&q=80'),
('recip_04', 'Sneha Community Relief Foundation', 'Community Center', 'sneha@annam.org', '+91 97400 11004', 'LOC_13', 'Suburban Colony Sector 2', 100, 'Lakshmi Narayan', TRUE, 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&auto=format&fit=crop&q=80'),
('recip_05', 'Anandha Nilayam Youth Shelter', 'Youth Shelter', 'anandha@annam.org', '+91 97400 11005', 'LOC_01', '5 Civic Lane, Central City Center', 50, 'Praveen Chander', TRUE, 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80'),
('recip_06', 'Shanti Peace Food Pantry', 'Food Pantry', 'shanti@annam.org', '+91 97400 11006', 'LOC_10', 'Midtown Crossway Transit Block', 70, 'Sardar Manpreet Singh', TRUE, 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=150&auto=format&fit=crop&q=80'),
('recip_07', 'Sunrise Women & Child Refuge', 'Women''s Shelter', 'sunrise@annam.org', '+91 97400 11007', 'LOC_09', '19 Heritage Square, Old City', 40, 'Bhavani Shankar', TRUE, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'),
('recip_08', 'Grace Children Hope Home', 'Children Foster Care', 'grace@annam.org', '+91 97400 11008', 'LOC_11', 'Hill View Ridge 2', 35, 'Rosemary David', TRUE, 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=150&auto=format&fit=crop&q=80'),
('recip_09', 'Mission Mercy Relief Center', 'Migrant Support Hub', 'mercy@annam.org', '+91 97400 11009', 'LOC_12', 'Industrial Logistic Yard 5', 120, 'Balwinder Dhillon', TRUE, 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80'),
('recip_10', 'Navjeevan Student Pantry', 'Student Welfare Pantry', 'navjeevan@annam.org', '+91 97400 11010', 'LOC_07', 'University Campus North Annex', 60, 'Aditya Vardhan', TRUE, 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=80'),
('recip_11', 'Mother Teresa Destitute Home', 'Destitute Shelter', 'motherteresa@annam.org', '+91 97400 11011', 'LOC_08', 'Grand Avenue South Wing', 65, 'Sister Agnes', TRUE, 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=150&auto=format&fit=crop&q=80'),
('recip_12', 'Sevak Kendra Crisis Haven', 'Crisis Relief Haven', 'sevak@annam.org', '+91 97400 11012', 'LOC_06', 'West End Sector 4', 55, 'Gopal Krishnan', TRUE, 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&auto=format&fit=crop&q=80');

-- 5. SEED USERS / AUTH PROFILES
INSERT INTO users (id, name, email, role, entity_id) VALUES
('usr_admin', 'Annam Super Admin Operations', 'admin@annam.org', 'SUPER_ADMIN', 'admin_01'),
('usr_d01', 'Spice Garden Restaurant', 'spicegarden@annam.org', 'DONOR', 'donor_01'),
('usr_d02', 'Royal Palace Hotel & Banquets', 'royalpalace@annam.org', 'DONOR', 'donor_02'),
('usr_d03', 'Green Leaf College Canteen', 'greenleaf@annam.org', 'DONOR', 'donor_03'),
('usr_d04', 'Annapurna Community Kitchen', 'annapurna@annam.org', 'DONOR', 'donor_04'),
('usr_d05', 'Metro Artisan Bakery', 'metrobakery@annam.org', 'DONOR', 'donor_05'),
('usr_r01', 'Hope Shelter for Homeless', 'hope@annam.org', 'RECIPIENT', 'recip_01'),
('usr_r02', 'Karuna Care Children Orphanage', 'karuna@annam.org', 'RECIPIENT', 'recip_02'),
('usr_r03', 'St. Jude Elderly Care Home', 'stjude@annam.org', 'RECIPIENT', 'recip_03'),
('usr_r04', 'Sneha Community Relief Foundation', 'sneha@annam.org', 'RECIPIENT', 'recip_04'),
('usr_r05', 'Anandha Nilayam Youth Shelter', 'anandha@annam.org', 'RECIPIENT', 'recip_05'),
('usr_r06', 'Shanti Peace Food Pantry', 'shanti@annam.org', 'RECIPIENT', 'recip_06'),
('usr_r07', 'Sunrise Women & Child Refuge', 'sunrise@annam.org', 'RECIPIENT', 'recip_07'),
('usr_r08', 'Grace Children Hope Home', 'grace@annam.org', 'RECIPIENT', 'recip_08'),
('usr_r09', 'Mission Mercy Relief Center', 'mercy@annam.org', 'RECIPIENT', 'recip_09'),
('usr_r10', 'Navjeevan Student Pantry', 'navjeevan@annam.org', 'RECIPIENT', 'recip_10'),
('usr_r11', 'Mother Teresa Destitute Home', 'motherteresa@annam.org', 'RECIPIENT', 'recip_11'),
('usr_r12', 'Sevak Kendra Crisis Haven', 'sevak@annam.org', 'RECIPIENT', 'recip_12');

-- 6. SEED DELIVERY FLEET (3 Vehicles)
INSERT INTO delivery_vehicles (id, name, plate_number, type, capacity_portions, status, current_location_id, speed_multiplier, driver_name, driver_phone, temperature_controlled) VALUES
('veh_01', 'Eco-Van Alpha (EV-01)', 'KA-01-EV-2024', 'Electric Refrigerated Van', 60, 'Available', 'LOC_01', 1.00, 'Ramesh Kumar', '+91 99001 23456', TRUE),
('veh_02', 'City Express Heavy (TRK-02)', 'KA-01-TR-9988', 'Medium Insulated Truck', 150, 'Available', 'LOC_10', 0.90, 'Suresh Patel', '+91 99002 34567', TRUE),
('veh_03', 'Rapid Cargo Bike (MOTO-03)', 'KA-01-BK-4512', 'Rapid Cargo E-Bike', 30, 'Available', 'LOC_06', 1.25, 'Vikram Das', '+91 99003 45678', FALSE);

-- 7. SEED FOOD DONATIONS (5 Surplus Batches with dynamic deadlines)
INSERT INTO donations (id, donor_id, donor_name, food_name, category, photo_url, portions_total, portions_remaining, quality_condition, preparation_date_time, use_by_date_time, pickup_location_id, status, dietary, storage_req, notes) VALUES
('don_01', 'donor_01', 'Spice Garden Restaurant', 'Paneer Butter Masala & Jeera Rice Meal Box', 'Cooked Meals', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80', 50, 50, 'Freshly Prepared Hot Food', NOW() - INTERVAL '1 hour 30 minutes', NOW() + INTERVAL '5 hours 30 minutes', 'LOC_01', 'Approved', 'Vegetarian', 'Keep Warm (>65°C)', 'Packed in food-grade foil containers with disposable cutlery.'),
('don_02', 'donor_02', 'Royal Palace Hotel & Banquets', 'Grand Banquet Dum Biryani & Dal Makhani Feast', 'Cooked Meals', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80', 120, 120, 'Pristine Surplus Buffet Food', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '6 hours', 'LOC_08', 'Approved', 'Vegetarian & Halal Non-Veg options separated', 'Insulated Hot Container', 'Surplus from high-profile corporate seminar. Inspected by executive chef.'),
('don_03', 'donor_05', 'Metro Artisan Bakery', 'Artisan Whole Wheat Loaves & Milk Dinner Rolls', 'Bakery & Breads', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80', 40, 40, 'Oven-Fresh Today', NOW() - INTERVAL '3 hours', NOW() + INTERVAL '24 hours', 'LOC_06', 'Approved', 'Vegetarian (Eggless)', 'Ambient / Dry Storage', 'Sealed kraft paper bags. 20 whole loaves and 80 fresh soft buns.'),
('don_04', 'donor_03', 'Green Leaf College Canteen', 'Nutritious South Indian Sambar & Lemon Rice Combo', 'Cooked Meals', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=80', 75, 75, 'Fresh Lunch Surplus', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '4 hours', 'LOC_07', 'Pending', 'Pure Vegetarian', 'Keep Warm', 'Cooked fresh at 12:30 PM for campus afternoon rush.'),
('don_05', 'donor_04', 'Annapurna Community Kitchen', 'Moong Dal Khichdi & Mixed Vegetable Porridge', 'Cooked Meals', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80', 60, 60, 'Freshly Prepared and Sealed', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '40 minutes', 'LOC_03', 'Approved', 'Vegetarian / Low Spice', 'Keep Warm', 'Ideal for elderly residents or children shelters.');

-- 8. SEED BOOKING REQUEST (Sample Booking)
INSERT INTO bookings (id, donation_id, recipient_id, recipient_name, portions_requested, status, delivery_location_id, special_instructions) VALUES
('bk_01', 'don_01', 'recip_01', 'Hope Shelter for Homeless', 25, 'Pending', 'LOC_04', 'Please deliver to rear kitchen receiving dock.');

-- 9. SEED AUDIT LOG
INSERT INTO audit_logs (id, timestamp, action, entity_type, details) VALUES
('log_01', NOW(), 'SYSTEM_INITIALIZED', 'SYSTEM', 'Annam smart food distribution database populated with 15 graph locations, 23 road segments, 5 donors, 12 recipients, and 3 fleet vehicles.');
