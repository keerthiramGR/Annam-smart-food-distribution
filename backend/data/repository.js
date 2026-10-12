/**
 * Annam - Smart Food Distribution System
 * In-Memory Data Repository (Database Abstraction Layer)
 * 
 * Provides clean CRUD access patterns mimicking MongoDB / SQL ORMs,
 * ensuring easy migration to production databases.
 */

const {
  INITIAL_DONORS,
  INITIAL_RECIPIENTS,
  INITIAL_ADMIN,
  INITIAL_VEHICLES,
  INITIAL_DONATIONS,
  INITIAL_BOOKINGS
} = require('./initialData');

class Repository {
  constructor() {
    this.reset();
  }

  reset() {
    // Deep clone initial data so state modifications can be reset anytime
    this.donors = JSON.parse(JSON.stringify(INITIAL_DONORS));
    this.recipients = JSON.parse(JSON.stringify(INITIAL_RECIPIENTS));
    this.admin = JSON.parse(JSON.stringify(INITIAL_ADMIN));
    this.vehicles = JSON.parse(JSON.stringify(INITIAL_VEHICLES));
    this.donations = JSON.parse(JSON.stringify(INITIAL_DONATIONS));
    this.bookings = JSON.parse(JSON.stringify(INITIAL_BOOKINGS));
    this.auditLogs = [
      {
        id: 'log_01',
        timestamp: new Date().toISOString(),
        action: 'SYSTEM_INITIALIZED',
        entityType: 'SYSTEM',
        details: 'Annam smart food distribution node initialized with 5 donors, 12 recipients, and 3 vehicles.'
      }
    ];
  }

  // --- Donors ---
  getAllDonors() {
    return [...this.donors];
  }

  getDonorById(id) {
    return this.donors.find(d => d.id === id) || null;
  }

  addDonor(donorData) {
    const newDonor = {
      id: `donor_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      ...donorData
    };
    this.donors.push(newDonor);
    this.logAction('DONOR_REGISTERED', 'DONOR', `Donor ${newDonor.name} registered.`);
    return newDonor;
  }

  // --- Recipients ---
  getAllRecipients() {
    return [...this.recipients];
  }

  getRecipientById(id) {
    return this.recipients.find(r => r.id === id) || null;
  }

  addRecipient(recipientData) {
    const newRecipient = {
      id: `recip_${Date.now().toString(36)}`,
      verified: true,
      createdAt: new Date().toISOString(),
      ...recipientData
    };
    this.recipients.push(newRecipient);
    this.logAction('RECIPIENT_REGISTERED', 'RECIPIENT', `Recipient ${newRecipient.name} registered.`);
    return newRecipient;
  }

  // --- Vehicles ---
  getAllVehicles() {
    return [...this.vehicles];
  }

  getVehicleById(id) {
    return this.vehicles.find(v => v.id === id) || null;
  }

  updateVehicle(id, updates) {
    const vehicle = this.getVehicleById(id);
    if (!vehicle) return null;
    Object.assign(vehicle, updates);
    return vehicle;
  }

  // --- Donations ---
  getAllDonations(filter = {}) {
    let result = [...this.donations];
    if (filter.status) {
      result = result.filter(d => d.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.donorId) {
      result = result.filter(d => d.donorId === filter.donorId);
    }
    if (filter.category && filter.category !== 'All') {
      result = result.filter(d => d.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.locationId && filter.locationId !== 'All') {
      result = result.filter(d => d.pickupLocationId === filter.locationId);
    }
    return result;
  }

  getDonationById(id) {
    return this.donations.find(d => d.id === id) || null;
  }

  addDonation(donationData) {
    const newDonation = {
      id: `don_${Date.now().toString(36)}`,
      status: 'Pending', // All new donations strictly require Super Admin approval
      portionsRemaining: Number(donationData.portionsTotal),
      createdAt: new Date().toISOString(),
      ...donationData,
      portionsTotal: Number(donationData.portionsTotal)
    };
    this.donations.unshift(newDonation);
    this.logAction('DONATION_SUBMITTED', 'DONATION', `Donation ${newDonation.foodName} (${newDonation.portionsTotal} portions) submitted by ${newDonation.donorName}. Awaiting Super Admin approval.`);
    return newDonation;
  }

  updateDonation(id, updates) {
    const donation = this.getDonationById(id);
    if (!donation) return null;
    Object.assign(donation, updates);
    return donation;
  }

  // --- Bookings ---
  getAllBookings(filter = {}) {
    let result = [...this.bookings];
    if (filter.recipientId) {
      result = result.filter(b => b.recipientId === filter.recipientId);
    }
    if (filter.status) {
      result = result.filter(b => b.status.toLowerCase() === filter.status.toLowerCase());
    }
    if (filter.donationId) {
      result = result.filter(b => b.donationId === filter.donationId);
    }
    return result;
  }

  getBookingById(id) {
    return this.bookings.find(b => b.id === id) || null;
  }

  addBooking(bookingData) {
    const newBooking = {
      id: `bk_${Date.now().toString(36)}`,
      status: 'Pending', // Pending admin feasibility verification & vehicle allocation
      createdAt: new Date().toISOString(),
      rejectionReason: null,
      vehicleId: null,
      routeMetrics: null,
      ...bookingData,
      portionsRequested: Number(bookingData.portionsRequested)
    };
    this.bookings.unshift(newBooking);
    this.logAction('BOOKING_REQUESTED', 'BOOKING', `Booking ${newBooking.id} created by ${newBooking.recipientName} for ${newBooking.portionsRequested} portions.`);
    return newBooking;
  }

  updateBooking(id, updates) {
    const booking = this.getBookingById(id);
    if (!booking) return null;
    Object.assign(booking, updates);
    return booking;
  }

  // --- Super Admin ---
  getAdmin() {
    return { ...this.admin };
  }

  // --- Audit Logging ---
  logAction(action, entityType, details) {
    const log = {
      id: `log_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      details
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    return log;
  }

  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
}

// Singleton repository instance
const repoInstance = new Repository();

module.exports = repoInstance;
