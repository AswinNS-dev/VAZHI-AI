from typing import List, Dict, Any, Optional
from simulation.vehicle import Vehicle

class RoadSegment:
    def __init__(
        self,
        road_id: str,
        from_node: str,
        to_node: str,
        length_m: float = 300.0,
        lanes: int = 2,
        capacity_pcu: int = 30,
        speed_limit_kmh: float = 50.0
    ):
        self.road_id = road_id
        self.from_node = from_node
        self.to_node = to_node
        self.length_m = length_m
        self.lanes = lanes
        self.capacity_pcu = capacity_pcu
        self.speed_limit_kmh = speed_limit_kmh
        self.free_flow_speed_mps = speed_limit_kmh * (1000 / 3600)

        self.vehicles: List[Vehicle] = []
        self.departed_vehicles_last_minute: int = 0
        self.arrived_vehicles_last_minute: int = 0

    @property
    def total_pcu(self) -> float:
        return sum(v.pcu for v in self.vehicles)

    @property
    def vehicle_count(self) -> int:
        return len(self.vehicles)

    @property
    def occupancy(self) -> float:
        if self.capacity_pcu <= 0:
            return 0.0
        return min(1.0, round(self.total_pcu / self.capacity_pcu, 4))

    @property
    def queue_length(self) -> int:
        """
        Count of vehicles stopped (speed < 1.0 m/s) within 100m of the intersection end.
        """
        queue_zone_start = max(0.0, self.length_m - 120.0)
        return sum(1 for v in self.vehicles if v.position_m >= queue_zone_start and v.speed_mps < 1.0)

    @property
    def average_waiting_time(self) -> float:
        if not self.vehicles:
            return 0.0
        return round(sum(v.waiting_time_s for v in self.vehicles) / len(self.vehicles), 1)

    @property
    def max_waiting_time(self) -> float:
        if not self.vehicles:
            return 0.0
        return round(max(v.waiting_time_s for v in self.vehicles), 1)

    @property
    def has_emergency(self) -> bool:
        return any(v.is_emergency for v in self.vehicles)

    def add_vehicle(self, vehicle: Vehicle):
        vehicle.current_road_id = self.road_id
        vehicle.position_m = 0.0
        self.vehicles.append(vehicle)
        self.arrived_vehicles_last_minute += 1

    def remove_vehicle(self, vehicle_id: str) -> Optional[Vehicle]:
        for idx, v in enumerate(self.vehicles):
            if v.id == vehicle_id:
                self.departed_vehicles_last_minute += 1
                return self.vehicles.pop(idx)
        return None

    def update_flow(self, dt: float, downstream_is_green: bool, downstream_has_spillback: bool):
        """
        Updates positions of all vehicles on the road using a car-following / density-speed model.
        """
        occ = self.occupancy
        # Speed degrades as occupancy approaches capacity
        speed_factor = max(0.1, 1.0 - (occ ** 2))
        effective_free_speed = self.free_flow_speed_mps * speed_factor

        stop_line = self.length_m - 5.0
        sorted_vehicles = sorted(self.vehicles, key=lambda v: v.position_m, reverse=True)

        for i, v in enumerate(sorted_vehicles):
            # Target distance ahead (either leader car or stop line)
            if i == 0:
                # Lead vehicle approaching the intersection
                dist_to_stop = stop_line - v.position_m
                if dist_to_stop <= 20.0 and (not downstream_is_green or downstream_has_spillback):
                    # Must stop at red or downstream hold
                    v.speed_mps = max(0.0, v.speed_mps - 4.0 * dt)
                    if v.speed_mps < 0.5:
                        v.speed_mps = 0.0
                        v.in_queue = True
                        v.waiting_time_s += dt
                else:
                    v.speed_mps = min(effective_free_speed, v.speed_mps + 2.0 * dt)
                    v.in_queue = False
            else:
                # Follower vehicle
                lead = sorted_vehicles[i - 1]
                gap = lead.position_m - v.position_m - lead.length_m
                if gap < 8.0:
                    v.speed_mps = max(0.0, min(lead.speed_mps, v.speed_mps - 4.5 * dt))
                    if v.speed_mps < 0.5:
                        v.speed_mps = 0.0
                        v.in_queue = True
                        v.waiting_time_s += dt
                elif gap < 20.0:
                    v.speed_mps = min(lead.speed_mps, v.speed_mps)
                    v.in_queue = False
                else:
                    v.speed_mps = min(effective_free_speed, v.speed_mps + 2.0 * dt)
                    v.in_queue = False

            # Update position
            v.position_m += v.speed_mps * dt
            if v.position_m > self.length_m:
                v.position_m = self.length_m

    def to_dict(self) -> Dict[str, Any]:
        return {
            "road_id": self.road_id,
            "from_node": self.from_node,
            "to_node": self.to_node,
            "length_m": self.length_m,
            "capacity_pcu": self.capacity_pcu,
            "vehicle_count": self.vehicle_count,
            "pcu_count": round(self.total_pcu, 1),
            "occupancy": self.occupancy,
            "occupancy_pct": round(self.occupancy * 100, 1),
            "queue_length": self.queue_length,
            "avg_waiting_time": self.average_waiting_time,
            "max_waiting_time": self.max_waiting_time,
            "has_emergency": self.has_emergency,
            "vehicles": [v.to_dict() for v in self.vehicles]
        }
