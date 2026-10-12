/**
 * Annam - Smart Food Distribution System
 * Super Admin Management & Multi-Constraint Allocation Routes
 */

const express = require('express');
const router = express.Router();
const repo = require('../data/repository');
const { evaluateAllocationFeasibility } = require('../services/allocationService');
const { calculateDistributionStats } = require('../services/statsService');

// ==================== DONATION APPROVAL / REJECTION ====================

// Approve food donation
router.post('/donations/:id/approve', (req, res) => {
  const donation = repo.getDonationById(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  if (donation.status === 'Approved') {
    return res.status(400).json({ error: 'Donation is already approved.' });
  }

  repo.updateDonation(donation.id, {
    status: 'Approved',
    approvedAt: new Date().toISOString()
  });

  repo.logAction('DONATION_APPROVED', 'DONATION', `Donation ${donation.foodName} (${donation.portionsTotal} portions) approved by Super Admin.`);

  res.json({
    message: `Donation '${donation.foodName}' approved. It is now visible to recipients for booking.`,
    donation: repo.getDonationById(donation.id)
  });
});

// Reject food donation
router.post('/donations/:id/reject', (req, res) => {
  const donation = repo.getDonationById(req.params.id);
  if (!donation) return res.status(404).json({ error: 'Donation not found' });

  const reason = req.body.reason || 'Did not meet safety, packaging or quality criteria.';

  repo.updateDonation(donation.id, {
    status: 'Rejected',
    rejectionReason: reason,
    rejectedAt: new Date().toISOString()
  });

  repo.logAction('DONATION_REJECTED', 'DONATION', `Donation ${donation.foodName} rejected by Super Admin. Reason: ${reason}`);

  res.json({
    message: `Donation '${donation.foodName}' rejected.`,
    donation: repo.getDonationById(donation.id)
  });
});

// ==================== BOOKING FEASIBILITY EVALUATION & ALLOCATION ====================

// Simulate / evaluate allocation feasibility without committing
router.post('/bookings/:id/evaluate', (req, res) => {
  const booking = repo.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const donation = repo.getDonationById(booking.donationId);
  const recipient = repo.getRecipientById(booking.recipientId);

  const vehicleId = req.body.vehicleId;
  const vehicle = vehicleId ? repo.getVehicleById(vehicleId) : null;

  const evaluation = evaluateAllocationFeasibility(booking, donation, recipient, vehicle);

  res.json(evaluation);
});

// Approve & Allocate Booking with Vehicle and Dijkstra Route
router.post('/bookings/:id/allocate', (req, res) => {
  const booking = repo.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (booking.status === 'Allocated' || booking.status === 'Delivered') {
    return res.status(400).json({ error: `Booking is already in '${booking.status}' state.` });
  }

  const { vehicleId } = req.body;
  if (!vehicleId) {
    return res.status(400).json({ error: 'A valid vehicle must be selected for allocation.' });
  }

  const vehicle = repo.getVehicleById(vehicleId);
  if (!vehicle) {
    return res.status(404).json({ error: 'Selected vehicle not found.' });
  }

  const donation = repo.getDonationById(booking.donationId);
  const recipient = repo.getRecipientById(booking.recipientId);

  // Strict feasibility check
  const evaluation = evaluateAllocationFeasibility(booking, donation, recipient, vehicle);

  if (!evaluation.isFeasible) {
    return res.status(422).json({
      error: 'Allocation failed due to feasibility check violation.',
      reason: evaluation.reason,
      issues: evaluation.issues,
      metrics: evaluation.metrics
    });
  }

  // Atomic state updates
  // 1. Deduct remaining portions from donation
  const requested = Number(booking.portionsRequested);
  const updatedRemaining = donation.portionsRemaining - requested;
  const newDonationStatus = updatedRemaining === 0 ? 'Fully Allocated' : 'Partially Allocated';

  repo.updateDonation(donation.id, {
    portionsRemaining: updatedRemaining,
    status: newDonationStatus
  });

  // 2. Mark vehicle as assigned / in-transit
  repo.updateVehicle(vehicle.id, {
    status: 'In-Transit',
    currentBookingId: booking.id
  });

  // 3. Mark booking as Allocated
  const updatedBooking = repo.updateBooking(booking.id, {
    status: 'Allocated',
    vehicleId: vehicle.id,
    allocatedAt: new Date().toISOString(),
    routeMetrics: evaluation.metrics,
    routePath: evaluation.route ? evaluation.route.path : [],
    rejectionReason: null
  });

  repo.logAction(
    'BOOKING_ALLOCATED',
    'BOOKING',
    `Booking ${booking.id} (${requested} portions) allocated to ${vehicle.name}. Shortest path: ${evaluation.route?.nodeNames.join(' -> ')}. Estimated transit: ${evaluation.metrics.travelMinutes} mins.`
  );

  res.json({
    message: 'Booking successfully approved and allocated with optimized delivery route.',
    booking: updatedBooking,
    evaluation
  });
});

// Reject Booking with explicit reason
router.post('/bookings/:id/reject', (req, res) => {
  const booking = repo.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const reason = req.body.reason || 'Insufficient vehicle capacity or timing conflict with use-by deadline.';

  // If vehicle was assigned, release it
  if (booking.vehicleId) {
    repo.updateVehicle(booking.vehicleId, {
      status: 'Available',
      currentBookingId: null
    });
  }

  // If portions were deducted previously, restore them
  if (booking.status === 'Allocated') {
    const donation = repo.getDonationById(booking.donationId);
    if (donation) {
      const restored = donation.portionsRemaining + Number(booking.portionsRequested);
      repo.updateDonation(donation.id, {
        portionsRemaining: restored,
        status: 'Approved'
      });
    }
  }

  const updatedBooking = repo.updateBooking(booking.id, {
    status: 'Rejected',
    rejectionReason: reason,
    rejectedAt: new Date().toISOString()
  });

  repo.logAction('BOOKING_REJECTED', 'BOOKING', `Booking ${booking.id} rejected by Super Admin. Reason: ${reason}`);

  res.json({
    message: 'Booking request rejected.',
    booking: updatedBooking
  });
});

// Update booking delivery status (e.g. In-Transit -> Delivered)
router.post('/bookings/:id/status', (req, res) => {
  const booking = repo.getBookingById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  const { status } = req.body;
  if (!['In-Transit', 'Delivered', 'Cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid delivery status.' });
  }

  const updates = { status };

  if (status === 'Delivered') {
    updates.deliveredAt = new Date().toISOString();
    // Release assigned vehicle
    if (booking.vehicleId) {
      repo.updateVehicle(booking.vehicleId, {
        status: 'Available',
        currentBookingId: null
      });
    }
  }

  const updatedBooking = repo.updateBooking(booking.id, updates);

  repo.logAction('DELIVERY_STATUS_UPDATED', 'BOOKING', `Booking ${booking.id} delivery status updated to '${status}'.`);

  res.json({
    message: `Delivery status updated to '${status}'.`,
    booking: updatedBooking
  });
});

// ==================== STATISTICS & ENTITIES ====================

// Get comprehensive distribution statistics
router.get('/stats', (req, res) => {
  const donations = repo.getAllDonations();
  const bookings = repo.getAllBookings();
  const donors = repo.getAllDonors();
  const recipients = repo.getAllRecipients();
  const vehicles = repo.getAllVehicles();

  const stats = calculateDistributionStats(donations, bookings, donors, recipients, vehicles);
  res.json(stats);
});

// Get audit logs
router.get('/audit-logs', (req, res) => {
  res.json(repo.getAuditLogs());
});

// Entity listings
router.get('/donors', (req, res) => res.json(repo.getAllDonors()));
router.get('/recipients', (req, res) => res.json(repo.getAllRecipients()));
router.get('/vehicles', (req, res) => res.json(repo.getAllVehicles()));

// Reset prototype database
router.post('/reset', (req, res) => {
  repo.reset();
  res.json({ message: 'System database successfully reset to pristine prototype state.' });
});

module.exports = router;
