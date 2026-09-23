from dataclasses import dataclass
from typing import Dict, List, Optional
from intelligence.configuration import get_config

@dataclass
class ApproachState:
    direction: str  # NORTH, SOUTH, EAST, WEST
    inflow_road_id: str
    outflow_road_id: str
    vehicle_count: int = 0
    pcu_count: float = 0.0
    queue_length: int = 0
    max_waiting_time: float = 0.0
    avg_waiting_time: float = 0.0
    has_emergency: bool = False
    emergency_count: int = 0
    downstream_road_id: Optional[str] = None
    downstream_occupancy: float = 0.0

    # Normalized component scores (0.0 to 1.0)
    demand_score: float = 0.0
    queue_score: float = 0.0
    waiting_score: float = 0.0
    emergency_score: float = 0.0
    downstream_congestion_score: float = 0.0
    starvation_penalty: float = 0.0

    # Composite priority score
    priority_score: float = 0.0

class TrafficStateEngine:
    def __init__(self):
        self.config = get_config()

    def normalize_and_score(
        self,
        approaches: Dict[str, ApproachState],
        max_capacity_ref: float = 40.0
    ) -> Dict[str, ApproachState]:
        """
        Normalizes metrics across approaches of an intersection and applies the configurable scoring model:
        priority_score =
              0.30 * demand_score
            + 0.20 * queue_score
            + 0.15 * waiting_score
            + 0.25 * emergency_score
            - 0.10 * downstream_congestion_score
            + starvation_boost
        """
        weights = self.config.weights
        starvation_cfg = self.config.starvation
        starvation_threshold = starvation_cfg.get("starvation_threshold_seconds", 60.0)

        # Find maximums across approaches for normalization
        max_pcu = max([app.pcu_count for app in approaches.values()] + [max_capacity_ref, 1.0])
        max_queue = max([app.queue_length for app in approaches.values()] + [10, 1])
        max_wait = max([app.max_waiting_time for app in approaches.values()] + [starvation_threshold, 1.0])

        for direction, app in approaches.items():
            # Normalized values 0.0 - 1.0
            app.demand_score = min(1.0, app.pcu_count / max_pcu)
            app.queue_score = min(1.0, app.queue_length / max_queue)
            app.waiting_score = min(1.0, app.max_waiting_time / max_wait)
            app.emergency_score = 1.0 if app.has_emergency else 0.0
            app.downstream_congestion_score = max(0.0, min(1.0, app.downstream_occupancy))

            # Starvation prevention boost
            if app.max_waiting_time > starvation_threshold:
                over_ratio = (app.max_waiting_time - starvation_threshold) / starvation_threshold
                app.starvation_penalty = min(
                    starvation_cfg.get("max_starvation_score_boost", 0.50),
                    over_ratio * 0.25
                )
            else:
                app.starvation_penalty = 0.0

            # Base weighted score
            base_score = (
                weights.get("demand_weight", 0.30) * app.demand_score
                + weights.get("queue_weight", 0.20) * app.queue_score
                + weights.get("waiting_weight", 0.15) * app.waiting_score
                + weights.get("emergency_weight", 0.25) * app.emergency_score
                - weights.get("downstream_congestion_weight", 0.10) * app.downstream_congestion_score
                + app.starvation_penalty
            )

            # Emergency hard priority override
            if app.has_emergency:
                base_score += 1.0

            app.priority_score = round(max(0.0, base_score), 4)

        return approaches
