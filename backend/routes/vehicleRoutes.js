/**
 * Annam - Smart Food Distribution System
 * Transport Vehicle Routes
 */

const express = require('express');
const router = express.Router();
const repo = require('../data/repository');
const { locationMap } = require('../services/dijkstraService');

// GET /api/vehicles - List all vehicles
router.get('/', (req, res) => {
  const vehicles = repo.getAllVehicles();
  const enriched = vehicles.map(v => {
    const loc = locationMap.get(v.currentLocationId);
    return {
      ...v,
      currentLocationName: loc ? loc.name : v.currentLocationId
    };
  });
  res.json(enriched);
});

// GET /api/vehicles/:id
router.get('/:id', (req, res) => {
  const vehicle = repo.getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
  const loc = locationMap.get(vehicle.currentLocationId);
  res.json({
    ...vehicle,
    currentLocationName: loc ? loc.name : vehicle.currentLocationId
  });
});

// PATCH /api/vehicles/:id - Update vehicle status
router.patch('/:id', (req, res) => {
  const { status, currentLocationId } = req.body;
  const vehicle = repo.getVehicleById(req.params.id);
  if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

  const updates = {};
  if (status) updates.status = status;
  if (currentLocationId) updates.currentLocationId = currentLocationId;

  const updated = repo.updateVehicle(vehicle.id, updates);
  repo.logAction('VEHICLE_UPDATED', 'VEHICLE', `Vehicle ${vehicle.name} updated: status=${updated.status}`);
  res.json(updated);
});

module.exports = router;
