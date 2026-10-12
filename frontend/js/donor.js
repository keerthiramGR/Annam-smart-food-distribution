/**
 * Annam - Smart Food Distribution System
 * Donor Dashboard Logic
 */

class DonorController {
  constructor() {
    this.currentDonor = null;
    this.donations = [];
    this.initEventListeners();
  }

  setDonor(donor) {
    this.currentDonor = donor;
    this.updateDonorBanner();
    this.setDefaultLocation();
    this.loadMyDonations();
  }

  initEventListeners() {
    const form = document.getElementById('donationUploadForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleDonationSubmit(e));
    }

    // Preset photo selection
    document.querySelectorAll('.preset-photo-thumb').forEach(thumb => {
      thumb.addEventListener('click', (e) => {
        document.querySelectorAll('.preset-photo-thumb').forEach(t => t.classList.remove('selected'));
        thumb.classList.add('selected');
        const img = thumb.querySelector('img');
        const photoInput = document.getElementById('foodPhotoUrl');
        if (photoInput && img) {
          photoInput.value = img.src;
        }
      });
    });

    // Time increment helper buttons
    document.querySelectorAll('.time-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hours = parseFloat(btn.dataset.hours || '4');
        const useByInput = document.getElementById('foodUseByDateTime');
        if (useByInput) {
          const d = new Date();
          d.setMinutes(d.getMinutes() + Math.round(hours * 60));
          // Format as YYYY-MM-DDTHH:mm for datetime-local
          const pad = (n) => String(n).padStart(2, '0');
          useByInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        }
      });
    });
  }

  setDefaultLocation() {
    const locSelect = document.getElementById('foodPickupLocation');
    if (locSelect && this.currentDonor?.locationId) {
      locSelect.value = this.currentDonor.locationId;
    }
    // Set default prep time to current time
    const prepInput = document.getElementById('foodPrepDateTime');
    if (prepInput && !prepInput.value) {
      const d = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      prepInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    // Set default use-by to +6 hours
    const useByInput = document.getElementById('foodUseByDateTime');
    if (useByInput && !useByInput.value) {
      const d = new Date();
      d.setHours(d.getHours() + 6);
      const pad = (n) => String(n).padStart(2, '0');
      useByInput.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }

  updateDonorBanner() {
    if (!this.currentDonor) return;
    const nameEl = document.getElementById('donorBannerName');
    const descEl = document.getElementById('donorBannerDesc');
    const avatarEl = document.getElementById('donorBannerAvatar');
    const fssaiEl = document.getElementById('donorBannerFssai');
    const locEl = document.getElementById('donorBannerLoc');

    if (nameEl) nameEl.textContent = this.currentDonor.name;
    if (descEl) descEl.textContent = `${this.currentDonor.type} • Contact: ${this.currentDonor.phone} • ${this.currentDonor.address}`;
    if (avatarEl && this.currentDonor.avatar) avatarEl.src = this.currentDonor.avatar;
    if (fssaiEl) fssaiEl.textContent = this.currentDonor.fssaiLicense || 'FSSAI Certified';
    if (locEl) locEl.textContent = `Location: ${this.currentDonor.locationId}`;
  }

  async loadMyDonations() {
    if (!this.currentDonor) return;
    const container = document.getElementById('donorDonationsList');
    if (!container) return;

    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Loading donation inventory...</div>';

    try {
      this.donations = await window.api.getDonations({ donorId: this.currentDonor.id });
      this.renderDonationsList();
    } catch (e) {
      container.innerHTML = `<div class="rejection-banner">Failed to load donations: ${e.message}</div>`;
    }
  }

  renderDonationsList() {
    const container = document.getElementById('donorDonationsList');
    if (!container) return;

    if (this.donations.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2.5rem; color:var(--text-muted); border:1px dashed var(--border-glass); border-radius:var(--radius-md);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🥗</div>
          <div style="font-weight:700; color:var(--text-main);">No food donations registered yet</div>
          <p style="font-size:0.85rem; margin-top:0.25rem;">Use the form to list surplus cooked meals, bakery products or fresh food.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.donations.map(don => {
      const remainingPercent = Math.round((don.portionsRemaining / don.portionsTotal) * 100);
      const isUrgent = new Date(don.useByDateTime).getTime() - Date.now() < 2 * 3600 * 1000;
      const statusClass = don.status.toLowerCase().replace(/\s+/g, '-');

      return `
        <div class="booking-item-card">
          <div class="booking-info-main">
            <img class="booking-thumb" src="${don.photoUrl}" alt="${don.foodName}" onerror="this.src='https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=150&auto=format&fit=crop&q=80'" />
            <div class="booking-details">
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <h4>${don.foodName}</h4>
                <span class="donation-status-pill status-${statusClass}">${don.status}</span>
              </div>
              <p>Category: <strong style="color:var(--text-main);">${don.category}</strong> • Condition: ${don.qualityCondition}</p>
              <div style="display:flex; gap:1rem; margin-top:0.35rem; font-size:0.75rem; color:var(--text-muted);">
                <span>Pickup: <strong style="color:var(--text-main);">${don.pickupLocationName || don.pickupLocationId}</strong></span>
                <span>Portions: <strong style="color:var(--primary-light);">${don.portionsRemaining} / ${don.portionsTotal} left</strong></span>
              </div>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.4rem;">
            <div class="countdown-box ${isUrgent ? 'urgent' : ''}">
              <span>⏳ Use-by:</span>
              <span>${new Date(don.useByDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${new Date(don.useByDateTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
            </div>
            
            <div style="width:140px; background:rgba(255,255,255,0.08); height:6px; border-radius:3px; overflow:hidden;">
              <div style="width:${remainingPercent}%; background:var(--primary); height:100%;"></div>
            </div>
          </div>

          ${don.rejectionReason ? `
            <div class="rejection-banner">
              <strong>Admin Rejection Note:</strong> ${don.rejectionReason}
            </div>
          ` : ''}

          ${don.status === 'Pending' ? `
            <div style="width:100%; font-size:0.75rem; color:var(--accent-amber); background:rgba(245,158,11,0.1); padding:0.4rem 0.6rem; border-radius:var(--radius-sm); border:1px solid rgba(245,158,11,0.2);">
              ℹ️ Awaiting Super Admin safety verification. Once approved, recipient shelters can request portions.
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  async handleDonationSubmit(e) {
    e.preventDefault();
    if (!this.currentDonor) {
      window.app?.showToast('Please select a donor account first.', 'error');
      return;
    }

    const form = e.target;
    const foodName = form.foodName.value.trim();
    const category = form.category.value;
    const portionsTotal = parseInt(form.portionsTotal.value, 10);
    const photoUrl = form.photoUrl.value.trim();
    const qualityCondition = form.qualityCondition.value;
    const preparationDateTime = form.preparationDateTime.value;
    const useByDateTime = form.useByDateTime.value;
    const pickupLocationId = form.pickupLocationId.value;
    const dietary = form.dietary.value;
    const storageReq = form.storageReq.value;
    const notes = form.notes.value.trim();

    if (!foodName || !category || isNaN(portionsTotal) || portionsTotal <= 0 || !useByDateTime || !pickupLocationId) {
      window.app?.showToast('Please fill all mandatory fields properly.', 'error');
      return;
    }

    const payload = {
      donorId: this.currentDonor.id,
      foodName,
      category,
      portionsTotal,
      photoUrl,
      qualityCondition,
      preparationDateTime: new Date(preparationDateTime).toISOString(),
      useByDateTime: new Date(useByDateTime).toISOString(),
      pickupLocationId,
      dietary,
      storageReq,
      notes
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await window.api.createDonation(payload);
      window.app?.showToast(res.message || 'Donation uploaded successfully! Status: Pending Approval', 'success');
      form.reset();
      this.setDefaultLocation();
      await this.loadMyDonations();
      window.app?.refreshStats();
    } catch (err) {
      window.app?.showToast(err.message || 'Failed to submit food donation.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }
}

window.DonorController = DonorController;
