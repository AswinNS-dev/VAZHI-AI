from typing import Dict, List, Optional, Any
from datetime import datetime
from intelligence.traffic_state import ApproachState
from intelligence.priority_engine import PriorityEngine
from intelligence.configuration import get_config

class SignalOptimizer:
    def __init__(self):
        self.config = get_config()
        self.priority_engine = PriorityEngine()

    def optimize_signal(
        self,
        intersection_id: str,
        approaches: Dict[str, ApproachState],
        corridor_directive: Optional[Dict[str, Any]] = None,
        downstream_holds: Optional[Dict[str, bool]] = None,
        current_phase: str = "ALL_RED",
        time_in_current_phase: int = 0
    ) -> Dict[str, Any]:
        """
        Determines the next best signal phase, duration, and human-readable explanation.
        """
        downstream_holds = downstream_holds or {}
        timing = self.config.signal_timing
        min_green = timing.get("min_green_seconds", 10)
        max_green = timing.get("max_green_seconds", 45)
        reasons: List[str] = []
        next_planned = "NS_GREEN"

        # 1. EMERGENCY CORRIDOR OVERRIDE
        if corridor_directive and corridor_directive.get("override"):
            amb_id = corridor_directive.get("ambulance_id", "AMB")
            p_dir = corridor_directive.get("priority_direction", "WEST")
            phase_name = f"{p_dir}_PRIORITY" if p_dir in ["NORTH", "SOUTH", "EAST", "WEST"] else "EMERGENCY_CORRIDOR"

            reasons.append(f"🚨 Emergency vehicle {amb_id} detected on approach")
            reasons.append(f"Active Emergency Corridor requires {p_dir.lower()} priority clearance")
            
            # Check downstream notes
            for d, app in approaches.items():
                if downstream_holds.get(d):
                    reasons.append(f"{d.capitalize()} downstream occupancy is critical ({int(app.downstream_occupancy * 100)}%) - traffic held")

            duration = 20  # Swift green clearance wave
            return {
                "intersection": intersection_id,
                "selected_phase": phase_name,
                "duration": duration,
                "reason": reasons,
                "next_planned_phase": "NORTH_PRIORITY" if p_dir == "WEST" else "NS_GREEN",
                "emergency_override": True,
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }

        # 2. CHECK STARVATION ESCALATION
        starving_approaches = [
            (d, app) for d, app in approaches.items()
            if app.max_waiting_time >= self.config.starvation.get("starvation_threshold_seconds", 60.0)
        ]
        starving_approaches.sort(key=lambda x: x[1].max_waiting_time, reverse=True)

        # 3. EVALUATE STANDARD PHASES
        ranked_phases = self.priority_engine.evaluate_phases(approaches, downstream_holds)
        best_candidate = ranked_phases[0]

        # If a starving approach exists and is not blocked by downstream spillback, favor it
        selected_phase = best_candidate["phase"]
        if starving_approaches:
            top_starve_dir, top_starve_app = starving_approaches[0]
            if not downstream_holds.get(top_starve_dir, False):
                selected_phase = f"{top_starve_dir}_PRIORITY"
                reasons.append(f"Starvation prevention: {top_starve_dir.capitalize()} accumulated wait time reached {int(top_starve_app.max_waiting_time)}s")

        # Explain why this phase was chosen
        if not reasons:
            top_approach = max(approaches.items(), key=lambda x: x[1].priority_score)[1]
            reasons.append(f"Highest traffic demand and queue pressure on {top_approach.direction.capitalize()} ({top_approach.vehicle_count} vehicles, {top_approach.queue_length} queued)")

        # Explain downstream congestion holds
        for d, app in approaches.items():
            if downstream_holds.get(d, False):
                reasons.append(f"{d.capitalize()} downstream occupancy is {int(app.downstream_occupancy * 100)}% - release metered/held to prevent spillback")

        # Note waiting times
        for d, app in approaches.items():
            if app.max_waiting_time > 30 and d not in [s[0] for s in starving_approaches]:
                reasons.append(f"{d.capitalize()} waiting time accumulating at {int(app.max_waiting_time)}s")

        # Compute dynamic green duration
        primary_app = approaches.get(selected_phase.replace("_PRIORITY", "").replace("_GREEN", ""))
        pcu = primary_app.pcu_count if primary_app else 15.0
        calculated_duration = int(min_green + (pcu / 35.0) * (max_green - min_green))
        duration = max(min_green, min(max_green, calculated_duration))

        # Determine next planned movement
        remaining_candidates = [p for p in ranked_phases if p["phase"] != selected_phase]
        if remaining_candidates:
            next_planned = remaining_candidates[0]["phase"]

        return {
            "intersection": intersection_id,
            "selected_phase": selected_phase,
            "duration": duration,
            "reason": reasons,
            "next_planned_phase": next_planned,
            "emergency_override": False,
            "timestamp": datetime.now().strftime("%H:%M:%S")
        }
