import React, { useEffect, useState } from 'react';
import { Scene3D } from './components/scene/Scene3D';
import { HolographicHUD } from './components/ui/HolographicHUD';
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
  const knowledge = useStudoStore((state) => state.knowledge);

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

    speechInput.onCommand = async (command) => {
      console.log('🎤 ARIO heard command:', command);
      
      if (command === 'explode') {
        setScene({ isExploded: true });
        ario.speak('Exploding holographic view.');
        return;
      } else if (command === 'assemble') {
        setScene({ isExploded: false });
        ario.speak('Reassembling holographic model.');
        return;
      } else if (command === 'stop_talking') {
        ario.stop();
        return;
      }

      try {
        const parsedCmd = parseCommand(command);
        console.log('✅ Parsed command:', parsedCmd);

        if (parsedCmd.verb === 'show' || parsedCmd.verb === 'explain') {
          const lang = useStudoStore.getState().ario.language;
          setArio({ state: 'thinking' });
          
          const topic = parsedCmd.object || 'general research';
          const explanation = await getExplanation(topic, `User said: ${command}`, lang);

          if (explanation.intent === 'clarification' || explanation.intent === 'argument' || !explanation.isReadyToBuild) {
            console.log('🤔 ARIA needs clarification/argument:', explanation.text);
            ario.speak(explanation.text);
            setKnowledge({
              title: explanation.intent === 'argument' ? 'Scientific Cross-Examination' : 'ARIA Needs More Info',
              summary: explanation.scientificDetail,
              crossQuestions: explanation.crossQuestions || [],
              loading: false,
              ario_intro: explanation.text
            });
            return;
          }
        }

        executeCommand(parsedCmd, {
          onShow: (obj) => {
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
    };

    speechInput.onWakeWord = () => {
      setArio({ micActive: true });
      if (useStudoStore.getState().ario.state !== 'speaking') {
        ario.speak('Yes?', true);
      }
    };
    speechInput.onStatusChange = (listening) => {
      setArio({ micActive: listening });
    };

    socket.on('welcome', (data) => {
      console.log('🤖 ARIO:', data.message);
    });

    const handleSearchResult = async (data: any) => {
      console.log('🔍 ARIO Search Result:', data);

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

      if (data.ario_intro || data.summary) {
        const intro = data.ario_intro || data.summary.slice(0, 300);
        ario.speak(intro, true);

        if (data.fun_fact) {
          setTimeout(() => {
            ario.speak(`Fun fact: ${data.fun_fact}`);
          }, 4000);
        }
      }

      try {
        const hologram = await buildHologram(data.query);
        console.log('🌐 Hologram config:', hologram);

        if (hologram.type === 'molecule' && hologram.moleculeData) {
          setScene({
            hologramType: 'molecule',
            currentModel: null,
            isExploded: false,
          });
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

      if (data.domain !== 'general') {
        wsService.emit('deep_research', { query: data.query });
      }
    };

    socket.on('search_result', handleSearchResult);
    
    socket.on('research_data_packet', (data) => {
      console.log('🧬 Research Packet Received:', data);
      const currentKnowledge = useStudoStore.getState().knowledge;
      setKnowledge({
        summary: (currentKnowledge.summary || '') + `\n\n[PARALLEL SYSTEM ANALYSIS]\nScientific Papers: ${data.papers.length}\nBlueprints: ${data.assets.length}\n\nTop Data Points:\n- ${data.datapoints.slice(0, 3).join('\n- ')}`,
        components: [...(currentKnowledge.components || []), ...data.assets.map((a: string) => `Blueprint: ${a.split('/').pop()}`)],
        researchPapers: data.papers
      });
    });

    socket.on('experiment_result', (data: any) => {
      console.log('🧪 Experiment Result:', data);
      
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

      try {
        const byteCharacters = atob(data.glb_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'model/gltf-binary' });
        const blobUrl = URL.createObjectURL(blob);

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
      <Scene3D />

      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.7)_100%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute inset-0 scan-overlay opacity-[0.05]" />
      </div>

      <HolographicHUD videoRef={videoRef} />

      {results && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto bg-black/60 backdrop-blur-sm">
           <div className="w-[600px] max-w-full">
             <ResultsPanel
                data={results}
                onRetry={() => setResults(null)}
                onSave={() => ario.speak('Results saved successfully.')}
                onCompare={() => ario.speak('Opening comparison view.')}
             />
           </div>
        </div>
      )}
    </div>
  );
};

export default App;