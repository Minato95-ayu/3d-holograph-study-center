# 🎯 ARIA LAB — TASK-SPECIFIC PROMPTS

> Copy-paste prompts for AI assistance  
> Use in Copilot, Claude, GPT-4, or build AI systems

---

## 📋 HOW TO USE THESE PROMPTS

1. **Choose the task** you're working on
2. **Copy the entire prompt** (including context)
3. **Paste into your AI assistant** (Copilot, Claude, GPT-4)
4. **Ask for implementation**
5. **Review code** before merging

---

## 🏗️ PROMPT 1: Build ExperimentLab Component

```
ROLE: Expert React + Three.js Developer

CONTEXT:
You are building ARIA Lab - an AI-powered virtual science laboratory.
The app allows students to explore scientific concepts through 
interactive 3D models with voice-controlled AI assistance.

TASK:
Create the ExperimentLab component that serves as the main 3D workspace.

REQUIREMENTS:
1. Use React + TypeScript + Three.js
2. Create an interactive 3D scene with:
   - Dark background (hex: #0a0e27)
   - 3D geometric engine placeholder (cylinder + piston)
   - Lighting system (ambient + point light with neon cyan color)
   - Auto-rotating animation
   - Smooth camera positioning

3. Implement interaction:
   - Mouse click detection on 3D objects
   - Highlight selected parts
   - Log clicked part name to console
   - Store selected part in React state

4. Handle responsiveness:
   - Resize listener for window changes
   - Proper aspect ratio handling
   - Works on desktop and tablet

5. Code quality:
   - Well-commented code
   - Clean TypeScript types
   - Proper cleanup in useEffect return
   - Performance optimized

DELIVERABLE:
TypeScript React component: src/components/scene/ExperimentLab.tsx

Export: <ExperimentLab />

Props: None (for now, can add later)

CONSTRAINTS:
- Do NOT use external 3D model files yet (use Three.js primitives)
- Use modern React 19+ hooks
- No deprecated Three.js methods
- Must work with existing useStudoStore
- Mountable in a flex container

TECHNICAL DETAILS:
- Window size: Use mountRef.current.clientWidth/Height
- Render quality: Set pixel ratio to devicePixelRatio
- Scene color: 0x0a0e27 (dark blue-black)
- Light colors: Cyan (#00f0ff) and Magenta (#ff00ff)

CODE EXAMPLE TO FOLLOW:
```javascript
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(...);
const renderer = new THREE.WebGLRenderer({ antialias: true });
// ... etc
```

EXPECTED OUTPUT:
A fully functional 3D lab workspace where:
- A simple engine model renders
- Model rotates smoothly
- Piston animates up/down
- Clicking parts logs their names
- Component is production-ready
```

---

## 🎤 PROMPT 2: Implement Voice Command Parser

```
ROLE: NLP & JavaScript Specialist

CONTEXT:
ARIA Lab has a voice input system. We need to parse user commands
like "ARIA show me an engine" into structured command objects.

TASK:
Create a command parser that converts voice input to structured commands.

INPUT FORMAT:
"ARIA, [verb] [object] [parameters]"

EXAMPLES:
- "show me a car engine" → {verb: 'show', object: 'engine', type: 'car'}
- "add turbo" → {verb: 'add', object: 'turbo'}
- "zoom into cylinder" → {verb: 'zoom', target: 'cylinder', level: 5}
- "explain the piston" → {verb: 'explain', object: 'piston'}
- "run the simulation" → {verb: 'run', object: 'simulation'}
- "reset the lab" → {verb: 'reset'}
- "compare with standard engine" → {verb: 'compare', target: 'engine'}

VERBS SUPPORTED:
'show', 'add', 'remove', 'zoom', 'rotate', 'run', 'reset', 'save', 'explain', 'compare'

REQUIREMENTS:
1. Create TypeScript file: src/lib/commandParser.ts

2. Implement function:
   ```typescript
   export interface Command {
     verb: string;
     object?: string;
     target?: string;
     level?: number;
     parameters?: Record<string, any>;
     confidence: 0.0-1.0;
   }
   
   export async function parseCommand(text: string): Promise<Command>
   ```

3. Implementation strategy:
   - First try regex patterns for common commands (80% use case)
   - If no match, call Gemini API for intelligent parsing
   - Return confidence score (0-1)
   - Handle typos and variations

4. Gemini API Integration:
   - Use fetch to hit Gemini endpoint
   - Prompt: Ask Gemini to extract verb/object from command
   - Format: Return JSON response
   - Fallback gracefully if API fails

5. Testing:
   - Test regex patterns work
   - Test Gemini parsing
   - Test error handling
   - Test confidence scores

CONSTRAINTS:
- Maximum API latency: 2 seconds
- Must work offline (regex fallback)
- Handle empty/null input safely
- TypeScript strict mode

EXPECTED BEHAVIOR:
Command "show me a car engine":
→ Return: {verb: 'show', object: 'engine', type: 'car', confidence: 0.98}
→ Takes <500ms if regex matches, <1.5s if Gemini needed
```

---

## 🧠 PROMPT 3: AI Explanation Engine with Gemini

```
ROLE: AI/Education Specialist

CONTEXT:
ARIA Lab needs to explain scientific concepts to students (age 12-18).
When a student asks "explain the piston" or clicks on a part,
ARIA should provide:
1. A simple 2-sentence explanation (spoken aloud)
2. Detailed scientific explanation (displayed)
3. Practical applications
4. Related topics to explore

TASK:
Implement getExplanation() function that fetches explanations from Gemini.

REQUIREMENTS:
1. Create TypeScript file: src/lib/explanationEngine.ts

2. Function signature:
   ```typescript
   export async function getExplanation(
     topic: string,
     context?: string
   ): Promise<Explanation>
   
   export interface Explanation {
     text: string;              // Simple (for speech)
     scientificDetail: string;  // Detailed (for display)
     suggestions: string[];     // 2-3 applications
     relatedTopics: string[];  // 2-3 related topics
   }
   ```

3. Gemini API Integration:
   - Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent
   - API Key: import.meta.env.VITE_GEMINI_API_KEY
   - Prompt strategy: Ask Gemini for JSON response
   - Parse the JSON carefully

4. Fallback System:
   - If Gemini API fails → Use hardcoded explanations
   - Create dictionary of 10+ default explanations
   - Include: piston, cylinder, crankshaft, turbo, combustion, valves, etc.

5. Integration with ARIO:
   - After getting explanation, call:
     ```typescript
     await ario.speak(explanation.text);
     ```
   - ARIO speaks the simple version

6. Caching (optional but nice):
   - Cache explanations in localStorage
   - Check cache before calling Gemini
   - Key format: `aria_explain_${topic.toLowerCase()}`

CONSTRAINTS:
- Response time: <3 seconds
- Fallback must always work (never fail silently)
- No crashes on API errors
- All responses should be student-friendly language
- Scientific accuracy required

EXPECTED BEHAVIOR:
```javascript
const explanation = await getExplanation('piston', 'car engine');

// Returns:
{
  text: "A piston is a moving part that goes up and down.",
  scientificDetail: "The piston reciprocates...",
  suggestions: ["Understand combustion", "Learn about..."],
  relatedTopics: ["Crankshaft", "Valves"]
}

// ARIO says: "A piston is a moving part that goes up and down."
// UI displays the scientificDetail
```

ERROR HANDLING:
- If API key not set → Log warning + use fallback
- If network fails → Use fallback gracefully
- If invalid JSON → Parse error handling
- Never throw unhandled exceptions
```

---

## 📊 PROMPT 4: Results Visualization Component

```
ROLE: UI/UX Developer & Data Visualization Expert

CONTEXT:
After running an experiment in ARIA Lab, students see results.
The results panel should be beautiful, informative, and mobile-friendly.
It displays metrics like Power, Temperature, Efficiency as animated bars.

TASK:
Create ResultsPanel component that visualizes experiment results.

REQUIREMENTS:
1. React + TypeScript component
   File: src/components/ui/ResultsPanel.tsx

2. Props interface:
   ```typescript
   interface ResultsData {
     experimentName: string;
     metrics: {
       label: string;           // e.g., "Power Output"
       value: number;           // e.g., 450
       unit: string;            // e.g., "HP"
       percentage: number;      // 0-100 for bar width
       color: string;           // Hex color for bar
     }[];
     explanation: string;       // 1-2 sentence summary
     suggestions: string[];     // 2-3 recommendations
   }
   ```

3. Design requirements:
   - Dark holographic theme (bg: rgba(10, 14, 39, 0.8))
   - Neon borders (cyan #00f0ff with glow)
   - Animated progress bars (grow from 0 to percentage in 500ms)
   - Glassmorphic effect (backdrop blur if supported)
   - Mobile responsive (works on phones)

4. Sections:
   - Header: Experiment name
   - Metrics: Each with label, value, unit, animated bar
   - Explanation: ARIA's scientific summary
   - Suggestions: Bulleted list of improvements
   - Action buttons: Save, Compare, Retry (optional)

5. Animations:
   - Bars: Grow from 0% with cubic-bezier timing (300ms)
   - Text numbers: Increment from 0 to final value
   - Entrance: Fade in + slide up

6. Code quality:
   - TypeScript strict
   - Reusable components
   - Responsive grid layout
   - TailwindCSS for styling
   - No hard-coded values

CONSTRAINTS:
- No external charting library required
- Pure CSS animations (no animation library)
- Works in Chrome + Safari + Firefox
- Performance: <50ms render time
- Mobile: Readable on 375px width

EXAMPLE USAGE:
```javascript
<ResultsPanel 
  data={{
    experimentName: "Car Engine Turbo Test",
    metrics: [
      {
        label: "Power Output",
        value: 480,
        unit: "HP",
        percentage: 85,
        color: "#00f0ff"
      },
      {
        label: "Temperature",
        value: 920,
        unit: "°C",
        percentage: 92,
        color: "#ff00ff"
      },
      {
        label: "Efficiency",
        value: 82,
        unit: "%",
        percentage: 82,
        color: "#00ff00"
      }
    ],
    explanation: "Turbo increased power by 30 HP. Temperature stable.",
    suggestions: [
      "Add cooling system for better efficiency",
      "Optimize fuel injection timing",
      "Reduce intake temperature"
    ]
  }}
/>
```

EXPECTED OUTPUT:
A professional results dashboard that:
- Shows all metrics with smooth animations
- Updates in real-time during simulation
- Looks impressive for hackathon judges
- Works on mobile devices
- Explains results in simple language
- Suggests improvements
```

---

## ⚙️ PROMPT 5: Physics Simulation Engine

```
ROLE: Physics Simulation & Mechanical Engineering Expert

CONTEXT:
ARIA Lab needs to simulate real-world physics for experiments.
When a student says "run the simulation", we need accurate calculations
based on thermodynamics, mechanics, and energy conservation.

TASK:
Implement physics simulation for a car engine experiment.

REQUIREMENTS:
1. Create file: src/lib/simulations/engineSimulation.ts

2. Function:
   ```typescript
   export interface EngineConfig {
     fuelType: 'regular' | 'premium' | 'diesel';
     turbo: boolean;
     displacement: number;      // cc (e.g., 2000)
     compressionRatio: number;  // e.g., 10
     rpm: number;              // Revolutions per minute
   }

   export interface SimulationStep {
     time: number;             // milliseconds
     power: number;            // HP
     temperature: number;      // Celsius
     pressure: number;         // PSI
     efficiency: number;       // Percentage
   }

   export async function simulateEngine(
     config: EngineConfig,
     duration: number = 5000  // 5 seconds
   ): Promise<SimulationStep[]>
   ```

3. Physics calculations:
   - Use realistic thermodynamic equations
   - Horsepower = (Torque × RPM) / 5252
   - Efficiency based on fuel energy + temperature loss
   - Temperature rise based on fuel burn rate
   - Pressure variations with displacement & compression

4. Simulation logic:
   - Calculate 50-100 data points per second
   - Return array of steps
   - Each step includes: time, power, temp, pressure, efficiency

5. Turbo effect:
   - Increases air intake by ~30%
   - Increases power output by ~25-35%
   - Increases temperature by ~20°C

6. Fuel type variations:
   - Regular: 87 octane, standard efficiency
   - Premium: 91 octane, +5% efficiency
   - Diesel: Better torque, different curve

CONSTRAINTS:
- Performance: Calculate 5 seconds of data in <100ms
- Accuracy: ±5% of real engine data
- No heavy libraries (pure math)
- TypeScript strict mode
- All values must be realistic

EXAMPLE USAGE:
```javascript
const results = await simulateEngine({
  fuelType: 'premium',
  turbo: true,
  displacement: 2000,
  compressionRatio: 10,
  rpm: 3000
}, 5000);

// Returns array of 250+ steps
// results[0] = { time: 0, power: 0, temp: 20, pressure: 14.7, efficiency: 0 }
// results[100] = { time: 2000, power: 480, temp: 890, pressure: 180, efficiency: 78 }
// results[250] = { time: 5000, power: 480, temp: 920, pressure: 190, efficiency: 82 }
```

VALIDATION:
- Peak power: 400-500 HP (reasonable for 2000cc)
- Peak temp: 800-950°C (realistic combustion)
- Efficiency: 70-85% (modern engines)
- Ramp time: 1-3 seconds to peak
```

---

## 🎨 PROMPT 6: Holographic UI Theme

```
ROLE: UI/UX Designer

CONTEXT:
ARIA Lab should look like a futuristic Tony Stark laboratory.
Dark holographic theme with neon cyan and magenta colors,
glassmorphism effects, and smooth animations.

TASK:
Create a comprehensive TailwindCSS + CSS design system for ARIA Lab.

REQUIREMENTS:
1. Update file: src/index.css

2. Global variables:
   ```css
   :root {
     --primary: #00f0ff;      /* Neon cyan */
     --accent: #ff00ff;       /* Neon magenta */
     --warning: #ff6b00;      /* Neon orange */
     --success: #00ff00;      /* Neon green */
     --bg-dark: #0a0e27;      /* Space blue */
     --border-glow: 0 0 20px rgba(0, 240, 255, 0.5);
   }
   ```

3. Component classes:
   - .holographic-card: Glassmorphic card
   - .neon-border: Glowing border
   - .glow-text: Glowing text
   - .fade-in-up: Entrance animation
   - .pulse-glow: Pulsing glow effect
   - .scan-animation: Scanning line effect

4. Animations:
   - Fade in + slide up (entrance)
   - Glow pulse (continuous)
   - Scan lines (top-to-bottom)
   - Number increment (results)
   - Smooth transitions (200-300ms)

5. Responsive breakpoints:
   - Mobile: <640px
   - Tablet: 640px - 1024px
   - Desktop: >1024px

6. Effects:
   - Glassmorphism (blur + semi-transparent)
   - Neon glows (text-shadow + box-shadow)
   - Particle effects (optional)
   - Smooth curves (border-radius)

CONSTRAINTS:
- Use TailwindCSS utility classes first
- Custom CSS for complex animations
- No external animation libraries
- Works in modern browsers
- Performance: 60 FPS animations
- Accessibility: WCAG AA compliant

DELIVERABLE:
Updated src/index.css with:
- CSS variables
- Animation keyframes
- Custom component classes
- Dark theme
- Responsive utilities
```

---

## 🚀 PROMPT 7: WebSocket Integration for Real-time Data

```
ROLE: Full-Stack Developer (Socket.IO expert)

CONTEXT:
ARIA Lab frontend needs real-time communication with FastAPI backend.
Experiments stream data continuously (power, temperature, efficiency).
The frontend must update graphs in real-time (<100ms latency).

TASK:
Implement WebSocket communication for experiment data streaming.

REQUIREMENTS:
1. Frontend: Update src/lib/websocket.ts
   
   Implement:
   ```typescript
   export interface ExperimentData {
     experimentId: string;
     timestamp: number;
     power: number;
     temperature: number;
     pressure: number;
     efficiency: number;
   }

   export function subscribeToExperiment(
     experimentId: string,
     callback: (data: ExperimentData) => void
   ): () => void
   ```

2. Backend integration:
   - Connect to Socket.IO on startup
   - Emit event: 'experiment:subscribe' with experimentId
   - Listen to: 'experiment:update' for data stream
   - Handle: 'experiment:complete' when done
   - Handle reconnection gracefully

3. Data streaming:
   - Receive updates 10-20 times per second
   - Update React state with useCallback
   - Trigger chart re-renders efficiently
   - Keep last 100 data points in memory

4. Error handling:
   - Reconnect automatically on disconnect
   - Exponential backoff (1s, 2s, 4s, etc.)
   - Show connection status to user
   - Fallback to polling if WebSocket fails

5. Performance:
   - Batch updates (send every 100ms)
   - Don't re-render on every message
   - Use React.memo to prevent unnecessary updates

CONSTRAINTS:
- Must work with existing FastAPI backend
- Latency <100ms for UI updates
- Handle 100+ data points/second
- Graceful degradation if WebSocket fails
```

---

## 🎯 PROMPT 8: Complete Feature Implementation

```
ROLE: Senior Full-Stack Developer

CONTEXT:
Building ARIA Lab - an AI-powered 3D science laboratory.
Need to implement a complete feature end-to-end.

TASK:
Implement the "Car Engine Experiment" feature completely.

REQUIREMENTS:
1. FEATURE OVERVIEW:
   - User says "ARIA show me a car engine"
   - 3D engine model appears and rotates
   - User can click parts for explanations
   - User says "run the experiment"
   - Physics simulation runs with real-time animation
   - Results display with metrics and ARIA narration

2. COMPONENTS NEEDED:
   ✓ ExperimentLab (3D workspace)
   ✓ ResultsPanel (metrics display)
   ✓ VoiceWaveform (audio visualizer)

3. SERVICES NEEDED:
   ✓ commandParser (voice input)
   ✓ explanationEngine (AI explanations)
   ✓ engineSimulation (physics)
   ✓ websocket (real-time data)

4. INTEGRATION:
   - Connect all services in App.tsx
   - Handle state with useStudoStore
   - Trigger animations based on state
   - Real-time data flow

5. USER FLOW:
   1. User says "ARIA show me a car engine"
   2. commandParser processes → {verb: 'show', object: 'engine'}
   3. ExperimentLab loads engine model
   4. ARIO explains: "This is a 4-cylinder engine..."
   5. User clicks "piston"
   6. ARIO explains: "The piston moves up and down..."
   7. User says "run the experiment"
   8. Simulation starts
   9. Real-time data streams in
   10. Animation plays
   11. ResultsPanel updates live
   12. Simulation completes
   13. ARIO announces results

6. CODE QUALITY:
   - TypeScript strict mode
   - Error boundaries
   - Loading states
   - Proper cleanup
   - Well-commented

DELIVERABLES:
- Updated App.tsx (orchestration)
- All 4 components working together
- Demo-ready feature

EXPECTED OUTCOME:
Complete working car engine experiment that impresses judges.
```

---

## 📚 USAGE TIPS

1. **For new developers**: Start with Prompt 1 (ExperimentLab)
2. **For frontend focus**: Use Prompts 1, 4, 6
3. **For backend focus**: Use Prompt 5, 7
4. **For AI integration**: Use Prompts 2, 3, 8
5. **For quick wins**: Use Prompt 6 (UI improvement)

---

## ✅ PROMPT CUSTOMIZATION

Feel free to modify prompts:
- Change difficulty level
- Add specific constraints
- Modify technical requirements
- Adjust for your API keys
- Update for your team's standards

---

**Happy coding! 🚀**
