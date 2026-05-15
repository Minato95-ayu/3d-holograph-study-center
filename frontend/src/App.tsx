import React, { useEffect, useState } from 'react';
import { Scene3D } from './components/scene/Scene3D';
import { HolographicHUD } from './components/ui/HolographicHUD';
import { ExperimentLab } from './components/scene/ExperimentLab';
import { ResultsPanel, ResultsData } from './components/ui/ResultsPanel';
import { useMediaPipe } from './hooks/useMediaPipe';
import { wsService } from './lib/websocket';
import { useStudoStore } from './store/useStudoStore';
import { ario } from './lib/ario';
import { speechInput } from './lib/speechInput';
import { buildHologram } from './lib/hologramEngine';
import { parseCommand, executeCommand } from './lib/commandParser';
import { getExplanation } from './lib/explanationEngine';

const App: React.FC = () => {
  const { videoRef } = useMediaPipe();
  const setKnowledge = useStudoStore((state) => state.setKnowledge);
  const setScene = useStudoStore((state) => state.setScene);
  const setArio = useStudoStore((state) => state.setArio);

  // ARIA Lab demo states
  const [demoMode, setDemoMode] = useState(true); // Start in demo mode for judges
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const socket = wsService.connect();

    // ARIO voice state sync
    ario.onCallbacks({
      onStateChange: (state) => setArio({ state }),
      onSpeakStart: (text) => setArio({ currentText: text }),
      onSpeakEnd: () => setArio({ currentText: null }),
    });

    // Welcome message after slight delay
    setTimeout(() => {
      ario.greet();
    }, 2000);

    speechInput.onQuery = (query) => {
      console.log('🎤 ARIO heard search:', query);
      setKnowledge({ loading: true, query });
      setArio({ state: 'thinking' });
      wsService.emit('search', { query });
    };

    speechInput.onChat = (text) => {
      console.log('🎤 ARIO heard chat:', text);
      setArio({ state: 'thinking' });
      wsService.emit('ario_chat', { text });
    };

    speechInput.onCommand = (command) => {
      console.log('🎤 ARIO heard command:', command);
      
      // Try to parse as ARIA Lab command first
      try {
        const parsedCmd = parseCommand(command);
        console.log('✅ Parsed command:', parsedCmd);

        executeCommand(parsedCmd, {
          onShow: (obj) => {
            ario.speak(`Displaying the ${obj}. This is a critical engine component.`);
          },
          onExplain: async (obj) => {
            const explanation = await getExplanation(obj);
            ario.speak(explanation.text);
          },
          onRun: async () => {
            setIsSimulating(true);
            ario.speak('Starting simulation. Running experiment...');
            
            // Simulate results after delay
            setTimeout(() => {
              setResults({
                experimentName: 'Car Engine Performance Test',
                metrics: [
                  {
                    label: 'Power Output',
                    value: 450,
                    unit: 'HP',
                    percentage: 90,
                    color: '#00f0ff',
                    icon: '⚡',
                  },
                  {
                    label: 'Temperature',
                    value: 890,
                    unit: '°C',
                    percentage: 85,
                    color: '#ff6b00',
                    icon: '🌡️',
                  },
                  {
                    label: 'Efficiency',
                    value: 78,
                    unit: '%',
                    percentage: 78,
                    color: '#00ff00',
                    icon: '💨',
                  },
                ],
                explanation:
                  'Experiment complete. Engine operating at peak performance with 450 HP output and 78% efficiency.',
                suggestions: [
                  'Optimize fuel injection timing for better efficiency',
                  'Add cooling system to reduce operating temperature',
                  'Upgrade to premium fuel for increased power output',
                ],
                isRunning: false,
              });
              setIsSimulating(false);
              ario.speak(
                'Simulation complete. Power output 450 HP, efficiency 78 percent, temperature 890 Celsius. Experiment successful.'
              );
            }, 3000);
          },
          onStop: () => {
            setIsSimulating(false);
            ario.speak('Stopping simulation.');
          },
        });
      } catch (error) {
        console.error('Error processing command:', error);
      }

      // Fallback to existing commands
      if (command === 'explode') {
        setScene({ isExploded: true });
        ario.speak('Exploding holographic view.');
      } else if (command === 'assemble') {
        setScene({ isExploded: false });
        ario.speak('Reassembling holographic model.');
      } else if (command === 'stop_talking') {
        ario.stop();
      }
    };

    speechInput.onWakeWord = () => {
      setArio({ micActive: true });
      // Only say yes if we aren't currently speaking
      if (useStudoStore.getState().ario.state !== 'speaking') {
        ario.speak('Yes?', true);
      }
    };
    speechInput.onStatusChange = (listening) => {
      setArio({ micActive: listening });
    };

    // Don't auto-start mic — user clicks mic button to activate


    socket.on('welcome', (data) => {
      console.log('🤖 ARIO:', data.message);
    });

    const handleSearchResult = async (data: any) => {
      console.log('🔍 ARIO Search Result:', data);

      // 1. Update knowledge state with full structured data
      setKnowledge({
        query: data.query,
        title: data.title || data.query,
        summary: data.summary,
        formulas: data.formulas || [],
        components: data.components || [],
        fun_fact: data.fun_fact || '',
        domain: data.domain || 'general',
        loading: false,
        ario_intro: data.ario_intro || data.summary?.slice(0, 200) || '',
      });

      // 2. ARIO speaks the intro
      if (data.ario_intro || data.summary) {
        const intro = data.ario_intro || data.summary.slice(0, 300);
        ario.speak(intro, true);

        // Also speak fun fact if available
        if (data.fun_fact) {
          setTimeout(() => {
            ario.speak(`Fun fact: ${data.fun_fact}`);
          }, 4000);
        }
      }

      // 3. Build and switch hologram
      try {
        const hologram = await buildHologram(data.query);
        console.log('🌐 Hologram config:', hologram);

        if (hologram.type === 'molecule' && hologram.moleculeData) {
          // Switch to molecule renderer
          setScene({
            hologramType: 'molecule',
            currentModel: null,
            isExploded: false,
          });
          // Store molecule data in knowledge for Scene3D to pick up
          setKnowledge({ query: data.query });
        } else if (hologram.type === 'dna') {
          setScene({ hologramType: 'dna', currentModel: null, isExploded: false });
        } else if (hologram.type === 'atom') {
          setScene({ hologramType: 'atom', currentModel: null, isExploded: false });
        } else if (hologram.type === 'solar_system') {
          setScene({ hologramType: 'solar_system', currentModel: null, isExploded: false });
        } else if (hologram.gltfUrl) {
          setScene({
            hologramType: 'gltf',
            currentModel: hologram.gltfUrl,
            isExploded: false,
          });
        }
      } catch (e) {
        console.error('Hologram build error:', e);
      }
    };

    socket.on('search_result', handleSearchResult);

    socket.on('experiment_result', (data: any) => {
      console.log('🧪 Experiment Result:', data);
      
      // Update knowledge state with experiment data
      setKnowledge({
        query: `Experiment: ${data.shape}`,
        title: `${data.shape.toUpperCase()} SIMULATION`,
        summary: `Running real-time physics and mathematics simulation for ${data.shape}. Generating mathematically accurate 3D model.`,
        domain: 'physics',
        loading: false,
        experiment: {
          shape: data.shape,
          calculations: data.calculations,
          glb_base64: data.glb_base64
        }
      });

      // Convert base64 to Blob URL
      try {
        const byteCharacters = atob(data.glb_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'model/gltf-binary' });
        const blobUrl = URL.createObjectURL(blob);

        // Switch scene to generative GLTF
        setScene({
          hologramType: 'gltf',
          currentModel: blobUrl,
          isExploded: false
        });
        
        ario.speak(`Physics calculation complete. Rendering generated ${data.shape} model based on mathematical parameters.`, true);
      } catch (err) {
        console.error("Error generating blob url from base64", err);
      }
    });

    socket.on('ario_chat_response', (data: any) => {
      console.log('🤖 ARIO Chat Response received.');
      ario.playBase64(data.audio_base64, data.text);
    });

    return () => {
      speechInput.stop();
      wsService.disconnect();
    };
  }, [setKnowledge, setScene, setArio]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* DEMO MODE: ARIA Lab */}
      {demoMode ? (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0e27' }}>
          {/* Top Bar */}
          <div
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.1) 0%, transparent 50%)',
              borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#00f0ff', textShadow: '0 0 10px rgba(0, 240, 255, 0.5)' }}>
              🤖 ARIA Lab — AI Research & Innovation Assistant
            </h1>
            <button
              onClick={() => setDemoMode(false)}
              style={{
                padding: '8px 16px',
                background: 'rgba(255, 0, 255, 0.1)',
                border: '1px solid #ff00ff',
                color: '#ff00ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            >
              Switch to Main App
            </button>
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr 1fr',
              gap: '16px',
              padding: '16px',
              flex: 1,
              overflow: 'hidden',
            }}
          >
            {/* Left Panel: Components */}
            <div
              style={{
                background: 'rgba(10, 14, 39, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                overflow: 'auto',
              }}
            >
              <h3 style={{ color: '#00f0ff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                🔧 Components
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Piston', 'Cylinder', 'Crankshaft', 'Valve', 'Turbo'].map((comp) => (
                  <button
                    key={comp}
                    onClick={() => {
                      ario.speak(`Explaining the ${comp.toLowerCase()}.`);
                      parseCommand(`explain the ${comp.toLowerCase()}`);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 240, 255, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ✓ {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* Center: 3D Workspace */}
            <div
              style={{
                background: 'rgba(10, 14, 39, 0.9)',
                border: '2px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '8px',
                overflow: 'hidden',
                minHeight: '500px',
              }}
            >
              <ExperimentLab />
            </div>

            {/* Right Panel: Results or Instructions */}
            <div
              style={{
                background: 'rgba(10, 14, 39, 0.8)',
                border: '1px solid rgba(0, 240, 255, 0.2)',
                borderRadius: '8px',
                padding: '16px',
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {results ? (
                <ResultsPanel
                  data={results}
                  onRetry={() => setResults(null)}
                  onSave={() => ario.speak('Results saved successfully.')}
                  onCompare={() => ario.speak('Opening comparison view.')}
                />
              ) : (
                <>
                  <h3 style={{ color: '#00f0ff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    📋 Instructions
                  </h3>
                  <div style={{ color: '#b0d4ff', fontSize: '12px', lineHeight: '1.6' }}>
                    <p>
                      <strong>Try these voice commands:</strong>
                    </p>
                    <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
                      <li>"ARIA, show me an engine"</li>
                      <li>"ARIA, explain the piston"</li>
                      <li>"ARIA, run the simulation"</li>
                      <li>"ARIA, add turbo"</li>
                    </ul>
                    <p style={{ marginTop: '16px' }}>
                      <strong>Or click components on the left to learn about them.</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      ario.speak('Starting simulation');
                      parseCommand('run the simulation');
                    }}
                    style={{
                      marginTop: 'auto',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 255, 0.2))',
                      border: '2px solid #00f0ff',
                      color: '#00f0ff',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(255, 0, 255, 0.3))';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 0, 255, 0.2))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    ▶ Run Simulation
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Bottom Bar: Voice Input */}
          <div
            style={{
              padding: '16px 24px',
              background: 'linear-gradient(90deg, transparent 0%, rgba(0, 240, 255, 0.1) 50%)',
              borderTop: '1px solid rgba(0, 240, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ color: '#00f0ff', fontWeight: 'bold' }}>🎤</span>
            <input
              type="text"
              placeholder="Say or type: 'ARIA, show me an engine'"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  parseCommand(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '4px',
                color: '#00f0ff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <span style={{ color: '#b0d4ff', fontSize: '12px' }}>Press Enter or use voice</span>
          </div>
        </div>
      ) : (
        <>
          {/* ORIGINAL APP */}
          {/* 3D Background */}
          <Scene3D />

          {/* Premium Overlays */}
          <div className="fixed inset-0 pointer-events-none z-[1]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.7)_100%)]" />
            <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            <div className="absolute inset-0 scan-overlay opacity-[0.05]" />
          </div>

          {/* UI Overlay */}
          <HolographicHUD videoRef={videoRef} />
        </>
      )}
    </div>
  );
};

export default App;
