/**
 * Annam - Smart Food Distribution System
 * Real Geographical Map & Live Dijkstra Navigation Visualizer for Erode City & Surroundings
 * 
 * Powered by Leaflet.js with OpenStreetMap / CartoDB / Satellite Imagery,
 * featuring interactive donor/recipient markers, turn-by-turn road paths,
 * real-time GPS fleet animation, and step-by-step telemetry HUD.
 */

class RoadGraphVisualizer {
  constructor(canvasId = 'roadGraphCanvas') {
    this.canvasId = canvasId;
    this.canvas = document.getElementById(canvasId);
    this.mapContainer = document.getElementById('realRoadMap');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    // Data State
    this.nodes = [];
    this.edges = [];
    this.donors = [];
    this.recipients = [];
    this.highlightedPath = [];
    this.highlightedNodes = new Set();
    this.highlightedCoordinates = [];
    this.selectedSource = 'LOC_01'; // PS Park & Manikoondu (Junior Kuppanna)
    this.selectedTarget = 'LOC_03'; // Erode Junction (Karunai Illam)
    this.currentRoute = null;
    this.animationId = null;

    // GPS Telemetry State
    this.gpsProgress = 0.0;
    this.gpsPlaying = true;
    this.gpsSpeedFactor = 1.0;
    this.dashOffset = 0;
    this.pulseAngle = 0;
    this.vehicleInfo = {
      id: 'veh_01',
      name: 'Eco-Van Alpha (EV-01)',
      type: 'van',
      plate: 'TN-33-AX-2024',
      baseSpeed: 42
    };

    // Leaflet Map State
    this.map = null;
    this.tileLayers = {};
    this.currentTileLayer = null;
    this.baseRoadsLayer = null;
    this.nodesLayer = null;
    this.routePolylineLayer = null;
    this.vehicleMarker = null;
    this.markerMap = new Map();

    this.init();
  }

  async init() {
    this.initGpsHudControls();
    this.initMapControls();

    try {
      // 1. Fetch road graph & account data in parallel
      const [graphData, donorsData, recipientsData] = await Promise.all([
        window.api.getGraph().catch(() => ({ nodes: [], edges: [] })),
        window.api.getDonors ? window.api.getDonors().catch(() => []) : Promise.resolve([]),
        window.api.getRecipients ? window.api.getRecipients().catch(() => []) : Promise.resolve([])
      ]);

      this.nodes = graphData.nodes || [];
      this.edges = graphData.edges || [];
      this.donors = donorsData || [];
      this.recipients = recipientsData || [];

      // 2. Populate Route Calculator dropdowns
      this.populateSelectDropdowns();

      // 3. Initialize Interactive Leaflet Map (if Leaflet loaded)
      if (window.L && this.mapContainer) {
        this.initLeafletMap();
      } else {
        // Fallback to Canvas
        if (this.canvas) {
          this.canvas.style.display = 'block';
          this.resizeCanvas();
          this.setupCanvasClicks();
        }
      }

      // 4. Calculate initial route
      await this.calculateCurrentRoute();

      // 5. Start live animation loop
      this.startGpsLoop();

      // Window resize handling
      window.addEventListener('resize', () => {
        if (this.map) {
          this.map.invalidateSize();
        }
        if (this.canvas) {
          this.resizeCanvas();
        }
      });
    } catch (e) {
      console.error('Failed to initialize Erode Road Graph Visualizer:', e);
    }
  }

  initMapControls() {
    // Tile layer switch buttons
    const btnOsm = document.getElementById('btnTileOsm');
    const btnCarto = document.getElementById('btnTileCarto');
    const btnSat = document.getElementById('btnTileSat');
    const btnRecenter = document.getElementById('btnRecenterErode');

    const setActiveBtn = (activeBtn) => {
      [btnOsm, btnCarto, btnSat].forEach(btn => {
        if (btn) btn.classList.remove('active');
      });
      if (activeBtn) activeBtn.classList.add('active');
    };

    setActiveBtn(btnCarto);

    if (btnOsm) {
      btnOsm.addEventListener('click', () => {
        this.switchTileLayer('osm');
        setActiveBtn(btnOsm);
      });
    }
    if (btnCarto) {
      btnCarto.addEventListener('click', () => {
        this.switchTileLayer('carto');
        setActiveBtn(btnCarto);
      });
    }
    if (btnSat) {
      btnSat.addEventListener('click', () => {
        this.switchTileLayer('sat');
        setActiveBtn(btnSat);
      });
    }
    if (btnRecenter) {
      btnRecenter.addEventListener('click', () => {
        this.recenterToErode();
      });
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
        this.updateVehiclePositionOnMap();
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

  // =========================================================================
  // LEAFLET REAL INTERACTIVE MAP INITIALIZATION & RENDERING
  // =========================================================================

  initLeafletMap() {
    if (this.map) return;

    // Erode City Coordinates: 11.3418° N, 77.7274° E
    const erodeCenter = [11.3418, 77.7274];

    // Create Map Instance
    this.map = L.map('realRoadMap', {
      center: erodeCenter,
      zoom: 12,
      zoomControl: false, // We'll customize zoom or let user zoom via wheel/pinch
      attributionControl: false
    });

    // Add sleek custom zoom control top-right so it never clashes with the HUD
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Tile Layer Definitions - Default to high-speed CDN CartoDB Voyager
    this.tileLayers = {
      carto: L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        attribution: '&copy; CARTO'
      }),
      osm: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }),
      sat: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Esri, Maxar, Earthstar Geographics'
      })
    };

    // Default to CartoDB Voyager for instantaneous sub-100ms loading
    this.currentTileLayer = this.tileLayers.carto.addTo(this.map);

    // Layer Groups for organized rendering
    this.baseRoadsLayer = L.layerGroup().addTo(this.map);
    this.routePolylineLayer = L.layerGroup().addTo(this.map);
    this.nodesLayer = L.layerGroup().addTo(this.map);

    // Draw Erode waterways (Cauvery & Bhavani rivers)
    this.drawWaterwaysOnMap();

    // Draw base Erode road network & nodes
    this.drawBaseRoadNetworkOnMap();
    this.drawMarkersOnMap();

    // Invalidate size once DOM layout is settled and when animations finish
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 60);
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 300);
    setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 800);
  }

  invalidateSize() {
    if (this.map) {
      this.map.invalidateSize();
    }
    if (this.canvas) {
      this.resizeCanvas();
    }
  }

  drawWaterwaysOnMap() {
    if (!this.map || !this.baseRoadsLayer) return;

    // Cauvery River flowing along north & east Erode
    const cauveryPath = [
      [11.4580, 77.6720],
      [11.4468, 77.6835], // Bhavani Kooduthurai Confluence
      [11.4400, 77.7050],
      [11.4250, 77.7180],
      [11.3900, 77.7320],
      [11.3650, 77.7380],
      [11.3530, 77.7430], // Historic Karungalpalayam - Pallipalayam bridge
      [11.3350, 77.7500],
      [11.3150, 77.7650], // Solar / Kokkarayanpettai bypass
      [11.2700, 77.7850]
    ];

    const river = L.polyline(cauveryPath, {
      color: '#38bdf8',
      weight: 10,
      opacity: 0.75,
      lineCap: 'round',
      lineJoin: 'round'
    });
    river.bindTooltip('🌊 Cauvery River (Erode Waterway Corridor)', { sticky: true });
    river.addTo(this.baseRoadsLayer);

    // Bhavani River coming from northwest into Kooduthurai
    const bhavaniPath = [
      [11.4650, 77.6500],
      [11.4550, 77.6680],
      [11.4468, 77.6835]
    ];
    const bhavaniRiver = L.polyline(bhavaniPath, {
      color: '#0284c7',
      weight: 7,
      opacity: 0.7,
      lineCap: 'round'
    });
    bhavaniRiver.bindTooltip('🌊 Bhavani River (Kooduthurai Sangameswarar Confluence)', { sticky: true });
    bhavaniRiver.addTo(this.baseRoadsLayer);
  }

  switchTileLayer(layerType) {
    if (!this.map || !this.tileLayers[layerType]) return;
    if (this.currentTileLayer) {
      this.map.removeLayer(this.currentTileLayer);
    }
    this.currentTileLayer = this.tileLayers[layerType].addTo(this.map);
  }

  recenterToErode() {
    if (!this.map) return;
    this.map.flyTo([11.3418, 77.7274], 12, {
      duration: 1.2,
      easeLinearity: 0.25
    });
  }

  drawBaseRoadNetworkOnMap() {
    if (!this.map || !this.baseRoadsLayer) return;
    this.baseRoadsLayer.clearLayers();

    this.edges.forEach(edge => {
      const fromNode = this.nodes.find(n => n.id === edge.from);
      const toNode = this.nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      const pathPoints = edge.waypoints && edge.waypoints.length > 0
        ? edge.waypoints
        : [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]];

      // 1. Road casing line
      const casing = L.polyline(pathPoints, {
        color: '#334155',
        weight: 4.5,
        opacity: 0.65,
        lineCap: 'round',
        lineJoin: 'round'
      });

      // 2. Road centerline with road name tooltip
      const roadLine = L.polyline(pathPoints, {
        color: '#64748b',
        weight: 2.5,
        opacity: 0.85,
        dashArray: '4, 6'
      });

      const tooltipText = `<strong>${edge.roadName || 'Erode Connector'}</strong><br/>${edge.distanceKm} km • ~${edge.timeMinutes} mins`;
      roadLine.bindTooltip(tooltipText, { sticky: true, opacity: 0.9 });

      casing.addTo(this.baseRoadsLayer);
      roadLine.addTo(this.baseRoadsLayer);
    });
  }

  drawMarkersOnMap() {
    if (!this.map || !this.nodesLayer) return;
    this.nodesLayer.clearLayers();
    this.markerMap.clear();

    this.nodes.forEach(node => {
      const isStart = this.highlightedPath[0] === node.id;
      const isEnd = this.highlightedPath[this.highlightedPath.length - 1] === node.id;
      const donor = this.donors.find(d => d.locationId === node.id);
      const recipient = this.recipients.find(r => r.locationId === node.id);

      let pinTypeClass = 'marker-pin-junction';
      let pinEmoji = '🚏';
      let tagBadge = `<span class="erode-popup-badge junction-tag">Transit Nexus</span>`;

      if (donor) {
        pinTypeClass = 'marker-pin-donor';
        pinEmoji = '👨‍🍳';
        tagBadge = `<span class="erode-popup-badge donor-tag">Food Donor</span>`;
      } else if (recipient) {
        pinTypeClass = 'marker-pin-recip';
        pinEmoji = '🏠';
        tagBadge = `<span class="erode-popup-badge recip-tag">Recipient Shelter</span>`;
      }

      // Custom HTML Marker Icon
      const customIcon = L.divIcon({
        className: 'erode-map-marker',
        html: `
          <div class="marker-pin-circle ${pinTypeClass}">
            <span>${pinEmoji}</span>
            ${donor ? '<span class="marker-pulse-ring"></span>' : ''}
            ${recipient ? '<span class="marker-pulse-ring marker-pulse-ring-recip"></span>' : ''}
          </div>
          <span class="marker-tag-label">${node.name.split('&')[0].trim()}</span>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Rich Interactive Popup
      let metaDetails = '';
      if (donor) {
        metaDetails = `
          <div class="erode-popup-meta">
            <div>👨‍🍳 <strong>${donor.name}</strong></div>
            <div>📋 ${donor.type}</div>
            <div>📍 ${donor.address || node.sector}</div>
          </div>
        `;
      } else if (recipient) {
        metaDetails = `
          <div class="erode-popup-meta">
            <div>🏠 <strong>${recipient.name}</strong></div>
            <div>👥 Capacity: <strong>${recipient.capacity || 60} persons</strong></div>
            <div>📍 ${recipient.address || node.sector}</div>
          </div>
        `;
      } else {
        metaDetails = `
          <div class="erode-popup-meta">
            <div>🚏 <strong>Major Transit Crossway</strong></div>
            <div>📍 ${node.description || 'Interconnecting major Erode sectors'}</div>
          </div>
        `;
      }

      const popupHtml = `
        <div class="erode-popup-card">
          ${tagBadge}
          <div class="erode-popup-title">${node.name}</div>
          <div class="erode-popup-sector">📍 ${node.sector} (${node.id})</div>
          ${metaDetails}
          <div class="erode-popup-btn-row">
            <button type="button" class="erode-popup-btn origin-btn" onclick="window.roadVisualizer.handleSetOrigin('${node.id}')">
              🟢 Set Origin
            </button>
            <button type="button" class="erode-popup-btn target-btn" onclick="window.roadVisualizer.handleSetTarget('${node.id}')">
              🏁 Set Destination
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { minWidth: 240, maxWidth: 300 });

      // Click on marker also alternates selection
      marker.on('click', () => {
        this.handleNodeClick(node.id);
      });

      marker.addTo(this.nodesLayer);
      this.markerMap.set(node.id, marker);
    });
  }

  handleSetOrigin(nodeId) {
    this.selectedSource = nodeId;
    const fromSelect = document.getElementById('routeFromSelect');
    if (fromSelect) fromSelect.value = nodeId;
    window.app?.showToast(`Origin set: ${this.getNodeName(nodeId)}`, 'info');
    if (this.map) this.map.closePopup();
    this.calculateCurrentRoute();
  }

  handleSetTarget(nodeId) {
    this.selectedTarget = nodeId;
    const toSelect = document.getElementById('routeToSelect');
    if (toSelect) toSelect.value = nodeId;
    window.app?.showToast(`Destination set: ${this.getNodeName(nodeId)}`, 'info');
    if (this.map) this.map.closePopup();
    this.calculateCurrentRoute();
  }

  handleNodeClick(nodeId) {
    const fromSelect = document.getElementById('routeFromSelect');
    const toSelect = document.getElementById('routeToSelect');

    if (!this.selectedSource || (this.selectedSource && this.selectedTarget)) {
      this.selectedSource = nodeId;
      this.selectedTarget = null;
      if (fromSelect) fromSelect.value = nodeId;
      window.app?.showToast(`GPS Origin Set: ${this.getNodeName(nodeId)}. Now click destination.`, 'info');
    } else {
      this.selectedTarget = nodeId;
      if (toSelect) toSelect.value = nodeId;
      window.app?.showToast(`GPS Destination Set: ${this.getNodeName(nodeId)}`, 'info');
      this.calculateCurrentRoute();
    }
    this.render();
  }

  // =========================================================================
  // ROUTE COMPUTATION & DIJKSTRA VISUALIZATION
  // =========================================================================

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
      this.highlightRoute(route.path, route.fullCoordinates);
      this.updateRouteSummaryUI(route);
      this.gpsProgress = 0.0; // Reset trip animation to start
    } catch (err) {
      window.app?.showToast(err.message, 'error');
    }
  }

  highlightRoute(pathArray, customCoordinates = null) {
    this.highlightedPath = pathArray || [];
    this.highlightedNodes = new Set(this.highlightedPath);

    if (this.highlightedPath.length >= 2) {
      this.selectedSource = this.highlightedPath[0];
      this.selectedTarget = this.highlightedPath[this.highlightedPath.length - 1];
      const fromSelect = document.getElementById('routeFromSelect');
      const toSelect = document.getElementById('routeToSelect');
      if (fromSelect) fromSelect.value = this.selectedSource;
      if (toSelect) toSelect.value = this.selectedTarget;
    }

    // Extract road coordinates along the path
    if (customCoordinates && customCoordinates.length > 0) {
      this.highlightedCoordinates = customCoordinates;
    } else {
      this.highlightedCoordinates = this.extractPathCoordinates(this.highlightedPath);
    }

    // Render on Leaflet Map
    if (this.map && this.routePolylineLayer) {
      this.renderRouteOnMap();
    }

    // Render on Canvas
    this.render();
  }

  extractPathCoordinates(path) {
    if (!path || path.length < 2) return [];
    const coords = [];

    for (let i = 0; i < path.length - 1; i++) {
      const u = path[i];
      const v = path[i + 1];

      // Check if there is an edge with waypoints
      const edge = this.edges.find(e => (e.from === u && e.to === v) || (e.from === v && e.to === u));
      if (edge && edge.waypoints && edge.waypoints.length > 0) {
        const pts = edge.from === u ? edge.waypoints : [...edge.waypoints].reverse();
        pts.forEach((pt, idx) => {
          if (coords.length === 0 || idx > 0) coords.push(pt);
        });
      } else {
        const uNode = this.nodes.find(n => n.id === u);
        const vNode = this.nodes.find(n => n.id === v);
        if (coords.length === 0 && uNode && uNode.lat) coords.push([uNode.lat, uNode.lng]);
        if (vNode && vNode.lat) coords.push([vNode.lat, vNode.lng]);
      }
    }

    return coords;
  }

  renderRouteOnMap() {
    this.routePolylineLayer.clearLayers();

    if (!this.highlightedCoordinates || this.highlightedCoordinates.length < 2) return;

    // A. Outer Cyan Glow Line (Dijkstra Path Glow)
    const glowPolyline = L.polyline(this.highlightedCoordinates, {
      color: '#0ea5e9',
      weight: 11,
      opacity: 0.45,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // B. Inner Emerald Road Route Line
    const mainPolyline = L.polyline(this.highlightedCoordinates, {
      color: '#059669',
      weight: 5.5,
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round'
    });

    // C. Dashed flowing chevron line
    const flowPolyline = L.polyline(this.highlightedCoordinates, {
      color: '#6ee7b7',
      weight: 2.5,
      opacity: 0.9,
      dashArray: '10, 10'
    });

    glowPolyline.addTo(this.routePolylineLayer);
    mainPolyline.addTo(this.routePolylineLayer);
    flowPolyline.addTo(this.routePolylineLayer);

    // Smoothly fly and frame the computed route
    const bounds = L.latLngBounds(this.highlightedCoordinates);
    this.map.flyToBounds(bounds, {
      padding: [80, 80],
      duration: 1.0,
      maxZoom: 14
    });

    // Initialize or update Vehicle Marker on Map
    this.initVehicleMarkerOnMap();
  }

  initVehicleMarkerOnMap() {
    if (!this.map || this.highlightedCoordinates.length === 0) return;

    const startPos = this.highlightedCoordinates[0];
    const vehEmoji = this.vehicleInfo.type === 'truck' ? '🚛' : (this.vehicleInfo.type === 'bike' ? '🛵' : '🚚');

    const vehicleIcon = L.divIcon({
      className: 'vehicle-map-marker',
      html: `
        <div class="vehicle-marker-box" id="vehicleMarkerIcon">
          <span>${vehEmoji}</span>
          <span class="vehicle-pulse-ring"></span>
        </div>
        <div class="vehicle-map-tag">${this.vehicleInfo.plate}</div>
      `,
      iconSize: [48, 54],
      iconAnchor: [24, 27]
    });

    if (this.vehicleMarker) {
      this.vehicleMarker.setLatLng(startPos);
      this.vehicleMarker.setIcon(vehicleIcon);
    } else {
      this.vehicleMarker = L.marker(startPos, { icon: vehicleIcon, zIndexOffset: 2000 });
      this.vehicleMarker.addTo(this.map);
    }
  }

  updateVehiclePositionOnMap() {
    if (!this.vehicleMarker || !this.highlightedCoordinates || this.highlightedCoordinates.length < 2) return;

    const totalPoints = this.highlightedCoordinates.length - 1;
    const progressIndex = Math.min(Math.floor(this.gpsProgress * totalPoints), totalPoints - 1);
    const subProgress = (this.gpsProgress * totalPoints) - progressIndex;

    const p1 = this.highlightedCoordinates[progressIndex];
    const p2 = this.highlightedCoordinates[progressIndex + 1];

    if (!p1 || !p2) return;

    const curLat = p1[0] + (p2[0] - p1[0]) * subProgress;
    const curLng = p1[1] + (p2[1] - p1[1]) * subProgress;

    this.vehicleMarker.setLatLng([curLat, curLng]);

    // Heading rotation
    const dLat = p2[0] - p1[0];
    const dLng = p2[1] - p1[1];
    const angleRad = Math.atan2(dLng, dLat);
    const angleDeg = (angleRad * 180 / Math.PI);

    const vehIconEl = document.getElementById('vehicleMarkerIcon');
    if (vehIconEl) {
      vehIconEl.style.transform = `rotate(${angleDeg}deg)`;
    }
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
        Road Traversals: <span style="font-family:var(--font-mono); color:var(--text-main); font-weight:700;">${route.path.length - 1} connected sectors in Erode</span>
      </div>
      <div class="route-steps-list">
        ${route.path.map((nodeId, idx) => {
          const loc = this.nodes.find(n => n.id === nodeId);
          const edgeInfo = route.edgesTraversed ? route.edgesTraversed[idx] : null;
          return `
            <div class="route-step-node" id="stepNode_${idx}">
              <span class="node-dot ${idx === 0 ? 'active' : ''}"></span>
              <span style="font-family:var(--font-mono); font-size:0.75rem; color:#059669; font-weight:800;">${idx + 1}.</span>
              <span style="font-weight:700; color:var(--text-main);">${this.getNodeName(nodeId)}</span>
              ${edgeInfo?.roadName ? `<span style="font-size:0.72rem; color:var(--primary); font-style:italic;">[via ${edgeInfo.roadName}]</span>` : ''}
              <span style="font-size:0.72rem; color:var(--text-dim); margin-left:auto; font-family:var(--font-mono);">${nodeId}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  getNodeName(id) {
    const n = this.nodes.find(item => item.id === id);
    return n ? n.name : id;
  }

  populateSelectDropdowns() {
    const fromSelect = document.getElementById('routeFromSelect');
    const toSelect = document.getElementById('routeToSelect');
    const vehicleSelect = document.getElementById('routeVehicleSelect');

    if (!fromSelect || !toSelect) return;

    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';

    this.nodes.forEach(node => {
      const isDonor = this.donors.some(d => d.locationId === node.id);
      const isRecip = this.recipients.some(r => r.locationId === node.id);
      const prefix = isDonor ? '👨‍🍳 ' : (isRecip ? '🏠 ' : '🚏 ');

      const opt1 = document.createElement('option');
      opt1.value = node.id;
      opt1.textContent = `${prefix}${node.name} (${node.sector})`;
      fromSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = node.id;
      opt2.textContent = `${prefix}${node.name} (${node.sector})`;
      toSelect.appendChild(opt2);
    });

    if (this.nodes.length >= 3) {
      fromSelect.value = 'LOC_01'; // PS Park (Junior Kuppanna)
      toSelect.value = 'LOC_03';   // Erode Junction (Karunai Illam)
      this.selectedSource = 'LOC_01';
      this.selectedTarget = 'LOC_03';
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
  }

  updateVehicleModel(vehicleId) {
    if (vehicleId === 'veh_02') {
      this.vehicleInfo = { id: 'veh_02', name: 'Kongu Express Heavy (TRK-02)', type: 'truck', plate: 'TN-33-TR-9988', baseSpeed: 38 };
    } else if (vehicleId === 'veh_03') {
      this.vehicleInfo = { id: 'veh_03', name: 'Bhavani Rapid Cargo Bike (MOTO-03)', type: 'bike', plate: 'TN-33-BK-4512', baseSpeed: 52 };
    } else {
      this.vehicleInfo = { id: 'veh_01', name: 'Eco-Van Alpha (EV-01)', type: 'van', plate: 'TN-33-AX-2024', baseSpeed: 44 };
    }

    const vehNameEl = document.getElementById('gpsVehicleName');
    if (vehNameEl) vehNameEl.textContent = this.vehicleInfo.name;

    if (this.vehicleMarker) {
      this.initVehicleMarkerOnMap();
    }
  }

  // =========================================================================
  // ANIMATION LOOP & HUD TELEMETRY UPDATE
  // =========================================================================

  startGpsLoop() {
    const loop = () => {
      this.pulseAngle += 0.05;

      if (this.gpsPlaying && this.highlightedPath.length > 1) {
        // Increment GPS progress along route
        const speedStep = 0.0020 * this.gpsSpeedFactor;
        this.gpsProgress += speedStep;
        if (this.gpsProgress > 1.0) {
          this.gpsProgress = 0.0; // Loop trip continuously
        }
        this.dashOffset -= 1.8; // Flow chevrons
      }

      this.updateGpsHudTelemetry();

      // Update Leaflet marker position
      if (this.map) {
        this.updateVehiclePositionOnMap();
      }

      // Render canvas fallback if canvas is shown
      if (this.canvas && this.canvas.style.display !== 'none') {
        this.renderCanvasFallback();
      }

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

    // Turn instruction with road details
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
        const edge = this.edges.find(e => (e.from === currNodeId && e.to === nextNodeId) || (e.from === nextNodeId && e.to === currNodeId));
        const road = edge?.roadName ? ` via ${edge.roadName}` : '';
        turnIconEl.textContent = '➔';
        turnTextEl.textContent = `En Route: ${this.getNodeName(currNodeId)} ➔ ${this.getNodeName(nextNodeId)}${road}`;
      }
    }
  }

  // =========================================================================
  // CANVAS FALLBACK IMPLEMENTATION (Ensures 100% offline & backup resilience)
  // =========================================================================

  resizeCanvas() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const w = parent ? parent.clientWidth : 720;
    const h = parent ? parent.clientHeight : 560;
    this.canvas.width = Math.round(w > 0 ? w : 720);
    this.canvas.height = Math.round(h > 0 ? h : 560);
  }

  setupCanvasClicks() {
    if (!this.canvas) return;
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      const mouseY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

      const scaleX = this.canvas.width / 720;
      const scaleY = this.canvas.height / 520;

      for (const node of this.nodes) {
        const nx = (node.x || 360) * scaleX;
        const ny = (node.y || 260) * scaleY;
        const dist = Math.hypot(nx - mouseX, ny - mouseY);

        if (dist <= 26) {
          this.handleNodeClick(node.id);
          break;
        }
      }
    });
  }

  render() {
    if (this.canvas && this.canvas.style.display !== 'none') {
      this.renderCanvasFallback();
    }
  }

  renderCanvasFallback() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width || 720;
    const h = this.canvas.height || 560;
    if (w <= 0 || h <= 0) return;

    ctx.clearRect(0, 0, w, h);

    // Dark sleek navigation gradient
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Subtle GPS grid
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

    const scaleX = w / 720;
    const scaleY = h / 520;

    const nodePosMap = new Map();
    this.nodes.forEach(n => {
      nodePosMap.set(n.id, { x: (n.x || 360) * scaleX, y: (n.y || 260) * scaleY });
    });

    // Draw base road edges
    this.edges.forEach(edge => {
      const fromPos = nodePosMap.get(edge.from);
      const toPos = nodePosMap.get(edge.to);
      if (!fromPos || !toPos) return;

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw active glowing path
    if (this.highlightedPath.length > 1) {
      ctx.beginPath();
      for (let i = 0; i < this.highlightedPath.length; i++) {
        const p = nodePosMap.get(this.highlightedPath[i]);
        if (p) {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = 'rgba(14, 165, 233, 0.35)';
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.beginPath();
      for (let i = 0; i < this.highlightedPath.length; i++) {
        const p = nodePosMap.get(this.highlightedPath[i]);
        if (p) {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = '#059669';
      ctx.lineWidth = 5;
      ctx.stroke();
    }

    // Draw nodes
    this.nodes.forEach(node => {
      const pos = nodePosMap.get(node.id);
      if (!pos) return;

      const isStart = this.highlightedPath[0] === node.id;
      const isEnd = this.highlightedPath[this.highlightedPath.length - 1] === node.id;
      const isDonor = this.donors.some(d => d.locationId === node.id);
      const isRecip = this.recipients.some(r => r.locationId === node.id);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isStart || isEnd ? 10 : 7, 0, Math.PI * 2);
      ctx.fillStyle = isDonor ? '#10b981' : (isRecip ? '#0284c7' : '#64748b');
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(node.name.split('&')[0].trim(), pos.x, pos.y + 20);
    });
  }
}

window.RoadGraphVisualizer = RoadGraphVisualizer;
