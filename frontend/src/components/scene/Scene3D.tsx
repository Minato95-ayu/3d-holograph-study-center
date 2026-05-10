import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { ModelLoader } from './ModelLoader';
import { useStudoStore } from '../../store/useStudoStore';
import { EffectComposer, Bloom, ChromaticAberration, Glitch, Scanline, Noise } from '@react-three/postprocessing';
import { Vector2 } from 'three';

export const Scene3D = () => {
  const { scene } = useStudoStore();

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: false }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
          
          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00f2ff" />
 
          {/* Dynamic Model Loader */}
          <Suspense fallback={<mesh><boxGeometry /><meshStandardMaterial color="#00f2ff" wireframe /></mesh>}>
             <ModelLoader modelPath={scene.currentModel || "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb"} />
          </Suspense>

          <ContactShadows 
            opacity={0.4} 
            scale={10} 
            blur={2.4} 
            far={4.5} 
            resolution={256} 
            color="#000000" 
          />

          {/* Holographic Post-Processing Effects */}
          <EffectComposer disableNormalPass>
            <Bloom 
              intensity={1.5} 
              luminanceThreshold={0.1} 
              luminanceSmoothing={0.9} 
              mipmapBlur 
            />
            <ChromaticAberration 
              offset={new Vector2(0.002, 0.002)} 
            />
            <Scanline opacity={0.1} />
            <Noise opacity={0.05} />
            {scene.isExploded && (
              <Glitch 
                delay={new Vector2(1.5, 3.5)} 
                duration={new Vector2(0.1, 0.3)} 
                strength={new Vector2(0.1, 0.3)} 
              />
            )}
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
};
