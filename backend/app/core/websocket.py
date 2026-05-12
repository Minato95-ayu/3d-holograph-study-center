import socketio
import logging

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("studo-socket")

sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*',
    logger=False,
    engineio_logger=False
)

@sio.event
async def connect(sid, environ):
    logger.info(f"🟢 Client connected: {sid}")
    await sio.emit("welcome", {
        "status": "connected",
        "message": "ARIO Holographic AI System Online",
        "sid": sid
    }, to=sid)

@sio.event
async def disconnect(sid):
    logger.info(f"🔴 Client disconnected: {sid}")

async def safe_emit_error(sid, error_msg):
    await sio.emit("backend_error", {
        "message": error_msg,
        "type": "RuntimeError"
    }, to=sid)

@sio.on("gesture_data")
async def handle_gesture(sid, data):
    try:
        gesture_type = data.get("gesture", "unknown")
        logger.debug(f"Gesture from {sid}: {gesture_type}")
        await sio.emit("gesture_response", {
            "sid": sid,
            "action": gesture_type,
            "processed": True
        }, to=sid)
    except Exception as e:
        logger.error(f"Error handling gesture: {str(e)}")
        await safe_emit_error(sid, str(e))

from ..services.knowledge import knowledge_service

@sio.on("search")
async def handle_search(sid, data):
    try:
        query = data.get("query", "").strip()
        logger.info(f"🔍 ARIO Search from {sid}: '{query}'")

        if not query:
            raise ValueError("Query is required")

        result = await knowledge_service.get_summary(query)
        logger.info(f"✅ Knowledge retrieved for '{query}' — domain: {result.get('domain')}")

        await sio.emit("search_result", {
            "query": query,
            "summary": result.get("summary"),
            "ario_intro": result.get("ario_intro", ""),
            "title": result.get("title", query),
            "url": result.get("url", ""),
            "success": result.get("exists", False),
            "formulas": result.get("formulas", []),
            "components": result.get("components", []),
            "fun_fact": result.get("fun_fact", ""),
            "domain": result.get("domain", "general"),
        }, to=sid)

    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        await safe_emit_error(sid, str(e))

@sio.on("explode_model")
async def handle_explode(sid, data):
    try:
        model_id = data.get("modelId")
        state = data.get("state")
        await sio.emit("model_action", {
            "action": "explode" if state else "assemble",
            "modelId": model_id
        }, to=sid)
    except Exception as e:
        await safe_emit_error(sid, str(e))

from ..services.simulation import simulation_service
from ..services.generative3d import generative_3d_service

@sio.on("run_experiment")
async def handle_experiment(sid, data):
    try:
        shape_type = data.get("shape", "sphere")
        params = data.get("params", {})
        
        logger.info(f"🧪 Running experiment from {sid} for {shape_type}")
        
        # 1. Calculate physics/math
        sim_result = simulation_service.run_experiment(shape_type, params)
        
        # 2. Generate 3D Model
        model_result = generative_3d_service.generate_shape(shape_type, params)
        
        if sim_result["success"] and model_result["success"]:
            await sio.emit("experiment_result", {
                "shape": shape_type,
                "calculations": sim_result["calculations"],
                "glb_base64": model_result["glb_base64"]
            }, to=sid)
        else:
            error_msg = sim_result.get("error", "") + " " + model_result.get("error", "")
            await safe_emit_error(sid, error_msg)

    except Exception as e:
        logger.error(f"❌ Experiment error: {str(e)}")
        await safe_emit_error(sid, str(e))

from ..services.ario_voice import ario_voice_service

@sio.on("ario_chat")
async def handle_chat(sid, data):
    try:
        text = data.get("text", "").strip()
        if not text:
            return
            
        logger.info(f"🗣️ User Chat from {sid}: '{text}'")
        
        # Process chat (LLM + TTS)
        response = await ario_voice_service.process_chat(text)
        
        if response["success"]:
            await sio.emit("ario_chat_response", {
                "text": response["text"],
                "audio_base64": response["audio_base64"]
            }, to=sid)
        else:
            await safe_emit_error(sid, "Failed to generate voice response.")
            
    except Exception as e:
        logger.error(f"❌ Chat error: {str(e)}")
        await safe_emit_error(sid, str(e))
