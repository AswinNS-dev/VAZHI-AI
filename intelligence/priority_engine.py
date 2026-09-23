from typing import Dict, List, Tuple
from intelligence.traffic_state import ApproachState
from intelligence.configuration import get_config

class PriorityEngine:
    """
    Ranks approaches and phase combinations using normalized traffic metrics,
    emergency requirements, starvation prevention, and downstream road capacities.
    """
    def __init__(self):
        self.config = get_config()

    def rank_approaches(self, approaches: Dict[str, ApproachState]) -> List[Tuple[str, float]]:
        """
        Returns sorted list of (direction, priority_score) in descending order.
        """
        sorted_apps = sorted(
            [(dir_name, app.priority_score) for dir_name, app in approaches.items()],
            key=lambda x: x[1],
            reverse=True
        )
        return sorted_apps

    def evaluate_phases(
        self,
        approaches: Dict[str, ApproachState],
        downstream_holds: Dict[str, bool]
    ) -> List[Dict[str, any]]:
        """
        Scores candidate phases based on approach scores, while penalizing phases that feed into congested downstream roads.
        """
        north = approaches.get("NORTH")
        south = approaches.get("SOUTH")
        east = approaches.get("EAST")
        west = approaches.get("WEST")

        ns_score = (north.priority_score if north else 0) + (south.priority_score if south else 0)
        ew_score = (east.priority_score if east else 0) + (west.priority_score if west else 0)

        # Apply downstream hold penalties
        if east and downstream_holds.get("EAST", False):
            ew_score *= 0.4
        if west and downstream_holds.get("WEST", False):
            ew_score *= 0.4
        if north and downstream_holds.get("NORTH", False):
            ns_score *= 0.4
        if south and downstream_holds.get("SOUTH", False):
            ns_score *= 0.4

        candidates = [
            {"phase": "NS_GREEN", "score": round(ns_score, 4), "directions": ["NORTH", "SOUTH"]},
            {"phase": "EW_GREEN", "score": round(ew_score, 4), "directions": ["EAST", "WEST"]},
            {"phase": "NORTH_PRIORITY", "score": round(north.priority_score if north else 0, 4), "directions": ["NORTH"]},
            {"phase": "SOUTH_PRIORITY", "score": round(south.priority_score if south else 0, 4), "directions": ["SOUTH"]},
            {"phase": "EAST_PRIORITY", "score": round(east.priority_score if east else 0, 4), "directions": ["EAST"]},
            {"phase": "WEST_PRIORITY", "score": round(west.priority_score if west else 0, 4), "directions": ["WEST"]}
        ]

        # Penalize individual approach priority if downstream is blocked
        for cand in candidates:
            if len(cand["directions"]) == 1:
                d = cand["directions"][0]
                if downstream_holds.get(d, False):
                    cand["score"] = round(cand["score"] * 0.2, 4)

        candidates.sort(key=lambda x: x["score"], reverse=True)
        return candidates
