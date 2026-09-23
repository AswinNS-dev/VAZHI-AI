import json
from pathlib import Path
from backend.app.models.database import (
    SessionLocal, init_db, IntersectionModel, RoadModel, User
)

def seed_database():
    init_db()
    db = SessionLocal()

    base_dir = Path(__file__).resolve().parent.parent.parent
    network_path = base_dir / "data" / "sample_network.json"
    
    with open(network_path, "r", encoding="utf-8") as f:
        network = json.load(f)

    # Seed Intersections
    for j in network.get("intersections", []):
        existing = db.query(IntersectionModel).filter_by(id=j["id"]).first()
        coords = j.get("coordinates", {})
        if not existing:
            inter = IntersectionModel(
                id=j["id"],
                name=j.get("name", j["id"]),
                lat=coords.get("lat"),
                lng=coords.get("lng"),
                current_phase="NS_GREEN",
                current_duration=25,
                approaches_json=j.get("approaches", {})
            )
            db.add(inter)

    # Seed Roads
    for r in network.get("roads", []):
        existing_road = db.query(RoadModel).filter_by(id=r["id"]).first()
        if not existing_road:
            road = RoadModel(
                id=r["id"],
                from_node=r["from_node"],
                to_node=r["to_node"],
                length_m=r.get("length_m", 300.0),
                lanes=r.get("lanes", 2),
                capacity_pcu=r.get("capacity_pcu", 30),
                speed_limit_kmh=r.get("speed_limit_kmh", 50.0)
            )
            db.add(road)

    # Seed Default Operator User
    existing_user = db.query(User).filter_by(username="traffic_operator_chennai").first()
    if not existing_user:
        user = User(
            username="traffic_operator_chennai",
            role="OPERATOR"
        )
        db.add(user)

    db.commit()
    db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_database()
