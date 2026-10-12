/**
 * Annam - Smart Food Distribution System
 * Initial Mock Dataset
 * 
 * Contains:
 * - 5 Donors (Restaurants, Hotels, College Canteens, Caterers, Bakeries)
 * - 12 Recipients (Shelters, Orphanages, Community Centers, Food Banks)
 * - 1 Super Admin
 * - 3 Transport Vehicles with varied portion capacities
 * - Pre-loaded food donations (Pending, Approved, Available)
 * - Sample bookings
 */

function getFutureIsoString(hoursAhead) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + Math.round(hoursAhead * 60));
  return d.toISOString();
}

function getPastIsoString(hoursAgo) {
  const d = new Date();
  d.setMinutes(d.getMinutes() - Math.round(hoursAgo * 60));
  return d.toISOString();
}

const INITIAL_DONORS = [
  {
    id: 'donor_01',
    name: 'Spice Garden Restaurant',
    type: 'Restaurant',
    email: 'spicegarden@annam.org',
    phone: '+91 98450 11223',
    locationId: 'LOC_01',
    address: '42 Central Boulevard, City Center',
    contactPerson: 'Chef Raghavendra Rao',
    fssaiLicense: 'FSSAI-11223344556677',
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    description: 'Specializes in North Indian curries, steamed rice, and tandoori breads.'
  },
  {
    id: 'donor_02',
    name: 'Royal Palace Hotel & Banquets',
    type: 'Luxury Hotel',
    email: 'royalpalace@annam.org',
    phone: '+91 98450 22334',
    locationId: 'LOC_08',
    address: '108 Grand Avenue Boulevard',
    contactPerson: 'Meera Nambiar (F&B Director)',
    fssaiLicense: 'FSSAI-22334455667788',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
    description: 'Premium buffet and banquet surplus from weddings and corporate summits.'
  },
  {
    id: 'donor_03',
    name: 'Green Leaf College Canteen',
    type: 'Educational Institution',
    email: 'greenleaf@annam.org',
    phone: '+91 98450 33445',
    locationId: 'LOC_07',
    address: 'University Campus, Gate 4',
    contactPerson: 'Prof. Ananya Sen',
    fssaiLicense: 'FSSAI-33445566778899',
    avatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    description: 'High-volume wholesome vegetarian lunch meals, dal, rotis, and seasonal vegetables.'
  },
  {
    id: 'donor_04',
    name: 'Annapurna Community Kitchen',
    type: 'Catering & Social Kitchen',
    email: 'annapurna@annam.org',
    phone: '+91 98450 44556',
    locationId: 'LOC_03',
    address: '15 North Market Square',
    contactPerson: 'Kalyan Sundaram',
    fssaiLicense: 'FSSAI-44556677889900',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    description: 'Large-pot nutritious khichdi, sambar rice, and vegetable pulao.'
  },
  {
    id: 'donor_05',
    name: 'Metro Artisan Bakery',
    type: 'Bakery & Confectionery',
    email: 'metrobakery@annam.org',
    phone: '+91 98450 55667',
    locationId: 'LOC_06',
    address: '77 West End Commercial Road',
    contactPerson: 'Zoya Fernandes',
    fssaiLicense: 'FSSAI-55667788990011',
    avatar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    description: 'Whole wheat bread loaves, dinner rolls, buns, and baked tea cakes.'
  }
];

const INITIAL_RECIPIENTS = [
  {
    id: 'recip_01',
    name: 'Hope Shelter for Homeless',
    category: 'Homeless Shelter',
    email: 'hope@annam.org',
    phone: '+91 97400 11001',
    locationId: 'LOC_04',
    address: '12 South Riverside Road',
    capacity: 85,
    coordinator: 'Sister Teresa Maria',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_02',
    name: 'Karuna Care Children Orphanage',
    category: 'Orphanage & Child Welfare',
    email: 'karuna@annam.org',
    phone: '+91 97400 11002',
    locationId: 'LOC_05',
    address: '88 East Gate Cross',
    capacity: 65,
    coordinator: 'Dr. Vigneshwar',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_03',
    name: 'St. Jude Elderly Care Home',
    category: 'Elderly Care',
    email: 'stjude@annam.org',
    phone: '+91 97400 11003',
    locationId: 'LOC_03',
    address: '3 North Market Lane',
    capacity: 45,
    coordinator: 'Father Thomas',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_04',
    name: 'Sneha Community Relief Foundation',
    category: 'Community Center',
    email: 'sneha@annam.org',
    phone: '+91 97400 11004',
    locationId: 'LOC_13',
    address: 'Suburban Colony Sector 2',
    capacity: 100,
    coordinator: 'Lakshmi Narayan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_05',
    name: 'Anandha Nilayam Youth Shelter',
    category: 'Youth Shelter',
    email: 'anandha@annam.org',
    phone: '+91 97400 11005',
    locationId: 'LOC_01',
    address: '5 Civic Lane, Central City Center',
    capacity: 50,
    coordinator: 'Praveen Chander',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_06',
    name: 'Shanti Peace Food Pantry',
    category: 'Food Pantry',
    email: 'shanti@annam.org',
    phone: '+91 97400 11006',
    locationId: 'LOC_10',
    address: 'Midtown Crossway Transit Block',
    capacity: 70,
    coordinator: 'Sardar Manpreet Singh',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_07',
    name: 'Sunrise Women & Child Refuge',
    category: "Women's Shelter",
    email: 'sunrise@annam.org',
    phone: '+91 97400 11007',
    locationId: 'LOC_09',
    address: '19 Heritage Square, Old City',
    capacity: 40,
    coordinator: 'Bhavani Shankar',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_08',
    name: 'Grace Children Hope Home',
    category: 'Children Foster Care',
    email: 'grace@annam.org',
    phone: '+91 97400 11008',
    locationId: 'LOC_11',
    address: 'Hill View Ridge 2',
    capacity: 35,
    coordinator: 'Rosemary David',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_09',
    name: 'Mission Mercy Relief Center',
    category: 'Migrant Support Hub',
    email: 'mercy@annam.org',
    phone: '+91 97400 11009',
    locationId: 'LOC_12',
    address: 'Industrial Logistic Yard 5',
    capacity: 120,
    coordinator: 'Balwinder Dhillon',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_10',
    name: 'Navjeevan Student Pantry',
    category: 'Student Welfare Pantry',
    email: 'navjeevan@annam.org',
    phone: '+91 97400 11010',
    locationId: 'LOC_07',
    address: 'University Campus North Annex',
    capacity: 60,
    coordinator: 'Aditya Vardhan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_11',
    name: 'Mother Teresa Destitute Home',
    category: 'Destitute Shelter',
    email: 'motherteresa@annam.org',
    phone: '+91 97400 11011',
    locationId: 'LOC_08',
    address: 'Grand Avenue South Wing',
    capacity: 65,
    coordinator: 'Sister Agnes',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_12',
    name: 'Sevak Kendra Crisis Haven',
    category: 'Crisis Relief Haven',
    email: 'sevak@annam.org',
    phone: '+91 97400 11012',
    locationId: 'LOC_06',
    address: 'West End Sector 4',
    capacity: 55,
    coordinator: 'Gopal Krishnan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_ADMIN = {
  id: 'admin_01',
  name: 'Annam Super Admin Operations',
  role: 'SUPER_ADMIN',
  email: 'admin@annam.org',
  phone: '+91 98000 00001',
  title: 'City Food Distribution Director'
};

const INITIAL_VEHICLES = [
  {
    id: 'veh_01',
    name: 'Eco-Van Alpha (EV-01)',
    plateNumber: 'KA-01-EV-2024',
    type: 'Electric Refrigerated Van',
    capacityPortions: 60,
    status: 'Available', // Available, In-Transit, Maintenance
    currentLocationId: 'LOC_01',
    speedMultiplier: 1.0,
    driverName: 'Ramesh Kumar',
    driverPhone: '+91 99001 23456',
    temperatureControlled: true
  },
  {
    id: 'veh_02',
    name: 'City Express Heavy (TRK-02)',
    plateNumber: 'KA-01-TR-9988',
    type: 'Medium Insulated Truck',
    capacityPortions: 150,
    status: 'Available',
    currentLocationId: 'LOC_10',
    speedMultiplier: 0.9,
    driverName: 'Suresh Patel',
    driverPhone: '+91 99002 34567',
    temperatureControlled: true
  },
  {
    id: 'veh_03',
    name: 'Rapid Cargo Bike (MOTO-03)',
    plateNumber: 'KA-01-BK-4512',
    type: 'Rapid Cargo E-Bike',
    capacityPortions: 30,
    status: 'Available',
    currentLocationId: 'LOC_06',
    speedMultiplier: 1.25,
    driverName: 'Vikram Das',
    driverPhone: '+91 99003 45678',
    temperatureControlled: false
  }
];

const INITIAL_DONATIONS = [
  {
    id: 'don_01',
    donorId: 'donor_01',
    donorName: 'Spice Garden Restaurant',
    foodName: 'Paneer Butter Masala & Jeera Rice Meal Box',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 50,
    portionsRemaining: 50,
    qualityCondition: 'Freshly Prepared Hot Food',
    preparationDateTime: getPastIsoString(1.5),
    useByDateTime: getFutureIsoString(5.5),
    pickupLocationId: 'LOC_01',
    status: 'Approved', // Approved -> Visible to recipients
    dietary: 'Vegetarian',
    storageReq: 'Keep Warm (>65°C)',
    notes: 'Packed in food-grade foil containers with disposable cutlery.'
  },
  {
    id: 'don_02',
    donorId: 'donor_02',
    donorName: 'Royal Palace Hotel & Banquets',
    foodName: 'Grand Banquet Dum Biryani & Dal Makhani Feast',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 120,
    portionsRemaining: 120,
    qualityCondition: 'Pristine Surplus Buffet Food',
    preparationDateTime: getPastIsoString(2),
    useByDateTime: getFutureIsoString(6.0),
    pickupLocationId: 'LOC_08',
    status: 'Approved',
    dietary: 'Vegetarian & Halal Non-Veg options separated',
    storageReq: 'Insulated Hot Container',
    notes: 'Surplus from high-profile corporate seminar. Inspected by executive chef.'
  },
  {
    id: 'don_03',
    donorId: 'donor_05',
    donorName: 'Metro Artisan Bakery',
    foodName: 'Artisan Whole Wheat Loaves & Milk Dinner Rolls',
    category: 'Bakery & Breads',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 40,
    portionsRemaining: 40,
    qualityCondition: 'Oven-Fresh Today',
    preparationDateTime: getPastIsoString(3),
    useByDateTime: getFutureIsoString(24.0),
    pickupLocationId: 'LOC_06',
    status: 'Approved',
    dietary: 'Vegetarian (Eggless)',
    storageReq: 'Ambient / Dry Storage',
    notes: 'Sealed kraft paper bags. 20 whole loaves and 80 fresh soft buns.'
  },
  {
    id: 'don_04',
    donorId: 'donor_03',
    donorName: 'Green Leaf College Canteen',
    foodName: 'Nutritious South Indian Sambar & Lemon Rice Combo',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 75,
    portionsRemaining: 75,
    qualityCondition: 'Fresh Lunch Surplus',
    preparationDateTime: getPastIsoString(1),
    useByDateTime: getFutureIsoString(4.0),
    pickupLocationId: 'LOC_07',
    status: 'Pending', // Pending super admin approval!
    dietary: 'Pure Vegetarian',
    storageReq: 'Keep Warm',
    notes: 'Cooked fresh at 12:30 PM for campus afternoon rush.'
  },
  {
    id: 'don_05',
    donorId: 'donor_04',
    donorName: 'Annapurna Community Kitchen',
    foodName: 'Moong Dal Khichdi & Mixed Vegetable Porridge',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 60,
    portionsRemaining: 60,
    qualityCondition: 'Freshly Prepared and Sealed',
    preparationDateTime: getPastIsoString(0.5),
    useByDateTime: getFutureIsoString(0.6), // Tight 36-min use-by window for testing rejection/infeasible timing
    pickupLocationId: 'LOC_03',
    status: 'Approved',
    dietary: 'Vegetarian / Low Spice',
    storageReq: 'Keep Warm',
    notes: 'Ideal for elderly residents or children shelters.'
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bk_01',
    donationId: 'don_01',
    recipientId: 'recip_01',
    recipientName: 'Hope Shelter for Homeless',
    portionsRequested: 25,
    status: 'Pending', // Pending Admin Allocation review
    deliveryLocationId: 'LOC_04',
    createdAt: getPastIsoString(0.5),
    specialInstructions: 'Please deliver to rear kitchen receiving dock.',
    rejectionReason: null,
    vehicleId: null,
    routeMetrics: null
  }
];

module.exports = {
  INITIAL_DONORS,
  INITIAL_RECIPIENTS,
  INITIAL_ADMIN,
  INITIAL_VEHICLES,
  INITIAL_DONATIONS,
  INITIAL_BOOKINGS,
  getFutureIsoString,
  getPastIsoString
};
