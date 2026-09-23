# VAZHI-AI API Reference

Base URL: `http://localhost:8000`

---

## 1. REST Endpoints

### Network & State
- `GET /api/network`
  Returns static network topology (intersections, roads, approaches, coordinates, destinations).
- `GET /api/intersections`
  Returns current state of all intersections (signal phases, durations, approach queues, wait times).
- `GET /api/roads`
  Returns real-time vehicle counts, PCU load, occupancy percentage, and queue lengths for each road.
- `GET /api/traffic`
  Returns the complete consolidated state frame.
- `GET /api/emergencies`
  Returns active emergency vehicle corridors, ETAs, and intersection readiness checklists.
- `GET /api/metrics`
  Returns aggregate performance indicators (average wait time, throughput, spillback count, etc.).
- `GET /api/decisions`
  Returns chronological AI decision logs with explainable reasons.

### Simulation Controls
- `POST /api/simulation/start`
  Resumes or starts the real-time simulation clock.
- `POST /api/simulation/pause`
  Pauses the simulation clock.
- `POST /api/simulation/reset`
  Resets all vehicles, queues, and signal states to baseline.
- `POST /api/simulation/mode`
  Body: `{"mode": "VAZHI_AI" | "FIXED_TIME"}`
  Switches between VAZHI-AI network-aware adaptive mode and the 30s fixed-time baseline.
- `POST /api/simulation/demo-scenario`
  Triggers the 12-step primary emergency corridor & downstream congestion scenario.

### Event Injection
- `POST /api/events/ambulance`
  Body: `{"origin_road": "IN_J1_W", "destination_node": "HOSPITAL"}`
  Spawns an ambulance and provisions an emergency green corridor.
- `POST /api/events/congestion`
  Body: `{"road_id": "ROAD_J1_J2", "vehicle_count": 25}`
  Surges traffic on the designated road segment.
- `POST /api/events/traffic`
  Body: `{"road_id": "IN_J2_N", "seconds": 75.0}`
  Artificially advances waiting time to test starvation prevention logic.

---

## 2. WebSocket Stream

Endpoint: `ws://localhost:8000/ws/traffic`

Streams real-time updates at 1 Hz containing:
```json
{
  "simulation_time": 42,
  "is_running": true,
  "mode": "VAZHI_AI",
  "metrics": {
    "average_waiting_time": 14.2,
    "maximum_queue_length": 8,
    "traffic_throughput": 34,
    "spillback_events": 0,
    "signal_switches": 6
  },
  "intersections": { ... },
  "roads": { ... },
  "emergencies": { ... },
  "recent_decisions": [ ... ]
}
```
