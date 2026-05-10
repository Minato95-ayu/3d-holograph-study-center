from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from .core.websocket import sio

app = FastAPI(title="Studo AI Brain")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

@app.get("/")
async def root():
    return {"message": "Studo AI Brain is online 🚀", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:socket_app", host="0.0.0.0", port=8000, reload=True)
