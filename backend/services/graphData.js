/**
 * Annam - Smart Food Distribution System
 * Urban Road Graph Data Definition
 * 15 nodes representing city sectors with realistic coordinates,
 * bidirectional weighted edges with distance (km) and base travel time (minutes).
 */

const LOCATIONS = [
  { id: 'LOC_01', name: 'Central City Center', sector: 'Downtown', x: 350, y: 250, description: 'Central commercial and civic plaza' },
  { id: 'LOC_02', name: 'Downtown Commercial Hub', sector: 'Downtown', x: 480, y: 220, description: 'High-density office and hotel district' },
  { id: 'LOC_03', name: 'North Market Square', sector: 'North', x: 330, y: 120, description: 'Traditional market and community hall' },
  { id: 'LOC_04', name: 'South Riverside Park', sector: 'South', x: 360, y: 400, description: 'Riverfront community and shelter zone' },
  { id: 'LOC_05', name: 'East Gate Junction', sector: 'East', x: 580, y: 310, description: 'Major transit crossway and welfare centers' },
  { id: 'LOC_06', name: 'West End District', sector: 'West', x: 180, y: 260, description: 'Residential and commercial bakery belt' },
  { id: 'LOC_07', name: 'University Campus', sector: 'Northwest', x: 190, y: 140, description: 'Higher education institutions and youth hostels' },
  { id: 'LOC_08', name: 'Grand Avenue Boulevard', sector: 'Northeast', x: 490, y: 110, description: 'Hotels, convention centers and banquets' },
  { id: 'LOC_09', name: 'Old Heritage Quarter', sector: 'Southwest', x: 240, y: 360, description: 'Dense historic quarter with relief homes' },
  { id: 'LOC_10', name: 'Midtown Crossway', sector: 'Central-East', x: 430, y: 320, description: 'Centrally accessible transit nexus' },
  { id: 'LOC_11', name: 'Hill View Enclave', sector: 'Far Northwest', x: 110, y: 80, description: 'Outlying community shelters and care homes' },
  { id: 'LOC_12', name: 'Industrial Logistic Zone', sector: 'Far Southeast', x: 620, y: 430, description: 'Warehouses and migrant worker communities' },
  { id: 'LOC_13', name: 'Suburban Colony West', sector: 'Far Southwest', x: 120, y: 430, description: 'Suburban outreach and family relief trusts' },
  { id: 'LOC_14', name: 'Tech Park Innovation Hub', sector: 'East Outer', x: 600, y: 180, description: 'Corporate canteens and tech campuses' },
  { id: 'LOC_15', name: 'Harbor Port Terminal', sector: 'South Coast', x: 470, y: 460, description: 'Coastal distribution and community kitchens' }
];

// Weighted bidirectional road connections
// distanceKm: distance in kilometers
// timeMinutes: average transit duration considering city traffic
const ROAD_EDGES = [
  { from: 'LOC_01', to: 'LOC_02', distanceKm: 3.2, timeMinutes: 8 },
  { from: 'LOC_01', to: 'LOC_03', distanceKm: 2.8, timeMinutes: 7 },
  { from: 'LOC_01', to: 'LOC_06', distanceKm: 3.5, timeMinutes: 9 },
  { from: 'LOC_01', to: 'LOC_10', distanceKm: 2.5, timeMinutes: 6 },
  { from: 'LOC_02', to: 'LOC_05', distanceKm: 3.8, timeMinutes: 10 },
  { from: 'LOC_02', to: 'LOC_08', distanceKm: 3.0, timeMinutes: 8 },
  { from: 'LOC_02', to: 'LOC_14', distanceKm: 4.1, timeMinutes: 11 },
  { from: 'LOC_03', to: 'LOC_07', distanceKm: 3.4, timeMinutes: 9 },
  { from: 'LOC_03', to: 'LOC_08', distanceKm: 3.1, timeMinutes: 8 },
  { from: 'LOC_04', to: 'LOC_01', distanceKm: 4.2, timeMinutes: 11 },
  { from: 'LOC_04', to: 'LOC_09', distanceKm: 2.9, timeMinutes: 8 },
  { from: 'LOC_04', to: 'LOC_10', distanceKm: 2.6, timeMinutes: 7 },
  { from: 'LOC_04', to: 'LOC_15', distanceKm: 3.7, timeMinutes: 10 },
  { from: 'LOC_05', to: 'LOC_10', distanceKm: 3.3, timeMinutes: 9 },
  { from: 'LOC_05', to: 'LOC_12', distanceKm: 4.5, timeMinutes: 12 },
  { from: 'LOC_06', to: 'LOC_07', distanceKm: 3.0, timeMinutes: 8 },
  { from: 'LOC_06', to: 'LOC_09', distanceKm: 3.1, timeMinutes: 8 },
  { from: 'LOC_06', to: 'LOC_13', distanceKm: 4.0, timeMinutes: 11 },
  { from: 'LOC_07', to: 'LOC_11', distanceKm: 3.6, timeMinutes: 10 },
  { from: 'LOC_08', to: 'LOC_14', distanceKm: 3.3, timeMinutes: 9 },
  { from: 'LOC_09', to: 'LOC_13', distanceKm: 3.5, timeMinutes: 9 },
  { from: 'LOC_10', to: 'LOC_15', distanceKm: 3.9, timeMinutes: 10 },
  { from: 'LOC_12', to: 'LOC_15', distanceKm: 4.2, timeMinutes: 11 },
  { from: 'LOC_14', to: 'LOC_12', distanceKm: 6.0, timeMinutes: 16 }
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
      timeMinutes: edge.timeMinutes
    });
    // Bidirectional road
    adj[edge.to].push({
      to: edge.from,
      distanceKm: edge.distanceKm,
      timeMinutes: edge.timeMinutes
    });
  });

  return adj;
}

module.exports = {
  LOCATIONS,
  ROAD_EDGES,
  buildAdjacencyList
};
