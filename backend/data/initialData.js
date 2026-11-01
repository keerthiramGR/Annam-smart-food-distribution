/**
 * Annam - Smart Food Distribution System
 * Initial Mock Dataset - Erode City & Surroundings Region
 * 
 * Contains:
 * - 5 Food Donors in Erode (Restaurants, Banquets, College Canteens, Annadhanam Kitchens, Bakeries)
 * - 12 Recipient Shelters in Erode & Surroundings (Homeless Shelters, Orphanages, Elder Care, Migrant Centers)
 * - 1 Super Admin (Erode Food Redistribution Operations Command)
 * - 3 Transport Vehicles (TN-33 Erode RTO Registered: EV-Van, Heavy Truck, Rapid E-Bike)
 * - Pre-loaded food donations & sample bookings
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
    name: 'Junior Kuppanna & Annapoorna Dining',
    type: 'Multi-Cuisine Restaurant',
    email: 'kuppanna@annam.org',
    phone: '+91 94432 11223',
    locationId: 'LOC_01', // PS Park & Manikoondu
    address: '14 Netaji Road, PS Park Circle, Erode Central',
    contactPerson: 'Chef Raghavan Murugesan',
    fssaiLicense: 'FSSAI-33018001002341',
    avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=150&auto=format&fit=crop&q=80',
    description: 'Renowned Erode dining brand specializing in South Indian meals, jeera rice, veg gravies, and meal boxes.'
  },
  {
    id: 'donor_02',
    name: 'Hotel Oxford & Grand Palace Banquets',
    type: 'Luxury Hotel & Convention Center',
    email: 'oxfordbanquets@annam.org',
    phone: '+91 94432 22334',
    locationId: 'LOC_02', // Central Bus Stand & Mettur Road
    address: '88 Mettur Road, Near Central Bus Stand, Erode',
    contactPerson: 'Senthil Kumar (F&B Director)',
    fssaiLicense: 'FSSAI-33018002003452',
    avatar: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150&auto=format&fit=crop&q=80',
    description: 'Surplus hot buffet and banquet feasts from corporate conferences, textile expos, and wedding receptions.'
  },
  {
    id: 'donor_03',
    name: 'Kongu & Vellalar Campus Mega Canteen',
    type: 'Educational Institution Canteen',
    email: 'vellalarcanteen@annam.org',
    phone: '+91 94432 33445',
    locationId: 'LOC_05', // Thindal (Perundurai Road)
    address: 'Vellalar Educational Complex, Thindal Hill, Perundurai Road, Erode',
    contactPerson: 'Prof. K. Thangavel',
    fssaiLicense: 'FSSAI-33018003004563',
    avatar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=150&auto=format&fit=crop&q=80',
    description: 'Nutritious wholesome campus meals, sambar rice combos, lemon rice, chapatis, and fresh vegetable kootu.'
  },
  {
    id: 'donor_04',
    name: 'Sri Krishna Annadhanam Social Kitchen',
    type: 'Catering & Social Kitchen Trust',
    email: 'annadhanam@annam.org',
    phone: '+91 94432 44556',
    locationId: 'LOC_04', // District Collectorate & Sampath Nagar
    address: '22 Collectorate Avenue, Sampath Nagar, Erode',
    contactPerson: 'Kalyana Sundaram Iyer',
    fssaiLicense: 'FSSAI-33018004005674',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80',
    description: 'Large-pot wholesome pure vegetarian khichdi, bisibelebath, dal rasam rice, and steamed idlis.'
  },
  {
    id: 'donor_05',
    name: 'Bake Valley Artisan Bakery',
    type: 'Bakery & Confectionery',
    email: 'bakevalley@annam.org',
    phone: '+91 94432 55667',
    locationId: 'LOC_14', // Veerappanchatram & Sathy Road
    address: '45 Sathy Main Road, Veerappanchatram, Erode',
    contactPerson: 'Priya Dharshini',
    fssaiLicense: 'FSSAI-33018005006785',
    avatar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
    description: 'Fresh whole wheat loaves, buns, butter dinner rolls, and packaged rusks for community shelters.'
  }
];

const INITIAL_RECIPIENTS = [
  {
    id: 'recip_01',
    name: 'Karunai Illam Destitute & Homeless Shelter',
    category: 'Homeless Shelter',
    email: 'karunai@annam.org',
    phone: '+91 98427 11001',
    locationId: 'LOC_03', // Erode Junction Railway Station
    address: 'Railway Station Colony South Gate, Erode Junction',
    capacity: 90,
    coordinator: 'Sister Arul Mary',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_02',
    name: 'Anbu Ashram Children Orphanage',
    category: 'Orphanage & Child Welfare',
    email: 'anbuashram@annam.org',
    phone: '+91 98427 11002',
    locationId: 'LOC_07', // Bhavani Kooduthurai
    address: 'Bhavani Riverbank Road, Near Sangameswarar Temple, Bhavani',
    capacity: 65,
    coordinator: 'Dr. R. Vigneshwar',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_03',
    name: 'Mother Teresa Elder Care Home',
    category: 'Elderly Care & Hospice',
    email: 'motherteresa.erode@annam.org',
    phone: '+91 98427 11003',
    locationId: 'LOC_11', // Surampatti Valasu
    address: '18 Gandhiji Street, Surampatti Valasu, Erode',
    capacity: 50,
    coordinator: 'Mother Agnes Pushpam',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1516307365426-bea591f05011?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_04',
    name: 'Sneham Foundation Daily Worker Food Bank',
    category: 'Community Food Bank',
    email: 'sneham@annam.org',
    phone: '+91 98427 11004',
    locationId: 'LOC_12', // Solar Bus Stand
    address: 'Solar Integrated Terminal Ring Road, Karur Bypass, Erode',
    capacity: 120,
    coordinator: 'V. Lakshmi Narayanan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_05',
    name: 'Nethaji Youth Guidance & Welfare Hostel',
    category: 'Youth Shelter',
    email: 'nethaji.hostel@annam.org',
    phone: '+91 98427 11005',
    locationId: 'LOC_01', // PS Park & Manikoondu
    address: '4 Manikoondu Civic Complex, Netaji Road, Erode Central',
    capacity: 55,
    coordinator: 'Praveen Chander',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_06',
    name: 'Cauvery Riverfront Community Food Pantry',
    category: 'Food Pantry & Crisis Haven',
    email: 'cauvery.relief@annam.org',
    phone: '+91 98427 11006',
    locationId: 'LOC_13', // Karungalpalayam
    address: 'Cauvery Bridge North Bank, Karungalpalayam, Erode',
    capacity: 75,
    coordinator: 'Gopalakrishnan Nair',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_07',
    name: 'Shanthi Nilayam Women & Children Refuge',
    category: "Women & Child Refuge",
    email: 'shanthinilayam@annam.org',
    phone: '+91 98427 11007',
    locationId: 'LOC_04', // Collectorate & Sampath Nagar
    address: '15 Court Road, Sampath Nagar, Erode',
    capacity: 45,
    coordinator: 'Bhavani Shanmugam',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_08',
    name: 'Perundurai Patient Attendant Care Home',
    category: 'Patient Support Shelter',
    email: 'perundurai.care@annam.org',
    phone: '+91 98427 11008',
    locationId: 'LOC_06', // Perundurai SIPCOT
    address: 'IRTT Hospital Road, SIPCOT Phase 1, Perundurai',
    capacity: 80,
    coordinator: 'Dr. S. Karthikeyan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_09',
    name: 'Chithode Highway Migrant Support Haven',
    category: 'Migrant Support Hub',
    email: 'chithode.haven@annam.org',
    phone: '+91 98427 11009',
    locationId: 'LOC_08', // Chithode NH 544
    address: 'NH 544 Bypass Crossway, Chithode, Erode',
    capacity: 100,
    coordinator: 'Balwinder Singh',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_10',
    name: 'Vellalar Students & Rural Youth Shelter',
    category: 'Student Welfare Pantry',
    email: 'vellalar.youth@annam.org',
    phone: '+91 98427 11010',
    locationId: 'LOC_05', // Thindal
    address: 'Thindal Educational Belt, Perundurai Road, Erode',
    capacity: 60,
    coordinator: 'Aditya Vardhan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_11',
    name: 'Pallipalayam Weavers Community Care Home',
    category: 'Artisan Welfare Shelter',
    email: 'pallipalayam.care@annam.org',
    phone: '+91 98427 11011',
    locationId: 'LOC_09', // Pallipalayam
    address: 'SPB Colony Road, Pallipalayam, Cauvery RS',
    capacity: 65,
    coordinator: 'M. Natarajan',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb7?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'recip_12',
    name: 'Modakkurichi Rural Destitute Relief Center',
    category: 'Rural Support Center',
    email: 'modakkurichi.relief@annam.org',
    phone: '+91 98427 11012',
    locationId: 'LOC_15', // Modakkurichi
    address: 'Modakkurichi Main Bazaar Road, Erode District',
    capacity: 55,
    coordinator: 'Chinnasamy Gounder',
    verified: true,
    avatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=150&auto=format&fit=crop&q=80'
  }
];

const INITIAL_ADMIN = {
  id: 'admin_01',
  name: 'Annam Super Admin Operations',
  role: 'SUPER_ADMIN',
  email: 'admin@annam.org',
  phone: '+91 94422 00001',
  title: 'Erode District Food Redistribution Command Director'
};

const INITIAL_VEHICLES = [
  {
    id: 'veh_01',
    name: 'Eco-Van Alpha (EV-01)',
    plateNumber: 'TN-33-AX-2024',
    type: 'Electric Refrigerated Van',
    capacityPortions: 60,
    status: 'Available', // Available, In-Transit, Maintenance
    currentLocationId: 'LOC_01', // PS Park Depot
    speedMultiplier: 1.0,
    driverName: 'Ramesh Kumar (Erode Central)',
    driverPhone: '+91 98428 23456',
    temperatureControlled: true
  },
  {
    id: 'veh_02',
    name: 'Kongu Express Heavy (TRK-02)',
    plateNumber: 'TN-33-TR-9988',
    type: 'Medium Insulated Food Truck',
    capacityPortions: 150,
    status: 'Available',
    currentLocationId: 'LOC_02', // Central Bus Stand Depot
    speedMultiplier: 0.9,
    driverName: 'Suresh Patel (Perundurai Highway)',
    driverPhone: '+91 98428 34567',
    temperatureControlled: true
  },
  {
    id: 'veh_03',
    name: 'Bhavani Rapid Cargo Bike (MOTO-03)',
    plateNumber: 'TN-33-BK-4512',
    type: 'Agile Delivery E-Cargo Bike',
    capacityPortions: 30,
    status: 'Available',
    currentLocationId: 'LOC_14', // Veerappanchatram
    speedMultiplier: 1.25,
    driverName: 'Vikram Das (Bhavani Link)',
    driverPhone: '+91 98428 45678',
    temperatureControlled: false
  }
];

const INITIAL_DONATIONS = [
  {
    id: 'don_01',
    donorId: 'donor_01',
    donorName: 'Junior Kuppanna & Annapoorna Dining',
    foodName: 'Kongu Paneer Ghee Rice & Sambar Meal Box',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 50,
    portionsRemaining: 50,
    qualityCondition: 'Freshly Prepared Hot Food',
    preparationDateTime: getPastIsoString(1.5),
    useByDateTime: getFutureIsoString(5.5),
    pickupLocationId: 'LOC_01', // PS Park & Manikoondu
    status: 'Approved', // Approved -> Visible to recipients
    dietary: 'Vegetarian',
    storageReq: 'Keep Warm (>65°C)',
    notes: 'Packed in food-grade foil containers with disposable cutlery.'
  },
  {
    id: 'don_02',
    donorId: 'donor_02',
    donorName: 'Hotel Oxford & Grand Palace Banquets',
    foodName: 'Grand Banquet Vegetable Dum Biryani & Kurma Feast',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 120,
    portionsRemaining: 120,
    qualityCondition: 'Pristine Surplus Buffet Food',
    preparationDateTime: getPastIsoString(2),
    useByDateTime: getFutureIsoString(6.0),
    pickupLocationId: 'LOC_02', // Central Bus Stand & Mettur Road
    status: 'Approved',
    dietary: 'Pure Vegetarian',
    storageReq: 'Insulated Hot Container',
    notes: 'Surplus from textile trade summit. Inspected and sealed by head banquet chef.'
  },
  {
    id: 'don_03',
    donorId: 'donor_05',
    donorName: 'Bake Valley Artisan Bakery',
    foodName: 'Artisan Whole Wheat Loaves & Sweet Dinner Rolls',
    category: 'Bakery & Breads',
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 40,
    portionsRemaining: 40,
    qualityCondition: 'Oven-Fresh Today',
    preparationDateTime: getPastIsoString(3),
    useByDateTime: getFutureIsoString(24.0),
    pickupLocationId: 'LOC_14', // Veerappanchatram
    status: 'Approved',
    dietary: 'Vegetarian (Eggless)',
    storageReq: 'Ambient / Dry Storage',
    notes: 'Sealed kraft paper bags. 20 whole loaves and 80 fresh soft buns.'
  },
  {
    id: 'don_04',
    donorId: 'donor_03',
    donorName: 'Kongu & Vellalar Campus Mega Canteen',
    foodName: 'Nutritious South Indian Sambar & Lemon Rice Combo',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 75,
    portionsRemaining: 75,
    qualityCondition: 'Fresh Campus Lunch Surplus',
    preparationDateTime: getPastIsoString(1),
    useByDateTime: getFutureIsoString(4.0),
    pickupLocationId: 'LOC_05', // Thindal
    status: 'Pending', // Pending super admin approval!
    dietary: 'Pure Vegetarian',
    storageReq: 'Keep Warm',
    notes: 'Cooked fresh at 12:30 PM for campus afternoon session.'
  },
  {
    id: 'don_05',
    donorId: 'donor_04',
    donorName: 'Sri Krishna Annadhanam Social Kitchen',
    foodName: 'Moong Dal Khichdi & Mixed Vegetable Porridge',
    category: 'Cooked Meals',
    photoUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    portionsTotal: 60,
    portionsRemaining: 60,
    qualityCondition: 'Freshly Prepared and Sealed',
    preparationDateTime: getPastIsoString(0.5),
    useByDateTime: getFutureIsoString(0.7), // Tight use-by window for testing feasibility timing
    pickupLocationId: 'LOC_04', // Sampath Nagar / Collectorate
    status: 'Approved',
    dietary: 'Vegetarian / Low Spice',
    storageReq: 'Keep Warm',
    notes: 'Mildly spiced, ideal for elderly residents or children shelters.'
  }
];

const INITIAL_BOOKINGS = [
  {
    id: 'bk_01',
    donationId: 'don_01',
    recipientId: 'recip_01',
    recipientName: 'Karunai Illam Destitute & Homeless Shelter',
    portionsRequested: 25,
    status: 'Pending', // Pending Admin Allocation review
    deliveryLocationId: 'LOC_03', // Erode Junction
    createdAt: getPastIsoString(0.5),
    specialInstructions: 'Please deliver to rear kitchen receiving dock near Railway Colony gate.',
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
