/**
 * Annam - Smart Food Distribution System
 * Routing & Dijkstra Road Graph API Routes
 */

const express = require('express');
const router = express.Router();
const { getRoadNetworkGraph, findShortestRoute } = require('../services/dijkstraService');
const { LOCATIONS } = require('../services/graphData');
const repo = require('../data/repository');

// GET /api/routing/graph - Get complete road graph structure
router.get('/graph', (req, res) => {
  res.json(getRoadNetworkGraph());
});

// GET /api/routing/locations - List of city sector locations
router.get('/locations', (req, res) => {
  res.json(LOCATIONS);
});

// GET /api/routing/shortest-path - Compute shortest route between any two locations
router.get('/shortest-path', (req, res) => {
  const { from, to, vehicleId } = req.query;

  if (!from || !to) {
    return res.status(400).json({ error: 'Query parameters from and to are required.' });
  }

  let speedMultiplier = 1.0;
  if (vehicleId) {
    const vehicle = repo.getVehicleById(vehicleId);
    if (vehicle && vehicle.speedMultiplier) {
      speedMultiplier = vehicle.speedMultiplier;
    }
  }

  try {
    const route = findShortestRoute(from, to, speedMultiplier);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
