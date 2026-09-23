from typing import Dict, List, Optional, Tuple, Any
import networkx as nx
from pathlib import Path
import json

class NetworkGraph:
    def __init__(self, network_data: Optional[Dict[str, Any]] = None):
        self.graph = nx.DiGraph()
        self.network_data = network_data or {}
        self.road_map: Dict[str, Dict[str, Any]] = {}
        self.node_positions: Dict[str, Tuple[float, float]] = {}
        if network_data:
            self._build_graph(network_data)

    @classmethod
    def from_file(cls, path: Path | str) -> "NetworkGraph":
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return cls(data)

    def _build_graph(self, data: Dict[str, Any]):
        for inter in data.get("intersections", []):
            node_id = inter["id"]
            coords = inter.get("coordinates", {})
            self.node_positions[node_id] = (coords.get("x", 0.0), coords.get("y", 0.0))
            self.graph.add_node(node_id, type="INTERSECTION", name=inter.get("name"), coords=coords)

        for dest in data.get("special_destinations", []):
            dest_id = dest["id"]
            coords = dest.get("coordinates", {})
            self.node_positions[dest_id] = (coords.get("x", 0.0), coords.get("y", 0.0))
            self.graph.add_node(dest_id, type="SPECIAL", name=dest.get("name"), coords=coords)

        for road in data.get("roads", []):
            road_id = road["id"]
            u = road["from_node"]
            v = road["to_node"]
            length = road.get("length_m", 100)
            lanes = road.get("lanes", 2)
            capacity = road.get("capacity_pcu", 30)
            speed = road.get("speed_limit_kmh", 50)
            
            # Base free flow travel time in seconds: length / (speed in m/s)
            free_flow_time = length / (max(speed, 10) * (1000 / 3600))

            self.road_map[road_id] = road
            self.graph.add_edge(
                u, v,
                road_id=road_id,
                length=length,
                lanes=lanes,
                capacity=capacity,
                weight=free_flow_time
            )

    def find_shortest_path(self, origin: str, destination: str) -> List[str]:
        try:
            return nx.shortest_path(self.graph, source=origin, target=destination, weight="weight")
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return []

    def get_route_roads(self, path_nodes: List[str]) -> List[str]:
        roads = []
        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i+1]
            if self.graph.has_edge(u, v):
                roads.append(self.graph[u][v].get("road_id"))
        return roads

    def get_downstream_intersections(self, intersection_id: str) -> List[str]:
        if not self.graph.has_node(intersection_id):
            return []
        return [succ for succ in self.graph.successors(intersection_id) if self.graph.nodes[succ].get("type") == "INTERSECTION"]

    def get_connected_road(self, from_node: str, to_node: str) -> Optional[str]:
        if self.graph.has_edge(from_node, to_node):
            return self.graph[from_node][to_node].get("road_id")
        return None
