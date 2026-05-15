# 🎯 STUDO / ARIA LAB — COMPLETE VISION DOCUMENT

> **Project**: Advanced Research & Innovation Assistant Lab  
> **Status**: Ready for Development  
> **Last Updated**: May 2026

---

## 📖 EXECUTIVE SUMMARY

**What is ARIA Lab?**

A revolutionary AI-powered virtual science laboratory that allows students (age 12-25) to learn science through interactive 3D models, voice commands, and real-time AI explanations.

**Why is it special?**

- **Voice-Controlled**: Natural commands like "ARIA, show me a car engine"
- **JARVIS-Like AI**: Deep male voice assistant that guides learning
- **3D Interactive**: Rotate, zoom, explode, and explore models
- **Real Physics**: Accurate simulations with actual science
- **Beautiful UI**: Holographic, neon-themed, futuristic design

**Target Demo**: 5-minute hackathon presentation that wows judges

---

## 🏢 PROJECT STRUCTURE

You have **3 separate implementations** to track:

### 1. **Studo (Main Project)** `d:\studo\`
```
studo/
├── ARIA_LAB_MASTER_PROMPT.md      ← Full architecture (this folder)
├── QUICK_START.md                  ← Implementation checklist
├── TASK_SPECIFIC_PROMPTS.md        ← Reusable AI prompts
├── frontend/                       ← React + TypeScript
├── backend/                        ← Python FastAPI
└── models/                         ← 3D assets
```

### 2. **Frontend Workspace** `d:\studo\frontend\`
```
Modern React app with:
- Three.js for 3D rendering
- MediaPipe for gesture control
- TailwindCSS for styling
- Socket.IO for real-time communication
```

### 3. **Backend Workspace** `d:\studo\backend\`
```
Python FastAPI server with:
- Edge TTS for voice synthesis
- OpenAI/Groq for AI
- Gemini API integration
- WebSocket support
```

---

## 🎯 WHAT YOU'RE BUILDING

### Core Features

```
ARIA LAB MAIN SCREEN
┌─────────────────────────────────────────────┐
│ ARIA Lab - Virtual Science Laboratory       │
├─────────────────────────────────────────────┤
│                                             │
│  [Components]  │  [3D Workspace]  │ [Results]
│  ✓ Piston     │   🔧 Engine      │ Power: ▓▓▓
│  ✓ Cylinder   │   ⚙️ Rotating    │ Temp: ▓▓▓▓
│  ✓ Turbo      │   💫 Animated    │ Eff: ▓▓▓
│  ✓ Crankshaft │                  │
│                │                  │
├─────────────────────────────────────────────┤
│ 🎤 [Voice Waveform] "Show me an engine"    │
│ ARIA: "Displaying a 4-cylinder engine..."  │
└─────────────────────────────────────────────┘
```

### User Journey

```
1. START
   ↓
   "ARIA, show me a car engine"
   ↓
2. EXPLORE
   - 3D engine appears
   - ARIA explains: "This is a combustion engine..."
   - Student clicks "piston"
   - ARIA explains: "The piston moves up and down..."
   ↓
3. MODIFY
   - Student: "Add turbo"
   - Turbo appears, connected
   - ARIA: "Turbo increases air intake..."
   ↓
4. SIMULATE
   - Student: "Run the experiment"
   - Animation starts
   - Real-time data streams in
   - Results graph updates live
   ↓
5. ANALYZE
   - Simulation completes
   - ResultsPanel shows metrics
   - ARIA narrates: "Power increased by 30 HP..."
   - Suggestions appear: "Try adding cooling system..."
   ↓
6. COMPARE
   - Student: "Save results"
   - Can compare with other experiments
   - Export to file (optional)
```

---

## 🔧 TECH STACK BREAKDOWN

### Frontend (What You See)
| Tech | Purpose | Status |
|------|---------|--------|
| **React 19** | UI framework | ✅ Working |
| **TypeScript** | Type safety | ✅ Working |
| **Three.js** | 3D rendering | ✅ Working |
| **TailwindCSS** | Styling | ✅ Working |
| **MediaPipe** | Gesture recognition | ✅ Working |
| **Socket.IO** | Real-time comms | ✅ Working |
| **Zustand** | State management | ✅ Working |

### Backend (The Brain)
| Tech | Purpose | Status |
|------|---------|--------|
| **FastAPI** | REST API | ✅ Working |
| **Socket.IO** | WebSocket server | ✅ Working |
| **Edge TTS** | Voice synthesis | ✅ Working |
| **Gemini API** | AI explanations | ✅ Ready |
| **OpenAI/Groq** | Fallback LLM | ✅ Ready |

### External APIs
| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **Gemini API** | AI brain | 🟢 Free tier available | ✅ Ready |
| **Web Speech API** | Voice input | 🟢 Built-in browser | ✅ Ready |
| **Three.js CDN** | 3D engine | 🟢 Free | ✅ Ready |

---

## 📚 DOCUMENTATION STRUCTURE

You now have **4 master documents**:

### 1. **ARIA_LAB_MASTER_PROMPT.md** (You are here)
- Complete vision and architecture
- Full system design
- Component specifications
- Implementation roadmap
- Task-specific prompts

### 2. **QUICK_START.md**
- 5-minute setup guide
- Step-by-step tasks
- Code templates with explanations
- Testing procedures
- Priority list for implementation

### 3. **TASK_SPECIFIC_PROMPTS.md**
- 8 ready-to-use AI prompts
- Copy-paste into Claude/GPT-4/Copilot
- Get specific components built
- Each with requirements & examples

### 4. **README.md** (existing)
- Project overview
- Basic setup
- Tech stack summary

---

## 🚀 IMPLEMENTATION PRIORITY

### PHASE 1: FOUNDATION (Do First - 2-3 hours)
```
✓ [20 min] ExperimentLab 3D Component
✓ [15 min] ResultsPanel Component  
✓ [15 min] Command Parser
✓ [10 min] Wire everything in App.tsx
✓ [30 min] Test voice input → output

RESULT: Basic working demo with 3D + voice
```

### PHASE 2: AI INTEGRATION (Next - 2 hours)
```
✓ [45 min] Explanation Engine with Gemini
✓ [30 min] Physics Simulation
✓ [30 min] WebSocket real-time data
✓ [15 min] Integrate all services

RESULT: Full experiment simulation working
```

### PHASE 3: POLISH (Final - 1-2 hours)
```
✓ [20 min] UI refinement (colors, fonts, effects)
✓ [20 min] Animations and transitions
✓ [20 min] Error handling
✓ [20 min] Mobile responsive
✓ [20 min] Testing and debugging

RESULT: Production-ready demo
```

---

## 💾 KEY FILES TO IMPLEMENT

### Must Create
- [ ] `src/components/scene/ExperimentLab.tsx` → 3D workspace
- [ ] `src/lib/commandParser.ts` → Voice command parsing
- [ ] `src/lib/explanationEngine.ts` → AI explanations
- [ ] `src/lib/simulations/engineSimulation.ts` → Physics
- [ ] `src/components/ui/ResultsPanel.tsx` → Metrics display

### Must Update
- [ ] `src/App.tsx` → Wire everything together
- [ ] `src/index.css` → Holographic theme
- [ ] `.env` → Add Gemini API key

### Already Exist ✅
- `src/lib/ario.ts` → Voice AI (ARIO engine)
- `src/lib/websocket.ts` → Socket.IO client
- `src/store/useStudoStore.ts` → State management
- `backend/app/main.py` → FastAPI server

---

## 🎤 HOW VOICE WORKS

### Voice Input Pipeline
```
┌──────────────────────────────────────┐
│ 1. User speaks: "ARIA show me engine"│
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ 2. Web Speech API (browser)          │
│    Converts to text (free)           │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ 3. parseCommand() in commandParser.ts│
│    Extracts: {verb, object, etc}     │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ 4. Backend processes & acts          │
│    - Loads 3D model                  │
│    - Calls Gemini if needed          │
│    - Generates response              │
└──────────────┬───────────────────────┘
               ↓
┌──────────────────────────────────────┐
│ 5. ARIO speaks response (Edge TTS)   │
│    "Displaying 4-cylinder engine..."│
└──────────────────────────────────────┘
```

### Code Example
```typescript
// User says: "ARIA show me an engine"

// Step 1: Parse
const command = await parseCommand("show me an engine");
// Returns: {verb: 'show', object: 'engine', confidence: 0.98}

// Step 2: Execute
handleCommand(command);
// - Load ExperimentLab
// - Display engine 3D model
// - Play loading animation

// Step 3: Explain
const explanation = await getExplanation('engine');
// Calls Gemini → Gets response

// Step 4: Speak
await ario.speak(explanation.text);
// "This is a combustion engine that converts fuel to mechanical power..."
```

---

## 🧪 TESTING CHECKLIST

### Before Demo

- [ ] **Voice**
  - [ ] "ARIA show me engine" works
  - [ ] Voice response is clear
  - [ ] Mic permission granted

- [ ] **3D**
  - [ ] Model renders without errors
  - [ ] Auto-rotating is smooth
  - [ ] Click detection works
  - [ ] Parts highlight on click

- [ ] **AI**
  - [ ] Gemini API key is valid
  - [ ] Explanations are accurate
  - [ ] No API timeouts
  - [ ] Fallback works if API fails

- [ ] **Simulation**
  - [ ] "Run experiment" command works
  - [ ] Animation is smooth
  - [ ] Data updates in real-time
  - [ ] Results display correctly

- [ ] **UI**
  - [ ] Dark theme looks good
  - [ ] Neon colors are visible
  - [ ] Mobile responsive
  - [ ] No console errors

---

## 📊 DEMO SCRIPT (5 minutes)

**Setup (30 seconds)**
```
App loads → Black screen →
"ARIA" logo appears →
ARIO greets: "Hello. Ready for your experiment?"
```

**Demo #1: Basic Interaction (1 minute)**
```
Me: "ARIA, show me a car engine"
→ 3D engine appears and rotates

ARIA: "This is a 4-cylinder combustion engine. 
It converts fuel energy into mechanical motion."

Me: (Rotate with mouse) "Explain the piston"
ARIA: "The piston is a cylindrical component that 
reciprocates inside the cylinder, converting pressure 
into linear motion..."
```

**Demo #2: Modification (1 minute)**
```
Me: "ARIA, add turbo"
→ Turbo component appears, connected to engine

ARIA: "Turbo installed. This component compresses 
incoming air, increasing engine efficiency."

Me: "ARIA, run the experiment"
→ Engine animation starts
→ Real-time data graph appears
→ Power meter fills up
```

**Demo #3: Results (1.5 minutes)**
```
Simulation completes →
Results panel shows:
- Power Output: 480 HP ▓▓▓▓▓░
- Temperature: 920°C ▓▓▓▓▓▓░
- Efficiency: 82% ▓▓▓▓▓▓░

ARIA: "Experiment complete. Turbo increased 
power by 30 HP. Temperature stable at 920°C. 
Efficiency improved to 82%. Recommend adding 
cooling system for optimal performance."

Me: "Impressive, ARIA!"
ARIA: "Thank you. Ready for the next experiment?"
```

**Close (30 seconds)**
- Show comparison with another engine
- Highlight save functionality
- Mention experiments available (physics, chemistry, biology)

---

## 🏆 JUDGE APPEAL FACTORS

What makes judges impressed:

✅ **Technology**
- Real AI (not fake)
- Actual physics simulation
- 3D graphics rendering
- Voice recognition working
- WebSocket real-time communication

✅ **Features**
- Multiple experiments available
- Interactive and responsive
- Educational value
- No bugs/crashes
- Smooth animations

✅ **Design**
- Beautiful UI (holographic theme)
- Professional look
- Intuitive interaction
- Mobile responsive
- Accessibility considerations

✅ **Demo Quality**
- Smooth live demo
- Clear talking points
- Impressive wow moments
- Technical depth explanation
- Vision for future

---

## 🆘 TROUBLESHOOTING

### Issue: "Gemini API 401 Unauthorized"
```
→ Check: https://aistudio.google.com/app/apikey
→ Generate new key
→ Update .env: VITE_GEMINI_API_KEY=your_new_key
→ Restart frontend (npm run dev)
```

### Issue: "Voice not working"
```
→ Check browser: Must use Chrome/Edge
→ Check permissions: Allow microphone
→ Check internet: WebSpeech needs connection
→ Fallback: Text input button should appear
```

### Issue: "3D not rendering / black screen"
```
→ Check GPU: Some laptops don't support WebGL
→ Check console: Press F12 for errors
→ Try different browser
→ Fallback: 2D demonstration mode
```

### Issue: "WebSocket connection fails"
```
→ Check backend running: python -m app.main
→ Check port: Should be http://localhost:8000
→ Check firewall: May block port 8000
→ Check .env: VITE_BACKEND_URL correct
```

---

## 📞 GETTING HELP

### If stuck on specific task:
1. Read the task-specific prompt in `TASK_SPECIFIC_PROMPTS.md`
2. Copy-paste into Claude/GPT-4/Copilot
3. Ask for specific code
4. Request implementation details

### If need visual reference:
1. Check Three.js docs: https://threejs.org/docs/
2. Check React Three Fiber: https://docs.pmnd.rs/react-three-fiber/
3. Check Socket.IO: https://socket.io/docs/
4. Check FastAPI: https://fastapi.tiangolo.com/

### If need AI concepts:
1. Check Gemini docs: https://ai.google.dev/
2. Physics formulas: https://en.wikipedia.org/wiki/Thermodynamics
3. Chemistry concepts: Khan Academy

---

## ✨ SUCCESS CRITERIA

Your demo is **READY** when:

✅ App loads in < 3 seconds  
✅ Voice command recognized  
✅ 3D model renders smoothly (60 FPS)  
✅ ARIA speaks response clearly  
✅ At least 1 complete experiment works  
✅ Results display with metrics  
✅ No console errors  
✅ UI looks professional  
✅ Works in Chrome browser  
✅ Mobile responsive  

---

## 🎉 FINAL THOUGHTS

You have:
- ✅ Working tech stack
- ✅ Clear architecture
- ✅ Implementation guide
- ✅ Ready-to-use prompts
- ✅ Demo script

**What you need to do:**
1. Build the 5 main components (QUICK_START.md)
2. Wire them together (App.tsx)
3. Test thoroughly
4. Polish UI
5. Demo confidently

**Estimated time:** 5-8 hours total development

**Potential impact:** Top-tier hackathon project that demonstrates:
- Full-stack skills
- AI integration
- 3D graphics knowledge
- User experience thinking
- Educational value

---

## 📝 NEXT STEPS

1. **Read**: `QUICK_START.md` for implementation checklist
2. **Start**: Build ExperimentLab component (Task 1)
3. **Use**: Copy prompts from `TASK_SPECIFIC_PROMPTS.md` for help
4. **Test**: Follow testing checklist
5. **Demo**: Use demo script for judges

---

**Good luck! You've got this! 🚀**

*Remember: Judges care about innovation, execution, and presentation.*  
*Make something awesome!* 💪

---

**Built with ❤️ for STUDO / ARIA Lab**  
**Mission: Transform education through AI-powered interactive learning**
