/**
 * Annam - Smart Food Distribution System
 * Core Application Controller (3-Door Login & Light Theme Edition)
 */

class App {
  constructor() {
    this.currentRole = null; // null when logged out, or 'DONOR', 'RECIPIENT', 'SUPER_ADMIN'
    this.currentUser = null;
    this.accounts = { donors: [], recipients: [], admin: null };

    this.donorCtrl = null;
    this.recipientCtrl = null;
    this.adminCtrl = null;
    this.roadVisualizer = null;

    this.init();
  }

  async init() {
    this.initControllers();
    this.initEventListeners();
    await this.loadAccounts();
    await this.refreshStats();

    // Show Login Gateway initially
    this.showLoginGateway();
  }

  initControllers() {
    this.donorCtrl = new window.DonorController();
    this.recipientCtrl = new window.RecipientController();
    this.adminCtrl = new window.AdminController();
    this.roadVisualizer = new window.RoadGraphVisualizer('roadGraphCanvas');

    window.donorCtrl = this.donorCtrl;
    window.recipientCtrl = this.recipientCtrl;
    window.adminCtrl = this.adminCtrl;
    window.roadVisualizer = this.roadVisualizer;
  }

  initEventListeners() {
    // 3-Door Login Buttons
    const btnLoginDonor = document.getElementById('btnLoginDonor');
    const btnLoginRecipient = document.getElementById('btnLoginRecipient');
    const btnLoginAdmin = document.getElementById('btnLoginAdmin');

    if (btnLoginDonor) {
      btnLoginDonor.addEventListener('click', () => {
        const sel = document.getElementById('loginDonorSelect');
        const donorId = sel ? sel.value : null;
        const donor = this.accounts.donors.find(d => d.id === donorId) || this.accounts.donors[0];
        if (donor) {
          this.loginAs(donor, 'DONOR');
        }
      });
    }

    if (btnLoginRecipient) {
      btnLoginRecipient.addEventListener('click', () => {
        const sel = document.getElementById('loginRecipSelect');
        const recipId = sel ? sel.value : null;
        const recip = this.accounts.recipients.find(r => r.id === recipId) || this.accounts.recipients[0];
        if (recip) {
          this.loginAs(recip, 'RECIPIENT');
        }
      });
    }

    if (btnLoginAdmin) {
      btnLoginAdmin.addEventListener('click', () => {
        if (this.accounts.admin) {
          this.loginAs(this.accounts.admin, 'SUPER_ADMIN');
        }
      });
    }

    // Logout button
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        this.logout();
      });
    }

    // Brand logo click
    const brandLogo = document.getElementById('brandLogoBtn');
    if (brandLogo) {
      brandLogo.addEventListener('click', () => {
        if (this.currentUser) {
          this.switchRole(this.currentRole);
        } else {
          this.showLoginGateway();
        }
      });
    }

    // Role Switcher Navigation buttons (when logged in)
    document.querySelectorAll('.role-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const role = btn.dataset.role;
        this.switchRole(role);
      });
    });

    // Reset Prototype Data button
    const resetBtn = document.getElementById('btnResetData');
    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (confirm('Reset prototype data to initial sample dataset?')) {
          try {
            await window.api.resetData();
            this.showToast('Prototype data successfully reset to clean state.', 'success');
            await this.loadAccounts();
            await this.refreshStats();
            if (this.currentUser) {
              this.switchRole(this.currentRole);
            }
          } catch (e) {
            this.showToast('Failed to reset: ' + e.message, 'error');
          }
        }
      });
    }

    // Road Graph Route Calculator trigger button
    const calcRouteBtn = document.getElementById('btnCalculateRoute');
    if (calcRouteBtn) {
      calcRouteBtn.addEventListener('click', () => {
        this.roadVisualizer?.calculateCurrentRoute();
      });
    }
  }

  async loadAccounts() {
    try {
      this.accounts = await window.api.getAccounts();
      this.populateLoginDropdowns();
      this.renderPersonaChips();
    } catch (e) {
      console.error('Failed to load accounts:', e);
      this.showToast('Could not load accounts list.', 'error');
    }
  }

  populateLoginDropdowns() {
    const donorSel = document.getElementById('loginDonorSelect');
    const recipSel = document.getElementById('loginRecipSelect');

    if (donorSel && this.accounts.donors) {
      donorSel.innerHTML = this.accounts.donors.map(d => `
        <option value="${d.id}">${d.name} (${d.type} - ${d.locationId})</option>
      `).join('');
    }

    if (recipSel && this.accounts.recipients) {
      recipSel.innerHTML = this.accounts.recipients.map(r => `
        <option value="${r.id}">${r.name} (${r.category} - ${r.locationId})</option>
      `).join('');
    }
  }

  renderPersonaChips() {
    const donorChips = document.getElementById('donorPersonaChips');
    const recipChips = document.getElementById('recipPersonaChips');

    if (donorChips) {
      donorChips.innerHTML = this.accounts.donors.map(d => `
        <button class="persona-chip ${this.currentUser?.id === d.id ? 'active' : ''}" 
                onclick="window.app.switchUserById('DONOR', '${d.id}')">
          ${d.name.split(' ')[0]} (${d.type.split(' ')[0]})
        </button>
      `).join('');
    }

    if (recipChips) {
      recipChips.innerHTML = this.accounts.recipients.map(r => `
        <button class="persona-chip ${this.currentUser?.id === r.id ? 'active' : ''}" 
                onclick="window.app.switchUserById('RECIPIENT', '${r.id}')">
          ${r.name.split(' ')[0]} (${r.category.split(' ')[0]})
        </button>
      `).join('');
    }
  }

  showLoginGateway() {
    this.currentUser = null;
    this.currentRole = null;

    document.getElementById('loginGatewayView').style.display = 'block';
    document.getElementById('appMainContent').style.display = 'none';

    document.getElementById('mainRoleNav').style.display = 'none';
    document.getElementById('headerProfileBadge').style.display = 'none';
    document.getElementById('btnLogout').style.display = 'none';
  }

  loginAs(user, role) {
    this.currentUser = user;
    this.currentRole = role;

    document.getElementById('loginGatewayView').style.display = 'none';
    document.getElementById('appMainContent').style.display = 'block';

    document.getElementById('mainRoleNav').style.display = 'flex';
    document.getElementById('headerProfileBadge').style.display = 'flex';
    document.getElementById('btnLogout').style.display = 'flex';

    this.switchRole(role, user);
    this.showToast(`Logged in successfully as ${user.name} (${role})`, 'success');

    // Ensure road network canvas resizes and computes initial route once visible
    setTimeout(() => {
      this.roadVisualizer?.resizeCanvas();
      this.roadVisualizer?.calculateCurrentRoute();
    }, 60);
  }

  logout() {
    this.showToast('Logged out of active session.', 'info');
    this.showLoginGateway();
  }

  switchRole(role, specificUser = null) {
    this.currentRole = role;

    // Update active nav button
    document.querySelectorAll('.role-nav-btn').forEach(b => {
      if (b.dataset.role === role) b.classList.add('active');
      else b.classList.remove('active');
    });

    // Update active dashboard view
    document.querySelectorAll('.dashboard-view').forEach(v => v.classList.remove('active'));

    if (role === 'DONOR') {
      document.getElementById('viewDonor')?.classList.add('active');
      const targetDonor = specificUser || (this.currentUser?.role === 'DONOR' ? this.currentUser : this.accounts.donors[0]);
      this.switchUser(targetDonor);
    } else if (role === 'RECIPIENT') {
      document.getElementById('viewRecipient')?.classList.add('active');
      const targetRecip = specificUser || (this.currentUser?.role === 'RECIPIENT' ? this.currentUser : this.accounts.recipients[0]);
      this.switchUser(targetRecip);
    } else if (role === 'SUPER_ADMIN') {
      document.getElementById('viewAdmin')?.classList.add('active');
      if (this.accounts.admin) {
        this.switchUser(this.accounts.admin);
        this.adminCtrl?.init();
      }
    }

    // Scroll to top of dashboard
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Ensure road graph visualizer adapts to updated viewport
    setTimeout(() => {
      this.roadVisualizer?.resizeCanvas();
    }, 60);
  }

  switchUserById(role, id) {
    let user = null;
    if (role === 'DONOR') user = this.accounts.donors.find(d => d.id === id);
    else if (role === 'RECIPIENT') user = this.accounts.recipients.find(r => r.id === id);
    else if (role === 'SUPER_ADMIN') user = this.accounts.admin;

    if (user) {
      this.switchUser(user);
    }
  }

  switchUser(user) {
    this.currentUser = user;
    this.updateHeaderProfile();
    this.renderPersonaChips();

    if (user.role === 'DONOR') {
      this.donorCtrl?.setDonor(user);
    } else if (user.role === 'RECIPIENT') {
      this.recipientCtrl?.setRecipient(user);
    } else if (user.role === 'SUPER_ADMIN') {
      this.adminCtrl?.init();
    }
  }

  updateHeaderProfile() {
    if (!this.currentUser) return;
    const nameEl = document.getElementById('headerUserName');
    const roleEl = document.getElementById('headerUserRole');
    const avatarEl = document.getElementById('headerUserAvatar');

    if (nameEl) nameEl.textContent = this.currentUser.name;
    if (roleEl) roleEl.textContent = this.currentUser.role.replace('_', ' ');
    if (avatarEl && this.currentUser.avatar) avatarEl.src = this.currentUser.avatar;
  }

  async refreshStats() {
    try {
      const stats = await window.api.getStats();
      const s = stats.summary;

      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
      };

      setVal('statPortionsDonated', s.totalPortionsDonated);
      setVal('statKgSaved', `${s.estimatedKgFoodSaved} kg`);
      setVal('statCo2Saved', `${s.estimatedCo2SavedKg} kg`);
      setVal('statFleetReady', `${s.availableVehicles} / ${s.totalVehicles}`);
    } catch (e) {
      console.warn('Could not refresh stats:', e);
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✓';
    else if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-weight:800; font-size:1rem;">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
