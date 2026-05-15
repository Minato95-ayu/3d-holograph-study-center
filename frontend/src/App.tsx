import React, { useEffect, useState } from 'react';
import { Scene3D } from './components/scene/Scene3D';
import { HolographicHUD } from './components/ui/HolographicHUD';
import { ExperimentLab } from './components/scene/ExperimentLab';
import { ResultsPanel, type ResultsData } from './components/ui/ResultsPanel';
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
  const [, setIsSimulating] = useState(false);

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

    speechInput.onQuery = async (query) => {
      console.log('🎤 ARIO heard search:', query);
      setArio({ state: 'thinking' });
      
      const lang = useStudoStore.getState().ario.language;
      const explanation = await getExplanation(query, 'User initiated search/build request.', lang);

      if (explanation.intent === 'clarification' || !explanation.isReadyToBuild) {
        ario.speak(explanation.text);
        setKnowledge({
          title: 'Awaiting Details',
          summary: explanation.scientificDetail,
          loading: false,
          ario_intro: explanation.text
        });
        return;
      }

      setKnowledge({ loading: true, query });
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

        // Before executing, if it's a show or explain command, check with Gemini if we need clarification
        if (parsedCmd.verb === 'show' || parsedCmd.verb === 'explain') {
          const lang = useStudoStore.getState().ario.language;
          setArio({ state: 'thinking' });
          
          const topic = parsedCmd.object || 'general research';
          const explanation = await getExplanation(topic, `User said: ${command}`, lang);

          if (explanation.intent === 'clarification' || !explanation.isReadyToBuild) {
            console.log('🤔 ARIA needs clarification:', explanation.text);
            ario.speak(explanation.text);
            setKnowledge({
              title: 'ARIA Needs More Info',
              summary: explanation.scientificDetail,
              loading: false,
              ario_intro: explanation.text
            });
            return; // STOP execution here, wait for user input
          }
        }

        executeCommand(parsedCmd, {
          onShow: (obj) => {
            const lang = useStudoStore.getState().ario.language;
            // No need to speak here as getExplanation already did or will handle it
            setKnowledge({ loading: true, query: obj });
            wsService.emit('search', { query: obj });
          },
          onExplain: async (obj) => {
            const lang = useStudoStore.getState().ario.language;
            setArio({ state: 'thinking' });
            const explanation = await getExplanation(obj, undefined, lang);
            ario.speak(explanation.text);
            setKnowledge({
              title: obj.toUpperCase(),
              summary: explanation.scientificDetail,
              formulas: explanation.formulas || [],
              components: explanation.relatedTopics || [],
              ario_intro: explanation.text,
              loading: false
            });
          },
          onLevel: (level) => {
            const lang = useStudoStore.getState().ario.language;
            const msg = lang === 'hi' ? `${level} level par ja raha hoon.` : lang === 'hinglish' ? `${level} level par switch kar raha hoon.` : `Switching to ${level} level.`;
            ario.speak(msg);
            setScene({ level: level as any });
          },
          onRun: async () => {
            setIsSimulating(true);
            const lang = useStudoStore.getState().ario.language;
            const msg = lang === 'hi' ? 'Simulation shuru ho rahi hai.' : lang === 'hinglish' ? 'Simulation start ho rahi hai.' : 'Starting simulation. Running experiment...';
            ario.speak(msg);
            
            // Simulate results after delay
            setTimeout(() => {
              setResults({
                experimentName: 'Multi-Level Structural Analysis',
                metrics: [
                  { label: 'Atomic Stability', value: 98, unit: '%', percentage: 98, color: '#00f0ff', icon: '⚛️' },
                  { label: 'Energy Flux', value: 1240, unit: 'W', percentage: 75, color: '#ff6b00', icon: '⚡' },
                  { label: 'Logic Coherence', value: 94, unit: '%', percentage: 94, color: '#00ff00', icon: '🧠' },
                ],
                explanation: 'Analysis complete. Mathematical logic confirms high structural stability across all levels.',
                suggestions: ['Explore sub-atomic layers', 'Check quantum resonance', 'Optimize molecular bonds'],
                isRunning: false,
              });
              setIsSimulating(false);
              ario.speak('Experiment complete. All systems nominal.', true);
            }, 3000);
          },
          onStop: () => {
            setIsSimulating(false);
            ario.speak('Stopping.');
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

      // Automatically trigger Parallel System Research for complex topics
      if (data.domain !== 'general') {
        wsService.emit('deep_research', { query: data.query });
      }
    };

    socket.on('search_result', handleSearchResult);
    
    socket.on('research_data_packet', (data) => {
      console.log('🧬 Research Packet Received:', data);
      setKnowledge(prev => ({
        ...prev,
        summary: prev.summary + `\n\n[PARALLEL SYSTEM ANALYSIS]\nScientific Papers: ${data.papers.length}\nBlueprints: ${data.assets.length}\n\nTop Data Points:\n- ${data.datapoints.slice(0, 3).join('\n- ')}`,
        components: [...(prev.components || []), ...data.assets.map((a: string) => `Blueprint: ${a.split('/').pop()}`)]
      }));
    });

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
                {(knowledge.components?.length ? knowledge.components : ['Piston', 'Cylinder', 'Crankshaft', 'Valve', 'Turbo']).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => {
                      ario.speak(`Explaining the ${comp.toLowerCase()}.`);
                      wsService.emit('search', { query: comp });
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                    }}
                  >
                    ✓ {comp}
                  </button>
                ))}
              </div>

              {/* Hierarchy Navigator in Demo Mode */}
              <h3 style={{ color: '#00f0ff', margin: '24px 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                📐 Navigation
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {(['system', 'organ', 'tissue', 'cell'] as const).map((lv) => (
                  <button
                    key={lv}
                    onClick={() => setScene({ level: lv })}
                    style={{
                      padding: '6px',
                      background: sceneState.level === lv ? '#00f0ff' : 'transparent',
                      border: '1px solid #00f0ff',
                      color: sceneState.level === lv ? '#000' : '#00f0ff',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {lv.toUpperCase()}
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
                <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
                  <h3 style={{ color: '#00f0ff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>
                    📖 Research context
                  </h3>
                  {knowledge.summary ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <p style={{ color: '#b0d4ff', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>
                        {knowledge.summary.slice(0, 300)}...
                      </p>
                      
                      {knowledge.formulas?.length ? (
                        <div>
                          <h4 style={{ color: '#00f0ff', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>⚡ Formulas</h4>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {knowledge.formulas.map(f => (
                              <span key={f} style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid #00f0ff', color: '#00f0ff', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>{f}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {knowledge.researchPapers?.length ? (
                        <div>
                          <h4 style={{ color: '#00ff88', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase' }}>📚 Papers</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {knowledge.researchPapers.map(p => (
                              <span key={p} style={{ color: '#00ff88', fontSize: '10px', borderLeft: '2px solid #00ff88', paddingLeft: '6px' }}>{p}</span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div style={{ color: '#b0d4ff', fontSize: '12px', lineHeight: '1.6' }}>
                      <p><strong>Try these voice commands:</strong></p>
                      <ul style={{ paddingLeft: '16px', margin: '8px 0' }}>
                        <li>"ARIA, show me a cell"</li>
                        <li>"ARIA, level down"</li>
                        <li>"ARIA, samjhao cell wall"</li>
                        <li>"ARIA, switch to Hindi"</li>
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: '24px', borderTop: '1px solid rgba(0,240,255,0.1)', paddingTop: '16px' }}>
                    <h3 style={{ color: '#ff00ff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold' }}>🌐 Language</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['en', 'hi', 'hinglish'].map(l => (
                        <button
                          key={l}
                          onClick={() => setArio({ language: l as any })}
                          style={{
                            flex: 1,
                            padding: '6px',
                            background: useStudoStore.getState().ario.language === l ? '#ff00ff' : 'transparent',
                            border: '1px solid #ff00ff',
                            color: useStudoStore.getState().ario.language === l ? '#000' : '#ff00ff',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                          }}
                        >
                          {l.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
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
                  const val = e.currentTarget.value;
                  e.currentTarget.value = '';
                  // Manually trigger the command handler to ensure clarification logic runs
                  speechInput.onCommand?.(val);
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
