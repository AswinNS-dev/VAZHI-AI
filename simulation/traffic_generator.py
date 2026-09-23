import random
from typing import Dict, List, Optional
from simulation.vehicle import Vehicle, VehicleType
from simulation.road import RoadSegment

class TrafficGenerator:
    def __init__(self, entry_roads: List[str]):
        self.entry_roads = entry_roads
        # Inflow rates in vehicles per minute
        self.inflow_rates: Dict[str, float] = {r_id: 12.0 for r_id in entry_roads}
        self.vehicle_counter = 100

    def set_inflow_rate(self, road_id: str, rate_vpm: float):
        self.inflow_rates[road_id] = max(0.0, rate_vpm)

    def generate_step(self, dt_seconds: float = 1.0) -> List[Vehicle]:
        """
        Stochastically generates vehicles for the current time step based on inflow rates.
        """
        new_vehicles = []
        for road_id in self.entry_roads:
            rate = self.inflow_rates.get(road_id, 10.0)
            # Poisson/binomial approximation: probability of arrival in dt
            arrival_prob = (rate / 60.0) * dt_seconds
            if random.random() < arrival_prob:
                v = self._create_random_vehicle(road_id)
                new_vehicles.append(v)
        return new_vehicles

    def _create_random_vehicle(self, road_id: str) -> Vehicle:
        self.vehicle_counter += 1
        roll = random.random()
        if roll < 0.25:
            v_type = VehicleType.BIKE
        elif roll < 0.85:
            v_type = VehicleType.CAR
        elif roll < 0.93:
            v_type = VehicleType.BUS
        else:
            v_type = VehicleType.TRUCK

        dest = "EXIT_E" if "W" in road_id or "J1" in road_id else "EXIT_W"
        return Vehicle(
            id=f"v_{self.vehicle_counter}",
            vehicle_type=v_type,
            current_road_id=road_id,
            destination_node=dest,
            position_m=0.0,
            speed_mps=11.0,
            waiting_time_s=0.0,
            is_emergency=False
        )

    def spawn_ambulance(self, road_id: str = "IN_J1_W", destination_node: str = "HOSPITAL") -> Vehicle:
        self.vehicle_counter += 1
        amb_id = f"A{self.vehicle_counter}"
        return Vehicle(
            id=amb_id,
            vehicle_type=VehicleType.AMBULANCE,
            current_road_id=road_id,
            destination_node=destination_node,
            position_m=0.0,
            speed_mps=13.8, # ~50 km/h
            waiting_time_s=0.0,
            is_emergency=True
        )
