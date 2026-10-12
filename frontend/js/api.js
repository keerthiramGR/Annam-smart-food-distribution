/**
 * Annam - Smart Food Distribution System
 * API Client Module
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg = data.error || data.reason || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.data = data;
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${endpoint}]:`, error);
    throw error;
  }
}

const api = {
  // Accounts & Auth
  getAccounts: () => request('/auth/accounts'),
  login: (role, id) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, id })
  }),

  // Donations
  getDonations: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.donorId) query.append('donorId', params.donorId);
    if (params.category) query.append('category', params.category);
    if (params.locationId) query.append('locationId', params.locationId);
    const qs = query.toString();
    return request(`/donations${qs ? `?${qs}` : ''}`);
  },
  getDonationById: (id) => request(`/donations/${id}`),
  createDonation: (data) => request('/donations', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Bookings
  getBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.recipientId) query.append('recipientId', params.recipientId);
    if (params.status) query.append('status', params.status);
    const qs = query.toString();
    return request(`/bookings${qs ? `?${qs}` : ''}`);
  },
  createBooking: (data) => request('/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Admin Actions
  approveDonation: (id) => request(`/admin/donations/${id}/approve`, { method: 'POST' }),
  rejectDonation: (id, reason) => request(`/admin/donations/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  evaluateBooking: (bookingId, vehicleId) => request(`/admin/bookings/${bookingId}/evaluate`, {
    method: 'POST',
    body: JSON.stringify({ vehicleId })
  }),
  allocateBooking: (bookingId, vehicleId) => request(`/admin/bookings/${bookingId}/allocate`, {
    method: 'POST',
    body: JSON.stringify({ vehicleId })
  }),
  rejectBooking: (bookingId, reason) => request(`/admin/bookings/${bookingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  }),
  updateDeliveryStatus: (bookingId, status) => request(`/admin/bookings/${bookingId}/status`, {
    method: 'POST',
    body: JSON.stringify({ status })
  }),
  getStats: () => request('/admin/stats'),
  getAuditLogs: () => request('/admin/audit-logs'),
  getDonors: () => request('/admin/donors'),
  getRecipients: () => request('/admin/recipients'),
  getVehicles: () => request('/admin/vehicles'),
  resetData: () => request('/admin/reset', { method: 'POST' }),

  // Routing & Road Graph
  getGraph: () => request('/routing/graph'),
  getLocations: () => request('/routing/locations'),
  getShortestPath: (from, to, vehicleId) => {
    const query = new URLSearchParams({ from, to });
    if (vehicleId) query.append('vehicleId', vehicleId);
    return request(`/routing/shortest-path?${query.toString()}`);
  }
};

window.api = api;
