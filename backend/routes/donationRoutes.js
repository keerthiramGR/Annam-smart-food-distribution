/**
 * Annam - Smart Food Distribution System
 * Food Donation Routes
 */

const express = require('express');
const router = express.Router();
const repo = require('../data/repository');
const { locationMap } = require('../services/dijkstraService');

// Default fallback food photos by category
const CATEGORY_DEFAULT_PHOTOS = {
  'Cooked Meals': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
  'Bakery & Breads': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=80',
  'Fresh Produce': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
  'Dairy & Desserts': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80',
  'Packaged Foods': 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=500&auto=format&fit=crop&q=80'
};

// GET /api/donations
router.get('/', (req, res) => {
  const { status, donorId, category, locationId } = req.query;
  const donations = repo.getAllDonations({ status, donorId, category, locationId });

  // Enrich with donor and location names
  const enriched = donations.map(d => {
    const donor = repo.getDonorById(d.donorId);
    const loc = locationMap.get(d.pickupLocationId);
    return {
      ...d,
      donorName: donor ? donor.name : d.donorName,
      donorPhone: donor ? donor.phone : null,
      pickupLocationName: loc ? loc.name : d.pickupLocationId,
      pickupSector: loc ? loc.sector : 'Urban'
    };
  });

  res.json(enriched);
});

// GET /api/donations/:id
router.get('/:id', (req, res) => {
  const donation = repo.getDonationById(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const donor = repo.getDonorById(donation.donorId);
  const loc = locationMap.get(donation.pickupLocationId);

  res.json({
    ...donation,
    donor,
    pickupLocationName: loc ? loc.name : donation.pickupLocationId
  });
});

// POST /api/donations - Donor uploads new food donation
router.post('/', (req, res) => {
  const {
    donorId,
    foodName,
    category,
    photoUrl,
    portionsTotal,
    qualityCondition,
    preparationDateTime,
    useByDateTime,
    pickupLocationId,
    dietary,
    storageReq,
    notes
  } = req.body;

  // Validation
  if (!donorId || !foodName || !category || !portionsTotal || !useByDateTime || !pickupLocationId) {
    return res.status(400).json({
      error: 'Missing mandatory fields: foodName, category, portionsTotal, useByDateTime, pickupLocationId are required.'
    });
  }

  const portionsNum = parseInt(portionsTotal, 10);
  if (isNaN(portionsNum) || portionsNum <= 0) {
    return res.status(400).json({ error: 'Portions total must be a positive integer.' });
  }

  const useByDate = new Date(useByDateTime);
  if (isNaN(useByDate.getTime())) {
    return res.status(400).json({ error: 'Invalid use-by date and time format.' });
  }

  const donor = repo.getDonorById(donorId);
  if (!donor) {
    return res.status(404).json({ error: 'Donor not found.' });
  }

  // Ensure photo or fallback
  const finalPhotoUrl = (photoUrl && photoUrl.trim().length > 0)
    ? photoUrl
    : (CATEGORY_DEFAULT_PHOTOS[category] || CATEGORY_DEFAULT_PHOTOS['Cooked Meals']);

  const newDonation = repo.addDonation({
    donorId,
    donorName: donor.name,
    foodName: foodName.trim(),
    category,
    photoUrl: finalPhotoUrl,
    portionsTotal: portionsNum,
    portionsRemaining: portionsNum,
    qualityCondition: qualityCondition || 'Freshly Prepared Food',
    preparationDateTime: preparationDateTime || new Date().toISOString(),
    useByDateTime: useByDate.toISOString(),
    pickupLocationId,
    dietary: dietary || 'Vegetarian',
    storageReq: storageReq || 'Ambient Room Temp',
    notes: notes || '',
    status: 'Pending' // Strictly Pending until Super Admin reviews and approves
  });

  res.status(201).json({
    message: 'Food donation submitted successfully. It will be available for recipients once Super Admin approves it.',
    donation: newDonation
  });
});

module.exports = router;
