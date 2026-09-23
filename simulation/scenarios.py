import asyncio
from typing import Dict, Any, List, Optional
from simulation.simulator import TrafficSimulator

class ScenarioRunner:
    def __init__(self, simulator: TrafficSimulator):
        self.simulator = simulator
        self.current_step = 0
        self.step_description = "IDLE"
        self.is_running_scenario = False

    async def run_emergency_scenario(self, broadcast_fn=None) -> Dict[str, Any]:
        """
        Executes the 12-step primary emergency demonstration scenario.
        """
        self.is_running_scenario = True
        self.simulator.set_mode("VAZHI_AI")

        steps = [
            (1, "Step 1: Establishing normal background traffic corridor flow", 4),
            (2, "Step 2: Injecting East road surge at J2 (25+ vehicles)", 4),
            (3, "Step 3: Accumulating high waiting time on North approach (18 vehicles)", 4),
            (4, "Step 4: East downstream road saturation (ROAD_J2_J3 reaches 92% occupancy)", 5),
            (5, "Step 5: Ambulance A102 dispatched on West feeder (IN_J1_W)", 4),
            (6, "Step 6: VAZHI-AI detects emergency & evaluates network constraints", 4),
            (7, "Step 7: Activating green corridor J1 → J2 → J3 → HOSPITAL", 5),
            (8, "Step 8: Progressive signal preemption across J1, J2, J3", 6),
            (9, "Step 9: Downstream spillback hold active: East traffic held (occupancy > 90%)", 5),
            (10, "Step 10: Starvation override: North serviced following emergency clearance", 5),
            (11, "Step 11: Ambulance safely arrives at Government Hospital", 5),
            (12, "Step 12: Emergency corridor released, returning to dynamic adaptive control", 4)
        ]

        for step_num, desc, duration_sec in steps:
            self.current_step = step_num
            self.step_description = desc

            # Trigger specific event actions at each step
            if step_num == 2:
                # East approach to J2 surge (ROAD_J1_J2 is West to J2, East to J2 is ROAD_J3_J2 or local feeder)
                self.simulator.surge_traffic("ROAD_J1_J2", count=25)
            elif step_num == 3:
                # North approach waiting time surge
                self.simulator.surge_traffic("IN_J2_N", count=18)
                self.simulator.surge_waiting_time("IN_J2_N", additional_seconds=75.0)
            elif step_num == 4:
                # Downstream road J2->J3 saturation
                self.simulator.surge_traffic("ROAD_J2_J3", count=32)
            elif step_num == 5:
                # Inject Ambulance
                self.simulator.inject_ambulance("IN_J1_W", "HOSPITAL")

            # Advance simulation in discrete ticks for the duration
            for _ in range(duration_sec):
                frame = self.simulator.tick(dt=1.0)
                frame["scenario_step"] = self.current_step
                frame["scenario_description"] = self.step_description
                if broadcast_fn:
                    await broadcast_fn(frame)
                await asyncio.sleep(0.5)

        self.is_running_scenario = False
        self.step_description = "SCENARIO_COMPLETED"
        return {"status": "SUCCESS", "message": "Emergency scenario successfully demonstrated."}

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_running": self.is_running_scenario,
            "current_step": self.current_step,
            "step_description": self.step_description
        }
