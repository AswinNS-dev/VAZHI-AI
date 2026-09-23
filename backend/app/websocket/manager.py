import json
import logging
from typing import List, Set
from fastapi import WebSocket

logger = logging.getLogger("vazhi.websocket")

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        logger.info(f"Client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, data: dict):
        if not self.active_connections:
            return

        message = json.dumps(data)
        disconnected = set()
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to client: {e}")
                disconnected.add(connection)

        for dead_conn in disconnected:
            self.active_connections.discard(dead_conn)

manager = ConnectionManager()
