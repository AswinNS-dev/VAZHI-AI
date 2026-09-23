# VAZHI-AI Simulation Engine Guide

## 1. Overview

The VAZHI-AI Simulation Engine is a microscopic, discrete-time traffic simulation modeled after Tamil Nadu urban corridors. It tracks individual vehicle physics, road segment density curves, downstream spillback risk, and intersection preemption waves.

---

## 2. Vehicle Dynamics & PCU

| Vehicle Type | PCU Equivalent | Length (m) | Free Speed (km/h) | Acceleration |
|--------------|----------------|------------|-------------------|--------------|
| **CAR**      | 1.0            | 4.5        | 45                | 2.0 m/s²     |
| **BIKE**     | 0.5            | 2.0        | 50                | 2.5 m/s²     |
| **BUS**      | 3.0            | 12.0       | 35                | 1.2 m/s²     |
| **TRUCK**    | 2.5            | 10.0       | 35                | 1.0 m/s²     |
| **AMBULANCE**| 1.2            | 6.0        | 55 (Priority)     | 3.0 m/s²     |

---

## 3. Road Segment Flow Model

Vehicle speed on each road is dynamically governed by road occupancy:

$$v_{eff} = v_{free} \cdot \max\left(0.10, 1 - \text{occupancy}^2\right)$$

- When downstream roads become congested ($\ge 85\%$ occupancy), lead vehicles decelerate to prevent queue spillback into the intersection cross-box.
- When an ambulance is active, downstream intersections enter preemption to clear queues in advance of the vehicle's arrival.

---

## 4. The 12-Step Primary Demo Scenario

1. **Step 1**: Establish normal baseline traffic.
2. **Step 2**: East road at J2 accumulates 25+ vehicles.
3. **Step 3**: North approach accumulates high waiting time (75s+).
4. **Step 4**: East downstream road (`ROAD_J2_J3`) hits 92% occupancy.
5. **Step 5**: Ambulance A102 dispatched on West feeder (`IN_J1_W`).
6. **Step 6**: VAZHI-AI evaluates network constraints.
7. **Step 7**: Emergency Corridor activated (`J1 → J2 → J3 → HOSPITAL`).
8. **Step 8**: Progressive signal preemption (`READY` / `PASSING` / `RELEASED`).
9. **Step 9**: East traffic held at J2 to prevent downstream spillback.
10. **Step 10**: North approach serviced for starvation prevention after emergency clears.
11. **Step 11**: Ambulance arrives at Hospital.
12. **Step 12**: Normal adaptive multi-factor control resumes.
