import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import { ModelLoader } from './ModelLoader';
import { MoleculeRenderer } from './MoleculeRenderer';
import { useStudoStore } from '../../store/useStudoStore';
import {
  EffectComposer, Bloom, ChromaticAberration, Glitch, Scanline, Noise,
} from '@react-three/postprocessing';
import { Vector2 } from 'three';

const DEFAULT_MODEL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb';

const LoadingBox = () => (
  <mesh rotation={[0.4, 0.4, 0]}>
    <boxGeometry args={[1.2, 1.2, 1.2]} />
    <meshStandardMaterial color="#00f2ff" wireframe />
  </mesh>
);

export const Scene3D = () => {
  const { scene, knowledge } = useStudoStore();

  const renderHologram = () => {
    switch (scene.hologramType) {
      case 'molecule':
        return (
          <Suspense fallback={<LoadingBox />}>
            <MoleculeRenderer query={knowledge.query || 'water'} />
          </Suspense>
        );
      case 'dna':
      case 'atom':
      case 'solar_system':
        // These will be implemented in next phase — show gltf for now
        return (
          <Suspense fallback={<LoadingBox />}>
            <ModelLoader
              modelPath={scene.currentModel || DEFAULT_MODEL}
            />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingBox />}>
            <ModelLoader
              modelPath={scene.currentModel || DEFAULT_MODEL}
            />
          </Suspense>
        );
    }
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: false }}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

          <ambientLight intensity={1.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={1.5} color="#00f2ff" />
          <pointLight position={[0, 5, 0]} intensity={0.8} color="#a855f7" />

          {renderHologram()}

          <ContactShadows
            opacity={0.4} scale={10} blur={2.4} far={4.5}
            resolution={256} color="#000000"
          />

          <EffectComposer disableNormalPass>
            <Bloom
              intensity={scene.hologramType === 'molecule' ? 2.5 : 1.5}
              luminanceThreshold={0.1}
              luminanceSmoothing={0.9}
              mipmapBlur
            />
            <ChromaticAberration offset={new Vector2(0.002, 0.002)} />
            <Scanline opacity={0.08} />
            <Noise opacity={0.04} />
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
