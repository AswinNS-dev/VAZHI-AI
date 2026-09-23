import json
from pathlib import Path
from typing import Any, Dict

DEFAULT_CONFIG: Dict[str, Any] = {
    "system": {
        "name": "VAZHI-AI",
        "version": "1.0.0",
        "description": "Real-Time Network-Aware Traffic & Emergency Intelligence MVP",
        "mode": "PROTOTYPE_SIMULATION",
        "target_region": "Tamil Nadu Urban Corridor Prototype"
    },
    "scoring_weights": {
        "demand_weight": 0.30,
        "queue_weight": 0.20,
        "waiting_weight": 0.15,
        "emergency_weight": 0.25,
        "downstream_congestion_weight": 0.10
    },
    "starvation": {
        "starvation_threshold_seconds": 60.0,
        "starvation_multiplier": 1.5,
        "max_starvation_score_boost": 0.50
    },
    "signal_timing": {
        "min_green_seconds": 10,
        "max_green_seconds": 45,
        "yellow_seconds": 3,
        "all_red_seconds": 2,
        "fixed_cycle_default_seconds": 30
    },
    "downstream_thresholds": {
        "low_max": 0.40,
        "moderate_max": 0.70,
        "high_max": 0.85,
        "critical_threshold": 0.85,
        "spillback_hold_threshold": 0.90
    },
    "emergency": {
        "preemption_lead_time_seconds": 20,
        "clearance_buffer_seconds": 5,
        "hospital_node": "HOSPITAL"
    },
    "simulation": {
        "tick_rate_hz": 1.0,
        "default_speed_kmh": 40.0,
        "car_pcu": 1.0,
        "bike_pcu": 0.5,
        "bus_pcu": 3.0,
        "truck_pcu": 2.5,
        "ambulance_pcu": 1.2
    }
}

class TrafficConfiguration:
    _instance = None

    def __new__(cls, config_path: Path | str | None = None):
        if cls._instance is None:
            cls._instance = super(TrafficConfiguration, cls).__new__(cls)
            cls._instance._init_config(config_path)
        return cls._instance

    def _init_config(self, config_path: Path | str | None = None):
        self.config: Dict[str, Any] = json.loads(json.dumps(DEFAULT_CONFIG))
        if config_path:
            self.load(config_path)
        else:
            # Try to load from default location
            base_dir = Path(__file__).resolve().parent.parent
            default_path = base_dir / "data" / "traffic_config.json"
            if default_path.exists():
                self.load(default_path)

    def load(self, path: Path | str):
        p = Path(path)
        if p.exists():
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.config.update(data)

    def get(self, key: str, default: Any = None) -> Any:
        return self.config.get(key, default)

    @property
    def weights(self) -> Dict[str, float]:
        return self.config.get("scoring_weights", DEFAULT_CONFIG["scoring_weights"])

    @property
    def starvation(self) -> Dict[str, float]:
        return self.config.get("starvation", DEFAULT_CONFIG["starvation"])

    @property
    def signal_timing(self) -> Dict[str, int]:
        return self.config.get("signal_timing", DEFAULT_CONFIG["signal_timing"])

    @property
    def downstream_thresholds(self) -> Dict[str, float]:
        return self.config.get("downstream_thresholds", DEFAULT_CONFIG["downstream_thresholds"])

    @property
    def emergency_settings(self) -> Dict[str, Any]:
        return self.config.get("emergency", DEFAULT_CONFIG["emergency"])

    def update_weights(self, new_weights: Dict[str, float]):
        self.config.setdefault("scoring_weights", {}).update(new_weights)

def get_config() -> TrafficConfiguration:
    return TrafficConfiguration()
