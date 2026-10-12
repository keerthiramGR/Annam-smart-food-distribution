/**
 * Annam - Smart Food Distribution System
 * Distribution Statistics Service
 */

function calculateDistributionStats(donations = [], bookings = [], donors = [], recipients = [], vehicles = []) {
  let totalPortionsDonated = 0;
  let totalPortionsDistributed = 0;
  let activeDonationCount = 0;
  let pendingDonationCount = 0;
  let approvedDonationCount = 0;
  let rejectedDonationCount = 0;

  donations.forEach(d => {
    totalPortionsDonated += Number(d.portionsTotal || 0);
    if (d.status === 'Pending') pendingDonationCount++;
    else if (d.status === 'Approved' || d.status === 'Partially Allocated') {
      activeDonationCount++;
      approvedDonationCount++;
    } else if (d.status === 'Rejected') {
      rejectedDonationCount++;
    }
  });

  let pendingBookingsCount = 0;
  let allocatedBookingsCount = 0;
  let completedDeliveriesCount = 0;
  let rejectedBookingsCount = 0;
  let totalKmLogged = 0;

  bookings.forEach(b => {
    if (b.status === 'Pending') pendingBookingsCount++;
    else if (b.status === 'Allocated' || b.status === 'In-Transit') {
      allocatedBookingsCount++;
      totalPortionsDistributed += Number(b.portionsRequested || 0);
      if (b.routeMetrics?.totalDistanceKm) {
        totalKmLogged += b.routeMetrics.totalDistanceKm;
      }
    } else if (b.status === 'Delivered') {
      completedDeliveriesCount++;
      totalPortionsDistributed += Number(b.portionsRequested || 0);
      if (b.routeMetrics?.totalDistanceKm) {
        totalKmLogged += b.routeMetrics.totalDistanceKm;
      }
    } else if (b.status === 'Rejected') {
      rejectedBookingsCount++;
    }
  });

  // Environmental and impact calculations
  // Average meal portion = 0.40 kg
  const estimatedKgFoodSaved = Math.round(totalPortionsDistributed * 0.4 * 10) / 10;
  // Food waste emission factor: ~2.5 kg CO2e per kg food saved
  const estimatedCo2SavedKg = Math.round(estimatedKgFoodSaved * 2.5 * 10) / 10;

  // Active vehicle stats
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;

  return {
    summary: {
      totalPortionsDonated,
      totalPortionsDistributed,
      estimatedKgFoodSaved,
      estimatedCo2SavedKg,
      totalDonors: donors.length,
      totalRecipients: recipients.length,
      totalVehicles: vehicles.length,
      availableVehicles,
      totalKmLogged: Math.round(totalKmLogged * 10) / 10
    },
    donations: {
      total: donations.length,
      pending: pendingDonationCount,
      approved: approvedDonationCount,
      active: activeDonationCount,
      rejected: rejectedDonationCount
    },
    bookings: {
      total: bookings.length,
      pending: pendingBookingsCount,
      allocated: allocatedBookingsCount,
      delivered: completedDeliveriesCount,
      rejected: rejectedBookingsCount
    }
  };
}

module.exports = {
  calculateDistributionStats
};
