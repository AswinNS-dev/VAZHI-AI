# VAZHI-AI Architecture & System Design

**VAZHI-AI** is a real-time, network-aware traffic and emergency intelligence software simulation system designed for complex urban corridors (modeled after Tamil Nadu urban transit dynamics, e.g. Anna Salai / OMR corridors).

---

## 1. Core Paradigm Shift

Traditional traffic systems optimize intersections as isolated, fixed-cycle silos. **VAZHI-AI** replaces isolated fixed timers with a coordinated decision network that evaluates:

$$\text{Priority Score} = w_d \cdot D + w_q \cdot Q + w_w \cdot W + w_e \cdot E - w_{ds} \cdot C_{down} + S_{boost}$$

Where:
- $D$ = Traffic Demand (Passenger Car Units - PCU)
- $Q$ = Queue Length (vehicles stopped near stop line)
- $W$ = Accumulated Waiting Time
- $E$ = Emergency Vehicle Presence
- $C_{down}$ = Downstream Road Occupancy / Spillback Risk
- $S_{boost}$ = Starvation Prevention Escalation

---

## 2. Downstream Spillback Detection

When downstream road segments cross threshold occupancies:
- **0 - 40%**: LOW (Free Flow)
- **40 - 70%**: MODERATE
- **70 - 85%**: HIGH (Metered Release)
- **85 - 100%**: CRITICAL (HOLD TRAFFIC to prevent intersection lockup)

Upstream intersections are restricted from releasing additional vehicles into saturated roads, preventing gridlock propagation across connected nodes.

---

## 3. Emergency Corridor Preemption

When an emergency vehicle (Ambulance) is detected:
1. **Routing**: NetworkX graph executes Dijkstra / A* to find the optimal path to the Government Hospital (`J1 → J2 → J3 → HOSPITAL`).
2. **Sequential Preemption**: The upcoming intersection enters `READY` state while adjacent nodes enter `PREPARING`.
3. **Cross-Traffic Hold**: Conflicting directions are safely phased to `RED` with yellow clearance transitions.
4. **Passage Tracking & Release**: When the ambulance passes, signals gracefully return to adaptive multi-factor control.

---

## 4. Real-Time Data Pipeline

```
Microscopic Simulation Engine (Vehicles, Speeds, Queues)
               │
               ▼
      Traffic State Engine (Normalization & Scoring)
               │
               ▼
      Spillback Detector & Emergency Corridor Coordinator
               │
               ▼
      Signal Optimizer (Safety Interlocks & Explainability)
               │
               ▼
      FastAPI Async Service (1 Hz Tick)
               │
               ▼
WebSocket Stream (/ws/traffic)
               │
               ▼
   React Native Mobile App (Zustand Cache, Live Map, Junction Detail, AI Timeline)
```

---

## 5. Decision Explainability Format

Every phase selection outputs structured, human-readable rationale:
```json
{
  "intersection": "J2",
  "selected_phase": "WEST_PRIORITY",
  "duration": 20,
  "reason": [
    "🚨 Emergency vehicle A102 detected on approach",
    "Active Emergency Corridor requires west priority clearance",
    "East downstream occupancy is critical (92%) - traffic held",
    "North accumulated waiting time is 75 seconds"
  ],
  "next_planned_phase": "NORTH_PRIORITY"
}
```
