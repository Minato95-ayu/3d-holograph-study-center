import React, { useEffect } from 'react';
import { Scene3D } from './components/scene/Scene3D';
import { HolographicHUD } from './components/ui/HolographicHUD';
import { useMediaPipe } from './hooks/useMediaPipe';
import { wsService } from './lib/websocket';
import { useStudoStore } from './store/useStudoStore';
import { ario } from './lib/ario';
import { speechInput } from './lib/speechInput';
import { buildHologram } from './lib/hologramEngine';

const App: React.FC = () => {
  const { videoRef } = useMediaPipe();
  const setKnowledge = useStudoStore((state) => state.setKnowledge);
  const setScene = useStudoStore((state) => state.setScene);
  const setArio = useStudoStore((state) => state.setArio);

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
    </div>
  );
};

export default App;
