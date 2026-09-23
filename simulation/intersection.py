from typing import Dict, Any, Optional, List
from intelligence.traffic_state import ApproachState

PHASE_APPROACH_SIGNALS = {
    "NS_GREEN": {"NORTH": "GREEN", "SOUTH": "GREEN", "EAST": "RED", "WEST": "RED"},
    "EW_GREEN": {"NORTH": "RED", "SOUTH": "RED", "EAST": "GREEN", "WEST": "GREEN"},
    "NORTH_PRIORITY": {"NORTH": "GREEN", "SOUTH": "RED", "EAST": "RED", "WEST": "RED"},
    "SOUTH_PRIORITY": {"NORTH": "RED", "SOUTH": "GREEN", "EAST": "RED", "WEST": "RED"},
    "EAST_PRIORITY": {"NORTH": "RED", "SOUTH": "RED", "EAST": "GREEN", "WEST": "RED"},
    "WEST_PRIORITY": {"NORTH": "RED", "SOUTH": "RED", "EAST": "RED", "WEST": "GREEN"},
    "EMERGENCY_CORRIDOR": {"NORTH": "RED", "SOUTH": "RED", "EAST": "RED", "WEST": "GREEN"},
    "ALL_RED": {"NORTH": "RED", "SOUTH": "RED", "EAST": "RED", "WEST": "RED"}
}

class Intersection:
    def __init__(self, intersection_id: str, name: str, approaches_config: Dict[str, Any], coordinates: Dict[str, Any]):
        self.intersection_id = intersection_id
        self.name = name
        self.approaches_config = approaches_config
        self.coordinates = coordinates

        self.current_phase = "NS_GREEN"
        self.current_phase_duration = 25
        self.time_in_current_phase = 0
        self.total_phase_switches = 0
        self.last_decision: Optional[Dict[str, Any]] = None

        # Approach models
        self.approaches: Dict[str, ApproachState] = {}
        for direction, cfg in approaches_config.items():
            self.approaches[direction] = ApproachState(
                direction=direction,
                inflow_road_id=cfg["inflow_road"],
                outflow_road_id=cfg["outflow_road"]
            )

    def get_signal_colors(self) -> Dict[str, str]:
        return PHASE_APPROACH_SIGNALS.get(self.current_phase, PHASE_APPROACH_SIGNALS["ALL_RED"])

    def tick(self, dt: float = 1.0) -> bool:
        """
        Advances the phase timer. Returns True if phase duration has expired.
        """
        self.time_in_current_phase += int(dt)
        return self.time_in_current_phase >= self.current_phase_duration

    def apply_phase(self, phase: str, duration: int, decision_details: Optional[Dict[str, Any]] = None):
        if phase != self.current_phase:
            self.current_phase = phase
            self.time_in_current_phase = 0
            self.total_phase_switches += 1
        self.current_phase_duration = max(5, duration)
        if decision_details:
            self.last_decision = decision_details

    def to_dict(self) -> Dict[str, Any]:
        signals = self.get_signal_colors()
        return {
            "id": self.intersection_id,
            "name": self.name,
            "coordinates": self.coordinates,
            "current_phase": self.current_phase,
            "phase_duration": self.current_phase_duration,
            "time_in_phase": self.time_in_current_phase,
            "time_remaining": max(0, self.current_phase_duration - self.time_in_current_phase),
            "signals": signals,
            "total_phase_switches": self.total_phase_switches,
            "last_decision": self.last_decision,
            "approaches": {
                d: {
                    "direction": app.direction,
                    "inflow_road": app.inflow_road_id,
                    "outflow_road": app.outflow_road_id,
                    "vehicle_count": app.vehicle_count,
                    "pcu_count": app.pcu_count,
                    "queue_length": app.queue_length,
                    "max_waiting_time": app.max_waiting_time,
                    "avg_waiting_time": app.avg_waiting_time,
                    "has_emergency": app.has_emergency,
                    "downstream_occupancy": app.downstream_occupancy,
                    "downstream_occupancy_pct": round(app.downstream_occupancy * 100, 1),
                    "priority_score": app.priority_score,
                    "signal_color": signals.get(d, "RED")
                }
                for d, app in self.approaches.items()
            }
        }
