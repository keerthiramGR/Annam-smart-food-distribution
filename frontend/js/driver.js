/**
 * Annam - Smart Food Distribution System
 * Delivery Driver & Fleet GPS Tracking Controller
 * 
 * Manages driver persona, active delivery mission,
 * turn-by-turn Dijkstra GPS navigation, and delivery handover execution.
 */

class DriverController {
  constructor() {
    this.currentDriver = null; // Current active vehicle/driver
    this.vehicles = [];
    this.activeBooking = null;
    this.pollingTimer = null;
  }

  async init(user = null) {
    await this.loadVehicles();

    if (user) {
      this.currentDriver = user;
    } else if (this.vehicles.length > 0) {
      this.currentDriver = this.vehicles[0];
    }

    this.renderDriverBanner();
    this.renderDriverChips();
    await this.loadActiveMission();
    this.initEventListeners();
  }

  initEventListeners() {
    const btnPickup = document.getElementById('btnDriverStartTransit');
    const btnDeliver = document.getElementById('btnDriverCompleteDelivery');
    const btnRefresh = document.getElementById('btnDriverRefreshMission');

    if (btnPickup) {
      btnPickup.onclick = () => this.handleStatusUpdate('In-Transit');
    }
    if (btnDeliver) {
      btnDeliver.onclick = () => this.handleStatusUpdate('Delivered');
    }
    if (btnRefresh) {
      btnRefresh.onclick = () => this.loadActiveMission();
    }
  }

  async loadVehicles() {
    try {
      this.vehicles = await window.api.getVehicles();
    } catch (e) {
      console.warn('Could not load vehicles for driver view:', e);
      this.vehicles = [
        {
          id: 'veh_01',
          name: 'Eco-Van Alpha (EV-01)',
          plateNumber: 'TN-33-AX-2024',
          driverName: 'Ramesh Kumar (Erode Central)',
          driverPhone: '+91 98428 23456',
          status: 'Available',
          capacityPortions: 60
        },
        {
          id: 'veh_02',
          name: 'Kongu Express Heavy (TRK-02)',
          plateNumber: 'TN-33-TR-9988',
          driverName: 'Suresh Patel (Perundurai Highway)',
          driverPhone: '+91 98428 34567',
          status: 'Available',
          capacityPortions: 150
        },
        {
          id: 'veh_03',
          name: 'Bhavani Rapid Cargo Bike (MOTO-03)',
          plateNumber: 'TN-33-BK-4512',
          driverName: 'Vikram Das (Bhavani Link)',
          driverPhone: '+91 98428 45678',
          status: 'Available',
          capacityPortions: 30
        }
      ];
    }
  }

  switchDriver(vehicleId) {
    const v = this.vehicles.find(item => item.id === vehicleId);
    if (!v) return;
    this.currentDriver = v;
    this.renderDriverBanner();
    this.renderDriverChips();
    this.loadActiveMission();
    if (window.roadVisualizer) {
      window.roadVisualizer.updateVehicleModel(v.id);
    }
  }

  renderDriverBanner() {
    if (!this.currentDriver) return;
    const v = this.currentDriver;

    const nameEl = document.getElementById('driverBannerName');
    const metaEl = document.getElementById('driverBannerMeta');
    const statusEl = document.getElementById('driverBannerStatus');
    const vehNameEl = document.getElementById('driverBannerVehicle');

    if (nameEl) nameEl.textContent = v.driverName || 'Driver';
    if (metaEl) metaEl.textContent = `Fleet Vehicle: ${v.name} • License Plate: ${v.plateNumber} • Contact: ${v.driverPhone}`;
    if (vehNameEl) vehNameEl.textContent = v.plateNumber;
    if (statusEl) {
      statusEl.textContent = v.status || 'Available';
      statusEl.className = `tag ${v.status === 'In-Transit' ? 'primary' : 'secondary'}`;
    }
  }

  renderDriverChips() {
    const container = document.getElementById('driverPersonaChips');
    if (!container || !this.vehicles) return;

    container.innerHTML = this.vehicles.map(v => `
      <button type="button" class="persona-chip ${this.currentDriver?.id === v.id ? 'active' : ''}" 
              onclick="window.driverCtrl.switchDriver('${v.id}')">
        🚚 ${v.driverName.split(' ')[0]} (${v.plateNumber})
      </button>
    `).join('');
  }

  async loadActiveMission() {
    if (!this.currentDriver) return;

    const missionArea = document.getElementById('driverActiveMissionContent');
    if (!missionArea) return;

    try {
      const allBookings = await window.api.getBookings();
      // Find booking allocated to this vehicle that is Allocated or In-Transit
      const active = allBookings.find(b => 
        b.vehicleId === this.currentDriver.id && 
        (b.status === 'Allocated' || b.status === 'In-Transit')
      );

      this.activeBooking = active || null;

      if (!active) {
        missionArea.innerHTML = `
          <div class="driver-empty-mission">
            <div style="font-size:3rem; margin-bottom:0.75rem;">🅿️</div>
            <h4 style="color:var(--text-main); margin-bottom:0.4rem;">No Active Delivery Mission</h4>
            <p style="font-size:0.85rem; color:var(--text-muted); max-width:440px; margin:0 auto 1.25rem;">
              Vehicle <strong>${this.currentDriver.plateNumber}</strong> is currently on standby at Erode Depot.
              When Super Admin approves and allocates a food request, it will appear here instantly for live GPS navigation.
            </p>
            <button type="button" class="btn-secondary" style="padding:0.6rem 1.2rem;" onclick="window.app.switchRole('SUPER_ADMIN')">
              🛡️ Go to Admin Center to Allocate Booking
            </button>
          </div>
        `;
        return;
      }

      // Render Active Mission Card
      const don = active.donation || {};
      const metrics = active.routeMetrics || {};
      const pathNodes = active.routePath || [];

      missionArea.innerHTML = `
        <div class="driver-mission-active-card">
          <!-- Mission Header -->
          <div class="driver-mission-header">
            <div>
              <span class="driver-mission-badge ${active.status === 'In-Transit' ? 'in-transit' : 'allocated'}">
                ${active.status === 'In-Transit' ? '🚚 EN ROUTE TO RECIPIENT' : '📋 NEW MISSION ASSIGNED'}
              </span>
              <h3 style="margin-top:0.35rem; color:var(--text-main); font-size:1.25rem;">
                ${don.foodName || 'Cooked Surplus Food'}
              </h3>
              <div style="font-size:0.82rem; color:var(--text-muted);">
                Order #${active.id} • Demanded Portions: <strong style="color:var(--primary);">${active.portionsRequested} boxes</strong>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.1rem; font-weight:800; color:#059669;">${metrics.totalDistanceKm || 2.1} km</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">~${metrics.travelMinutes || 6} min Dijkstra transit</div>
            </div>
          </div>

          <!-- Stops Grid: Pickup -> Delivery -->
          <div class="driver-stops-grid">
            <!-- Pickup Stop -->
            <div class="driver-stop-box pickup-stop">
              <div class="driver-stop-header">
                <span class="stop-dot pickup"></span>
                <span class="stop-label">1. FOOD PICKUP (DONOR)</span>
              </div>
              <div class="stop-title">${don.donorName || 'Food Donor'}</div>
              <div class="stop-address">📍 ${don.pickupLocationName || 'Erode Central'}</div>
              <div class="stop-meta">
                <span>Dietary: ${don.category || 'Cooked Meals'}</span>
                <span>Storage: Keep Warm (>65°C)</span>
              </div>
            </div>

            <!-- Arrow Divider -->
            <div class="driver-stops-arrow">➔</div>

            <!-- Delivery Stop -->
            <div class="driver-stop-box delivery-stop">
              <div class="driver-stop-header">
                <span class="stop-dot delivery"></span>
                <span class="stop-label">2. DELIVERY DROP-OFF (SHELTER)</span>
              </div>
              <div class="stop-title">${active.recipientName || 'Recipient Shelter'}</div>
              <div class="stop-address">📍 ${active.deliveryLocationName || 'Shelter Receiving Dock'}</div>
              <div class="stop-meta">
                <span>Recipient Phone: ${active.recipientPhone || '+91 98427 11001'}</span>
                <span>Note: ${active.specialInstructions || 'Receiving dock open'}</span>
              </div>
            </div>
          </div>

          <!-- Dijkstra Step-By-Step Road Segment Flow -->
          <div class="driver-route-nav-preview">
            <div style="font-size:0.8rem; font-weight:800; color:var(--text-main); margin-bottom:0.4rem;">
              🧭 Optimal Dijkstra Highway Route:
            </div>
            <div class="driver-route-chips">
              ${pathNodes.map((n, idx) => `
                <span class="driver-route-node-pill">
                  <strong>${idx + 1}.</strong> ${window.roadVisualizer?.getNodeName(n) || n}
                </span>
                ${idx < pathNodes.length - 1 ? '<span class="driver-route-arrow">➔</span>' : ''}
              `).join('')}
            </div>
          </div>

          <!-- Driver Action Buttons -->
          <div class="driver-action-buttons">
            <button type="button" class="btn-primary" id="btnDriverStartTransit" 
                    style="flex:1; background:#0284c7; border-color:#0284c7;"
                    ${active.status === 'In-Transit' ? 'disabled' : ''}>
              <span>📦 1. Mark Food Picked Up & Depart</span>
            </button>
            <button type="button" class="btn-primary" id="btnDriverCompleteDelivery" 
                    style="flex:1; background:#059669; border-color:#059669;"
                    ${active.status !== 'In-Transit' ? 'disabled' : ''}>
              <span>🏁 2. Confirm Delivery Handover Complete</span>
            </button>
          </div>
        </div>
      `;

      // Re-bind listeners for the newly injected buttons
      this.initEventListeners();

      // Lock Dijkstra route on map visualizer
      if (pathNodes.length >= 2 && window.roadVisualizer) {
        window.roadVisualizer.updateVehicleModel(this.currentDriver.id);
        window.roadVisualizer.highlightRoute(pathNodes);
      }
    } catch (e) {
      console.error('Failed to load active mission:', e);
    }
  }

  async handleStatusUpdate(newStatus) {
    if (!this.activeBooking) return;

    try {
      const res = await window.api.updateDeliveryStatus(this.activeBooking.id, newStatus);
      if (newStatus === 'In-Transit') {
        window.app?.showToast(`Vehicle ${this.currentDriver.plateNumber} is now En Route! GPS Live Tracking active.`, 'success');
      } else if (newStatus === 'Delivered') {
        window.app?.showToast(`🎉 Order #${this.activeBooking.id} delivered successfully to ${this.activeBooking.recipientName}! Vehicle released.`, 'success');
      }

      await this.loadVehicles();
      const updatedV = this.vehicles.find(v => v.id === this.currentDriver.id);
      if (updatedV) this.currentDriver = updatedV;
      this.renderDriverBanner();
      await this.loadActiveMission();
      window.app?.refreshStats();
    } catch (err) {
      window.app?.showToast(err.message || 'Failed to update delivery status', 'error');
    }
  }
}

window.DriverController = DriverController;

