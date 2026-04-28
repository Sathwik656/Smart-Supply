import socketio

from app.config import settings

# We use an AsyncServer for FastAPI
# Disable Socket.IO's own CORS headers so FastAPI's middleware can be the
# single source of truth for HTTP polling requests.
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins=[])
sio_app = socketio.ASGIApp(sio, socketio_path='')

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def subscribe_shipments(sid, data):
    sio.enter_room(sid, "shipments")
    await sio.emit("message", {"data": "Subscribed to shipments"}, room=sid)

@sio.event
async def subscribe_alerts(sid, data):
    sio.enter_room(sid, "alerts")
    await sio.emit("message", {"data": "Subscribed to alerts"}, room=sid)

async def broadcast_shipment_update(shipment_data: dict):
    await sio.emit("shipment:updated", shipment_data, room="shipments")

async def broadcast_alert_new(alert_data: dict):
    await sio.emit("alert:new", alert_data, room="alerts")

async def broadcast_alert_resolved(alert_data: dict):
    await sio.emit("alert:resolved", alert_data, room="alerts")

async def broadcast_kpi_update(kpi_data: dict):
    # KPIs can just be broadcasted to everyone
    await sio.emit("kpi:updated", kpi_data)
