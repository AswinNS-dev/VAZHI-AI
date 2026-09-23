import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional

class VehicleType(str, Enum):
    CAR = "CAR"
    BIKE = "BIKE"
    BUS = "BUS"
    TRUCK = "TRUCK"
    AMBULANCE = "AMBULANCE"

PCU_MAP = {
    VehicleType.CAR: 1.0,
    VehicleType.BIKE: 0.5,
    VehicleType.BUS: 3.0,
    VehicleType.TRUCK: 2.5,
    VehicleType.AMBULANCE: 1.2
}

LENGTH_MAP = {
    VehicleType.CAR: 4.5,
    VehicleType.BIKE: 2.0,
    VehicleType.BUS: 12.0,
    VehicleType.TRUCK: 10.0,
    VehicleType.AMBULANCE: 6.0
}

@dataclass
class Vehicle:
    id: str = field(default_factory=lambda: f"v_{uuid.uuid4().hex[:6]}")
    vehicle_type: VehicleType = VehicleType.CAR
    current_road_id: str = ""
    current_intersection_id: Optional[str] = None
    destination_node: str = "EXIT_E"
    route: List[str] = field(default_factory=list) # List of road IDs or node IDs
    position_m: float = 0.0 # meters from start of road
    speed_mps: float = 11.1 # ~40 km/h
    waiting_time_s: float = 0.0
    is_emergency: bool = False
    in_queue: bool = False

    @property
    def pcu(self) -> float:
        return PCU_MAP.get(self.vehicle_type, 1.0)

    @property
    def length_m(self) -> float:
        return LENGTH_MAP.get(self.vehicle_type, 4.5)

    def to_dict(self):
        return {
            "id": self.id,
            "vehicle_type": self.vehicle_type.value,
            "current_road_id": self.current_road_id,
            "current_intersection_id": self.current_intersection_id,
            "destination_node": self.destination_node,
            "position_m": round(self.position_m, 1),
            "speed_kmh": round(self.speed_mps * 3.6, 1),
            "waiting_time_s": round(self.waiting_time_s, 1),
            "is_emergency": self.is_emergency,
            "in_queue": self.in_queue
        }
