/**
 * Annam - Smart Food Distribution System
 * Allocation & Feasibility Verification Service
 * 
 * Implements strict multi-constraint validation for Super Admin allocation:
 * 1. Food Availability & Non-over-allocation
 * 2. Recipient Demand vs Remaining Portions
 * 3. Vehicle Capacity & Availability
 * 4. Dijkstra Shortest Route & Transit Time calculation
 * 5. Strict Use-By Deadline Enforcement: (Pickup + Travel + Handover < Use-by Time)
 */

const { findShortestRoute, locationMap } = require('./dijkstraService');

// Standard operational safety buffers (in minutes)
const PICKUP_LOADING_BUFFER_MIN = 15; // Time required to load and inspect food at donor
const HANDOVER_UNLOADING_BUFFER_MIN = 10; // Time required to unload and hand over to recipient

/**
 * Evaluates feasibility of allocating a specific booking to a specific vehicle.
 * 
 * @param {object} booking - Booking request object
 * @param {object} donation - Food donation object
 * @param {object} recipient - Recipient facility object
 * @param {object} vehicle - Assigned transport vehicle object
 * @param {Date} [simulatedNow] - Optional reference time for testing
 * @returns {object} Detailed feasibility report { isFeasible, reason, metrics, route }
 */
function evaluateAllocationFeasibility(booking, donation, recipient, vehicle, simulatedNow = new Date()) {
  const issues = [];
  const now = new Date(simulatedNow);

  // 1. Check donation state
  if (!donation) {
    return { isFeasible: false, reason: 'Donation not found', checks: {} };
  }
  if (donation.status !== 'Approved' && donation.status !== 'Partially Allocated') {
    issues.push(`Donation is not in active available status (Current status: ${donation.status}). Super Admin must approve donation first.`);
  }

  // 2. Over-allocation check
  const requestedPortions = Number(booking.portionsRequested);
  const remainingPortions = Number(donation.portionsRemaining);

  if (requestedPortions <= 0) {
    issues.push('Requested portions must be greater than zero.');
  } else if (requestedPortions > remainingPortions) {
    issues.push(`Requested portions (${requestedPortions}) exceeds available remaining stock (${remainingPortions} portions).`);
  }

  // 3. Vehicle capacity check
  if (!vehicle) {
    issues.push('A delivery vehicle must be assigned for distribution.');
  } else {
    if (vehicle.status !== 'Available' && vehicle.currentBookingId !== booking.id) {
      issues.push(`Vehicle ${vehicle.name} (${vehicle.plateNumber}) is currently '${vehicle.status}' and unavailable.`);
    }
    if (vehicle.capacityPortions < requestedPortions) {
      issues.push(`Vehicle capacity (${vehicle.capacityPortions} portions) is lower than requested demand (${requestedPortions} portions). Please select a higher-capacity vehicle.`);
    }
  }

  // 4. Dijkstra Route Computation between Donor and Recipient
  const donorLocId = donation.pickupLocationId;
  const recipientLocId = recipient ? recipient.locationId : booking.deliveryLocationId;

  if (!donorLocId || !recipientLocId) {
    issues.push('Valid pickup and delivery location IDs are required to compute road route.');
  }

  let route = null;
  let travelMinutes = 0;
  let totalDistanceKm = 0;

  if (donorLocId && recipientLocId) {
    try {
      const speedMultiplier = vehicle ? (vehicle.speedMultiplier || 1.0) : 1.0;
      route = findShortestRoute(donorLocId, recipientLocId, speedMultiplier);
      if (!route.found) {
        issues.push(`No road network path connects ${donorLocId} and ${recipientLocId}.`);
      } else {
        travelMinutes = route.adjustedTimeMinutes;
        totalDistanceKm = route.totalDistanceKm;
      }
    } catch (err) {
      issues.push(`Routing computation error: ${err.message}`);
    }
  }

  // 5. Strict Use-By Time Constraint Check
  const useByDate = new Date(donation.useByDateTime);
  const prepDate = new Date(donation.preparationDateTime || donation.createdAt);

  if (isNaN(useByDate.getTime())) {
    issues.push('Donation lacks a valid use-by timestamp.');
  }

  // Earliest pickup start: cannot pickup before food is prepared or before now
  const earliestPickupStart = new Date(Math.max(now.getTime(), isNaN(prepDate.getTime()) ? now.getTime() : prepDate.getTime()));
  
  // Total delivery operation time = pickup loading buffer + transit travel time + recipient handover buffer
  const totalMissionMinutes = PICKUP_LOADING_BUFFER_MIN + travelMinutes + HANDOVER_UNLOADING_BUFFER_MIN;
  const estimatedCompletionTime = new Date(earliestPickupStart.getTime() + totalMissionMinutes * 60 * 1000);

  // Time remaining until use-by from estimated completion
  const safetyMarginMs = useByDate.getTime() - estimatedCompletionTime.getTime();
  const safetyMarginMinutes = Math.round(safetyMarginMs / (60 * 1000));

  if (safetyMarginMs <= 0) {
    const overdueMinutes = Math.abs(safetyMarginMinutes);
    issues.push(
      `Delivery deadline violation: Estimated completion at ${estimatedCompletionTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ` +
      `violates use-by deadline of ${useByDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${overdueMinutes} minutes. ` +
      `Food safety and freshness cannot be assured strictly before perishability window.`
    );
  }

  const isFeasible = issues.length === 0;

  return {
    isFeasible,
    reason: isFeasible ? 'All operational constraints, vehicle capacity, and use-by safety checks passed successfully.' : issues.join(' | '),
    issues,
    metrics: {
      requestedPortions,
      remainingPortions,
      vehicleCapacity: vehicle ? vehicle.capacityPortions : 0,
      pickupLoadingBufferMin: PICKUP_LOADING_BUFFER_MIN,
      travelMinutes,
      handoverBufferMin: HANDOVER_UNLOADING_BUFFER_MIN,
      totalMissionDurationMin: totalMissionMinutes,
      totalDistanceKm,
      earliestPickupTime: earliestPickupStart.toISOString(),
      estimatedCompletionTime: estimatedCompletionTime.toISOString(),
      useByDateTime: useByDate.toISOString(),
      safetyMarginMinutes,
      donorLocation: locationMap.get(donorLocId)?.name || donorLocId,
      recipientLocation: locationMap.get(recipientLocId)?.name || recipientLocId
    },
    route
  };
}

module.exports = {
  evaluateAllocationFeasibility,
  PICKUP_LOADING_BUFFER_MIN,
  HANDOVER_UNLOADING_BUFFER_MIN
};
