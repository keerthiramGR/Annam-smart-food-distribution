/**
 * Annam - Smart Food Distribution System
 * Erode City & Surroundings Urban Road Graph Data Definition
 * 15 realistic nodes representing Erode urban, commercial, highway, and rural sectors.
 * Includes precise geographical coordinates (latitude, longitude), normalized coordinates for 2D visualizers,
 * and bidirectional weighted edges with actual road names, distances (km), travel times (minutes), and GPS waypoints.
 */

const LOCATIONS = [
  {
    id: 'LOC_01',
    name: 'PS Park & Manikoondu',
    sector: 'Central Erode',
    lat: 11.3418,
    lng: 77.7274,
    x: 540,
    y: 260,
    description: 'Central civic plaza, Clock Tower, Netaji daily market & dining belt'
  },
  {
    id: 'LOC_02',
    name: 'Central Bus Stand & Mettur Rd',
    sector: 'City Commercial Hub',
    lat: 11.3482,
    lng: 77.7225,
    x: 524,
    y: 246,
    description: 'Primary intercity bus terminus, commercial complexes, and hotel district'
  },
  {
    id: 'LOC_03',
    name: 'Erode Junction Railway Station',
    sector: 'Railway Colony / South',
    lat: 11.3283,
    lng: 77.7280,
    x: 542,
    y: 290,
    description: 'Major railway junction on Chennai-Kochi corridor and south relief shelters'
  },
  {
    id: 'LOC_04',
    name: 'District Collectorate & Sampath Nagar',
    sector: 'Civic & Hospital District',
    lat: 11.3364,
    lng: 77.7088,
    x: 480,
    y: 272,
    description: 'District administrative headquarters, courts, and social kitchen trusts'
  },
  {
    id: 'LOC_05',
    name: 'Thindal (Perundurai Road)',
    sector: 'West Educational Corridor',
    lat: 11.3195,
    lng: 77.6745,
    x: 370,
    y: 310,
    description: 'Thindal Murugan Temple area, major engineering and arts college canteens'
  },
  {
    id: 'LOC_06',
    name: 'Perundurai Town & SIPCOT',
    sector: 'Perundurai West Hub',
    lat: 11.2750,
    lng: 77.5830,
    x: 80,
    y: 410,
    description: 'SIPCOT Industrial Park, IRTT Medical Center, and migrant worker communities'
  },
  {
    id: 'LOC_07',
    name: 'Bhavani Kooduthurai',
    sector: 'North Riverside Confluence',
    lat: 11.4468,
    lng: 77.6835,
    x: 400,
    y: 35,
    description: 'Holy river confluence of Bhavani and Cauvery, pilgrimage canteens & shelters'
  },
  {
    id: 'LOC_08',
    name: 'Chithode NH 544 Junction',
    sector: 'Highway Logistics Crossway',
    lat: 11.4025,
    lng: 77.6710,
    x: 360,
    y: 130,
    description: 'Salem-Kochi NH 544 expressway junction, logistics warehouses, and motels'
  },
  {
    id: 'LOC_09',
    name: 'Pallipalayam (Cauvery East Bank)',
    sector: 'Cauvery East Industrial Belt',
    lat: 11.3535,
    lng: 77.7390,
    x: 580,
    y: 235,
    description: 'Across the Cauvery bridge, SPB Paper Mills, and textile artisan clusters'
  },
  {
    id: 'LOC_10',
    name: 'Komarapalayam Textile Belt',
    sector: 'Northeast Weaving Hub',
    lat: 11.4430,
    lng: 77.7120,
    x: 490,
    y: 42,
    description: 'High-density textile and garment worker belt across the Bhavani bridge'
  },
  {
    id: 'LOC_11',
    name: 'Surampatti & Surampatti Valasu',
    sector: 'Southwest Residential',
    lat: 11.3180,
    lng: 77.7130,
    x: 495,
    y: 315,
    description: 'Dense residential neighborhood, community welfare trusts, and day shelters'
  },
  {
    id: 'LOC_12',
    name: 'Solar Bus Stand & Karur Road',
    sector: 'Southeast Logistics Terminal',
    lat: 11.3130,
    lng: 77.7550,
    x: 630,
    y: 325,
    description: 'New Solar Integrated Bus Terminal, wholesale markets, and transport hubs'
  },
  {
    id: 'LOC_13',
    name: 'Karungalpalayam (Old Cauvery Bridge)',
    sector: 'Riverfront Northeast',
    lat: 11.3530,
    lng: 77.7470,
    x: 605,
    y: 236,
    description: 'Historic riverfront gate, famous weekly market, and community care homes'
  },
  {
    id: 'LOC_14',
    name: 'Veerappanchatram & Sathy Road',
    sector: 'North Textile Market',
    lat: 11.3650,
    lng: 77.7180,
    x: 510,
    y: 210,
    description: 'Weekly textile trade market, bakeries, and community social kitchens'
  },
  {
    id: 'LOC_15',
    name: 'Modakkurichi Agricultural Belt',
    sector: 'South Rural Outreach',
    lat: 11.2580,
    lng: 77.7560,
    x: 635,
    y: 450,
    description: 'Agrarian rural belt, local food producer trusts, and rural elder homes'
  }
];

// Weighted bidirectional road connections in Erode and surrounding area
// Includes realistic distances in km, transit times in minutes, and real intermediate road waypoints
const ROAD_EDGES = [
  {
    from: 'LOC_01',
    to: 'LOC_02',
    distanceKm: 1.8,
    timeMinutes: 5,
    roadName: 'Brough Road / Mettur Road',
    waypoints: [
      [11.3418, 77.7274],
      [11.3445, 77.7252],
      [11.3482, 77.7225]
    ]
  },
  {
    from: 'LOC_01',
    to: 'LOC_03',
    distanceKm: 2.1,
    timeMinutes: 6,
    roadName: 'Gandhiji Road',
    waypoints: [
      [11.3418, 77.7274],
      [11.3355, 77.7278],
      [11.3283, 77.7280]
    ]
  },
  {
    from: 'LOC_01',
    to: 'LOC_04',
    distanceKm: 2.6,
    timeMinutes: 7,
    roadName: 'Perundurai Road (Brough Rd Cut)',
    waypoints: [
      [11.3418, 77.7274],
      [11.3400, 77.7180],
      [11.3364, 77.7088]
    ]
  },
  {
    from: 'LOC_01',
    to: 'LOC_13',
    distanceKm: 2.4,
    timeMinutes: 6,
    roadName: 'Cauvery Road',
    waypoints: [
      [11.3418, 77.7274],
      [11.3480, 77.7380],
      [11.3530, 77.7470]
    ]
  },
  {
    from: 'LOC_02',
    to: 'LOC_04',
    distanceKm: 2.0,
    timeMinutes: 5,
    roadName: 'EVN Road / Gandhiji Road',
    waypoints: [
      [11.3482, 77.7225],
      [11.3420, 77.7145],
      [11.3364, 77.7088]
    ]
  },
  {
    from: 'LOC_02',
    to: 'LOC_14',
    distanceKm: 2.3,
    timeMinutes: 6,
    roadName: 'Sathy Main Road',
    waypoints: [
      [11.3482, 77.7225],
      [11.3570, 77.7200],
      [11.3650, 77.7180]
    ]
  },
  {
    from: 'LOC_03',
    to: 'LOC_11',
    distanceKm: 2.2,
    timeMinutes: 6,
    roadName: 'Chennimalai Road / Surampatti 4 Roads',
    waypoints: [
      [11.3283, 77.7280],
      [11.3230, 77.7200],
      [11.3180, 77.7130]
    ]
  },
  {
    from: 'LOC_03',
    to: 'LOC_12',
    distanceKm: 4.0,
    timeMinutes: 9,
    roadName: 'Railway Colony / Karur Bypass',
    waypoints: [
      [11.3283, 77.7280],
      [11.3210, 77.7420],
      [11.3130, 77.7550]
    ]
  },
  {
    from: 'LOC_04',
    to: 'LOC_05',
    distanceKm: 4.5,
    timeMinutes: 9,
    roadName: 'Perundurai Road (SH 96)',
    waypoints: [
      [11.3364, 77.7088],
      [11.3280, 77.6920],
      [11.3195, 77.6745]
    ]
  },
  {
    from: 'LOC_04',
    to: 'LOC_11',
    distanceKm: 2.8,
    timeMinutes: 7,
    roadName: 'Sampath Nagar - Municipal Colony Link',
    waypoints: [
      [11.3364, 77.7088],
      [11.3270, 77.7100],
      [11.3180, 77.7130]
    ]
  },
  {
    from: 'LOC_05',
    to: 'LOC_06',
    distanceKm: 11.5,
    timeMinutes: 18,
    roadName: 'Perundurai State Highway 96',
    waypoints: [
      [11.3195, 77.6745],
      [11.3050, 77.6400],
      [11.2900, 77.6100],
      [11.2750, 77.5830]
    ]
  },
  {
    from: 'LOC_05',
    to: 'LOC_08',
    distanceKm: 9.2,
    timeMinutes: 14,
    roadName: 'Erode West Ring Road',
    waypoints: [
      [11.3195, 77.6745],
      [11.3500, 77.6720],
      [11.3800, 77.6715],
      [11.4025, 77.6710]
    ]
  },
  {
    from: 'LOC_06',
    to: 'LOC_08',
    distanceKm: 15.2,
    timeMinutes: 18,
    roadName: 'Salem-Kochi Expressway (NH 544)',
    waypoints: [
      [11.2750, 77.5830],
      [11.3200, 77.6150],
      [11.3650, 77.6450],
      [11.4025, 77.6710]
    ]
  },
  {
    from: 'LOC_07',
    to: 'LOC_08',
    distanceKm: 6.4,
    timeMinutes: 9,
    roadName: 'Bhavani - Chithode Bypass (NH 544)',
    waypoints: [
      [11.4468, 77.6835],
      [11.4250, 77.6760],
      [11.4025, 77.6710]
    ]
  },
  {
    from: 'LOC_07',
    to: 'LOC_10',
    distanceKm: 3.2,
    timeMinutes: 6,
    roadName: 'Cauvery River Bridge (Bhavani-Komarapalayam)',
    waypoints: [
      [11.4468, 77.6835],
      [11.4450, 77.6980],
      [11.4430, 77.7120]
    ]
  },
  {
    from: 'LOC_07',
    to: 'LOC_14',
    distanceKm: 10.5,
    timeMinutes: 16,
    roadName: 'Bhavani - Erode Main Road',
    waypoints: [
      [11.4468, 77.6835],
      [11.4150, 77.6950],
      [11.3850, 77.7100],
      [11.3650, 77.7180]
    ]
  },
  {
    from: 'LOC_08',
    to: 'LOC_14',
    distanceKm: 6.8,
    timeMinutes: 11,
    roadName: 'Chithode - Erode Connector Road',
    waypoints: [
      [11.4025, 77.6710],
      [11.3850, 77.6930],
      [11.3650, 77.7180]
    ]
  },
  {
    from: 'LOC_09',
    to: 'LOC_10',
    distanceKm: 11.8,
    timeMinutes: 18,
    roadName: 'Cauvery East Riverbank Road',
    waypoints: [
      [11.3535, 77.7390],
      [11.3900, 77.7300],
      [11.4200, 77.7200],
      [11.4430, 77.7120]
    ]
  },
  {
    from: 'LOC_09',
    to: 'LOC_13',
    distanceKm: 1.8,
    timeMinutes: 5,
    roadName: 'Historic Cauvery River Bridge',
    waypoints: [
      [11.3535, 77.7390],
      [11.3532, 77.7430],
      [11.3530, 77.7470]
    ]
  },
  {
    from: 'LOC_09',
    to: 'LOC_12',
    distanceKm: 5.2,
    timeMinutes: 11,
    roadName: 'East Bypass / Kokkarayanpettai Link',
    waypoints: [
      [11.3535, 77.7390],
      [11.3340, 77.7480],
      [11.3130, 77.7550]
    ]
  },
  {
    from: 'LOC_11',
    to: 'LOC_12',
    distanceKm: 5.0,
    timeMinutes: 10,
    roadName: 'Surampatti - Solar Ring Road',
    waypoints: [
      [11.3180, 77.7130],
      [11.3140, 77.7340],
      [11.3130, 77.7550]
    ]
  },
  {
    from: 'LOC_11',
    to: 'LOC_15',
    distanceKm: 10.8,
    timeMinutes: 17,
    roadName: 'Modakkurichi Main Road',
    waypoints: [
      [11.3180, 77.7130],
      [11.2900, 77.7300],
      [11.2580, 77.7560]
    ]
  },
  {
    from: 'LOC_12',
    to: 'LOC_15',
    distanceKm: 8.5,
    timeMinutes: 13,
    roadName: 'Karur Highway / Modakkurichi Feeder',
    waypoints: [
      [11.3130, 77.7550],
      [11.2850, 77.7555],
      [11.2580, 77.7560]
    ]
  },
  {
    from: 'LOC_13',
    to: 'LOC_14',
    distanceKm: 3.5,
    timeMinutes: 8,
    roadName: 'Agraharam & Sathy Road Crossway',
    waypoints: [
      [11.3530, 77.7470],
      [11.3600, 77.7320],
      [11.3650, 77.7180]
    ]
  }
];

// Helper adjacency list builder
function buildAdjacencyList() {
  const adj = {};
  LOCATIONS.forEach(loc => {
    adj[loc.id] = [];
  });

  ROAD_EDGES.forEach(edge => {
    adj[edge.from].push({
      to: edge.to,
      distanceKm: edge.distanceKm,
      timeMinutes: edge.timeMinutes,
      roadName: edge.roadName,
      waypoints: edge.waypoints
    });
    // Bidirectional road
    adj[edge.to].push({
      to: edge.from,
      distanceKm: edge.distanceKm,
      timeMinutes: edge.timeMinutes,
      roadName: edge.roadName,
      waypoints: edge.waypoints ? [...edge.waypoints].reverse() : null
    });
  });

  return adj;
}

module.exports = {
  LOCATIONS,
  ROAD_EDGES,
  buildAdjacencyList
};
