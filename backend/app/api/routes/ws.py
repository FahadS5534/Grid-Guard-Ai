from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import asyncio
import json

router = APIRouter(prefix="/ws", tags=["Real-time WebSockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, transformer_id: str, websocket: WebSocket):
        await websocket.accept()
        if transformer_id not in self.active_connections:
            self.active_connections[transformer_id] = []
        self.active_connections[transformer_id].append(websocket)

    def disconnect(self, transformer_id: str, websocket: WebSocket):
        if transformer_id in self.active_connections:
            if websocket in self.active_connections[transformer_id]:
                self.active_connections[transformer_id].remove(websocket)

    async def broadcast(self, transformer_id: str, message: dict):
        if transformer_id in self.active_connections:
            for connection in self.active_connections[transformer_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/transformers/{transformer_id}")
async def websocket_endpoint(websocket: WebSocket, transformer_id: str):
    await manager.connect(transformer_id, websocket)
    try:
        while True:
            # Keep connection open & listen for client messages / pings
            data = await websocket.receive_text()
            # Echo back pong or acknowledge
            await websocket.send_json({"event": "pong", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(transformer_id, websocket)
