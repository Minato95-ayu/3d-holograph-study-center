# Project Context: Studo / ARIA Lab

## Overview
Studo (ARIA Lab) is a Spatial Computing Platform acting as an AI-powered virtual science laboratory. It allows users (target age 12-25) to learn science through interactive 3D models, voice commands, and real-time AI explanations.

## Architecture
- **Frontend**: React 19, TypeScript, Three.js, React Three Fiber (R3F), MediaPipe (gesture control), TailwindCSS, Socket.IO client, Zustand.
- **Backend**: Python FastAPI, Socket.IO server, Edge TTS (voice synthesis), Gemini API / OpenAI / Groq (AI capabilities).
- **Models**: 3D GLTF assets.

## Core Features
1.  **Voice-Controlled AI Assistant (ARIA)**: Natural language commands parsed and executed (e.g., "ARIA, show me a car engine").
2.  **3D Interactive Workspace**: High-fidelity 3D models with rotation, zoom, explode, and interactive component exploration.
3.  **Real-time Physics Simulation**: Interactive science experiments with real-time data metrics and graphs.
4.  **No-Touch Gesture Control**: Spatial interaction via MediaPipe.

## Development Status & Structure
- The project is divided into `/frontend`, `/backend`, and `/models`.
- Basic foundational elements are working (FastAPI, React, Three.js, MediaPipe).
- **Immediate implementation focus**: `ExperimentLab` (3D workspace), `ResultsPanel`, `commandParser` (voice commands), and `explanationEngine` (Gemini AI).

## Architectural Rules
- Do not change existing architecture.
- Only work on requested features.
- Do not rewrite unrelated files.
