import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.websocket.manager import ConnectionManager

client = TestClient(app)

def test_api_network():
    response = client.get("/api/network")
    assert response.status_code == 200
    data = response.json()
    assert "intersections" in data
    assert len(data["intersections"]) == 4

def test_api_traffic_and_metrics():
    response = client.get("/api/traffic")
    assert response.status_code == 200
    data = response.json()
    assert "intersections" in data
    assert "roads" in data
    assert "metrics" in data

    metrics_res = client.get("/api/metrics")
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert "average_waiting_time" in metrics
    assert "maximum_queue_length" in metrics

def test_simulation_controls_and_mode_toggle():
    res = client.post("/api/simulation/pause")
    assert res.status_code == 200
    assert res.json()["status"] == "PAUSED"

    res = client.post("/api/simulation/start")
    assert res.status_code == 200
    assert res.json()["status"] == "RUNNING"

    # Toggle to Fixed Time
    res = client.post("/api/simulation/mode", json={"mode": "FIXED_TIME"})
    assert res.status_code == 200
    assert res.json()["mode"] == "FIXED_TIME"

    # Toggle back to VAZHI_AI
    res = client.post("/api/simulation/mode", json={"mode": "VAZHI_AI"})
    assert res.status_code == 200
    assert res.json()["mode"] == "VAZHI_AI"

def test_events_injection():
    # Inject ambulance
    res = client.post("/api/events/ambulance", json={"origin_road": "IN_J1_W", "destination_node": "HOSPITAL"})
    assert res.status_code == 200
    assert res.json()["status"] == "DISPATCHED"

    # Inject congestion
    res = client.post("/api/events/congestion", json={"road_id": "ROAD_J1_J2", "vehicle_count": 20})
    assert res.status_code == 200
    assert res.json()["status"] == "CONGESTION_INJECTED"

    # Increase waiting time
    res = client.post("/api/events/traffic", json={"road_id": "IN_J2_N", "seconds": 70.0})
    assert res.status_code == 200
    assert res.json()["status"] == "WAITING_TIME_INCREASED"

def test_08_websocket_connect_and_disconnect():
    with client.websocket_connect("/ws/traffic") as websocket:
        data = websocket.receive_json()
        assert "intersections" in data
        assert "simulation_time" in data
        # Closing context triggers clean disconnect
    # Verify app is still responsive after disconnect
    res = client.get("/api/metrics")
    assert res.status_code == 200
