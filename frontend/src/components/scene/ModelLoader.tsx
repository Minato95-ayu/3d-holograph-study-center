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
  const initRef = useRef(false);

  useEffect(() => {
    if (gltfScene) {
      setScene({ modelLoaded: true, currentModel: modelPath });
      initRef.current = false; // Reset init flag when new model loads
    }
  }, [gltfScene, modelPath, setScene]);

  useFrame((state) => {
    if (groupRef.current) {
      // 0. Initialize explosion data once per model
      if (!initRef.current) {
        const box = new THREE.Box3().setFromObject(groupRef.current);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Convert global center to local space of the group
        groupRef.current.worldToLocal(center);

        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Save original local position
            if (!child.userData.originalPos) {
              child.userData.originalPos = child.position.clone();
            }
            
            // Calculate center of this specific mesh
            child.geometry.computeBoundingBox();
            const meshCenter = new THREE.Vector3();
            if (child.geometry.boundingBox) {
              child.geometry.boundingBox.getCenter(meshCenter);
            }
            
            // Vector from object center to mesh center
            const direction = new THREE.Vector3().subVectors(meshCenter, center);
            
            // If direction is basically zero (mesh is at center), give it a random outward push or up push
            if (direction.lengthSq() < 0.001) {
              direction.set(Math.random() - 0.5, Math.random(), Math.random() - 0.5);
            }
            
            direction.normalize();
            child.userData.explosionDir = direction;
          }
        });
        initRef.current = true;
      }

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
        } else {
           // Revert to normal scale if not pinching
           groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
        }
      } else {
        // Auto-rotation if no hand
        groupRef.current.rotation.y += 0.002;
        prevPos.current = null;
        groupRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      }

      // 2. Gentle floating animation or active simulation physics
      if (scene.isSimulating) {
        // Active "Run Simulation" state: rotate faster and bounce more vigorously
        groupRef.current.rotation.y += 0.02;
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.05;
        groupRef.current.position.y = (Math.sin(state.clock.elapsedTime * 5) * 0.3) - 0.5;
      } else {
        // Normal gentle float
        groupRef.current.position.y = (Math.sin(state.clock.elapsedTime * 0.5) * 0.1) - 0.5;
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
      }

      // 3. Explosion Logic
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.userData.originalPos && child.userData.explosionDir) {
          // You can adjust explosionFactor based on model size or dynamically
          const explosionFactor = 2.5; 
          const targetPos = scene.isExploded 
            ? child.userData.originalPos.clone().add(child.userData.explosionDir.clone().multiplyScalar(explosionFactor)) 
            : child.userData.originalPos;
          
          child.position.lerp(targetPos, 0.08); // Smooth interpolation
          
          // Optional: Add slight rotation to parts when exploded
          if (!child.userData.originalQuat) {
              child.userData.originalQuat = child.quaternion.clone();
          }
          if (scene.isExploded) {
              const targetQuat = child.userData.originalQuat.clone().multiply(new THREE.Quaternion().setFromAxisAngle(child.userData.explosionDir, Math.sin(state.clock.elapsedTime) * 0.2));
              child.quaternion.slerp(targetQuat, 0.05);
          } else {
              child.quaternion.slerp(child.userData.originalQuat, 0.08);
          }
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
