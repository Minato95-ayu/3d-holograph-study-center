# 🔬 ARIA LAB — MASTER PROMPT & IMPLEMENTATION GUIDE

> **A.R.I.A** = *Advanced Research & Innovation Assistant*  
> **STATUS**: Production-Ready Vision Document  
> **DATE**: May 2026  
> **AUDIENCE**: Hackathon Judges, Development Team

---

## 🎯 EXECUTIVE SUMMARY

**ARIA Lab** is an AI-powered virtual experiment laboratory that transforms how students learn science. Using a JARVIS-like voice assistant, students can conduct physics, chemistry, and biology experiments in real-time with instant AI explanations.

**Key Differentiators:**
- ✅ Natural voice commands ("ARIA, show me a car engine")
- ✅ Deep male AI voice (not robotic)
- ✅ Real-time 3D visualization (Three.js)
- ✅ Intelligent AI explanations (Gemini API)
- ✅ Gesture control (MediaPipe hand tracking)
- ✅ Holographic UI (neon, glassmorphic)
- ✅ Full-stack: React frontend + FastAPI backend

---

## 📊 CURRENT TECH STACK ANALYSIS

### What You Already Have ✅

| Component | Tech | Status |
|-----------|------|--------|
| **Voice AI** | ARIO Engine + Edge TTS | ✅ Working |
| **3D Rendering** | Three.js + R3F | ✅ Working |
| **Gesture Control** | MediaPipe | ✅ Working |
| **Frontend** | React 19 + TypeScript | ✅ Working |
| **Backend** | FastAPI + Socket.IO | ✅ Working |
| **AI Integration** | OpenAI/Groq/Gemini | ✅ Ready |
| **WebSocket** | Socket.IO | ✅ Working |
| **UI Framework** | TailwindCSS | ✅ Working |

### What Needs Enhancement 🚀

| Feature | Current | Target |
|---------|---------|--------|
| Experiments | Basic models | Full lab with experiments |
| Results System | Knowledge cards | Graphs + physics simulation |
| Voice Commands | Limited | Full experiment control |
| Lab Interface | Holographic HUD | Full experiment workspace |
| Components Library | Not built | Drag-drop parts system |

---

## 🎨 ARIA LAB ARCHITECTURE

```
┌─────────────────────────────────────────────┐
│         ARIA LAB - Full Stack              │
├─────────────────────────────────────────────┤
│                                             │
│   FRONTEND (React + TypeScript)             │
│   ┌──────────────────────────────────────┐  │
│   │ Components:                          │  │
│   │ • AriaAssistant (Voice AI)           │  │
│   │ • ExperimentLab (3D Workspace)       │  │
│   │ • ComponentLibrary (Parts Palette)   │  │
│   │ • ResultsPanel (Graphs + Stats)      │  │
│   │ • HolographicHUD (Futuristic UI)     │  │
│   │ • VoiceWaveform (Audio Visualizer)   │  │
│   └──────────────────────────────────────┘  │
│            Three.js Canvas                  │
│                                             │
│   HOOKS & STATE:                            │
│   • useStudoStore (Zustand)                 │
│   • useMediaPipe (Hand Tracking)            │
│   • useExperiment (Lab Logic)               │
│   • useResults (Data Visualization)         │
│                                             │
├─────────────────────────────────────────────┤
│                                             │
│   BACKEND (FastAPI + Socket.IO)             │
│   ┌──────────────────────────────────────┐  │
│   │ Services:                            │  │
│   │ • ario_voice (Speech synthesis)      │  │
│   │ • generative3d (Model generation)    │  │
│   │ • knowledge (AI explanations)        │  │
│   │ • simulation (Physics engine)        │  │
│   └──────────────────────────────────────┘  │
│                                             │
│   EXTERNAL APIs:                            │
│   • Gemini API (AI Brain)                   │
│   • OpenAI/Groq (Fallback LLM)              │
│   • Edge TTS (Voice Synthesis)              │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎤 ARIA VOICE ASSISTANT SPEC

### Personality
```
Name: ARIA (Advanced Research & Innovation Assistant)
Voice: Deep male voice (Tony Stark/JARVIS style)
Tone: Professional, helpful, slightly witty
Response Time: <1 second for commands
Always remembers: Previous experiments, user preferences
```

### Greeting Sequence

```javascript
// ON APP STARTUP
1. Black screen appears (200ms)
2. "ARIA" logo fades in (500ms)
3. ARIA speaks: "Initializing ARIA Lab. All systems nominal."
4. HUD elements slide in (500ms)
5. ARIA: "Welcome back. Ready for your experiment?"
```

### Voice Commands Format

```
User: "ARIA, [command]"

Examples:
✅ "ARIA, show me a car engine"
✅ "ARIA, explain the piston"
✅ "ARIA, what happens if I add turbo"
✅ "ARIA, run the simulation"
✅ "ARIA, zoom into cylinder"
✅ "ARIA, reset the lab"
✅ "ARIA, save experiment"
✅ "ARIA, compare two versions"
```

### ARIA Response Pattern

```
ARIA always responds in this format:

[Action Acknowledgment]
"Understood. Displaying [component]..."

[Educational Content]
"This is a [name]. It [function]. 
 In this engine, it [specific role]."

[Next Step Suggestion]
"Would you like me to [next action]?"

[Voice Effect]
- Slightly lower pitch during complex explanations
- Faster speech during exciting moments
- Pause for emphasis on key points
```

---

## 🔬 EXPERIMENT SYSTEM

### Supported Experiments (MVP)

#### 1. **Physics Lab**
- **Car Engine Simulation**
  - Components: Piston, Crankshaft, Cylinder, Valve
  - Variables: Fuel type, ignition timing, compression ratio
  - Output: Power (HP), Efficiency (%), Temperature (°C)
  
- **Gravity & Motion**
  - Components: Objects, Gravity field, Friction surface
  - Variables: Mass, Angle, Gravity strength
  - Output: Velocity, Distance, Time

- **Electric Circuits**
  - Components: Battery, Resistor, Wire, LED
  - Variables: Voltage, Resistance, Current
  - Output: Power, Brightness, Heat

#### 2. **Chemistry Lab**
- **Molecular Reactions**
  - Display: 3D molecular structures
  - Reaction: H2 + O2 → H2O
  - Variables: Temperature, Pressure, Catalyst
  - Output: Yield %, Energy released

- **pH & Reactions**
  - Components: Acids, Bases, Indicators
  - Variables: Concentration, Volume
  - Output: pH value, Color change

#### 3. **Biology Lab**
- **Heart Simulation**
  - Components: Chambers, Valves, Vessels
  - Variables: Heart rate, Pressure, O2 levels
  - Output: Blood flow, Oxygen distribution

- **Photosynthesis**
  - Components: Plant cell, Light source, CO2
  - Variables: Light intensity, CO2 level, Temperature
  - Output: Glucose production, O2 output

### Experiment Flow

```
┌─────────────────────────────────────┐
│ 1. SETUP PHASE                      │
│    - ARIA suggests experiment       │
│    - User says: "Show car engine"   │
│    - 3D model appears               │
│    - ARIA explains what's visible   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ 2. INTERACTION PHASE                │
│    - User explores (zoom, rotate)   │
│    - User clicks parts              │
│    - ARIA explains each part        │
│    - User says: "Add turbo"         │
│    - New component appears          │
│    - ARIA: "Turbo added. Impact?"   │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ 3. SIMULATION PHASE                 │
│    - User: "Run the experiment"     │
│    - Animation plays                │
│    - Real-time data updates         │
│    - ARIA narrates: "Piston..."     │
│    - Results graph builds           │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ 4. RESULTS PHASE                    │
│    - ARIA announces results         │
│    - Visual graphs shown            │
│    - Scientific explanation         │
│    - Improvement suggestions        │
│    - User: "Try again" or "New"     │
└─────────────────────────────────────┘
```

---

## 🎨 UI/UX DESIGN SYSTEM

### Color Palette (Holographic Theme)

```css
/* Primary Colors */
--primary: #00f0ff;      /* Neon cyan */
--accent: #ff00ff;       /* Neon magenta */
--warning: #ff6b00;      /* Neon orange */
--success: #00ff00;      /* Neon green */

/* Background */
--bg-dark: #0a0e27;      /* Deep space blue */
--bg-card: rgba(10, 14, 39, 0.8);
--bg-overlay: rgba(0, 240, 255, 0.1);

/* Text */
--text-primary: #ffffff;
--text-secondary: #b0d4ff;

/* Borders */
--border: 1px solid #00f0ff;
--border-glow: 0 0 20px rgba(0, 240, 255, 0.5);
```

### Component Layouts

#### Main Screen
```
┌─────────────────────────────────────────┐
│ [ARIA Status] ← Top Bar with logo       │
├──────────────┬──────────────┬───────────┤
│              │              │           │
│ Components   │   3D Lab     │ Results   │
│ Library      │  Workspace   │ & Data    │
│              │              │           │
│ • Piston     │              │ Power: ▓▓▓│
│ • Cylinder   │   [3D Eng]   │ Temp:  ▓▓ │
│ • Turbo      │              │ Eff:   ▓▓▓│
│              │              │           │
├──────────────┴──────────────┴───────────┤
│ 🎤 [Voice Waveform] [Transcript]       │
└─────────────────────────────────────────┘
```

#### Results Panel
```
╔═══════════════════════════════════════╗
║ EXPERIMENT: Car Engine Turbo Test     ║
╠═══════════════════════════════════════╣
║                                       ║
║  ⚡ Power Output: 480 HP ▓▓▓▓▓░░░     ║
║  🌡️  Temperature: 920°C ▓▓▓▓▓▓░░     ║
║  💨 Efficiency:   82%   ▓▓▓▓▓▓░░     ║
║  ⏱️  Time-to-Peak: 2.3s ▓▓▓░░░░░     ║
║                                       ║
╠═══════════════════════════════════════╣
║ ARIA: "Turbo provided 30 HP boost.    ║
║  Temperature increased by 30°C.       ║
║  Efficiency improved by 4 points.     ║
║  Recommend cooling system upgrade."   ║
╠═══════════════════════════════════════╣
║ [📊 COMPARE] [💾 SAVE] [🔄 RETRY]   ║
╚═══════════════════════════════════════╝
```

### Animation Guidelines

- **Entrance**: Fade in + slide (300ms cubic-bezier)
- **Hover**: Scale 1.05 + glow (200ms)
- **Click**: Scale 0.95 then 1 (150ms) + sound effect
- **Data Update**: Bar grows + number increments (800ms)
- **Scene Load**: Spinning loading ring (until complete)
- **Voice Active**: Waveform animates in sync with audio

---

## 💻 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [x] Existing: ARIO voice engine
- [x] Existing: Three.js rendering
- [ ] Build: ExperimentLab component
- [ ] Build: ResultsPanel component
- [ ] Build: VoiceWaveform visualizer

### Phase 2: Experiments (Week 2)
- [ ] Car Engine 3D model + physics
- [ ] Heart simulation + animation
- [ ] Molecular structure viewer
- [ ] Experiment state management
- [ ] Simulation engine (physics.js or Babylon.js physics)

### Phase 3: AI Integration (Week 3)
- [ ] Gemini API for explanations
- [ ] Real-time data analysis
- [ ] Suggestion system
- [ ] Comparison engine

### Phase 4: Polish (Week 4)
- [ ] UI refinement
- [ ] Performance optimization
- [ ] Error handling
- [ ] Mobile responsiveness
- [ ] Demo video

---

## 📝 TASK-SPECIFIC PROMPTS

### Prompt 1: Build Experiment Lab Component

```
ROLE: Expert React + Three.js Developer

TASK: Create ExperimentLab component for ARIA Lab

REQUIREMENTS:
- Interactive 3D workspace using Three.js
- Drag-drop component system
- Part highlighting on hover
- Physics simulation using Cannon.js
- Real-time data streaming

DELIVERABLE:
src/components/scene/ExperimentLab.tsx
- Exports: <ExperimentLab />
- Props: { experimentType, isRunning, onResults }
- Features: zoom, rotate, pan controls

CONSTRAINTS:
- No external 3D models initially (use Three.js primitives)
- Must integrate with useStudoStore
- Must emit Socket.IO events for backend
```

### Prompt 2: Build ARIA Voice Command Parser

```
ROLE: AI/NLP Specialist

TASK: Enhance ARIO voice recognition for experiment commands

REQUIREMENTS:
- Parse: "ARIA, [verb] [object] [parameter]"
- Examples:
  * "show me a car engine" → {verb: 'show', object: 'engine', type: 'car'}
  * "add turbo" → {verb: 'add', object: 'turbo', value: null}
  * "run simulation" → {verb: 'run', object: 'simulation', params: {...}}
  * "zoom into piston" → {verb: 'zoom', target: 'piston', level: 5}

DELIVERABLE:
src/lib/commandParser.ts
- Function: parseCommand(text: string): Command
- Returns structured command object
- Handles variations and typos

CONSTRAINTS:
- Must work with Gemini API for intent classification
- Cache common commands
- Fallback to Levenshtein distance for fuzzy matching
```

### Prompt 3: Build Results Visualization

```
ROLE: Data Visualization Expert

TASK: Create results dashboard with real-time graphs

REQUIREMENTS:
- Bar charts for metrics (Power, Efficiency, Temperature)
- Line graphs for time-series data
- Animated updates during simulation
- Compare previous experiments
- Export results to JSON/CSV

DELIVERABLE:
src/components/ui/ResultsPanel.tsx
- Exports: <ResultsPanel results={data} />
- Library: Recharts or Plotly.js
- Features: animation, comparison, export

CONSTRAINTS:
- Must update in real-time (<100ms latency)
- Support mobile responsiveness
- Dark theme compatible
```

### Prompt 4: Build Physics Simulation Engine

```
ROLE: Physics Simulation Expert

TASK: Implement car engine physics simulation

REQUIREMENTS:
- Realistic piston motion
- Heat generation based on fuel
- Power output calculation
- Efficiency metrics
- Turbo effect simulation

DELIVERABLE:
src/lib/simulations/engineSimulation.ts
- Function: simulateEngine(config): SimulationResult
- Parameters: {fuelType, turbo, compression, speed}
- Output: {power, temperature, efficiency, timeline}

CONSTRAINTS:
- Must be accurate within ±5% of real engines
- Performance: calculate 1000 cycles in <100ms
- Use real thermodynamic formulas
```

---

## 🚀 DEPLOYMENT & LAUNCH

### Environment Variables (.env)
```
VITE_GEMINI_API_KEY=your_key_here
VITE_BACKEND_URL=http://localhost:8000
VITE_ENV=development
```

### Frontend Build
```bash
cd frontend
npm run build  # Creates dist/
```

### Backend Start
```bash
cd backend
python -m app.main  # Runs on http://localhost:8000
```

### Production Checklist
- [ ] API keys secured in .env
- [ ] CORS configured properly
- [ ] WebSocket authentication added
- [ ] Error boundaries in React
- [ ] Loading states for all async operations
- [ ] Mobile tested on iPhone + Android
- [ ] Performance: <3s initial load time
- [ ] Accessibility: WCAG 2.1 AA compliant
- [ ] Security: No XSS/CSRF vulnerabilities

---

## 🏆 JUDGE DEMO SCRIPT

```
Duration: 5 minutes

[SETUP - 30 seconds]
App loads → ARIA greets: "Hello. Ready for your experiment?"

[SHOWCASE #1: Basic Experiment - 1 minute]
You: "ARIA, show me a car engine"
→ 3D engine appears, spins slowly
ARIA: "This is a 4-cylinder combustion engine. 
       It converts fuel to mechanical power..."

[SHOWCASE #2: Interaction - 1 minute]
You: (Rotate with mouse) "ARIA, explain the piston"
ARIA: "The piston is a cylindrical component..."
You: "ARIA, add turbo"
→ Turbo appears, connected to engine

[SHOWCASE #3: Simulation - 1.5 minutes]
You: "ARIA, run the simulation"
→ Animation plays, engine running
→ Real-time data graph appears
ARIA: "Engine at peak performance. 
       Power output: 480 HP. Efficiency: 82%."

[CLOSE - 30 seconds]
You: "ARIA, compare with standard engine"
→ Side-by-side comparison with graphs
You: "Impressive ARIA!"
ARIA: "Thank you. Ready for the next experiment?"
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

| Issue | Cause | Solution |
|-------|-------|----------|
| Voice not working | Mic permission denied | Request permission on first load |
| 3D model glitchy | Z-fighting on overlapping geometry | Increase camera near/far ratio |
| Gemini API slow | Rate limiting | Implement request queuing + caching |
| WebSocket drops | Network unstable | Add reconnection logic + heartbeat |
| UI lag | Too many animations | Use CSS transforms + GPU acceleration |

---

## 📚 RESOURCE LINKS

- **Three.js Docs**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Gemini API**: https://ai.google.dev/
- **Cannon.js Physics**: https://www.cannonjs.org/
- **Socket.IO**: https://socket.io/docs/
- **FastAPI**: https://fastapi.tiangolo.com/

---

## ✨ SUCCESS METRICS

A successful ARIA Lab implementation will have:

✅ **Performance**
- App loads in <3 seconds
- Voice recognition <500ms latency
- 3D rendering at 60 FPS

✅ **Features**
- 3+ working experiments
- Real-time physics simulation
- Accurate AI explanations

✅ **User Experience**
- Intuitive voice commands
- Beautiful holographic UI
- Smooth interactions

✅ **Judge Appeal**
- Wow factor in demo
- Clear educational value
- Technical sophistication

---

**Built with ❤️ for the future of education**  
*Let's make learning awesome, ARIA!* 🚀
