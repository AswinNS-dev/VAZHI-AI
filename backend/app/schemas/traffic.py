from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class NetworkResponse(BaseModel):
    network_id: str
    name: str
    intersections: List[Dict[str, Any]]
    roads: List[Dict[str, Any]]
    special_destinations: List[Dict[str, Any]]

class InflowSurgeRequest(BaseModel):
    road_id: str
    vehicle_count: int = Field(default=15, ge=1, le=50)

class WaitingSurgeRequest(BaseModel):
    road_id: str
    seconds: float = Field(default=60.0, ge=1.0, le=300.0)

class AmbulanceDispatch(BaseModel):
    origin_road: str = Field(default="IN_J1_W")
    destination_node: str = Field(default="HOSPITAL")

class SimulationModeRequest(BaseModel):
    mode: str = Field(..., pattern="^(VAZHI_AI|FIXED_TIME)$")

class SimulationMetricsResponse(BaseModel):
    mode: str
    simulation_time_seconds: int
    average_waiting_time: float
    maximum_queue_length: int
    average_queue_length: float
    traffic_throughput: int
    spillback_events: int
    signal_switches: int
    average_road_occupancy_pct: float
    active_vehicle_count: int
    emergency_vehicles_active: int
