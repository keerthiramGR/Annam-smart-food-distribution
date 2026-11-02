import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
import os

def update_shape_text(shape, lines, default_font_size=None, default_bold=None):
    if not shape.has_text_frame:
        return
    tf = shape.text_frame
    
    # Capture styling from first run if present
    font_name = "Times New Roman"
    font_size = default_font_size
    font_bold = default_bold
    font_color_rgb = None
    
    if tf.paragraphs and tf.paragraphs[0].runs:
        r0 = tf.paragraphs[0].runs[0]
        if r0.font.name:
            font_name = r0.font.name
        if r0.font.size and default_font_size is None:
            font_size = r0.font.size
        if r0.font.bold is not None and default_bold is None:
            font_bold = r0.font.bold
        try:
            if r0.font.color and r0.font.color.rgb:
                font_color_rgb = r0.font.color.rgb
        except Exception:
            pass

    if isinstance(lines, str):
        lines = lines.split('\n')

    # Assign first line
    tf.text = lines[0] if lines else ""
    if tf.paragraphs and tf.paragraphs[0].runs:
        r = tf.paragraphs[0].runs[0]
        r.font.name = font_name
        if font_size: r.font.size = font_size
        if font_bold is not None: r.font.bold = font_bold
        if font_color_rgb: r.font.color.rgb = font_color_rgb
        
    # Append remaining lines
    for line in lines[1:]:
        p = tf.add_paragraph()
        p.text = line
        if p.runs:
            r = p.runs[0]
            r.font.name = font_name
            if font_size: r.font.size = font_size
            if font_bold is not None: r.font.bold = font_bold
            if font_color_rgb: r.font.color.rgb = font_color_rgb

def build_presentation():
    prs = pptx.Presentation('template_MP_R.pptx')
    print(f"Loaded template with {len(prs.slides)} slides.")

    # =========================================================================
    # SLIDE 1: TITLE & TEAM DETAILS
    # =========================================================================
    s1 = prs.slides[0]
    # Shape 0: Title box
    s1_title_shape = s1.shapes[0]
    s1_title_tf = s1_title_shape.text_frame
    s1_title_tf.text = "Department of Computer Science and Engineering"
    
    p1 = s1_title_tf.add_paragraph()
    p1.text = "24GEP31 - MINI PROJECT // REVIEW–1"
    
    p2 = s1_title_tf.add_paragraph()
    p2.text = "Annam – Smart Food Distribution and Food Waste Reduction System"
    if p2.runs:
        p2.runs[0].font.bold = True
        p2.runs[0].font.color.rgb = RGBColor(16, 120, 60) # Green accent
        p2.runs[0].font.size = Pt(17)

    p3 = s1_title_tf.add_paragraph()
    p3.text = "SDG 2 - Zero Hunger | SDG 12 - Responsible Consumption & Production | SDG 13 - Climate Action"
    if p3.runs:
        p3.runs[0].font.size = Pt(13)

    # Shape 1: Mentor
    s1_mentor = s1.shapes[1]
    update_shape_text(s1_mentor, ["Mentor Details:", "MS.N.KEERTHINI"])

    # Shape 2: Team Members
    s1_team = s1.shapes[2]
    update_shape_text(s1_team, [
        "Team Members Details:",
        "25CSR138 - KIRUTHIKA S",
        "25CSR160 - MANASA J",
        "25CSR179 - MOHD AKRAM KHAN T",
        "KEERTHIRAM G R"
    ])

    # =========================================================================
    # SLIDE 2: PROBLEM DEFINITION & SCOPE
    # =========================================================================
    s2 = prs.slides[1]
    # Shape 0: Title
    update_shape_text(s2.shapes[0], "Problem Definition & Scope")
    
    # Shape 1: Problem statement paragraph
    update_shape_text(s2.shapes[1], [
        "Commercial food providers (restaurants, hotels, college canteens, banquets) produce large volumes of pristine, unserved surplus food that is routinely dumped into municipal landfills, causing severe methane emissions.",
        "Concurrently, local destitute shelters, orphanages, and care homes face acute daily meal shortages, relying on uncoordinated manual donations.",
        "Traditional food redistribution is fragmented: without dynamic routing and strict perishability tracking, food spoils before reaching beneficiaries, and delivery vehicles are either overloaded or underutilized."
    ], default_font_size=Pt(11))

    # Flow boxes
    update_shape_text(s2.shapes[3], ["Commercial Kitchens", "& Banquets"])
    update_shape_text(s2.shapes[6], ["Food Surplus", "+ Perishability Window"])
    update_shape_text(s2.shapes[9], ["Unoptimized", "Manual Dispatch"])
    update_shape_text(s2.shapes[12], ["Delayed Delivery", "& Food Spoilage"])
    update_shape_text(s2.shapes[15], ["Annam Smart Food", "Distribution System"])

    # Scope title & stats
    update_shape_text(s2.shapes[16], "PROJECT SCOPE")
    update_shape_text(s2.shapes[18], ["15 Erode", "Sectors"])
    update_shape_text(s2.shapes[20], ["3 Fleet", "Vehicles"])
    update_shape_text(s2.shapes[22], ["17+ Donors", "& Shelters"])
    update_shape_text(s2.shapes[24], ["3 Constraints", "(FEFO, Capacity, ETA)"])

    # =========================================================================
    # SLIDE 3: OBJECTIVES & EXPECTED OUTCOMES
    # =========================================================================
    s3 = prs.slides[2]
    update_shape_text(s3.shapes[0], "Objectives & Expected Outcomes")
    update_shape_text(s3.shapes[1], "OBJECTIVES")
    update_shape_text(s3.shapes[2], "EXPECTED OUTCOMES")
    
    # Objectives list
    update_shape_text(s3.shapes[3], [
        "1. Prioritize surplus batches via First Expired, First Out (FEFO) based on use-by deadlines.",
        "2. Represent the urban transport network as a Directed Weighted Graph with real road metrics.",
        "3. Compute least-time delivery paths using Dijkstra's algorithm factoring vehicle speed multipliers.",
        "4. Enforce automated multi-constraint feasibility checks (portions, vehicle payload, freshness window)."
    ], default_font_size=Pt(11))

    # Expected Outcomes list
    update_shape_text(s3.shapes[4], [
        "1. Rapid, zero-waste food allocation to verified shelters within safety freshness windows.",
        "2. Dynamic routing avoiding traffic delays, minimizing travel times and transport CO2 footprint.",
        "3. Live GPS telemetry with turn-by-turn navigation for drivers and accurate ETA for shelters.",
        "4. 100% auditable closed-loop delivery handover confirming meal receipt at beneficiary docks."
    ], default_font_size=Pt(11))

    # Processing flow boxes (7 steps)
    update_shape_text(s3.shapes[5], "PROCESSING FLOW")
    update_shape_text(s3.shapes[7], ["Surplus Food", "Donation"])
    update_shape_text(s3.shapes[10], ["Admin Safety", "Verification"])
    update_shape_text(s3.shapes[13], ["Portion Request", "& PriorityQueue"])
    update_shape_text(s3.shapes[16], ["Feasibility", "Check Engine"])
    update_shape_text(s3.shapes[19], ["Dijkstra's", "Algorithm"])
    update_shape_text(s3.shapes[22], ["Optimal Route", "& Fleet Dispatch"])
    update_shape_text(s3.shapes[25], ["GPS Tracking &", "Handover"])

    # =========================================================================
    # SLIDE 4: TECHNICAL APPROACH & FEASIBILITY
    # =========================================================================
    s4 = prs.slides[3]
    update_shape_text(s4.shapes[0], "Technical Approach & Feasibility")
    update_shape_text(s4.shapes[1], "JAVA — OOP CONCEPTS")
    update_shape_text(s4.shapes[2], "DATA STRUCTURES")

    # OOP Concepts
    update_shape_text(s4.shapes[4], "Classes & Objects")
    update_shape_text(s4.shapes[6], "Encapsulation")
    update_shape_text(s4.shapes[8], "Inheritance")
    update_shape_text(s4.shapes[10], "Polymorphism")
    update_shape_text(s4.shapes[12], "Abstraction")
    update_shape_text(s4.shapes[14], "Composition")

    # Data Structures
    update_shape_text(s4.shapes[16], "Directed Weighted Graph")
    update_shape_text(s4.shapes[18], "PriorityQueue (FEFO)")
    update_shape_text(s4.shapes[20], "ArrayDeque (FIFO Events)")
    update_shape_text(s4.shapes[22], "HashMap (O(1) Lookups)")
    update_shape_text(s4.shapes[24], "Min-Heap (Dijkstra)")

    # Algorithm details
    update_shape_text(s4.shapes[26], ["Algorithm", "Dijkstra's Shortest Path"])
    update_shape_text(s4.shapes[28], ["Purpose", "Calculate least-time delivery routes across Erode sectors within the food freshness window."])
    update_shape_text(s4.shapes[30], ["Feasibility", "Dual Mode: Standalone Java console application (com.annam.Main) + Full-stack Web GIS (Express + Leaflet)."])

    # Implementation Flow
    update_shape_text(s4.shapes[31], "IMPLEMENTATION FLOW")
    update_shape_text(s4.shapes[33], "Java Core")
    update_shape_text(s4.shapes[36], ["OOP", "Concepts"])
    update_shape_text(s4.shapes[39], ["Data", "Structures"])
    update_shape_text(s4.shapes[42], ["FEFO & Stock", "Allocation"])
    update_shape_text(s4.shapes[45], ["Dijkstra's", "Algorithm"])
    update_shape_text(s4.shapes[48], ["Optimal Route", "Calculation"])
    update_shape_text(s4.shapes[51], ["Driver Telemetry", "& Output"])
    update_shape_text(s4.shapes[52], "Hybrid architecture: Pure Java DSA console application benchmarking Dijkstra/FEFO, complemented by Express.js REST API & real Leaflet Erode map.")

    # =========================================================================
    # SLIDE 5: SYSTEM ARCHITECTURE & COMPLETE WORKFLOW
    # =========================================================================
    s5 = prs.slides[4]
    update_shape_text(s5.shapes[0], "System Architecture & Complete Workflow")
    update_shape_text(s5.shapes[1], "COMPLETE WORKFLOW")
    update_shape_text(s5.shapes[2], "ARCHITECTURE FLOW")

    # Numbered workflow
    update_shape_text(s5.shapes[3], [
        "1.  Donor lists surplus batch (portions, use-by time, pickup location). Status: Pending.",
        "2.  Super Admin verifies food safety and approves batch into active recipient catalog.",
        "3.  Recipient Shelter requests portions; previews Dijkstra distance and transit time.",
        "4.  Super Admin runs Feasibility Check (demanded <= avail, capacity >= portions, travel <= use-by).",
        "5.  Allocation is locked; system assigns optimal fleet vehicle and triggers 1-click dispatch.",
        "6.  Driver navigates along Dijkstra coordinates, completes handover, and logs delivery."
    ], default_font_size=Pt(10.5))

    # Architecture tiers
    update_shape_text(s5.shapes[5], "Food Logistics Command")
    update_shape_text(s5.shapes[8], ["Input Entities", "Donors • Shelters • Fleet Vehicles • 15 Erode Sectors"])
    update_shape_text(s5.shapes[11], "Allocation & Feasibility Engine")
    update_shape_text(s5.shapes[14], "PriorityQueue (FEFO) + ArrayDeque (Requests) + HashMap")
    update_shape_text(s5.shapes[17], ["Route Planner", "Dijkstra's Algorithm + Min-Heap (graphData.js)"])
    update_shape_text(s5.shapes[20], "Optimal Route & GPS Telemetry ➔ Live Driver Handover")

    # =========================================================================
    # SLIDE 6: JAVA OOP CLASS DIAGRAM & DATA STRUCTURES
    # =========================================================================
    s6 = prs.slides[5]
    update_shape_text(s6.shapes[0], "Java OOP Class Diagram & Data Structures")
    update_shape_text(s6.shapes[1], "UML CLASS STRUCTURE")
    update_shape_text(s6.shapes[2], "DATA STRUCTURE ROLE")

    update_shape_text(s6.shapes[4], ["DeliveryVehicle", "vehicleId, name, plateNumber,", "capacityPortions, speedMultiplier", "assignMission(), updatePosition()"])
    update_shape_text(s6.shapes[6], ["BookingRequest", "requestId, donationId, recipientId,", "portionsRequested, status", "validate(), compareTo()"])
    update_shape_text(s6.shapes[8], ["FoodBatch", "batchId, donorId, foodName,", "portions, useByDateTime, status", "isExpired(), deductPortions()"])
    update_shape_text(s6.shapes[10], ["AllocationService", "foodBatches, requests, vehicles,", "policy, evaluateFeasibility(),", "allocateBooking(), processFEFO()"])
    update_shape_text(s6.shapes[12], ["RoutingService", "roadNetwork, findShortestRoute(),", "dijkstra(), calculateTravelTime()"])
    update_shape_text(s6.shapes[14], ["DijkstraResult", "path, totalDistanceKm,", "travelMinutes, fullCoordinates"])
    update_shape_text(s6.shapes[16], ["UserAccount «abstract»", "id, name, email, role", "authenticate()"])
    update_shape_text(s6.shapes[18], ["Donor", "extends UserAccount", "fssaiLicense, locationId"])
    update_shape_text(s6.shapes[20], ["Recipient", "extends UserAccount", "capacity, verified"])

    update_shape_text(s6.shapes[24], [
        "Donor and Recipient inherit from abstract UserAccount.",
        "AllocationService manages FEFO priority queue and vehicle fleet allocation.",
        "RoutingService executes Dijkstra algorithm on the 15-node RoadNetworkGraph.",
        "DeliveryVehicle state transitions from Available ➔ In-Transit ➔ Delivered."
    ], default_font_size=Pt(9.5))

    # Data structure roles
    update_shape_text(s6.shapes[26], ["Directed Weighted Graph", "15 Erode sectors & travel times"])
    update_shape_text(s6.shapes[28], ["PriorityQueue", "FEFO food batches by use-by deadline"])
    update_shape_text(s6.shapes[30], ["ArrayDeque", "Booking requests queue (FIFO)"])
    update_shape_text(s6.shapes[32], ["HashMap", "O(1) Vehicle, donor & location lookup"])
    update_shape_text(s6.shapes[34], ["Dijkstra + Min-Heap", "Least-time shortest route calculation"])

    # =========================================================================
    # SLIDE 7: PROJECT PLANNING & TIMELINE
    # =========================================================================
    s7 = prs.slides[6]
    update_shape_text(s7.shapes[0], "Project Planning & Timeline")
    update_shape_text(s7.shapes[1], [
        "Our development roadmap spans from Review-1 (Core Foundation & DSA) to Review-3 (Full-Scale Testing & Deployment):",
        "",
        "• Review-1 (Completed Foundation): Problem definition, stakeholder workflow mapping, directed weighted graph modeling (15 Erode sectors, 24 edges), core Java OOP architecture, and Dijkstra shortest path algorithm.",
        "",
        "• Review-2 (Current Milestone): Multi-constraint feasibility engine (FEFO, vehicle capacity, use-by deadlines), interactive 4-door web portal, real Leaflet road map integration, and one-click fleet dispatch.",
        "",
        "• Review-3 (Planned Final): Dynamic traffic delay simulation, multi-stop delivery route optimization, environmental impact metrics (CO2 savings & food rescued analytics), and end-to-end stress testing."
    ], default_font_size=Pt(12))

    # =========================================================================
    # SLIDE 8: IMPLEMENTATION STATUS & UNIQUE FEATURES
    # =========================================================================
    s8 = prs.slides[7]
    update_shape_text(s8.shapes[0], "Implementation Status & Unique Features")
    update_shape_text(s8.shapes[1], "COMPLETED FOUNDATION")
    update_shape_text(s8.shapes[2], "PLANNED ENHANCEMENTS")

    update_shape_text(s8.shapes[3], [
        "• Core Java OOP architecture & data structures",
        "• 15-node directed weighted road network (Erode)",
        "• Dijkstra shortest path algorithm implementation",
        "• Multi-constraint feasibility evaluation engine",
        "• Full-stack 4-door web platform with Leaflet GIS"
    ], default_font_size=Pt(11))

    update_shape_text(s8.shapes[4], [
        "• Dynamic traffic delay simulation (road closures)",
        "• Multi-stop TSP batch routing for multi-donor pickups",
        "• Automated temperature-sensor telemetry integration",
        "• Push notification service for drivers and shelters"
    ], default_font_size=Pt(11))

    update_shape_text(s8.shapes[6], "OUR UNIQUE FEATURE — Perishability-Aware Dynamic Routing & Safety Enforcement")
    update_shape_text(s8.shapes[8], ["Surplus Food", "Donation"])
    update_shape_text(s8.shapes[11], ["FEFO Freshness", "Evaluation"])
    update_shape_text(s8.shapes[14], ["Dijkstra Route", "Computed"])
    update_shape_text(s8.shapes[17], ["Vehicle Speed", "Factor Applied"])
    update_shape_text(s8.shapes[20], ["Freshness Check", "(Travel <= Shelf-Life)"])
    update_shape_text(s8.shapes[23], ["Safe Delivery", "Handover"])

    update_shape_text(s8.shapes[24], [
        "Concept: Unlike standard logistics where only distance is considered, Annam validates whether the Dijkstra travel time fits strictly within the food's remaining freshness window (Travel Time + Buffer <= Shelf-Life). If the deadline cannot be met, the allocation is safely blocked."
    ], default_font_size=Pt(10))

    update_shape_text(s8.shapes[25], [
        "Additional Proposed Enhancement: Dual Execution Architecture — Pure Java Data Structures CLI for academic benchmarking + Web GIS interface with real Leaflet tiles for field usability."
    ], default_font_size=Pt(10))

    # =========================================================================
    # SLIDE 9: THANK YOU
    # =========================================================================
    s9 = prs.slides[8]
    update_shape_text(s9.shapes[0], "THANK YOU\n\nQuestions & Feedback Welcome\nAnnam - Smart Food Distribution System")

    # Save presentation
    out_path = 'Annam_Smart_Food_Distribution_Presentation.pptx'
    prs.save(out_path)
    print(f"Presentation successfully created and saved to: {out_path}")

if __name__ == '__main__':
    build_presentation()
