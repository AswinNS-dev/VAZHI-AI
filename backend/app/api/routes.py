from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Dict, Any, List
from backend.app.services.simulation_service import service
from backend.app.schemas.traffic import (
    InflowSurgeRequest,
    WaitingSurgeRequest,
    AmbulanceDispatch,
    SimulationModeRequest,
    SimulationMetricsResponse
)
from intelligence.configuration import get_config

router = APIRouter(prefix="/api", tags=["traffic"])

@router.get("/network")
def get_network() -> Dict[str, Any]:
    return service.simulator.network_data

@router.get("/intersections")
def get_intersections() -> Dict[str, Any]:
    return {j_id: j.to_dict() for j_id, j in service.simulator.intersections.items()}

@router.get("/roads")
def get_roads() -> Dict[str, Any]:
    return {r_id: r.to_dict() for r_id, r in service.simulator.roads.items()}

@router.get("/traffic")
def get_traffic() -> Dict[str, Any]:
    return service.simulator.get_state_frame()

@router.get("/emergencies")
def get_emergencies() -> Dict[str, Any]:
    return service.simulator.emergency_engine.active_emergencies

@router.get("/metrics")
def get_metrics() -> Dict[str, Any]:
    return service.simulator.get_metrics()

@router.get("/decisions")
def get_decisions() -> List[Dict[str, Any]]:
    return service.simulator.decision_timeline[:50]

@router.post("/simulation/start")
def start_simulation() -> Dict[str, str]:
    service.simulator.is_paused = False
    service.simulator.is_running = True
    return {"status": "RUNNING", "mode": service.simulator.mode}

@router.post("/simulation/pause")
def pause_simulation() -> Dict[str, str]:
    service.simulator.is_paused = True
    return {"status": "PAUSED", "mode": service.simulator.mode}

@router.post("/simulation/reset")
def reset_simulation() -> Dict[str, str]:
    service.simulator.reset()
    return {"status": "RESET", "mode": service.simulator.mode}

@router.post("/simulation/mode")
def set_simulation_mode(req: SimulationModeRequest) -> Dict[str, str]:
    service.simulator.set_mode(req.mode)
    return {"status": "MODE_UPDATED", "mode": service.simulator.mode}

@router.post("/simulation/demo-scenario")
async def trigger_demo_scenario(background_tasks: BackgroundTasks) -> Dict[str, str]:
    if service.scenario_runner.is_running_scenario:
        return {"status": "ALREADY_RUNNING", "message": "Demo scenario is already executing."}
    background_tasks.add_task(service.trigger_demo_scenario)
    return {"status": "INITIATED", "message": "12-step primary emergency scenario started."}

@router.get("/simulation/demo-status")
def get_demo_status() -> Dict[str, Any]:
    return service.scenario_runner.get_status()

@router.post("/events/ambulance")
def dispatch_ambulance(req: AmbulanceDispatch) -> Dict[str, Any]:
    corridor = service.simulator.inject_ambulance(
        origin_road=req.origin_road,
        destination_node=req.destination_node
    )
    return {"status": "DISPATCHED", "corridor": corridor}

@router.post("/events/congestion")
def trigger_downstream_congestion(req: InflowSurgeRequest) -> Dict[str, Any]:
    service.simulator.surge_traffic(req.road_id, req.vehicle_count)
    return {"status": "CONGESTION_INJECTED", "road": req.road_id, "added_vehicles": req.vehicle_count}

@router.post("/events/traffic")
def trigger_waiting_surge(req: WaitingSurgeRequest) -> Dict[str, Any]:
    service.simulator.surge_waiting_time(req.road_id, req.seconds)
    return {"status": "WAITING_TIME_INCREASED", "road": req.road_id, "added_seconds": req.seconds}

@router.get("/config")
def get_traffic_config() -> Dict[str, Any]:
    cfg = get_config()
    return cfg.config

@router.post("/config/weights")
def update_scoring_weights(weights: Dict[str, float]) -> Dict[str, Any]:
    cfg = get_config()
    cfg.update_weights(weights)
    return {"status": "WEIGHTS_UPDATED", "current_weights": cfg.weights}
