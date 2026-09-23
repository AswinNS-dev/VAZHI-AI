from typing import Dict, List, Optional, Any
from intelligence.routing import NetworkGraph
from intelligence.configuration import get_config

class EmergencyCorridorEngine:
    def __init__(self, network_graph: NetworkGraph):
        self.network_graph = network_graph
        self.config = get_config()
        self.active_emergencies: Dict[str, Dict[str, Any]] = {}

    def register_ambulance(
        self,
        ambulance_id: str,
        current_node_or_road: str,
        destination_node: str = "HOSPITAL",
        estimated_speed_mps: float = 14.0 # ~50 km/h
    ) -> Dict[str, Any]:
        """
        Creates an emergency corridor, computing shortest route through network graph.
        """
        # Determine origin intersection node
        origin = current_node_or_road
        if current_node_or_road not in self.network_graph.graph.nodes:
            # Check if it's a road
            if current_node_or_road in self.network_graph.road_map:
                origin = self.network_graph.road_map[current_node_or_road]["to_node"]
            else:
                # Default feeder origin
                origin = "J1"

        route_nodes = self.network_graph.find_shortest_path(origin, destination_node)
        if not route_nodes:
            # Fallback path if direct path not found
            route_nodes = ["J1", "J2", "J3", destination_node]

        intersections = [n for n in route_nodes if n.startswith("J")]
        route_roads = self.network_graph.get_route_roads(route_nodes)

        # Estimate travel distance & ETA
        total_dist_m = 0
        for r_id in route_roads:
            if r_id in self.network_graph.road_map:
                total_dist_m += self.network_graph.road_map[r_id].get("length_m", 300)
        total_dist_m = max(total_dist_m, 1000)
        eta_seconds = int(total_dist_m / max(estimated_speed_mps, 5.0))

        # Build initial intersection corridor readiness statuses
        prepared_intersections = {}
        for idx, j_id in enumerate(intersections):
            status = "READY" if idx == 0 else "PREPARING"
            prepared_intersections[j_id] = {
                "status": status,
                "step": idx + 1,
                "ready": idx == 0,
                "passed": False
            }

        emergency_record = {
            "ambulance_id": ambulance_id,
            "origin": origin,
            "current_location": origin,
            "destination": destination_node,
            "route_nodes": route_nodes,
            "route_display": " → ".join(route_nodes),
            "route_roads": route_roads,
            "intersections": intersections,
            "prepared_intersections": prepared_intersections,
            "eta_seconds": eta_seconds,
            "total_distance_m": total_dist_m,
            "active": True,
            "status": "ACTIVE_CORRIDOR"
        }
        self.active_emergencies[ambulance_id] = emergency_record
        return emergency_record

    def update_location(self, ambulance_id: str, current_node: str, remaining_dist_m: float) -> Optional[Dict[str, Any]]:
        record = self.active_emergencies.get(ambulance_id)
        if not record:
            return None

        record["current_location"] = current_node
        record["eta_seconds"] = max(0, int(remaining_dist_m / 14.0))

        # Check if ambulance reached destination
        if current_node == record["destination"] or remaining_dist_m <= 0:
            record["active"] = False
            record["status"] = "ARRIVED_AT_HOSPITAL"
            for j_id in record["intersections"]:
                record["prepared_intersections"][j_id]["status"] = "RELEASED"
                record["prepared_intersections"][j_id]["ready"] = False
                record["prepared_intersections"][j_id]["passed"] = True
            return record

        # Progressively update intersection readiness
        passed = True
        for j_id in record["intersections"]:
            prep = record["prepared_intersections"][j_id]
            if j_id == current_node:
                prep["status"] = "PASSING"
                prep["ready"] = True
                prep["passed"] = False
                passed = False
            elif passed:
                prep["status"] = "RELEASED"
                prep["ready"] = False
                prep["passed"] = True
            else:
                # Ahead of current location
                prep["status"] = "READY" if prep.get("step", 99) <= 2 else "PREPARING"
                prep["ready"] = (prep["status"] == "READY")
                prep["passed"] = False

        return record

    def get_corridor_signal_directive(self, intersection_id: str) -> Optional[Dict[str, Any]]:
        """
        Returns required signal override for this intersection if part of an active corridor.
        """
        for amb_id, rec in self.active_emergencies.items():
            if not rec.get("active"):
                continue
            if intersection_id in rec["prepared_intersections"]:
                prep = rec["prepared_intersections"][intersection_id]
                if prep.get("ready") or prep.get("status") in ["READY", "PASSING"]:
                    # Determine which approach needs green for the ambulance route
                    route = rec["route_nodes"]
                    try:
                        idx = route.index(intersection_id)
                        prev_node = route[idx - 1] if idx > 0 else "ENTRY_W"
                        next_node = route[idx + 1] if idx < len(route) - 1 else "HOSPITAL"
                    except ValueError:
                        prev_node, next_node = "WEST", "EAST"

                    # Map direction based on route
                    direction = "WEST" if "J1" in prev_node or prev_node == "ENTRY_W" else "EAST"
                    if intersection_id == "J4":
                        direction = "SOUTH"
                    elif intersection_id == "J2" and prev_node == "J1":
                        direction = "WEST"
                    elif intersection_id == "J3" and prev_node == "J2":
                        direction = "WEST"

                    return {
                        "override": True,
                        "ambulance_id": amb_id,
                        "phase": "EMERGENCY_CORRIDOR",
                        "priority_direction": direction,
                        "reason": f"Active Emergency Corridor for Ambulance {amb_id} heading to {rec['destination']}"
                    }
        return None

    def clear_emergency(self, ambulance_id: str):
        if ambulance_id in self.active_emergencies:
            self.active_emergencies[ambulance_id]["active"] = False
            self.active_emergencies[ambulance_id]["status"] = "COMPLETED"
