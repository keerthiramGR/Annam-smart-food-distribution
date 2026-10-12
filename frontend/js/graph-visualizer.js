/**
 * Annam - Smart Food Distribution System
 * Live GPS Navigation & Dijkstra Tracking Visualizer
 * Features real-time GPS vehicle movement, radar beacons, turn-by-turn HUD, and dynamic telemetry.
 */

class RoadGraphVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.edges = [];
    this.highlightedPath = [];
    this.highlightedNodes = new Set();
    this.selectedSource = 'LOC_01';
    this.selectedTarget = 'LOC_04';
    this.animationId = null;

    // GPS Navigation & Telemetry State
    this.gpsProgress = 0.0;
    this.gpsPlaying = true;
    this.gpsSpeedFactor = 1.0;
    this.dashOffset = 0;
    this.pulseAngle = 0;
    this.currentRoute = null;
    this.vehicleInfo = {
      id: 'veh_01',
      name: 'Eco-Van Alpha (EV-01)',
      type: 'van',
      plate: 'KA-01-EV-2024',
      baseSpeed: 42
    };

    this.init();
  }

  async init() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.contentRect.width > 0) {
            this.resizeCanvas();
          }
        }
      });
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    this.initGpsHudControls();

    try {
      const data = await window.api.getGraph();
      this.nodes = data.nodes || [];
      this.edges = data.edges || [];
      this.populateSelectDropdowns();
      this.resizeCanvas();
      this.setupCanvasClicks();
      this.startGpsLoop();
    } catch (e) {
      console.error('Failed to load road graph data:', e);
    }
  }

  initGpsHudControls() {
    const btnPlayPause = document.getElementById('btnGpsPlayPause');
    const playIcon = document.getElementById('gpsPlayIcon');
    if (btnPlayPause) {
      btnPlayPause.addEventListener('click', () => {
        this.gpsPlaying = !this.gpsPlaying;
        if (playIcon) {
          playIcon.textContent = this.gpsPlaying ? '⏸' : '▶';
        }
      });
    }

    const progressTrack = document.getElementById('gpsProgressTrack');
    if (progressTrack) {
      progressTrack.addEventListener('click', (e) => {
        const rect = progressTrack.getBoundingClientRect();
        const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.gpsProgress = clickRatio;
        this.render();
      });
    }

    document.querySelectorAll('.gps-speed-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.gps-speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.gpsSpeedFactor = parseFloat(btn.dataset.speed) || 1.0;
      });
    });
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : null;
    let w = (rect && rect.width > 0) ? rect.width : (parent ? parent.clientWidth : 0);
    if (!w || w <= 0) {
      const container = document.querySelector('.graph-container') || document.querySelector('.main-content');
      const cRect = container ? container.getBoundingClientRect() : null;
      w = (cRect && cRect.width > 0) ? cRect.width * 0.65 : 720;
    }
    this.canvas.width = Math.round(w);
    this.canvas.height = Math.round(Math.max(500, parent ? parent.clientHeight : 520));
    this.render();
  }

  populateSelectDropdowns() {
    const fromSelect = document.getElementById('routeFromSelect');
    const toSelect = document.getElementById('routeToSelect');
    const vehicleSelect = document.getElementById('routeVehicleSelect');

    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    this.nodes.forEach(node => {
      const opt1 = document.createElement('option');
      opt1.value = node.id;
      opt1.textContent = `${node.name} (${node.sector})`;
      fromSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = node.id;
      opt2.textContent = `${node.name} (${node.sector})`;
      toSelect.appendChild(opt2);
    });

    if (this.nodes.length >= 4) {
      fromSelect.value = 'LOC_01'; // City Center
      toSelect.value = 'LOC_04';   // South Riverside
      this.selectedSource = 'LOC_01';
      this.selectedTarget = 'LOC_04';
    }

    fromSelect.onchange = () => {
      this.selectedSource = fromSelect.value;
      this.calculateCurrentRoute();
    };
    toSelect.onchange = () => {
      this.selectedTarget = toSelect.value;
      this.calculateCurrentRoute();
    };
    if (vehicleSelect) {
      vehicleSelect.onchange = () => {
        this.updateVehicleModel(vehicleSelect.value);
        this.calculateCurrentRoute();
      };
    }

    // Calculate initial route
    this.updateVehicleModel(vehicleSelect ? vehicleSelect.value : '');
    this.calculateCurrentRoute();
  }

  updateVehicleModel(vehicleId) {
    if (vehicleId === 'veh_02') {
      this.vehicleInfo = { id: 'veh_02', name: 'City Express Heavy (TRK-02)', type: 'truck', plate: 'KA-01-TR-9988', baseSpeed: 38 };
    } else if (vehicleId === 'veh_03') {
      this.vehicleInfo = { id: 'veh_03', name: 'Rapid Cargo Bike (MOTO-03)', type: 'bike', plate: 'KA-01-BK-4512', baseSpeed: 52 };
    } else {
      this.vehicleInfo = { id: 'veh_01', name: 'Eco-Van Alpha (EV-01)', type: 'van', plate: 'KA-01-EV-2024', baseSpeed: 44 };
    }

    const vehNameEl = document.getElementById('gpsVehicleName');
    if (vehNameEl) vehNameEl.textContent = this.vehicleInfo.name;
  }

  setupCanvasClicks() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      const scaleX = this.canvas.width / 720;
      const scaleY = this.canvas.height / 520;

      for (const node of this.nodes) {
        const nx = node.x * scaleX;
        const ny = node.y * scaleY;
        const dist = Math.hypot(nx - mouseX, ny - mouseY);

        if (dist <= 26) {
          this.handleNodeClick(node.id);
          break;
        }
      }
    });
  }

  handleNodeClick(nodeId) {
    const fromSelect = document.getElementById('routeFromSelect');
    const toSelect = document.getElementById('routeToSelect');

    if (!this.selectedSource || (this.selectedSource && this.selectedTarget)) {
      this.selectedSource = nodeId;
      this.selectedTarget = null;
      if (fromSelect) fromSelect.value = nodeId;
      window.app?.showToast(`GPS Origin Set: ${this.getNodeName(nodeId)}`, 'info');
    } else {
      this.selectedTarget = nodeId;
      if (toSelect) toSelect.value = nodeId;
      window.app?.showToast(`GPS Destination Set: ${this.getNodeName(nodeId)}`, 'info');
      this.calculateCurrentRoute();
    }
    this.render();
  }

  async calculateCurrentRoute() {
    const fromSelect = document.getElementById('routeFromSelect');
    const toSelect = document.getElementById('routeToSelect');
    const vehicleSelect = document.getElementById('routeVehicleSelect');

    const from = fromSelect ? fromSelect.value : this.selectedSource;
    const to = toSelect ? toSelect.value : this.selectedTarget;
    const vehicleId = vehicleSelect ? vehicleSelect.value : null;

    if (!from || !to) return;

    try {
      const route = await window.api.getShortestPath(from, to, vehicleId);
      this.currentRoute = route;
      this.highlightRoute(route.path);
      this.updateRouteSummaryUI(route);
      this.gpsProgress = 0.0; // Reset trip animation to start
    } catch (err) {
      window.app?.showToast(err.message, 'error');
    }
  }

  highlightRoute(pathArray) {
    this.highlightedPath = pathArray || [];
    this.highlightedNodes = new Set(this.highlightedPath);
    this.render();
  }

  updateRouteSummaryUI(route) {
    const summaryCard = document.getElementById('dijkstraRouteSummary');
    if (!summaryCard) return;

    if (!route || !route.found) {
      summaryCard.innerHTML = `<div class="form-help">No road path available between selected nodes.</div>`;
      return;
    }

    summaryCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
        <span style="font-weight:800; color:#059669; font-size:0.9rem;">📍 Optimal Dijkstra Path</span>
        <span class="route-pill" style="background:#ecfdf5; color:#065f46; border:1px solid #a7f3d0; font-weight:700;">
          ${route.totalDistanceKm} km • ${route.adjustedTimeMinutes} min
        </span>
      </div>
      <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">
        Legs: <span style="font-family:var(--font-mono); color:var(--text-main); font-weight:700;">${route.path.length - 1} road segments</span>
      </div>
      <div class="route-steps-list">
        ${route.path.map((nodeId, idx) => `
          <div class="route-step-node" id="stepNode_${idx}">
            <span class="node-dot ${idx === 0 ? 'active' : ''}"></span>
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:#059669; font-weight:800;">${idx + 1}.</span>
            <span style="font-weight:700; color:var(--text-main);">${this.getNodeName(nodeId)}</span>
            <span style="font-size:0.72rem; color:var(--text-dim); margin-left:auto; font-family:var(--font-mono);">${nodeId}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  getNodeName(id) {
    const n = this.nodes.find(item => item.id === id);
    return n ? n.name : id;
  }

  startGpsLoop() {
    const loop = () => {
      this.pulseAngle += 0.05;

      if (this.gpsPlaying && this.highlightedPath.length > 1) {
        // Increment GPS progress along route
        const speedStep = 0.0022 * this.gpsSpeedFactor;
        this.gpsProgress += speedStep;
        if (this.gpsProgress > 1.0) {
          this.gpsProgress = 0.0; // Loop trip continuously
        }
        this.dashOffset -= 1.8; // Forward flowing chevrons
      }

      this.updateGpsHudTelemetry();
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    loop();
  }

  updateGpsHudTelemetry() {
    if (!this.currentRoute || this.highlightedPath.length < 2) return;

    // Progress bar
    const pBar = document.getElementById('gpsProgressBar');
    if (pBar) {
      pBar.style.width = `${(this.gpsProgress * 100).toFixed(1)}%`;
    }

    // Remaining distance & time
    const totalDist = this.currentRoute.totalDistanceKm || 5.0;
    const totalTime = this.currentRoute.adjustedTimeMinutes || 12.0;

    const remainingDist = Math.max(0, (totalDist * (1 - this.gpsProgress))).toFixed(1);
    const remainingTime = Math.max(0, (totalTime * (1 - this.gpsProgress))).toFixed(1);

    const distEl = document.getElementById('gpsRemainingDist');
    if (distEl) distEl.textContent = `${remainingDist} km`;

    const timeEl = document.getElementById('gpsRemainingTime');
    if (timeEl) timeEl.textContent = `${remainingTime} mins`;

    // Speedometer dynamic fluctuation
    const baseSpeed = this.vehicleInfo.baseSpeed;
    const fluctuation = Math.sin(this.pulseAngle * 1.5) * 4;
    const liveSpeed = Math.round(baseSpeed + fluctuation);
    const speedEl = document.getElementById('gpsSpeedValue');
    if (speedEl) speedEl.textContent = liveSpeed;

    // Turn instruction
    const totalSegments = this.highlightedPath.length - 1;
    const segmentIndex = Math.min(Math.floor(this.gpsProgress * totalSegments), totalSegments - 1);
    const currNodeId = this.highlightedPath[segmentIndex];
    const nextNodeId = this.highlightedPath[segmentIndex + 1];

    const turnTextEl = document.getElementById('gpsTurnText');
    const turnIconEl = document.getElementById('gpsTurnIcon');

    if (turnTextEl && turnIconEl) {
      if (this.gpsProgress >= 0.96) {
        turnIconEl.textContent = '🏁';
        turnTextEl.textContent = `Arriving at ${this.getNodeName(nextNodeId)} (Shelter Delivery Point)`;
      } else {
        turnIconEl.textContent = '➔';
        turnTextEl.textContent = `En Route: ${this.getNodeName(currNodeId)} ➔ Next: ${this.getNodeName(nextNodeId)}`;
      }
    }
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    if (this.canvas.width <= 0 || this.canvas.height <= 0) {
      this.resizeCanvas();
    }
    const ctx = this.ctx;
    const w = this.canvas.width || 720;
    const h = this.canvas.height || 520;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    // ==========================================
    // 1. SLEEK GPS NAVIGATION MAP BACKGROUND
    // ==========================================
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0f172a'); // Slate 900
    bgGrad.addColorStop(1, '#020617'); // Slate 950
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle GPS grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.35)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Coordinate scale factors (base domain: 720 x 520)
    const scaleX = w / 720;
    const scaleY = h / 520;

    const nodePosMap = new Map();
    this.nodes.forEach(n => {
      nodePosMap.set(n.id, { x: n.x * scaleX, y: n.y * scaleY });
    });

    // ==========================================
    // 2. DRAW BASE ROAD NETWORK (GRAY STREETS)
    // ==========================================
    this.edges.forEach(edge => {
      const fromPos = nodePosMap.get(edge.from);
      const toPos = nodePosMap.get(edge.to);
      if (!fromPos || !toPos) return;

      const isPathEdge = this.isEdgeInPath(edge.from, edge.to);
      if (isPathEdge) return; // Drawn in glowing GPS pass below

      // Road casing
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Road centerline
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Metrics pill at midpoint
      const midX = (fromPos.x + toPos.x) / 2;
      const midY = (fromPos.y + toPos.y) / 2;
      ctx.fillStyle = '#64748b';
      ctx.font = '600 8.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${edge.distanceKm}k`, midX, midY - 3);
    });

    // ==========================================
    // 3. DRAW ACTIVE GLOWING GPS ROUTE
    // ==========================================
    if (this.highlightedPath.length > 1) {
      this.drawGpsRoutePolyline(nodePosMap);
    }

    // ==========================================
    // 4. DRAW ALL SECTOR NODES & BEACONS
    // ==========================================
    this.nodes.forEach(node => {
      const pos = nodePosMap.get(node.id);
      if (!pos) return;

      const isStart = this.highlightedPath[0] === node.id;
      const isEnd = this.highlightedPath[this.highlightedPath.length - 1] === node.id;
      const isWayPoint = this.highlightedNodes.has(node.id) && !isStart && !isEnd;

      if (isStart) {
        // Pulsing Pickup Radar Rings
        const ring1 = (this.pulseAngle * 12) % 32;
        const ring2 = ((this.pulseAngle * 12) + 16) % 32;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ring1, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - ring1 / 32)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ring2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(16, 185, 129, ${Math.max(0, 1 - ring2 / 32)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pin body
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#10b981';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Label Tag
        ctx.fillStyle = '#34d399';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📍 PICKUP', pos.x, pos.y - 16);

      } else if (isEnd) {
        // Destination Target Pulsing Rings
        const ring = (this.pulseAngle * 10) % 28;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, ring, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(245, 158, 11, ${Math.max(0, 1 - ring / 28)})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏁 DELIVERY', pos.x, pos.y - 16);

      } else if (isWayPoint) {
        // Active route waypoint
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

      } else {
        // Standard City Hub
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#475569';
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node Name Label
      ctx.font = (isStart || isEnd) ? 'bold 11px "Plus Jakarta Sans", sans-serif' : '600 9.5px "Plus Jakarta Sans", sans-serif';
      ctx.fillStyle = (isStart || isEnd) ? '#ffffff' : (isWayPoint ? '#e2e8f0' : '#94a3b8');
      ctx.textAlign = 'center';
      ctx.fillText(node.name, pos.x, pos.y + 22);

      // Node Sector ID
      ctx.font = '500 8px "JetBrains Mono", monospace';
      ctx.fillStyle = isStart ? '#34d399' : (isEnd ? '#fbbf24' : '#64748b');
      ctx.fillText(node.id, pos.x, pos.y + 33);
    });

    // ==========================================
    // 5. DRAW LIVE GPS TRACKING VEHICLE
    // ==========================================
    if (this.highlightedPath.length > 1) {
      this.drawGpsVehicleMarker(nodePosMap);
    }
  }

  drawGpsRoutePolyline(posMap) {
    const ctx = this.ctx;

    // A. Outer Cyan Glow Layer
    ctx.beginPath();
    for (let i = 0; i < this.highlightedPath.length; i++) {
      const p = posMap.get(this.highlightedPath[i]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // B. Solid High-Visibility Route Track
    ctx.beginPath();
    for (let i = 0; i < this.highlightedPath.length; i++) {
      const p = posMap.get(this.highlightedPath[i]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // C. Forward-Animated Flow Chevrons (GPS Motion Effect)
    ctx.beginPath();
    for (let i = 0; i < this.highlightedPath.length; i++) {
      const p = posMap.get(this.highlightedPath[i]);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 8]);
    ctx.lineDashOffset = this.dashOffset;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash
  }

  drawGpsVehicleMarker(posMap) {
    const ctx = this.ctx;
    const totalSegments = this.highlightedPath.length - 1;
    const segmentIndex = Math.min(Math.floor(this.gpsProgress * totalSegments), totalSegments - 1);
    const subProgress = (this.gpsProgress * totalSegments) - segmentIndex;

    const u = this.highlightedPath[segmentIndex];
    const v = this.highlightedPath[segmentIndex + 1];
    const p1 = posMap.get(u);
    const p2 = posMap.get(v);

    if (!p1 || !p2) return;

    const currentX = p1.x + (p2.x - p1.x) * subProgress;
    const currentY = p1.y + (p2.y - p1.y) * subProgress;
    const headingAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    // 1. Pulsing GPS Location Wave under vehicle
    const gpsRipple = (this.pulseAngle * 10) % 24;
    ctx.beginPath();
    ctx.arc(currentX, currentY, gpsRipple, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 0.8 - gpsRipple / 24)})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 2. Headlight Beams illuminating forward road
    ctx.save();
    ctx.translate(currentX, currentY);
    ctx.rotate(headingAngle);

    // Left headlight beam
    const headGrad = ctx.createLinearGradient(0, 0, 36, 0);
    headGrad.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
    headGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.beginPath();
    ctx.moveTo(10, -4);
    ctx.lineTo(38, -14);
    ctx.lineTo(38, 14);
    ctx.lineTo(10, 4);
    ctx.closePath();
    ctx.fillStyle = headGrad;
    ctx.fill();

    // 3. Vehicle Body Geometry
    // Vehicle drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-12, -7, 24, 14, 4);
    ctx.fill();

    // Chassis color according to vehicle type
    if (this.vehicleInfo.type === 'truck') {
      // Medium Truck
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(-14, -8, 28, 16, 3);
      ctx.fill();

      // Cargo box
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-12, -7, 18, 14);

      // Cab windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, -6, 5, 12);
    } else if (this.vehicleInfo.type === 'bike') {
      // Rapid Cargo Bike
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(-8, -4, 18, 8, 3);
      ctx.fill();

      // Helmet / Rider
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Electric Van (Eco-Van Alpha)
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.roundRect(-12, -7, 25, 14, 4);
      ctx.fill();

      // Windshield
      ctx.fillStyle = '#047857';
      ctx.fillRect(6, -5, 5, 10);

      // Roof battery icon
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-5, -2, 7, 4);
    }

    // Tail lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-12, -6, 2, 3);
    ctx.fillRect(-12, 3, 2, 3);

    ctx.restore();

    // 4. Floating GPS Telemetry Tooltip above vehicle
    const tooltipY = currentY - 24;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(currentX - 54, tooltipY - 10, 108, 18, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`🚐 ${this.vehicleInfo.plate}`, currentX, tooltipY + 3);
  }

  isEdgeInPath(u, v) {
    if (!this.highlightedPath || this.highlightedPath.length < 2) return false;
    for (let i = 0; i < this.highlightedPath.length - 1; i++) {
      const a = this.highlightedPath[i];
      const b = this.highlightedPath[i + 1];
      if ((a === u && b === v) || (a === v && b === u)) return true;
    }
    return false;
  }
}

window.RoadGraphVisualizer = RoadGraphVisualizer;
