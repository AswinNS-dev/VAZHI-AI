from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.models.database import init_db
from backend.app.api.routes import router as api_router
from backend.app.websocket.manager import manager
from backend.app.services.simulation_service import service

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize database tables & launch simulation loop
    init_db()
    await service.start_ticker()
    yield
    # Shutdown: gracefully terminate background tasks
    service.stop_ticker()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="VAZHI-AI: Real-Time Network-Aware Traffic & Emergency Intelligence Backend",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.websocket("/ws/traffic")
async def websocket_traffic_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send immediate initial state upon connection
    initial_frame = service.simulator.get_state_frame()
    await websocket.send_json(initial_frame)
    try:
        while True:
            # Client can send commands (e.g. ping/heartbeat or controls)
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "system": "VAZHI-AI",
        "tagline": "Real-Time Network-Aware Traffic & Emergency Intelligence",
        "status": "ONLINE",
        "prototype_simulation": True,
        "mode": service.simulator.mode,
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
