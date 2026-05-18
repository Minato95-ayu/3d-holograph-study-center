import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Scanline } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useStudoStore } from '../../store/useStudoStore';
import { ModelLoader } from './ModelLoader';
import { MoleculeRenderer } from './MoleculeRenderer';

// Abstract visual representations for different navigation levels when no specific model is loaded
const AbstractLevelVisual: React.FC<{ level: string }> = ({ level }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useStudoStore();

  useFrame((state) => {
    if (groupRef.current) {
       // Gentle rotation
       groupRef.current.rotation.y += 0.005;
       groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
       
       // Handle simple explosion animation for the abstract visuals
       if (scene.isExploded) {
         groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
       } else {
         groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
       }
    }
  });

  return (
    <group ref={groupRef}>
      {level === 'system' || level === 'organism' ? (
        <group>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[1.2, 1.2, 2.5, 32]} />
            <meshPhongMaterial color={0xff00ff} emissive={0x440044} shininess={100} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshPhongMaterial color={0x00f0ff} emissive={0x004466} shininess={150} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 3, 16]} />
            <meshPhongMaterial color={0x00d0ff} emissive={0x003344} shininess={120} />
          </mesh>
        </group>
      ) : level === 'organ' || level === 'tissue' ? (
        <mesh>
          <icosahedronGeometry args={[1.5, 2]} />
          <meshPhongMaterial color={0xff44aa} wireframe emissive={0x220011} transparent opacity={0.6} />
        </mesh>
      ) : (
        <group>
          <mesh>
            <sphereGeometry args={[1.8, 32, 32]} />
            <meshPhongMaterial color={0x00ff88} transparent opacity={0.3} shininess={200} side={THREE.BackSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.6, 32, 32]} />
            <meshPhongMaterial color={0xff00ff} emissive={0x330033} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export const ExperimentLab: React.FC = () => {
  const { scene, knowledge } = useStudoStore();

  const renderContent = () => {
    // If a specific dynamic model has been loaded (via Gemini / API or UI)
    if (scene.currentModel || scene.hologramType === 'molecule') {
      if (scene.hologramType === 'molecule') {
        return <MoleculeRenderer query={knowledge.query || 'water'} />;
      }
      return <ModelLoader modelPath={scene.currentModel!} />;
    }

    // Otherwise, show the abstract visual based on the navigation level (fallback)
    return <AbstractLevelVisual level={scene.level} />;
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <color attach="background" args={['#0a0e27']} />
        <fog attach="fog" args={['#0a0e27', 5, 15]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} color="#00f0ff" intensity={1.5} castShadow />
        <pointLight position={[-5, 3, -5]} color="#ff00ff" intensity={1} />
        
        <Suspense fallback={
          <mesh rotation={[0.4, 0.4, 0]}>
            <boxGeometry args={[1.2, 1.2, 1.2]} />
            <meshStandardMaterial color="#00f2ff" wireframe />
          </mesh>
        }>
          {renderContent()}
          
          <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} color="#00f0ff" />
          
          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur />
            <Scanline opacity={0.05} />
          </EffectComposer>
        </Suspense>

        <OrbitControls enablePan={false} enableZoom={true} />
      </Canvas>
    </div>
  );
};
