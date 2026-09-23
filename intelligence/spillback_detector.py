from typing import Dict, Any, Optional
from intelligence.configuration import get_config

class SpillbackDetector:
    def __init__(self):
        self.config = get_config()
        self.history: Dict[str, list] = {}  # road_id -> list of occupancy records

    def categorize_occupancy(self, occupancy: float) -> str:
        thresh = self.config.downstream_thresholds
        if occupancy < thresh.get("low_max", 0.40):
            return "LOW"
        elif occupancy < thresh.get("moderate_max", 0.70):
            return "MODERATE"
        elif occupancy < thresh.get("high_max", 0.85):
            return "HIGH"
        else:
            return "CRITICAL"

    def evaluate_spillback(
        self,
        road_id: str,
        current_vehicles: int,
        capacity: int,
        arrival_rate: float = 0.0,
        departure_rate: float = 0.0,
        queue_growth_rate: float = 0.0
    ) -> Dict[str, Any]:
        """
        Calculates spillback risk (0.0 to 1.0) and status.
        spillback_risk is determined by:
        - occupancy ratio (pcu / capacity)
        - arrival vs departure rate differential
        - queue growth velocity
        """
        cap = max(1, capacity)
        occupancy = round(min(1.0, current_vehicles / cap), 4)
        status = self.categorize_occupancy(occupancy)

        # Track history for trend
        if road_id not in self.history:
            self.history[road_id] = []
        self.history[road_id].append(occupancy)
        if len(self.history[road_id]) > 10:
            self.history[road_id].pop(0)

        # Growth trend
        trend_boost = 0.0
        if len(self.history[road_id]) >= 3:
            recent_delta = self.history[road_id][-1] - self.history[road_id][-3]
            if recent_delta > 0:
                trend_boost = min(0.2, recent_delta)

        # Inflow pressure
        rate_diff = arrival_rate - departure_rate
        inflow_boost = 0.1 if rate_diff > 0 else 0.0

        # Composite risk calculation
        risk = min(1.0, round(occupancy * 0.75 + trend_boost + inflow_boost + (queue_growth_rate * 0.1), 4))
        
        # Override risk to critical if occupancy is over 85%
        if occupancy >= 0.85:
            risk = max(risk, 0.85)

        should_hold = occupancy >= self.config.downstream_thresholds.get("spillback_hold_threshold", 0.90)

        return {
            "road": road_id,
            "occupancy": occupancy,
            "occupancy_pct": round(occupancy * 100, 1),
            "risk": risk,
            "status": status,
            "should_hold": should_hold,
            "recommendation": "HOLD_TRAFFIC" if should_hold else ("METER_RELEASE" if occupancy > 0.70 else "FREE_FLOW")
        }
