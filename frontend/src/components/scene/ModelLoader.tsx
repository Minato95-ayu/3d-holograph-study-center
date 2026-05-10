import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useStudoStore } from '../../store/useStudoStore';

interface ModelLoaderProps {
  modelPath: string;
}

export const ModelLoader: React.FC<ModelLoaderProps> = ({ modelPath }) => {
  const { scene, setScene, gestures } = useStudoStore();
  const { scene: gltfScene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const prevPos = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    if (gltfScene) {
      setScene({ modelLoaded: true, currentModel: modelPath });
    }
  }, [gltfScene, modelPath, setScene]);

  useFrame((state) => {
    if (groupRef.current) {
      // 1. Gesture-Based Control
      if (gestures.active && gestures.handPosition) {
        // GRAB -> Rotate
        if (gestures.type === 'GRAB') {
          if (prevPos.current) {
            const dx = gestures.handPosition.x - prevPos.current.x;
            const dy = gestures.handPosition.y - prevPos.current.y;
            groupRef.current.rotation.y += dx * 5;
            groupRef.current.rotation.x += dy * 5;
          }
          prevPos.current = { x: gestures.handPosition.x, y: gestures.handPosition.y };
        } else {
          prevPos.current = null;
        }

        // PINCH -> Zoom (Scale)
        if (gestures.type === 'PINCH') {
           const targetScale = 1.5 + (1 - gestures.confidence) * 2; // Simple scale mapping
           groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
        }

        // SPREAD -> Explode
        if (gestures.type === 'SPREAD' && !scene.isExploded) {
           setScene({ isExploded: true });
        }
      } else {
        // Auto-rotation if no hand
        groupRef.current.rotation.y += 0.002;
        prevPos.current = null;
      }

      // 2. Gentle floating animation
      groupRef.current.position.y = (Math.sin(state.clock.elapsedTime * 0.5) * 0.1) - 0.5;

      // 3. Explosion Logic
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (!child.userData.originalPos) {
            child.userData.originalPos = child.position.clone();
            const direction = child.position.length() > 0.1 
              ? child.position.clone().normalize() 
              : new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
            child.userData.explosionDir = direction;
          }

          const explosionFactor = 3;
          const targetPos = scene.isExploded 
            ? child.userData.originalPos.clone().add(child.userData.explosionDir.clone().multiplyScalar(explosionFactor)) 
            : child.userData.originalPos;
          
          child.position.lerp(targetPos, 0.05);
        }
      });
    }
  });

  return (
    <group 
      ref={groupRef}
      scale={scene.modelLoaded ? 1.5 : 0}
      visible={scene.modelLoaded}
      position={[0, -0.5, 0]}
    >
      <Clone 
        object={gltfScene} 
        castShadow 
        receiveShadow 
      />
    </group>
  );
};

// Preload models
// useGLTF.preload('/models/engine.glb');
