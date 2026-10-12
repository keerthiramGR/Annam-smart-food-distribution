/**
 * Annam - Smart Food Distribution System
 * Super Admin Operations Command & Allocation Wizard
 */

class AdminController {
  constructor() {
    this.donations = [];
    this.bookings = [];
    this.vehicles = [];
    this.donors = [];
    this.recipients = [];
    this.auditLogs = [];
    this.stats = null;
    this.activeTab = 'tabAdminDonations';
    this.selectedBookingForEval = null;

    this.initEventListeners();
  }

  init() {
    this.loadAllData();
  }

  initEventListeners() {
    // Admin tab switching
    const tabBtns = document.querySelectorAll('.admin-nav-tab');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetId = btn.dataset.target;
        document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.add('hidden'));
        document.getElementById(targetId)?.classList.remove('hidden');
        this.activeTab = targetId;

        if (targetId === 'tabAdminFleet') this.renderFleetTab();
        else if (targetId === 'tabAdminEntities') this.renderEntitiesTab();
        else if (targetId === 'tabAdminLogs') this.renderAuditLogsTab();
      });
    });

    // Modal rejection confirm
    const rejectForm = document.getElementById('adminRejectForm');
    if (rejectForm) {
      rejectForm.addEventListener('submit', (e) => this.handleRejectConfirm(e));
    }
  }

  async loadAllData() {
    try {
      const [donations, bookings, vehicles, donors, recipients, logs, stats] = await Promise.all([
        window.api.getDonations(),
        window.api.getBookings(),
        window.api.getVehicles(),
        window.api.getDonors(),
        window.api.getRecipients(),
        window.api.getAuditLogs(),
        window.api.getStats()
      ]);

      this.donations = donations;
      this.bookings = bookings;
      this.vehicles = vehicles;
      this.donors = donors;
      this.recipients = recipients;
      this.auditLogs = logs;
      this.stats = stats;

      this.renderStatsOverview();
      this.renderDonationsQueue();
      this.renderBookingsQueue();
      this.populateVehicleSelectors();
    } catch (e) {
      console.error('Failed to load admin data:', e);
      window.app?.showToast('Error loading administrative data: ' + e.message, 'error');
    }
  }

  renderStatsOverview() {
    if (!this.stats) return;
    const s = this.stats.summary;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('adminStatTotalPortions', s.totalPortionsDonated);
    setVal('adminStatDistributed', s.totalPortionsDistributed);
    setVal('adminStatKgSaved', `${s.estimatedKgFoodSaved} kg`);
    setVal('adminStatCo2Saved', `${s.estimatedCo2SavedKg} kg`);
    setVal('adminStatFleet', `${s.availableVehicles} / ${s.totalVehicles} Ready`);
    setVal('adminStatKm', `${s.totalKmLogged} km`);
  }

  // ==================== TAB 1: DONATIONS QUEUE ====================
  renderDonationsQueue() {
    const container = document.getElementById('adminDonationsTableBody');
    if (!container) return;

    if (this.donations.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No donations submitted yet.</td></tr>`;
      return;
    }

    container.innerHTML = this.donations.map(don => {
      const statusClass = don.status.toLowerCase().replace(/\s+/g, '-');
      const isPending = don.status === 'Pending';
      const useByDate = new Date(don.useByDateTime);

      return `
        <tr>
          <td>
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <img src="${don.photoUrl}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=100&auto=format&fit=crop&q=80'" />
              <div>
                <strong style="color:var(--text-main);">${don.foodName}</strong>
                <div style="font-size:0.72rem; color:var(--text-dim);">${don.id} • ${don.category}</div>
              </div>
            </div>
          </td>
          <td>
            <div>${don.donorName}</div>
            <div style="font-size:0.72rem; color:var(--text-dim);">Loc: ${don.pickupLocationName || don.pickupLocationId}</div>
          </td>
          <td>
            <span class="portions-badge" style="font-weight:700;">${don.portionsRemaining} / ${don.portionsTotal}</span>
          </td>
          <td>
            <div style="font-size:0.75rem;">${don.qualityCondition}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${don.dietary}</div>
          </td>
          <td>
            <div style="font-size:0.78rem; font-family:var(--font-mono);">${useByDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            <div style="font-size:0.7rem; color:var(--text-dim);">${useByDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</div>
          </td>
          <td>
            <span class="donation-status-pill status-${statusClass}">${don.status}</span>
          </td>
          <td>
            <div style="display:flex; gap:0.4rem;">
              ${isPending ? `
                <button class="btn-sm btn-success" onclick="window.adminCtrl.approveDonation('${don.id}')">
                  ✓ Approve
                </button>
                <button class="btn-sm btn-danger" onclick="window.adminCtrl.openRejectModal('DONATION', '${don.id}')">
                  ✗ Reject
                </button>
              ` : `
                <span style="font-size:0.75rem; color:var(--text-dim);">${don.approvedAt ? 'Approved' : (don.rejectedAt ? 'Rejected' : 'Reviewed')}</span>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  async approveDonation(id) {
    try {
      const res = await window.api.approveDonation(id);
      window.app?.showToast(res.message || 'Donation approved successfully!', 'success');
      await this.loadAllData();
      window.app?.refreshStats();
    } catch (e) {
      window.app?.showToast(e.message || 'Failed to approve donation.', 'error');
    }
  }

  // ==================== TAB 2: BOOKINGS ALLOCATION WIZARD ====================
  populateVehicleSelectors() {
    const sel = document.getElementById('evalVehicleSelect');
    if (!sel) return;

    sel.innerHTML = '<option value="">-- Choose Transport Vehicle --</option>';
    this.vehicles.forEach(v => {
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = `${v.name} (${v.capacityPortions} portions max, ${v.status})`;
      sel.appendChild(opt);
    });
  }

  renderBookingsQueue() {
    const container = document.getElementById('adminBookingsList');
    if (!container) return;

    if (this.bookings.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">No booking requests found.</div>`;
      return;
    }

    container.innerHTML = this.bookings.map(b => {
      const statusClass = b.status.toLowerCase().replace(/\s+/g, '-');
      const isPending = b.status === 'Pending';
      const isAllocated = b.status === 'Allocated';
      const isInTransit = b.status === 'In-Transit';

      return `
        <div class="booking-item-card" id="bookingCard_${b.id}">
          <div class="booking-info-main">
            <img class="booking-thumb" src="${b.donation?.photoUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80'}" />
            <div class="booking-details">
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h4>Booking #${b.id}: ${b.portionsRequested} portions</h4>
                <span class="donation-status-pill status-${statusClass}">${b.status}</span>
              </div>
              <p>Recipient: <strong style="color:var(--text-main);">${b.recipientName}</strong> • Item: <strong style="color:var(--primary-light);">${b.donation?.foodName || 'Donation'}</strong></p>
              <div style="display:flex; gap:1rem; margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">
                <span>Sector: <strong>${b.deliveryLocationName || b.deliveryLocationId}</strong></span>
                <span>Requested: ${new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                ${b.specialInstructions ? `<span>Note: <em>${b.specialInstructions}</em></span>` : ''}
              </div>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
            ${isPending ? `
              <button class="btn-sm btn-primary" onclick="window.adminCtrl.openFeasibilityInspector('${b.id}')">
                ⚡ Evaluate & Allocate
              </button>
              <button class="btn-sm btn-danger" onclick="window.adminCtrl.openRejectModal('BOOKING', '${b.id}')">
                ✗ Reject
              </button>
            ` : ''}

            ${isAllocated ? `
              <button class="btn-sm btn-secondary" onclick="window.adminCtrl.updateDeliveryStatus('${b.id}', 'In-Transit')">
                🚀 Dispatch In-Transit
              </button>
              <button class="btn-sm btn-success" onclick="window.adminCtrl.updateDeliveryStatus('${b.id}', 'Delivered')">
                ✓ Mark Delivered
              </button>
            ` : ''}

            ${isInTransit ? `
              <button class="btn-sm btn-success" onclick="window.adminCtrl.updateDeliveryStatus('${b.id}', 'Delivered')">
                ✓ Mark Delivered
              </button>
            ` : ''}

            ${b.routeMetrics ? `
              <button class="btn-sm btn-secondary" onclick="window.adminCtrl.highlightBookingOnMap('${b.id}')">
                🗺️ Show on Map
              </button>
            ` : ''}
          </div>

          ${b.rejectionReason ? `
            <div class="rejection-banner">
              <strong>Rejection Details:</strong> ${b.rejectionReason}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  openFeasibilityInspector(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    this.selectedBookingForEval = booking;
    const modal = document.getElementById('feasibilityModal');
    if (!modal) return;

    document.getElementById('fezbBookingId').textContent = booking.id;
    document.getElementById('fezbRecipient').textContent = `${booking.recipientName} (${booking.deliveryLocationId})`;
    document.getElementById('fezbDonation').textContent = `${booking.donation?.foodName || 'Donation'} (${booking.donation?.donorName})`;
    document.getElementById('fezbDemand').textContent = `${booking.portionsRequested} portions`;

    // Clear previous simulation output
    document.getElementById('fezbResultsArea').innerHTML = `
      <div style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:1.5rem;">
        Select an available vehicle from the dropdown above and click <strong>"Run Feasibility Simulation"</strong> to verify constraints and compute Dijkstra route.
      </div>
    `;
    document.getElementById('btnConfirmAllocation').disabled = true;

    modal.classList.add('active');
  }

  async runFeasibilitySimulation() {
    if (!this.selectedBookingForEval) return;

    const vehicleSelect = document.getElementById('evalVehicleSelect');
    const vehicleId = vehicleSelect ? vehicleSelect.value : '';

    if (!vehicleId) {
      window.app?.showToast('Please select a vehicle to test allocation feasibility.', 'error');
      return;
    }

    const resultsArea = document.getElementById('fezbResultsArea');
    const confirmBtn = document.getElementById('btnConfirmAllocation');
    resultsArea.innerHTML = '<div style="color:var(--primary-light); font-size:0.85rem;">Computing Dijkstra shortest route and verifying perishable timing constraints...</div>';

    try {
      const evaluation = await window.api.evaluateBooking(this.selectedBookingForEval.id, vehicleId);
      const isPass = evaluation.isFeasible;
      const m = evaluation.metrics || {};

      resultsArea.innerHTML = `
        <div class="feasibility-box ${isPass ? 'pass' : 'fail'}">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <strong style="font-size:0.95rem; color:${isPass ? 'var(--primary-light)' : 'var(--accent-rose)'};">
              ${isPass ? '✓ ALL ALLOCATION CRITERIA PASSED' : '✗ INFEASIBLE ALLOCATION'}
            </strong>
            <span class="route-pill">${m.totalDistanceKm || 0} km • ${m.travelMinutes || 0} min transit</span>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.82rem;">
            <div class="check-item">
              <span class="check-icon ${m.requestedPortions <= m.remainingPortions ? 'pass' : 'fail'}">
                ${m.requestedPortions <= m.remainingPortions ? '✓' : '✗'}
              </span>
              <span>Food Stock: Requested <strong>${m.requestedPortions}</strong> portions ≤ Available <strong>${m.remainingPortions}</strong> portions</span>
            </div>

            <div class="check-item">
              <span class="check-icon ${m.vehicleCapacity >= m.requestedPortions ? 'pass' : 'fail'}">
                ${m.vehicleCapacity >= m.requestedPortions ? '✓' : '✗'}
              </span>
              <span>Vehicle Capacity: Transport capacity <strong>${m.vehicleCapacity}</strong> ≥ Demand <strong>${m.requestedPortions}</strong></span>
            </div>

            <div class="check-item">
              <span class="check-icon ${evaluation.route?.found ? 'pass' : 'fail'}">
                ${evaluation.route?.found ? '✓' : '✗'}
              </span>
              <span>Dijkstra Shortest Route: <strong>${evaluation.route?.nodeNames?.join(' ➔ ') || 'N/A'}</strong></span>
            </div>

            <div class="check-item">
              <span class="check-icon ${m.safetyMarginMinutes > 0 ? 'pass' : 'fail'}">
                ${m.safetyMarginMinutes > 0 ? '✓' : '✗'}
              </span>
              <div>
                <div>Strict Use-By Deadline: ${m.safetyMarginMinutes > 0 ? 'COMPLIANT' : 'VIOLATION'}</div>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">
                  Pickup buffer (${m.pickupLoadingBufferMin}m) + Road transit (${m.travelMinutes}m) + Handover buffer (${m.handoverBufferMin}m) = <strong>${m.totalMissionDurationMin}m mission duration</strong>.
                  <br/>
                  Estimated completion: <strong>${new Date(m.estimatedCompletionTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong> vs Use-by: <strong>${new Date(m.useByDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>.
                  <br/>
                  Freshness safety margin: <strong style="color:${m.safetyMarginMinutes > 0 ? 'var(--primary-light)' : 'var(--accent-rose)'};">${m.safetyMarginMinutes} minutes</strong>
                </div>
              </div>
            </div>
          </div>

          ${!isPass ? `
            <div class="rejection-banner" style="margin-top:0.75rem;">
              <strong>Feasibility Failure:</strong> ${evaluation.reason}
            </div>
          ` : ''}
        </div>
      `;

      confirmBtn.disabled = !isPass;
    } catch (e) {
      resultsArea.innerHTML = `<div class="rejection-banner">Simulation error: ${e.message}</div>`;
      confirmBtn.disabled = true;
    }
  }

  async confirmAllocation() {
    if (!this.selectedBookingForEval) return;
    const vehicleSelect = document.getElementById('evalVehicleSelect');
    const vehicleId = vehicleSelect ? vehicleSelect.value : '';

    if (!vehicleId) return;

    try {
      const res = await window.api.allocateBooking(this.selectedBookingForEval.id, vehicleId);
      window.app?.showToast(res.message || 'Booking allocated and delivery route locked!', 'success');
      this.closeFeasibilityModal();
      await this.loadAllData();
      window.app?.refreshStats();

      // Highlight on visualizer
      if (res.booking?.routePath && window.roadVisualizer) {
        window.roadVisualizer.highlightRoute(res.booking.routePath);
      }
    } catch (e) {
      window.app?.showToast(e.message || 'Allocation rejected.', 'error');
    }
  }

  closeFeasibilityModal() {
    const modal = document.getElementById('feasibilityModal');
    if (modal) modal.classList.remove('active');
    this.selectedBookingForEval = null;
  }

  async updateDeliveryStatus(bookingId, status) {
    try {
      const res = await window.api.updateDeliveryStatus(bookingId, status);
      window.app?.showToast(res.message || `Delivery status changed to ${status}`, 'success');
      await this.loadAllData();
      window.app?.refreshStats();
    } catch (e) {
      window.app?.showToast(e.message || 'Failed to update status', 'error');
    }
  }

  highlightBookingOnMap(bookingId) {
    const booking = this.bookings.find(b => b.id === bookingId);
    if (!booking || !booking.routePath || !window.roadVisualizer) return;
    window.roadVisualizer.highlightRoute(booking.routePath);
    // Scroll smoothly to graph section
    document.getElementById('roadGraphSection')?.scrollIntoView({ behavior: 'smooth' });
    window.app?.showToast(`Highlighted delivery route for Booking #${booking.id} on Road Map.`, 'info');
  }

  // ==================== REJECTION MODAL ====================
  openRejectModal(type, entityId) {
    const modal = document.getElementById('rejectModal');
    if (!modal) return;

    document.getElementById('rejectEntityType').value = type;
    document.getElementById('rejectEntityId').value = entityId;
    document.getElementById('rejectReasonInput').value = '';

    modal.classList.add('active');
  }

  closeRejectModal() {
    const modal = document.getElementById('rejectModal');
    if (modal) modal.classList.remove('active');
  }

  async handleRejectConfirm(e) {
    e.preventDefault();
    const type = document.getElementById('rejectEntityType').value;
    const entityId = document.getElementById('rejectEntityId').value;
    const reason = document.getElementById('rejectReasonInput').value.trim() || 'Operational constraint rejection.';

    try {
      if (type === 'DONATION') {
        await window.api.rejectDonation(entityId, reason);
        window.app?.showToast('Donation rejected.', 'info');
      } else if (type === 'BOOKING') {
        await window.api.rejectBooking(entityId, reason);
        window.app?.showToast('Booking rejected.', 'info');
      }
      this.closeRejectModal();
      await this.loadAllData();
      window.app?.refreshStats();
    } catch (err) {
      window.app?.showToast(err.message || 'Failed to reject entity.', 'error');
    }
  }

  // ==================== TAB 3: FLEET ====================
  renderFleetTab() {
    const container = document.getElementById('adminFleetGrid');
    if (!container) return;

    container.innerHTML = this.vehicles.map(v => {
      const isAvail = v.status === 'Available';
      return `
        <div class="card" style="display:flex; flex-direction:column; gap:0.75rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:1.05rem; color:var(--text-main);">${v.name}</strong>
            <span class="donation-status-pill ${isAvail ? 'status-approved' : 'status-pending'}">${v.status}</span>
          </div>
          <div style="font-size:0.8rem; color:var(--text-muted);">
            Plate: <strong style="color:var(--text-main); font-family:var(--font-mono);">${v.plateNumber}</strong> • Type: ${v.type}
          </div>
          <div class="donation-meta-grid" style="margin:0;">
            <div class="meta-field">
              <span class="meta-field-label">Portion Capacity</span>
              <span class="meta-field-val portions-badge">${v.capacityPortions} portions</span>
            </div>
            <div class="meta-field">
              <span class="meta-field-label">Speed Factor</span>
              <span class="meta-field-val">${v.speedMultiplier}x</span>
            </div>
            <div class="meta-field">
              <span class="meta-field-label">Driver</span>
              <span class="meta-field-val" style="font-size:0.75rem;">${v.driverName}</span>
            </div>
            <div class="meta-field">
              <span class="meta-field-label">Driver Phone</span>
              <span class="meta-field-val" style="font-size:0.75rem;">${v.driverPhone}</span>
            </div>
          </div>
          <div style="font-size:0.75rem; color:var(--text-dim);">
            ${v.temperatureControlled ? '❄️ Temperature controlled refrigeration enabled' : '📦 Dry secure cargo container'}
          </div>
        </div>
      `;
    }).join('');
  }

  // ==================== TAB 4: ENTITIES ====================
  renderEntitiesTab() {
    const donorsContainer = document.getElementById('adminDonorsList');
    const recipContainer = document.getElementById('adminRecipientsList');

    if (donorsContainer) {
      donorsContainer.innerHTML = this.donors.map(d => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:rgba(15,23,42,0.6); border-radius:var(--radius-sm); border:1px solid var(--border-glass); margin-bottom:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${d.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
            <div>
              <strong style="color:var(--text-main); font-size:0.88rem;">${d.name}</strong>
              <div style="font-size:0.72rem; color:var(--text-muted);">${d.type} • ${d.fssaiLicense}</div>
            </div>
          </div>
          <div style="text-align:right; font-size:0.75rem; color:var(--text-muted);">
            <div>Loc: <strong style="color:var(--text-main);">${d.locationId}</strong></div>
            <div>${d.phone}</div>
          </div>
        </div>
      `).join('');
    }

    if (recipContainer) {
      recipContainer.innerHTML = this.recipients.map(r => `
        <div style="display:flex; align-items:center; justify-content:space-between; padding:0.75rem; background:rgba(15,23,42,0.6); border-radius:var(--radius-sm); border:1px solid var(--border-glass); margin-bottom:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <img src="${r.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
            <div>
              <strong style="color:var(--text-main); font-size:0.88rem;">${r.name}</strong>
              <div style="font-size:0.72rem; color:var(--text-muted);">${r.category} • Coordinator: ${r.coordinator}</div>
            </div>
          </div>
          <div style="text-align:right; font-size:0.75rem; color:var(--text-muted);">
            <div>Capacity: <strong style="color:var(--primary-light);">${r.capacity} people</strong></div>
            <div>Loc: <strong style="color:var(--text-main);">${r.locationId}</strong></div>
          </div>
        </div>
      `).join('');
    }
  }

  // ==================== TAB 5: AUDIT LOGS ====================
  renderAuditLogsTab() {
    const container = document.getElementById('adminLogsList');
    if (!container) return;

    container.innerHTML = this.auditLogs.map(l => `
      <div style="padding:0.75rem; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.8rem; display:flex; align-items:flex-start; gap:0.75rem;">
        <span style="font-family:var(--font-mono); font-size:0.72rem; color:var(--text-dim); white-space:nowrap;">
          ${new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
        <span class="tag ${l.action.includes('REJECT') ? 'danger' : 'primary'}" style="font-size:0.68rem;">
          ${l.action}
        </span>
        <span style="color:var(--text-main);">${l.details}</span>
      </div>
    `).join('');
  }
}

window.AdminController = AdminController;
