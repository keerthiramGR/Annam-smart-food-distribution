/**
 * Annam - Smart Food Distribution System
 * Recipient Dashboard Logic
 */

class RecipientController {
  constructor() {
    this.currentRecipient = null;
    this.donations = [];
    this.bookings = [];
    this.activeTab = 'catalog'; // 'catalog' or 'bookings'
    this.distanceCache = new Map();
    this.selectedDonationForBooking = null;

    this.initEventListeners();
  }

  setRecipient(recipient) {
    this.currentRecipient = recipient;
    this.distanceCache.clear();
    this.updateRecipientBanner();
    this.loadCatalog();
    this.loadMyBookings();
  }

  initEventListeners() {
    // Filter controls
    const catFilter = document.getElementById('catalogCategoryFilter');
    const locFilter = document.getElementById('catalogLocationFilter');
    const sortFilter = document.getElementById('catalogSortFilter');
    const searchInput = document.getElementById('catalogSearchInput');

    if (catFilter) catFilter.addEventListener('change', () => this.applyFiltersAndRender());
    if (locFilter) locFilter.addEventListener('change', () => this.applyFiltersAndRender());
    if (sortFilter) sortFilter.addEventListener('change', () => this.applyFiltersAndRender());
    if (searchInput) searchInput.addEventListener('input', () => this.applyFiltersAndRender());

    // Tab switching
    const tabCatalog = document.getElementById('recipientTabCatalog');
    const tabBookings = document.getElementById('recipientTabBookings');

    if (tabCatalog) {
      tabCatalog.addEventListener('click', () => {
        this.activeTab = 'catalog';
        tabCatalog.classList.add('active');
        if (tabBookings) tabBookings.classList.remove('active');
        document.getElementById('recipientCatalogView')?.classList.remove('hidden');
        document.getElementById('recipientBookingsView')?.classList.add('hidden');
      });
    }

    if (tabBookings) {
      tabBookings.addEventListener('click', () => {
        this.activeTab = 'bookings';
        tabBookings.classList.add('active');
        if (tabCatalog) tabCatalog.classList.remove('active');
        document.getElementById('recipientCatalogView')?.classList.add('hidden');
        document.getElementById('recipientBookingsView')?.classList.remove('hidden');
        this.loadMyBookings();
      });
    }

    // Booking modal form submission
    const bookingForm = document.getElementById('bookingRequestForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
    }
  }

  updateRecipientBanner() {
    if (!this.currentRecipient) return;
    const nameEl = document.getElementById('recipBannerName');
    const descEl = document.getElementById('recipBannerDesc');
    const avatarEl = document.getElementById('recipBannerAvatar');
    const capEl = document.getElementById('recipBannerCap');
    const locEl = document.getElementById('recipBannerLoc');

    if (nameEl) nameEl.textContent = this.currentRecipient.name;
    if (descEl) descEl.textContent = `${this.currentRecipient.category} • Coordinator: ${this.currentRecipient.coordinator} • ${this.currentRecipient.address}`;
    if (avatarEl && this.currentRecipient.avatar) avatarEl.src = this.currentRecipient.avatar;
    if (capEl) capEl.textContent = `Capacity: ${this.currentRecipient.capacity} beneficiaries`;
    if (locEl) locEl.textContent = `Sector: ${this.currentRecipient.locationId}`;
  }

  async loadCatalog() {
    const container = document.getElementById('recipientDonationGrid');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Searching available approved donations...</div>';

    try {
      // Only fetch Approved or Partially Allocated donations
      const all = await window.api.getDonations();
      this.donations = all.filter(d => (d.status === 'Approved' || d.status === 'Partially Allocated') && d.portionsRemaining > 0);
      await this.preloadDistances();
      this.applyFiltersAndRender();
    } catch (e) {
      container.innerHTML = `<div class="rejection-banner">Failed to load food donations: ${e.message}</div>`;
    }
  }

  async preloadDistances() {
    if (!this.currentRecipient?.locationId) return;
    const recipLoc = this.currentRecipient.locationId;

    for (const don of this.donations) {
      const donorLoc = don.pickupLocationId;
      const key = `${donorLoc}->${recipLoc}`;
      if (!this.distanceCache.has(key)) {
        try {
          const route = await window.api.getShortestPath(donorLoc, recipLoc, null);
          this.distanceCache.set(key, route);
        } catch (e) {
          this.distanceCache.set(key, { totalDistanceKm: 999, adjustedTimeMinutes: 999, found: false });
        }
      }
    }
  }

  async loadMyBookings() {
    if (!this.currentRecipient) return;
    const container = document.getElementById('recipientBookingsList');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Fetching your booking requests...</div>';

    try {
      this.bookings = await window.api.getBookings({ recipientId: this.currentRecipient.id });
      this.renderBookingsList();
    } catch (e) {
      container.innerHTML = `<div class="rejection-banner">Failed to load booking tracking: ${e.message}</div>`;
    }
  }

  applyFiltersAndRender() {
    const catFilter = document.getElementById('catalogCategoryFilter')?.value || 'All';
    const locFilter = document.getElementById('catalogLocationFilter')?.value || 'All';
    const sortFilter = document.getElementById('catalogSortFilter')?.value || 'useBy';
    const search = document.getElementById('catalogSearchInput')?.value.trim().toLowerCase() || '';

    let filtered = [...this.donations];

    if (catFilter !== 'All') {
      filtered = filtered.filter(d => d.category === catFilter);
    }

    if (locFilter !== 'All') {
      filtered = filtered.filter(d => d.pickupLocationId === locFilter);
    }

    if (search) {
      filtered = filtered.filter(d =>
        d.foodName.toLowerCase().includes(search) ||
        d.donorName.toLowerCase().includes(search) ||
        (d.pickupLocationName || '').toLowerCase().includes(search)
      );
    }

    // Sorters
    const recipLoc = this.currentRecipient?.locationId;
    if (sortFilter === 'useBy') {
      // Perishable first
      filtered.sort((a, b) => new Date(a.useByDateTime) - new Date(b.useByDateTime));
    } else if (sortFilter === 'distance' && recipLoc) {
      // Nearest donor first
      filtered.sort((a, b) => {
        const da = this.distanceCache.get(`${a.pickupLocationId}->${recipLoc}`)?.totalDistanceKm || 999;
        const db = this.distanceCache.get(`${b.pickupLocationId}->${recipLoc}`)?.totalDistanceKm || 999;
        return da - db;
      });
    } else if (sortFilter === 'portions') {
      filtered.sort((a, b) => b.portionsRemaining - a.portionsRemaining);
    }

    this.renderCatalog(filtered);
  }

  renderCatalog(items) {
    const container = document.getElementById('recipientDonationGrid');
    if (!container) return;

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-glass);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🔍</div>
          <div style="font-weight:700; color:var(--text-main);">No matching approved food donations found</div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Try relaxing your filters or check back when donors upload new surplus food.</p>
        </div>
      `;
      return;
    }

    const recipLoc = this.currentRecipient?.locationId;

    container.innerHTML = items.map(don => {
      const routeInfo = recipLoc ? this.distanceCache.get(`${don.pickupLocationId}->${recipLoc}`) : null;
      const distLabel = routeInfo?.found ? `${routeInfo.totalDistanceKm} km (${routeInfo.adjustedTimeMinutes} min transit)` : 'Graph connected';

      const useByDate = new Date(don.useByDateTime);
      const hoursLeft = Math.round((useByDate - Date.now()) / (3600 * 1000) * 10) / 10;
      const isUrgent = hoursLeft <= 2;

      return `
        <div class="donation-card">
          <div class="donation-img-wrap">
            <img class="donation-img" src="${don.photoUrl}" alt="${don.foodName}" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80'" />
            <span class="donation-status-pill status-approved">Available</span>
            <span class="category-tag-over">${don.category}</span>
          </div>

          <div class="donation-body">
            <h3 class="donation-title">${don.foodName}</h3>
            <div class="donation-donor">
              <span>🏢</span>
              <span>${don.donorName}</span>
            </div>

            <div class="donation-meta-grid">
              <div class="meta-field">
                <span class="meta-field-label">Available Portions</span>
                <span class="meta-field-val portions-badge">${don.portionsRemaining} / ${don.portionsTotal}</span>
              </div>
              <div class="meta-field">
                <span class="meta-field-label">Condition</span>
                <span class="meta-field-val" style="font-size:0.75rem;">${don.qualityCondition}</span>
              </div>
              <div class="meta-field">
                <span class="meta-field-label">Pickup Sector</span>
                <span class="meta-field-val" style="font-size:0.75rem;">${don.pickupLocationName || don.pickupLocationId}</span>
              </div>
              <div class="meta-field">
                <span class="meta-field-label">Route to Shelter</span>
                <span class="meta-field-val" style="font-size:0.75rem; color:var(--accent-indigo);">${distLabel}</span>
              </div>
            </div>

            <div class="countdown-box ${isUrgent ? 'urgent' : ''}">
              <span>⏳ Expires in:</span>
              <span>${hoursLeft > 0 ? `${hoursLeft} hours` : 'Perishing soon'} (${useByDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
            </div>

            <div class="donation-actions">
              <button class="btn-primary" onclick="window.recipientCtrl.openBookingModal('${don.id}')">
                <span>🍽️ Request Portions</span>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  openBookingModal(donationId) {
    const don = this.donations.find(d => d.id === donationId);
    if (!don || !this.currentRecipient) return;

    this.selectedDonationForBooking = don;
    const modal = document.getElementById('bookingModal');
    if (!modal) return;

    document.getElementById('modalDonationFoodName').textContent = don.foodName;
    document.getElementById('modalDonationDonor').textContent = don.donorName;
    document.getElementById('modalDonationRemaining').textContent = don.portionsRemaining;
    document.getElementById('modalPortionsInput').max = don.portionsRemaining;
    document.getElementById('modalPortionsInput').value = Math.min(25, don.portionsRemaining);

    // Route info display
    const recipLoc = this.currentRecipient.locationId;
    const routeInfo = this.distanceCache.get(`${don.pickupLocationId}->${recipLoc}`);
    const routePreviewEl = document.getElementById('modalRoutePreview');
    if (routePreviewEl) {
      if (routeInfo && routeInfo.found) {
        routePreviewEl.innerHTML = `
          <div style="font-size:0.8rem; color:var(--text-muted); display:flex; justify-content:space-between; align-items:center;">
            <span>Delivery Route: <strong>${don.pickupLocationId} ➔ ${recipLoc}</strong></span>
            <span class="route-pill">${routeInfo.totalDistanceKm} km • ~${routeInfo.adjustedTimeMinutes} min transit</span>
          </div>
        `;
      } else {
        routePreviewEl.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted);">Route will be mapped via Dijkstra on submission.</div>`;
      }
    }

    modal.classList.add('active');
  }

  closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    this.selectedDonationForBooking = null;
  }

  async handleBookingSubmit(e) {
    e.preventDefault();
    if (!this.selectedDonationForBooking || !this.currentRecipient) return;

    const portions = parseInt(document.getElementById('modalPortionsInput').value, 10);
    const instructions = document.getElementById('modalSpecialInstructions').value.trim();

    if (isNaN(portions) || portions <= 0) {
      window.app?.showToast('Please enter a valid portion count.', 'error');
      return;
    }

    if (portions > this.selectedDonationForBooking.portionsRemaining) {
      window.app?.showToast(`Cannot request more than ${this.selectedDonationForBooking.portionsRemaining} available portions.`, 'error');
      return;
    }

    const payload = {
      recipientId: this.currentRecipient.id,
      donationId: this.selectedDonationForBooking.id,
      portionsRequested: portions,
      specialInstructions: instructions
    };

    try {
      const res = await window.api.createBooking(payload);
      window.app?.showToast(res.message || 'Booking requested! Super Admin will review allocation.', 'success');
      this.closeBookingModal();
      await this.loadCatalog();
      await this.loadMyBookings();
      window.app?.refreshStats();

      // Switch to tracking tab to show user their booking
      const tabBookings = document.getElementById('recipientTabBookings');
      if (tabBookings) tabBookings.click();
    } catch (err) {
      window.app?.showToast(err.message || 'Booking request failed.', 'error');
    }
  }

  renderBookingsList() {
    const container = document.getElementById('recipientBookingsList');
    if (!container) return;

    if (this.bookings.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:3rem; background:var(--bg-card); border-radius:var(--radius-md); border:1px dashed var(--border-glass);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">📋</div>
          <div style="font-weight:700; color:var(--text-main);">No active food requests</div>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Browse available food donations in the catalog to request portions.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.bookings.map(b => {
      const statusClass = b.status.toLowerCase().replace(/\s+/g, '-');
      const photo = b.donation?.photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80';

      return `
        <div class="booking-item-card">
          <div class="booking-info-main">
            <img class="booking-thumb" src="${photo}" alt="Food" />
            <div class="booking-details">
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h4>${b.donation?.foodName || 'Food Donation'}</h4>
                <span class="donation-status-pill status-${statusClass}">${b.status}</span>
              </div>
              <p>Donor: <strong style="color:var(--text-main);">${b.donation?.donorName || 'Provider'}</strong> • Requested: <strong style="color:var(--primary-light);">${b.portionsRequested} portions</strong></p>
              <div style="display:flex; gap:1rem; margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted); flex-wrap:wrap;">
                <span>Requested on: ${new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                ${b.specialInstructions ? `<span>Note: <em>${b.specialInstructions}</em></span>` : ''}
              </div>
            </div>
          </div>

          <div class="booking-route-summary">
            ${b.vehicle ? `
              <div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.25); padding:0.4rem 0.6rem; border-radius:var(--radius-sm);">
                <div style="font-weight:700; color:var(--primary-light);">🚚 Allocated Vehicle: ${b.vehicle.name}</div>
                <div style="font-size:0.72rem; color:var(--text-muted);">Plate: ${b.vehicle.plateNumber} • Driver: ${b.vehicle.driverName} (${b.vehicle.driverPhone})</div>
              </div>
            ` : `
              <span style="font-size:0.78rem; color:var(--accent-amber);">⏳ Awaiting Admin Fleet Allocation</span>
            `}

            ${b.routeMetrics ? `
              <div style="margin-top:0.35rem; display:flex; align-items:center; gap:0.4rem;">
                <span class="route-pill">${b.routeMetrics.totalDistanceKm} km • ~${b.routeMetrics.travelMinutes}m transit</span>
                <span style="font-size:0.7rem; color:var(--text-dim);">${b.routeMetrics.donorLocation} ➔ ${b.routeMetrics.recipientLocation}</span>
              </div>
            ` : ''}
          </div>

          ${b.rejectionReason ? `
            <div class="rejection-banner">
              <strong>Admin Allocation Rejection:</strong> ${b.rejectionReason}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }
}

window.RecipientController = RecipientController;
