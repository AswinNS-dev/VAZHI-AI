import asyncio
import logging
from typing import Optional
from simulation.simulator import TrafficSimulator
from simulation.scenarios import ScenarioRunner
from backend.app.websocket.manager import manager
from backend.app.models.database import SessionLocal, SignalDecisionModel, SimulationMetricModel

logger = logging.getLogger("vazhi.simulation_service")

class SimulationService:
    def __init__(self):
        self.simulator = TrafficSimulator()
        self.scenario_runner = ScenarioRunner(self.simulator)
        self.ticker_task: Optional[asyncio.Task] = None
        self.is_running = False
        self.speed_multiplier: float = 1.0

    def set_speed(self, speed: float):
        self.speed_multiplier = max(0.1, min(10.0, float(speed)))
        logger.info(f"Simulation speed updated to {self.speed_multiplier}x")

    async def start_ticker(self):
        if self.ticker_task and not self.ticker_task.done():
            return
        self.is_running = True
        self.ticker_task = asyncio.create_task(self._simulation_loop())
        logger.info("Simulation ticker background task started.")

    async def _simulation_loop(self):
        tick_count = 0
        while self.is_running:
            try:
                # If a demo scenario is running, it controls its own step progression
                if not self.scenario_runner.is_running_scenario:
                    frame = self.simulator.tick(dt=1.0)
                    frame["speed_multiplier"] = self.speed_multiplier
                    await manager.broadcast(frame)

                    tick_count += 1
                    # Periodically save snapshot to DB every 10 seconds
                    if tick_count % 10 == 0:
                        self._persist_metrics_snapshot()

                sleep_time = max(0.05, 1.0 / self.speed_multiplier)
                await asyncio.sleep(sleep_time)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in simulation loop: {e}")
                await asyncio.sleep(1.0)

    def _persist_metrics_snapshot(self):
        try:
            metrics = self.simulator.get_metrics()
            db = SessionLocal()
            record = SimulationMetricModel(
                run_id=f"run_{self.simulator.mode.lower()}",
                sim_time_seconds=metrics["simulation_time_seconds"],
                average_waiting_time=metrics["average_waiting_time"],
                maximum_queue_length=metrics["maximum_queue_length"],
                throughput=metrics["traffic_throughput"],
                spillback_events=metrics["spillback_events"],
                signal_switches=metrics["signal_switches"]
            )
            db.add(record)
            db.commit()
            db.close()
        except Exception as e:
            logger.debug(f"Metrics persist skipped: {e}")

    async def trigger_demo_scenario(self):
        return await self.scenario_runner.run_emergency_scenario(broadcast_fn=manager.broadcast)

    def stop_ticker(self):
        self.is_running = False
        if self.ticker_task:
            self.ticker_task.cancel()

service = SimulationService()
