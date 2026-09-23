import os
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vazhi.db")

# SQLite needs connect_args check_same_thread=False
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(20), default="OPERATOR") # OPERATOR, DISPATCHER, ADMIN
    created_at = Column(DateTime, default=datetime.utcnow)

class IntersectionModel(Base):
    __tablename__ = "intersections"
    id = Column(String(20), primary_key=True, index=True) # J1, J2, J3, J4
    name = Column(String(100), nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    current_phase = Column(String(30), default="NS_GREEN")
    current_duration = Column(Integer, default=25)
    approaches_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    decisions = relationship("SignalDecisionModel", back_populates="intersection")

class RoadModel(Base):
    __tablename__ = "roads"
    id = Column(String(30), primary_key=True, index=True)
    from_node = Column(String(20), nullable=False, index=True)
    to_node = Column(String(20), nullable=False, index=True)
    length_m = Column(Float, default=300.0)
    lanes = Column(Integer, default=2)
    capacity_pcu = Column(Integer, default=30)
    speed_limit_kmh = Column(Float, default=50.0)

class VehicleModel(Base):
    __tablename__ = "vehicles"
    id = Column(String(50), primary_key=True, index=True)
    vehicle_type = Column(String(20), default="CAR")
    current_road_id = Column(String(30), nullable=True)
    destination = Column(String(30), nullable=True)
    is_emergency = Column(Boolean, default=False)
    waiting_time_s = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

class TrafficEventModel(Base):
    __tablename__ = "traffic_events"
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False) # CONGESTION_SURGE, SPILLBACK_TRIGGER, ACCIDENT
    target_id = Column(String(50), nullable=False) # road or intersection id
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SignalDecisionModel(Base):
    __tablename__ = "signal_decisions"
    id = Column(Integer, primary_key=True, index=True)
    intersection_id = Column(String(20), ForeignKey("intersections.id"), nullable=False, index=True)
    selected_phase = Column(String(30), nullable=False)
    duration = Column(Integer, nullable=False)
    reasons = Column(JSON, nullable=True)
    next_planned_phase = Column(String(30), nullable=True)
    emergency_override = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    intersection = relationship("IntersectionModel", back_populates="decisions")

class EmergencyEventModel(Base):
    __tablename__ = "emergency_events"
    id = Column(Integer, primary_key=True, index=True)
    ambulance_id = Column(String(50), nullable=False, index=True)
    origin = Column(String(50), nullable=False)
    destination = Column(String(50), nullable=False)
    route_json = Column(JSON, nullable=True)
    status = Column(String(30), default="ACTIVE") # ACTIVE, COMPLETED, CANCELLED
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class SimulationRunModel(Base):
    __tablename__ = "simulation_runs"
    id = Column(String(50), primary_key=True, index=True)
    mode = Column(String(20), default="VAZHI_AI") # VAZHI_AI or FIXED_TIME
    scenario_name = Column(String(100), default="DEFAULT")
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    metrics = relationship("SimulationMetricModel", back_populates="run")

class SimulationMetricModel(Base):
    __tablename__ = "simulation_metrics"
    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(String(50), ForeignKey("simulation_runs.id"), nullable=False, index=True)
    sim_time_seconds = Column(Integer, nullable=False)
    average_waiting_time = Column(Float, default=0.0)
    maximum_queue_length = Column(Integer, default=0)
    throughput = Column(Integer, default=0)
    spillback_events = Column(Integer, default=0)
    signal_switches = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("SimulationRunModel", back_populates="metrics")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
