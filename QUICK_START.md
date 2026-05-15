# 🛠️ ARIA LAB — IMPLEMENTATION CHECKLIST & QUICK START

> Quick reference for developers  
> Updated: May 2026

---

## 📋 QUICK SETUP (5 minutes)

### 1. Clone & Install
```bash
# Frontend setup
cd frontend
npm install

# Backend setup  
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac: source venv/bin/activate
pip install -r requirements.txt
```

### 2. Add Gemini API Key
```bash
# Create .env file in root
VITE_GEMINI_API_KEY=your_key_from_aistudio.google.com
```

### 3. Run Both
```bash
# Terminal 1 - Backend
cd backend && python -m app.main

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

Visit: `http://localhost:5173`

---

## 🎯 PRIORITY IMPLEMENTATION TASKS

### ✅ DONE (Already Working)
- [x] ARIO voice assistant engine
- [x] Three.js 3D rendering
- [x] MediaPipe gesture control
- [x] React + TypeScript foundation
- [x] FastAPI backend
- [x] Socket.IO communication
- [x] TailwindCSS styling

### 🚧 IN PROGRESS (Start Here)

#### Task 1: Build ExperimentLab Component ⚡
**Time**: 2-3 hours  
**Priority**: 🔴 CRITICAL

Create a new component that serves as the main 3D workspace.

**File**: `src/components/scene/ExperimentLab.tsx`

```typescript
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStudoStore } from '../../store/useStudoStore';

export const ExperimentLab: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [selectedPart, setSelectedPart] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27);
    sceneRef.current = scene;

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Add Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0x00f0ff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 5. Create Placeholder Engine (Geometric Shapes)
    const engineGroup = new THREE.Group();
    engineGroup.name = 'engine';

    // Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.name = 'cylinder';
    engineGroup.add(cylinder);

    // Piston
    const pistonGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const pistonMaterial = new THREE.MeshPhongMaterial({ color: 0x00f0ff });
    const piston = new THREE.Mesh(pistonGeometry, pistonMaterial);
    piston.position.y = 1.5;
    piston.name = 'piston';
    engineGroup.add(piston);

    scene.add(engineGroup);

    // 6. Mouse Controls
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(engineGroup.children);
      
      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        setSelectedPart(clicked);
        console.log(`Selected: ${clicked.name}`);
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // 7. Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate engine
      engineGroup.rotation.y += 0.005;

      // Animate piston (up and down)
      if (piston) {
        piston.position.y = 1.5 + Math.sin(Date.now() * 0.005) * 0.3;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Handle Resize
    const onWindowResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onWindowResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        borderRadius: '8px',
        border: '1px solid #00f0ff',
        overflow: 'hidden'
      }} 
    />
  );
};
```

**✅ What this does:**
- Creates 3D scene with Three.js
- Basic engine with cylinder + piston
- Mouse click detection
- Auto-rotating animation

---

#### Task 2: Build Results Panel ⚡
**Time**: 1-2 hours  
**Priority**: 🟠 HIGH

Create a results visualization component.

**File**: `src/components/ui/ResultsPanel.tsx`

```typescript
import React from 'react';

interface ResultsData {
  experimentName: string;
  metrics: {
    label: string;
    value: number;
    unit: string;
    percentage: number;  // 0-100
    color: string;      // hex color
  }[];
  explanation: string;
  suggestions: string[];
}

export const ResultsPanel: React.FC<{ data: ResultsData }> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-6 border border-cyan-500/50">
      {/* Header */}
      <h2 className="text-xl font-bold text-cyan-400 mb-4">
        EXPERIMENT: {data.experimentName}
      </h2>

      {/* Metrics */}
      <div className="space-y-4 mb-6">
        {data.metrics.map((metric, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{metric.label}</span>
              <span className="text-cyan-400 font-mono">
                {metric.value} {metric.unit}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${metric.percentage}%`,
                  backgroundColor: metric.color,
                  boxShadow: `0 0 10px ${metric.color}`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="bg-cyan-900/20 border border-cyan-500/30 rounded p-4 mb-4">
        <p className="text-sm text-cyan-200 leading-relaxed">
          {data.explanation}
        </p>
      </div>

      {/* Suggestions */}
      {data.suggestions.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-purple-400">💡 Suggestions</h3>
          <ul className="text-xs text-gray-300 space-y-1">
            {data.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-purple-400">▸</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
```

**✅ What this does:**
- Beautiful results display
- Animated progress bars
- ARIA suggestions
- Dark holographic theme

---

#### Task 3: Voice Command Parser 🎤
**Time**: 1-2 hours  
**Priority**: 🟠 HIGH

Create smart command parsing for ARIA voice commands.

**File**: `src/lib/commandParser.ts`

```typescript
import { ario } from './ario';

export interface Command {
  verb: 'show' | 'add' | 'remove' | 'zoom' | 'rotate' | 'run' | 'reset' | 'save' | 'explain' | 'compare';
  object?: string;
  target?: string;
  level?: number;
  parameters?: Record<string, any>;
  confidence: number;
}

export async function parseCommand(text: string): Promise<Command> {
  const normalized = text.toLowerCase().trim();

  // Pattern matching
  const patterns = {
    show: /show\s+(?:me\s+)?(?:a\s+)?(\w+)/,
    add: /add\s+(\w+)/,
    remove: /remove\s+(\w+)/,
    zoom: /zoom\s+(in|out|to)\s+(\w+)?/,
    rotate: /rotate\s+(left|right)\s+(\d+)?/,
    run: /run\s+(?:the\s+)?(\w+)/,
    explain: /explain\s+(?:the\s+)?(\w+)/,
    reset: /reset/,
    save: /save/,
    compare: /compare/,
  };

  for (const [verb, pattern] of Object.entries(patterns)) {
    const match = normalized.match(pattern);
    if (match) {
      return {
        verb: verb as Command['verb'],
        object: match[1] || undefined,
        target: match[2] || undefined,
        confidence: 0.95,
      };
    }
  }

  // Fallback: Try Gemini for intelligent parsing
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Parse this user command for an AI lab assistant. 
                  User said: "${text}"
                  
                  Return JSON: {
                    verb: 'show|add|remove|zoom|rotate|run|reset|save|explain|compare',
                    object: 'what object (engine, piston, etc)',
                    confidence: 0.0-1.0
                  }`
          }]
        }]
      })
    });

    const data = await response.json();
    const result = JSON.parse(
      data.candidates[0].content.parts[0].text
    );

    return {
      verb: result.verb,
      object: result.object,
      confidence: result.confidence,
    };
  } catch (error) {
    console.error('Command parsing failed:', error);
    return {
      verb: 'show',
      confidence: 0.5,
    };
  }
}

// Usage in your component:
export async function handleVoiceInput(text: string) {
  const command = await parseCommand(text);
  
  console.log('Parsed command:', command);

  if (command.verb === 'show') {
    ario.speak(`Displaying ${command.object}`);
    // Trigger 3D model load
  } else if (command.verb === 'explain') {
    ario.speak(`Let me explain ${command.object}`);
    // Get explanation from Gemini
  } else if (command.verb === 'run') {
    ario.speak('Running simulation');
    // Start physics simulation
  }
}
```

**✅ What this does:**
- Parses "ARIA, show engine" → {verb: 'show', object: 'engine'}
- Uses regex for common patterns
- Falls back to Gemini for complex commands
- Returns structured command object

---

#### Task 4: AI Explanation Engine 🧠
**Time**: 2-3 hours  
**Priority**: 🔴 CRITICAL

Create Gemini integration for smart explanations.

**File**: `src/lib/explainationEngine.ts`

```typescript
import { ario } from './ario';

export interface Explanation {
  text: string;
  scientificDetail: string;
  suggestions: string[];
  relatedTopics: string[];
}

export async function getExplanation(
  topic: string,
  context: string = ''
): Promise<Explanation> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('Gemini API key not configured');
    return getDefaultExplanation(topic);
  }

  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are ARIA, a helpful science lab assistant. 
                    Explain this to a student (age 12-18):
                    
                    Topic: ${topic}
                    Context: ${context || 'General explanation'}
                    
                    Provide:
                    1. Simple 2-sentence explanation (for speech output)
                    2. Detailed scientific explanation (for display)
                    3. 2-3 practical applications
                    4. 2-3 related topics to explore
                    
                    Format as JSON:
                    {
                      "simple": "Easy explanation",
                      "detailed": "Scientific explanation",
                      "applications": ["app1", "app2"],
                      "relatedTopics": ["topic1", "topic2"]
                    }`
            }]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response format');

    const result = JSON.parse(jsonMatch[0]);

    // ARIA speaks the simple version
    await ario.speak(result.simple);

    return {
      text: result.simple,
      scientificDetail: result.detailed,
      suggestions: result.applications || [],
      relatedTopics: result.relatedTopics || [],
    };
  } catch (error) {
    console.error('Explanation fetch failed:', error);
    return getDefaultExplanation(topic);
  }
}

function getDefaultExplanation(topic: string): Explanation {
  const defaults: Record<string, Explanation> = {
    piston: {
      text: 'A piston moves up and down inside a cylinder to create power.',
      scientificDetail: 'The piston is a cylindrical component that reciprocates inside the cylinder. It converts the pressure from combustion into linear motion, which is then converted to rotational motion via the crankshaft.',
      suggestions: ['Understand combustion cycle', 'Learn about crankshaft', 'Study compression ratios'],
      relatedTopics: ['Crankshaft', 'Combustion', 'Engine blocks'],
    },
    cylinder: {
      text: 'A cylinder is where fuel burns to create power.',
      scientificDetail: 'The cylinder chamber contains the fuel-air mixture that is ignited by the spark plug. The resulting combustion creates high pressure that pushes the piston.',
      suggestions: ['Learn about fuel injection', 'Understand combustion timing', 'Study cylinder design'],
      relatedTopics: ['Spark plug', 'Combustion chamber', 'Compression ratio'],
    },
  };

  return defaults[topic.toLowerCase()] || {
    text: `${topic} is an important component in this system.`,
    scientificDetail: `${topic} plays a key role in the overall function of the apparatus. Further research needed.`,
    suggestions: ['Explore more', 'Ask for details', 'Run simulation'],
    relatedTopics: ['Related systems', 'Energy transfer'],
  };
}
```

**✅ What this does:**
- Fetches smart explanations from Gemini
- ARIA speaks them naturally
- Returns detailed scientific info
- Has fallback explanations

---

### 🔜 NEXT TASKS (After Above)

#### Task 5: Physics Simulation Engine
**Time**: 4-6 hours  
**Priority**: 🟠 HIGH  
**Start after**: Tasks 1-4 complete

Implement real engine physics.

#### Task 6: Gesture Control Integration  
**Time**: 2 hours  
**Priority**: 🟡 MEDIUM  
**Dependency**: MediaPipe (already exists)

Connect hand gestures to control experiment.

#### Task 7: Experiment System
**Time**: 3-4 hours  
**Priority**: 🟠 HIGH

Support multiple experiments (physics, chemistry, biology).

---

## 🎮 TESTING THE CHANGES

### Step-by-step testing

```bash
# 1. Start backend
cd backend
python -m app.main
# Should see: "Uvicorn running on http://127.0.0.1:8000"

# 2. Start frontend (new terminal)
cd frontend  
npm run dev
# Should see: "VITE v5.x.x ready in 200 ms"

# 3. Open browser
# Navigate to http://localhost:5173

# 4. Test voice
# Click mic → Say "ARIA show me an engine"
# Should hear response + see 3D model

# 5. Click on piston
# Should highlight + hear explanation

# 6. Say "ARIA run simulation"
# Should animate + show results
```

---

## 📊 FILE STRUCTURE AFTER IMPLEMENTATION

```
studo/
├── ARIA_LAB_MASTER_PROMPT.md         ← You are here
├── QUICK_START.md                     ← This file
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── scene/
│       │   │   ├── ExperimentLab.tsx  ← NEW
│       │   │   └── ...
│       │   └── ui/
│       │       ├── ResultsPanel.tsx   ← NEW
│       │       ├── HolographicHUD.tsx
│       │       └── ...
│       ├── lib/
│       │   ├── commandParser.ts       ← NEW
│       │   ├── explainationEngine.ts  ← NEW
│       │   ├── ario.ts                (Enhanced)
│       │   └── ...
│       └── ...
└── backend/
    └── app/
        └── services/
            └── (Use existing)
```

---

## 🚀 QUICK WINS (Do First)

1. **10 min**: Add ExperimentLab to App.tsx layout
2. **15 min**: Wire ResultsPanel to state  
3. **20 min**: Test voice input with commandParser
4. **15 min**: Call Gemini API for one explanation

**Total**: 60 minutes = Working demo! 🎉

---

## 🆘 HELP / DEBUGGING

### Issue: Voice not working
```javascript
// Check permissions
navigator.permissions.query({name: 'microphone'})
  .then(result => console.log(result.state));
```

### Issue: 3D not rendering
```javascript
// Check GPU
console.log(renderer.capabilities);
```

### Issue: Gemini API 401
```bash
# Generate new key at: https://aistudio.google.com/app/apikey
# Add to .env: VITE_GEMINI_API_KEY=your_new_key
```

### Issue: Socket.IO not connecting
```javascript
// Check backend running:
curl http://localhost:8000
// Should return FastAPI docs
```

---

**Good luck! You've got this! 🚀**
