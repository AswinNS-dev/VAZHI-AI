import pytest
from simulation.simulator import TrafficSimulator
from simulation.vehicle import Vehicle, VehicleType
from intelligence.traffic_state import ApproachState, TrafficStateEngine
from intelligence.spillback_detector import SpillbackDetector
from intelligence.emergency_engine import EmergencyCorridorEngine
from intelligence.signal_optimizer import SignalOptimizer
from intelligence.configuration import get_config

def test_01_normal_traffic():
    sim = TrafficSimulator()
    frame = sim.tick(dt=1.0)
    assert frame["is_running"] is True
    assert "J1" in frame["intersections"]
    assert "ROAD_J1_J2" in frame["roads"]
    assert frame["vehicle_count"] >= 0

def test_02_heavy_east_traffic():
    sim = TrafficSimulator()
    # Surge East approach (e.g. ROAD_J1_J2 entering J2)
    sim.surge_traffic("ROAD_J1_J2", count=25)
    road = sim.roads["ROAD_J1_J2"]
    assert road.vehicle_count >= 25
    assert road.occupancy > 0.50

    # Tick simulation and verify approach detects queue buildup
    frame = sim.tick(dt=1.0)
    j2 = frame["intersections"]["J2"]
    west_app = j2["approaches"]["WEST"]  # inflow from J1
    assert west_app["vehicle_count"] >= 25

def test_03_high_north_waiting_time_and_starvation():
    sim = TrafficSimulator()
    sim.surge_traffic("IN_J2_N", count=10)
    sim.surge_waiting_time("IN_J2_N", additional_seconds=75.0)
    sim.tick(dt=1.0)

    j2 = sim.intersections["J2"]
    north_app = j2.approaches["NORTH"]
    assert north_app.max_waiting_time >= 75.0
    # Starvation boost should be active
    assert north_app.starvation_penalty > 0.0

    # Signal optimizer should prioritize North for starvation relief
    optimizer = SignalOptimizer()
    decision = optimizer.optimize_signal("J2", j2.approaches)
    assert "NORTH" in decision["selected_phase"] or any("Starvation prevention" in r for r in decision["reason"])

def test_04_downstream_congestion_and_spillback():
    detector = SpillbackDetector()
    # 92% occupancy on 40-capacity road
    res = detector.evaluate_spillback("ROAD_J2_J3", current_vehicles=37, capacity=40)
    assert res["occupancy"] >= 0.90
    assert res["status"] == "CRITICAL"
    assert res["should_hold"] is True
    assert res["risk"] >= 0.85

def test_05_ambulance_and_emergency_corridor():
    sim = TrafficSimulator()
    corridor = sim.inject_ambulance("IN_J1_W", "HOSPITAL")
    assert corridor["active"] is True
    assert "J1" in corridor["intersections"]
    assert "J2" in corridor["intersections"]
    assert "J3" in corridor["intersections"]
    assert corridor["prepared_intersections"]["J1"]["status"] == "READY"

    # Optimization cycle should enforce emergency priority
    frame = sim.tick(dt=1.0)
    j1 = frame["intersections"]["J1"]
    assert j1["signals"]["WEST"] == "GREEN" or j1["current_phase"] in ["WEST_PRIORITY", "EMERGENCY_CORRIDOR"]

def test_06_ambulance_with_downstream_congestion():
    sim = TrafficSimulator()
    # Downstream J2->J3 is congested (32 vehicles)
    sim.surge_traffic("ROAD_J2_J3", count=32)
    # Ambulance approaches J1
    sim.inject_ambulance("IN_J1_W", "HOSPITAL")
    
    frame = sim.tick(dt=1.0)
    j2 = frame["intersections"]["J2"]
    # J2 East outflow road is saturated
    out_road = sim.roads["ROAD_J2_J3"]
    assert out_road.occupancy >= 0.85
    # Decision reasons must note downstream hold and emergency override
    recent_reasons = [r for d in frame["recent_decisions"] for r in d.get("reason", [])]
    assert any("Emergency" in r for r in recent_reasons)

def test_07_multiple_connected_intersections():
    sim = TrafficSimulator()
    assert set(sim.intersections.keys()) == {"J1", "J2", "J3", "J4"}
    
    # Path from J1 to Hospital traverses J1 -> J2 -> J3 -> HOSPITAL
    path = sim.routing_graph.find_shortest_path("J1", "HOSPITAL")
    assert path == ["J1", "J2", "J3", "HOSPITAL"]
    
    # Test path from J4 to Hospital: J4 -> J2 -> J3 -> HOSPITAL
    path_j4 = sim.routing_graph.find_shortest_path("J4", "HOSPITAL")
    assert path_j4 == ["J4", "J2", "J3", "HOSPITAL"]
