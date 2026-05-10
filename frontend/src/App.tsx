import React, { useEffect } from 'react';
import { Scene3D } from './components/scene/Scene3D';
import { HolographicHUD } from './components/ui/HolographicHUD';
import { useMediaPipe } from './hooks/useMediaPipe';
import { wsService } from './lib/websocket';
import { useStudoStore } from './store/useStudoStore';

const App: React.FC = () => {
  const { videoRef } = useMediaPipe();
  const setKnowledge = useStudoStore((state) => state.setKnowledge);
  const setScene = useStudoStore((state) => state.setScene);

  useEffect(() => {
    const socket = wsService.connect();

    socket.on("welcome", (data) => console.log(data.message));

    const handleSearchResult = (data: any) => {
      console.log("🔍 Search Result:", data);
      setKnowledge({ summary: data.summary, query: data.query, loading: false });
      
      // Dynamic Model Swapping based on query keywords
      const query = data.query.toLowerCase();
      let modelUrl = "";
      
      if (query.includes("heart") || query.includes("human body")) {
        modelUrl = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/anatomy-heart/model.gltf";
      } else if (query.includes("engine") || query.includes("car")) {
        modelUrl = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/engine/model.gltf";
      } else if (query.includes("drone") || query.includes("technology")) {
        modelUrl = "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/drone/model.gltf";
      } else if (query.includes("dna") || query.includes("biology")) {
        modelUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb"; // Placeholder for DNA
      }

      if (modelUrl) {
        console.log("🚀 Swapping model to:", modelUrl);
        setScene({ currentModel: modelUrl, isExploded: false });
      }
    };

    socket.on("search_result", handleSearchResult);

    return () => wsService.disconnect();
  }, [setKnowledge, setScene]);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black relative">
      {/* 3D Background */}
      <Scene3D />

      {/* UI Overlay */}
      <HolographicHUD videoRef={videoRef} />

      {/* Premium Overlays */}
      <div className="fixed inset-0 pointer-events-none z-[1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,6,23,0.7)_100%)]" />
        <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute inset-0 scan-overlay opacity-[0.05]" />
      </div>
    </div>
  );
};

export default App;
