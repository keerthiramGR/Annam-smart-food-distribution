package com.annam.data;

import java.util.*;

/**
 * Urban Road Network Graph containing 15 nodes and bidirectional weighted edges.
 */
public class RoadNetworkGraph {
    private final Map<String, RoadNode> nodes = new LinkedHashMap<>();
    private final Map<String, List<RoadEdge>> adjacencyList = new LinkedHashMap<>();

    public RoadNetworkGraph() {
        initializeDefaultNetwork();
    }

    public void addNode(RoadNode node) {
        nodes.put(node.getId(), node);
        adjacencyList.putIfAbsent(node.getId(), new ArrayList<>());
    }

    public void addBidirectionalEdge(String from, String to, double distKm, double timeMin) {
        adjacencyList.computeIfAbsent(from, k -> new ArrayList<>())
                .add(new RoadEdge(from, to, distKm, timeMin));
        adjacencyList.computeIfAbsent(to, k -> new ArrayList<>())
                .add(new RoadEdge(to, from, distKm, timeMin));
    }

    public RoadNode getNode(String id) {
        return nodes.get(id);
    }

    public Collection<RoadNode> getAllNodes() {
        return nodes.values();
    }

    public List<RoadEdge> getEdgesFrom(String nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    public Set<String> getAllNodeIds() {
        return nodes.keySet();
    }

    private void initializeDefaultNetwork() {
        // 15 Urban Nodes
        addNode(new RoadNode("LOC_01", "Central City Center", "Downtown", 350, 250, "Central commercial and civic plaza"));
        addNode(new RoadNode("LOC_02", "Downtown Commercial Hub", "Downtown", 480, 220, "High-density office and hotel district"));
        addNode(new RoadNode("LOC_03", "North Market Square", "North", 330, 120, "Traditional market and community hall"));
        addNode(new RoadNode("LOC_04", "South Riverside Park", "South", 360, 400, "Riverfront community and shelter zone"));
        addNode(new RoadNode("LOC_05", "East Gate Junction", "East", 580, 310, "Major transit crossway and welfare centers"));
        addNode(new RoadNode("LOC_06", "West End District", "West", 180, 260, "Residential and commercial bakery belt"));
        addNode(new RoadNode("LOC_07", "University Campus", "Northwest", 190, 140, "Higher education institutions and youth hostels"));
        addNode(new RoadNode("LOC_08", "Grand Avenue Boulevard", "Northeast", 490, 110, "Hotels, convention centers and banquets"));
        addNode(new RoadNode("LOC_09", "Old Heritage Quarter", "Southwest", 240, 360, "Dense historic quarter with relief homes"));
        addNode(new RoadNode("LOC_10", "Midtown Crossway", "Central-East", 430, 320, "Centrally accessible transit nexus"));
        addNode(new RoadNode("LOC_11", "Hill View Enclave", "Far Northwest", 110, 80, "Outlying community shelters and care homes"));
        addNode(new RoadNode("LOC_12", "Industrial Logistic Zone", "Far Southeast", 620, 430, "Warehouses and migrant worker communities"));
        addNode(new RoadNode("LOC_13", "Suburban Colony West", "Far Southwest", 120, 430, "Suburban outreach and family relief trusts"));
        addNode(new RoadNode("LOC_14", "Tech Park Innovation Hub", "East Outer", 600, 180, "Corporate canteens and tech campuses"));
        addNode(new RoadNode("LOC_15", "Harbor Port Terminal", "South Coast", 470, 460, "Coastal distribution and community kitchens"));

        // Bidirectional weighted edges
        addBidirectionalEdge("LOC_01", "LOC_02", 3.2, 8.0);
        addBidirectionalEdge("LOC_01", "LOC_03", 2.8, 7.0);
        addBidirectionalEdge("LOC_01", "LOC_06", 3.5, 9.0);
        addBidirectionalEdge("LOC_01", "LOC_10", 2.5, 6.0);
        addBidirectionalEdge("LOC_02", "LOC_05", 3.8, 10.0);
        addBidirectionalEdge("LOC_02", "LOC_08", 3.0, 8.0);
        addBidirectionalEdge("LOC_02", "LOC_14", 4.1, 11.0);
        addBidirectionalEdge("LOC_03", "LOC_07", 3.4, 9.0);
        addBidirectionalEdge("LOC_03", "LOC_08", 3.1, 8.0);
        addBidirectionalEdge("LOC_04", "LOC_01", 4.2, 11.0);
        addBidirectionalEdge("LOC_04", "LOC_09", 2.9, 8.0);
        addBidirectionalEdge("LOC_04", "LOC_10", 2.6, 7.0);
        addBidirectionalEdge("LOC_04", "LOC_15", 3.7, 10.0);
        addBidirectionalEdge("LOC_05", "LOC_10", 3.3, 9.0);
        addBidirectionalEdge("LOC_05", "LOC_12", 4.5, 12.0);
        addBidirectionalEdge("LOC_06", "LOC_07", 3.0, 8.0);
        addBidirectionalEdge("LOC_06", "LOC_09", 3.1, 8.0);
        addBidirectionalEdge("LOC_06", "LOC_13", 4.0, 11.0);
        addBidirectionalEdge("LOC_07", "LOC_11", 3.6, 10.0);
        addBidirectionalEdge("LOC_08", "LOC_14", 3.3, 9.0);
        addBidirectionalEdge("LOC_09", "LOC_13", 3.5, 9.0);
        addBidirectionalEdge("LOC_10", "LOC_15", 3.9, 10.0);
        addBidirectionalEdge("LOC_12", "LOC_15", 4.2, 11.0);
        addBidirectionalEdge("LOC_14", "LOC_12", 6.0, 16.0);
    }
}
