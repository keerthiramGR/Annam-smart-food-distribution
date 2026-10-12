/**
 * Annam - Smart Food Distribution System
 * Recipient Food Booking Request Routes
 */

const express = require('express');
const router = express.Router();
const repo = require('../data/repository');
const { locationMap, findShortestRoute } = require('../services/dijkstraService');

// GET /api/bookings - List bookings (optional filter by recipientId, status)
router.get('/', (req, res) => {
  const { recipientId, status } = req.query;
  const bookings = repo.getAllBookings({ recipientId, status });

  // Enrich with donation, donor, recipient, vehicle, and location info
  const enriched = bookings.map(b => {
    const donation = repo.getDonationById(b.donationId);
    const recipient = repo.getRecipientById(b.recipientId);
    const vehicle = b.vehicleId ? repo.getVehicleById(b.vehicleId) : null;
    const donorLoc = donation ? locationMap.get(donation.pickupLocationId) : null;
    const recipLoc = recipient ? locationMap.get(recipient.locationId) : null;

    return {
      ...b,
      donation: donation ? {
        foodName: donation.foodName,
        category: donation.category,
        photoUrl: donation.photoUrl,
        donorName: donation.donorName,
        useByDateTime: donation.useByDateTime,
        pickupLocationName: donorLoc ? donorLoc.name : donation.pickupLocationId,
        qualityCondition: donation.qualityCondition
      } : null,
      recipientName: recipient ? recipient.name : b.recipientName,
      recipientCategory: recipient ? recipient.category : 'Shelter',
      recipientPhone: recipient ? recipient.phone : null,
      deliveryLocationName: recipLoc ? recipLoc.name : b.deliveryLocationId,
      vehicle: vehicle ? {
        name: vehicle.name,
        plateNumber: vehicle.plateNumber,
        driverName: vehicle.driverName,
        driverPhone: vehicle.driverPhone
      } : null
    };
  });

  res.json(enriched);
});

// GET /api/bookings/:id
router.get('/:id', (req, res) => {
  const booking = repo.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const donation = repo.getDonationById(booking.donationId);
  const recipient = repo.getRecipientById(booking.recipientId);
  const vehicle = booking.vehicleId ? repo.getVehicleById(booking.vehicleId) : null;

  res.json({
    ...booking,
    donation,
    recipient,
    vehicle
  });
});

// POST /api/bookings - Recipient creates food booking request
router.post('/', (req, res) => {
  const { recipientId, donationId, portionsRequested, specialInstructions } = req.body;

  if (!recipientId || !donationId || !portionsRequested) {
    return res.status(400).json({ error: 'recipientId, donationId, and portionsRequested are required.' });
  }

  const requestedCount = parseInt(portionsRequested, 10);
  if (isNaN(requestedCount) || requestedCount <= 0) {
    return res.status(400).json({ error: 'Requested portions must be greater than zero.' });
  }

  const recipient = repo.getRecipientById(recipientId);
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient organization not found.' });
  }

  const donation = repo.getDonationById(donationId);
  if (!donation) {
    return res.status(404).json({ error: 'Food donation not found.' });
  }

  // Ensure donation is approved
  if (donation.status !== 'Approved' && donation.status !== 'Partially Allocated') {
    return res.status(400).json({
      error: `Cannot request food from donation in '${donation.status}' state. Only approved donations can be requested.`
    });
  }

  // Ensure remaining portions exist
  if (requestedCount > donation.portionsRemaining) {
    return res.status(400).json({
      error: `Requested portions (${requestedCount}) exceeds available portions (${donation.portionsRemaining}).`
    });
  }

  // Check if recipient already has an active pending booking for the same donation
  const existingPending = repo.getAllBookings({ recipientId, donationId }).find(b => b.status === 'Pending');
  if (existingPending) {
    return res.status(400).json({
      error: 'You already have an active pending request for this donation. Awaiting Super Admin review.'
    });
  }

  // Initial distance calculation to give recipient immediate travel estimate
  let estimatedDistanceKm = null;
  let estimatedTravelMinutes = null;
  try {
    const route = findShortestRoute(donation.pickupLocationId, recipient.locationId, 1.0);
    if (route.found) {
      estimatedDistanceKm = route.totalDistanceKm;
      estimatedTravelMinutes = route.totalTimeMinutes;
    }
  } catch (e) {
    // Non-fatal
  }

  const newBooking = repo.addBooking({
    recipientId,
    recipientName: recipient.name,
    donationId,
    portionsRequested: requestedCount,
    deliveryLocationId: recipient.locationId,
    specialInstructions: specialInstructions || '',
    status: 'Pending', // Pending Super Admin feasibility check & vehicle assignment
    estimatedDistanceKm,
    estimatedTravelMinutes
  });

  res.status(201).json({
    message: 'Booking request placed successfully. Super Admin is verifying logistics and vehicle allocation.',
    booking: newBooking
  });
});

module.exports = router;
