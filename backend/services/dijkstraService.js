/**
 * Annam - Smart Food Distribution System
 * Dijkstra Shortest Path Service
 * 
 * Computes optimal delivery route on the weighted road network.
 * Weight criteria: Time (minutes) with secondary consideration for distance (km).
 * 
 * Future Java mapping:
 * Equivalent to Dijkstra using a PriorityQueue<NodeDistance> with an adjacency list Map<String, List<Edge>>.
 */

const { LOCATIONS, buildAdjacencyList } = require('./graphData');

const locationMap = new Map(LOCATIONS.map(loc => [loc.id, loc]));

/**
 * Finds shortest path between sourceId and destinationId
 * @param {string} sourceId - Origin location ID (e.g. 'LOC_01')
 * @param {string} destinationId - Target location ID (e.g. 'LOC_04')
 * @param {number} vehicleSpeedMultiplier - Optional vehicle speed factor (1.0 default)
 * @returns {object} { path, nodeNames, totalDistanceKm, totalTimeMinutes, edgesTraversed, found }
 */
function findShortestRoute(sourceId, destinationId, vehicleSpeedMultiplier = 1.0) {
  if (!sourceId || !destinationId) {
    throw new Error('Both sourceId and destinationId are required');
  }

  if (sourceId === destinationId) {
    const loc = locationMap.get(sourceId);
    return {
      sourceId,
      destinationId,
      path: [sourceId],
      nodeNames: [loc ? loc.name : sourceId],
      totalDistanceKm: 0,
      totalTimeMinutes: 0,
      adjustedTimeMinutes: 0,
      edgesTraversed: [],
      found: true
    };
  }

  const adj = buildAdjacencyList();
  const times = {};
  const distances = {};
  const previous = {};
  const visited = new Set();
  const unvisited = new Set(Object.keys(adj));

  // Initialize distances/times
  Object.keys(adj).forEach(nodeId => {
    times[nodeId] = Infinity;
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
  });

  times[sourceId] = 0;
  distances[sourceId] = 0;

  while (unvisited.size > 0) {
    // Find unvisited node with smallest time
    let current = null;
    let minTime = Infinity;

    for (const nodeId of unvisited) {
      if (times[nodeId] < minTime) {
        minTime = times[nodeId];
        current = nodeId;
      }
    }

    if (current === null || minTime === Infinity) {
      break; // No reachable remaining nodes
    }

    if (current === destinationId) {
      break; // Reached target
    }

    unvisited.delete(current);
    visited.add(current);

    const neighbors = adj[current] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.to)) continue;

      const altTime = times[current] + edge.timeMinutes;
      const altDist = distances[current] + edge.distanceKm;

      if (altTime < times[edge.to]) {
        times[edge.to] = altTime;
        distances[edge.to] = Number(altDist.toFixed(2));
        previous[edge.to] = { from: current, edge };
      }
    }
  }

  // Reconstruct path
  if (times[destinationId] === Infinity) {
    return {
      sourceId,
      destinationId,
      path: [],
      nodeNames: [],
      totalDistanceKm: Infinity,
      totalTimeMinutes: Infinity,
      adjustedTimeMinutes: Infinity,
      edgesTraversed: [],
      found: false
    };
  }

  const path = [];
  const edgesTraversed = [];
  let curr = destinationId;

  while (curr !== null) {
    path.unshift(curr);
    const prevInfo = previous[curr];
    if (prevInfo) {
      edgesTraversed.unshift({
        from: prevInfo.from,
        to: curr,
        distanceKm: prevInfo.edge.distanceKm,
        timeMinutes: prevInfo.edge.timeMinutes
      });
      curr = prevInfo.from;
    } else {
      curr = null;
    }
  }

  const rawMinutes = times[destinationId];
  // Speed multiplier adjustments (e.g. 1.25x bike is faster -> divide minutes by factor)
  const adjustedMinutes = Math.round((rawMinutes / (vehicleSpeedMultiplier || 1.0)) * 10) / 10;
  const totalKm = Math.round(distances[destinationId] * 10) / 10;

  return {
    sourceId,
    destinationId,
    path,
    nodeNames: path.map(id => locationMap.get(id)?.name || id),
    totalDistanceKm: totalKm,
    totalTimeMinutes: rawMinutes,
    adjustedTimeMinutes: adjustedMinutes,
    edgesTraversed,
    found: true
  };
}

/**
 * Returns complete roadmap nodes and edges with coordinates for visualization
 */
function getRoadNetworkGraph() {
  const { LOCATIONS, ROAD_EDGES } = require('./graphData');
  return {
    nodes: LOCATIONS,
    edges: ROAD_EDGES
  };
}

module.exports = {
  findShortestRoute,
  getRoadNetworkGraph,
  locationMap
};
