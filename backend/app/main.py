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

from fastapi.responses import Response
from .services.ario_voice import ario_voice_service
import base64

@app.get("/api/tts")
async def get_tts(text: str):
    """Generate TTS audio and return as raw bytes."""
    base64_audio = await ario_voice_service.generate_speech_base64(text)
    if base64_audio:
        audio_bytes = base64.b64decode(base64_audio)
        return Response(content=audio_bytes, media_type="audio/mpeg")
    return Response(status_code=500)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:socket_app", host="0.0.0.0", port=8000, reload=True)
