# Studo (Spatial Computing OS)

**Studo** is a futuristic Spatial Computing Platform that allows users to interact with 3D models, simulations, and knowledge using natural hand gestures. Designed as a "Future Lab" for education and research.

## Features
- **No-Touch Gesture Control**: Rotate, Zoom, Pinch, and Explode 3D models.
- **AI Brain**: Real-time knowledge fetching and voice narration via FastAPI.
- **High-Fidelity 3D**: Three.js based engine with PBR materials and Draco compression.
- **Holographic UI**: Glassmorphic, neon-accented spatial interface.

## Project Structure
- `/frontend`: React + Vite + Three.js + MediaPipe.
- `/backend`: Python FastAPI + Socket.IO (AI Brain).
- `/models`: 3D GLTF assets.

## Quick Start

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

## Tech Stack
- **Frontend**: React, TypeScript, Three.js, R3F, MediaPipe, Socket.io-client, TailwindCSS.
- **Backend**: FastAPI, Socket.io, Wikipedia-API, OpenAI/Grok.

---
Built with ❤️ for the future of education.
