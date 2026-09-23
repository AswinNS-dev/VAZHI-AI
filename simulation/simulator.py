import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime

from simulation.vehicle import Vehicle, VehicleType
from simulation.road import RoadSegment
from simulation.intersection import Intersection
from simulation.traffic_generator import TrafficGenerator

from intelligence.routing import NetworkGraph
from intelligence.traffic_state import TrafficStateEngine
from intelligence.spillback_detector import SpillbackDetector
from intelligence.emergency_engine import EmergencyCorridorEngine
from intelligence.signal_optimizer import SignalOptimizer
from intelligence.configuration import get_config

class TrafficSimulator:
    def __init__(self, network_file: Optional[Path | str] = None):
        self.config = get_config()
        base_dir = Path(__file__).resolve().parent.parent
        self.network_file = network_file or (base_dir / "data" / "sample_network.json")
        
        # Load network data
        with open(self.network_file, "r", encoding="utf-8") as f:
            self.network_data = json.load(f)

        self.routing_graph = NetworkGraph(self.network_data)
        self.traffic_state_engine = TrafficStateEngine()
        self.spillback_detector = SpillbackDetector()
        self.emergency_engine = EmergencyCorridorEngine(self.routing_graph)
        self.signal_optimizer = SignalOptimizer()

        # Build Roads and Intersections
        self.roads: Dict[str, RoadSegment] = {}
        for r in self.network_data.get("roads", []):
            self.roads[r["id"]] = RoadSegment(
                road_id=r["id"],
                from_node=r["from_node"],
                to_node=r["to_node"],
                length_m=r.get("length_m", 300),
                lanes=r.get("lanes", 2),
                capacity_pcu=r.get("capacity_pcu", 30),
                speed_limit_kmh=r.get("speed_limit_kmh", 50)
            )

        self.intersections: Dict[str, Intersection] = {}
        for j in self.network_data.get("intersections", []):
            self.intersections[j["id"]] = Intersection(
                intersection_id=j["id"],
                name=j.get("name", j["id"]),
                approaches_config=j["approaches"],
                coordinates=j.get("coordinates", {})
            )

        entry_roads = [r_id for r_id, r in self.roads.items() if r.from_node.startswith("ENTRY_")]
        self.traffic_generator = TrafficGenerator(entry_roads)

        # Simulation states
        self.is_running = True
        self.is_paused = False
        self.sim_time_seconds = 0
        self.mode = "VAZHI_AI"  # "VAZHI_AI" or "FIXED_TIME"
        
        # Timeline and metrics
        self.decision_timeline: List[Dict[str, Any]] = []
        self.total_throughput = 0
        self.spillback_event_count = 0
        self.spillback_states: Dict[str, Dict[str, Any]] = {}
        self.active_vehicles: Dict[str, Vehicle] = {}
        self.ambulance_stats: List[Dict[str, Any]] = []

        # Populate some initial light traffic
        self._seed_initial_vehicles()

    def _seed_initial_vehicles(self):
        for road_id in ["ROAD_J1_J2", "ROAD_J2_J3", "IN_J1_W", "IN_J2_N"]:
            if road_id in self.roads:
                for _ in range(4):
                    v = self.traffic_generator._create_random_vehicle(road_id)
                    v.position_m = float(len(self.roads[road_id].vehicles) * 15.0)
                    self.roads[road_id].add_vehicle(v)
                    self.active_vehicles[v.id] = v

    def set_mode(self, mode: str):
        if mode in ["VAZHI_AI", "FIXED_TIME"]:
            self.mode = mode

    def inject_ambulance(self, origin_road: str = "IN_J1_W", destination_node: str = "HOSPITAL") -> Dict[str, Any]:
        amb = self.traffic_generator.spawn_ambulance(origin_road, destination_node)
        if origin_road in self.roads:
            self.roads[origin_road].add_vehicle(amb)
        self.active_vehicles[amb.id] = amb

        corridor_data = self.emergency_engine.register_ambulance(
            ambulance_id=amb.id,
            current_node_or_road=origin_road,
            destination_node=destination_node
        )
        return corridor_data

    def surge_traffic(self, road_id: str, count: int = 15):
        if road_id in self.roads:
            for _ in range(count):
                v = self.traffic_generator._create_random_vehicle(road_id)
                self.roads[road_id].add_vehicle(v)
                self.active_vehicles[v.id] = v

    def surge_waiting_time(self, road_id: str, additional_seconds: float = 65.0):
        if road_id in self.roads:
            for v in self.roads[road_id].vehicles:
                v.waiting_time_s += additional_seconds

    def tick(self, dt: float = 1.0) -> Dict[str, Any]:
        """
        Executes one simulation step (1 second discrete time).
        """
        if self.is_paused or not self.is_running:
            return self.get_state_frame()

        self.sim_time_seconds += int(dt)

        # 1. Generate new vehicles from perimeter entry points
        new_vehicles = self.traffic_generator.generate_step(dt)
        for v in new_vehicles:
            if v.current_road_id in self.roads:
                self.roads[v.current_road_id].add_vehicle(v)
                self.active_vehicles[v.id] = v

        # 2. Evaluate Downstream Spillback for all roads
        downstream_holds: Dict[str, bool] = {}
        for r_id, road in self.roads.items():
            sb_info = self.spillback_detector.evaluate_spillback(
                road_id=r_id,
                current_vehicles=road.vehicle_count,
                capacity=road.capacity_pcu
            )
            self.spillback_states[r_id] = sb_info
            if sb_info["should_hold"]:
                downstream_holds[r_id] = True
                if sb_info["risk"] >= 0.85:
                    self.spillback_event_count += 1

        # 3. Synchronize Approach States for Intersections
        for j_id, intersection in self.intersections.items():
            for d, app in intersection.approaches.items():
                in_road = self.roads.get(app.inflow_road_id)
                out_road = self.roads.get(app.outflow_road_id)
                if in_road:
                    app.vehicle_count = in_road.vehicle_count
                    app.pcu_count = in_road.total_pcu
                    app.queue_length = in_road.queue_length
                    app.max_waiting_time = in_road.max_waiting_time
                    app.avg_waiting_time = in_road.average_waiting_time
                    app.has_emergency = in_road.has_emergency
                if out_road:
                    app.downstream_road_id = out_road.road_id
                    app.downstream_occupancy = out_road.occupancy

            # Normalize & compute priority scores
            self.traffic_state_engine.normalize_and_score(intersection.approaches)

        # 4. Check for active emergency ambulance positions and corridor progression
        for amb_id, rec in list(self.emergency_engine.active_emergencies.items()):
            if rec.get("active"):
                amb_v = self.active_vehicles.get(amb_id)
                if amb_v:
                    # Check what node or road ambulance is on
                    curr_road = self.roads.get(amb_v.current_road_id)
                    curr_node = curr_road.to_node if curr_road else "J1"
                    rem_dist = max(0.0, 1200.0 - (self.sim_time_seconds * 14.0))
                    self.emergency_engine.update_location(amb_id, curr_node, rem_dist)

        # 5. Signal Phase Control & Decision Cycle
        for j_id, intersection in self.intersections.items():
            phase_expired = intersection.tick(dt)
            corridor_directive = self.emergency_engine.get_corridor_signal_directive(j_id)

            # In VAZHI-AI mode: Evaluate if expired OR if immediate emergency corridor preemption triggers
            if self.mode == "VAZHI_AI":
                should_decide = phase_expired or (corridor_directive and intersection.current_phase != corridor_directive["phase"])
                if should_decide:
                    # Check holds on outflow roads
                    holds_map = {
                        d: downstream_holds.get(app.outflow_road_id, False)
                        for d, app in intersection.approaches.items()
                    }
                    decision = self.signal_optimizer.optimize_signal(
                        intersection_id=j_id,
                        approaches=intersection.approaches,
                        corridor_directive=corridor_directive,
                        downstream_holds=holds_map,
                        current_phase=intersection.current_phase,
                        time_in_current_phase=intersection.time_in_current_phase
                    )
                    intersection.apply_phase(decision["selected_phase"], decision["duration"], decision)
                    self._record_decision(decision)

            elif self.mode == "FIXED_TIME":
                # Standard 30s Fixed Cycle: Alternate NS_GREEN and EW_GREEN blindly
                if phase_expired:
                    next_fixed = "EW_GREEN" if intersection.current_phase == "NS_GREEN" else "NS_GREEN"
                    decision = {
                        "intersection": j_id,
                        "selected_phase": next_fixed,
                        "duration": 30,
                        "reason": ["Fixed-timer cycle elapsed (30s predetermined timing)"],
                        "next_planned_phase": "NS_GREEN" if next_fixed == "EW_GREEN" else "EW_GREEN",
                        "emergency_override": False,
                        "timestamp": datetime.now().strftime("%H:%M:%S")
                    }
                    intersection.apply_phase(next_fixed, 30, decision)

        # 6. Update Vehicle Movements along Roads
        self._update_vehicle_flows(dt)

        return self.get_state_frame()

    def _update_vehicle_flows(self, dt: float):
        for j_id, intersection in self.intersections.items():
            signals = intersection.get_signal_colors()
            for direction, app in intersection.approaches.items():
                in_road = self.roads.get(app.inflow_road_id)
                out_road = self.roads.get(app.outflow_road_id)
                if not in_road:
                    continue

                is_green = signals.get(direction) == "GREEN"
                downstream_blocked = False
                if out_road and self.spillback_states.get(out_road.road_id, {}).get("should_hold", False):
                    # In VAZHI-AI mode, hold traffic if downstream road is critically occupied
                    if self.mode == "VAZHI_AI" and not in_road.has_emergency:
                        downstream_blocked = True

                # Step vehicles on inflow road
                in_road.update_flow(dt, downstream_is_green=is_green, downstream_has_spillback=downstream_blocked)

                # Transfer vehicles that reached the end during green phase
                if is_green and not downstream_blocked:
                    crossing_candidates = [v for v in in_road.vehicles if v.position_m >= in_road.length_m - 6.0]
                    for v in crossing_candidates[:2]: # Max 2 vehicles can cross per second per approach
                        in_road.remove_vehicle(v.id)
                        if out_road:
                            if out_road.to_node == "HOSPITAL" and v.is_emergency:
                                # Reached destination!
                                self.emergency_engine.clear_emergency(v.id)
                            out_road.add_vehicle(v)
                        else:
                            # Reached network exit
                            self.total_throughput += 1
                            if v.id in self.active_vehicles:
                                del self.active_vehicles[v.id]

    def _record_decision(self, decision: Dict[str, Any]):
        self.decision_timeline.insert(0, decision)
        if len(self.decision_timeline) > 100:
            self.decision_timeline.pop()

    def get_metrics(self) -> Dict[str, Any]:
        all_roads = list(self.roads.values())
        all_vehicles = list(self.active_vehicles.values())
        
        avg_wait = round(sum(v.waiting_time_s for v in all_vehicles) / max(1, len(all_vehicles)), 1)
        max_q = max([r.queue_length for r in all_roads] + [0])
        avg_q = round(sum(r.queue_length for r in all_roads) / max(1, len(all_roads)), 1)
        total_switches = sum(j.total_phase_switches for j in self.intersections.values())
        avg_occ = round(sum(r.occupancy for r in all_roads) / max(1, len(all_roads)) * 100, 1)

        return {
            "mode": self.mode,
            "simulation_time_seconds": self.sim_time_seconds,
            "average_waiting_time": avg_wait,
            "maximum_queue_length": max_q,
            "average_queue_length": avg_q,
            "traffic_throughput": self.total_throughput,
            "spillback_events": self.spillback_event_count,
            "signal_switches": total_switches,
            "average_road_occupancy_pct": avg_occ,
            "active_vehicle_count": len(all_vehicles),
            "emergency_vehicles_active": sum(1 for v in all_vehicles if v.is_emergency)
        }

    def get_state_frame(self) -> Dict[str, Any]:
        metrics = self.get_metrics()
        return {
            "simulation_time": self.sim_time_seconds,
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "mode": self.mode,
            "metrics": metrics,
            "intersections": {j_id: inter.to_dict() for j_id, inter in self.intersections.items()},
            "roads": {r_id: road.to_dict() for r_id, road in self.roads.items()},
            "emergencies": self.emergency_engine.active_emergencies,
            "spillback": self.spillback_states,
            "recent_decisions": self.decision_timeline[:15],
            "vehicle_count": len(self.active_vehicles),
            "timestamp": datetime.now().isoformat()
        }

    def reset(self):
        self.__init__(self.network_file)
