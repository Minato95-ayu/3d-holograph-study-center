import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CPK_COLORS, ATOM_RADII, type MoleculeData, fetchMolecule3D } from '../../lib/hologramEngine';
import { useStudoStore } from '../../store/useStudoStore';

interface MoleculeRendererProps {
  query: string;
}

export const MoleculeRenderer: React.FC<MoleculeRendererProps> = ({ query }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null);
  const { scene, gestures } = useStudoStore();
  const prevPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMoleculeData(null);
    fetchMolecule3D(query).then((data) => {
      if (data) setMoleculeData(data);
    });
  }, [query]);

  useFrame((state) => {
    if (!groupRef.current) return;
    if (gestures.active && gestures.handPosition) {
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

      if (gestures.type === 'PINCH') {
        const targetScale = 1.0 + (1 - gestures.confidence) * 1.5;
        groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      }
    } else {
      groupRef.current.rotation.y += 0.005;
      prevPos.current = null;
      groupRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
    }
    if (scene.isSimulating) {
      groupRef.current.rotation.y += 0.05;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 5) * 0.1;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.2;
    } else {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
    }
  });

  if (!moleculeData) {
    // Loading placeholder: spinning wireframe cube
    return (
      <mesh rotation={[0.5, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#00f2ff" wireframe opacity={0.3} transparent />
      </mesh>
    );
  }

  // Normalize atom positions to fit in scene
  const xs = moleculeData.atoms.map(a => a.x);
  const ys = moleculeData.atoms.map(a => a.y);
  const zs = moleculeData.atoms.map(a => a.z);
  const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const centerZ = (Math.max(...zs) + Math.min(...zs)) / 2;
  const maxRange = Math.max(
    Math.max(...xs) - Math.min(...xs),
    Math.max(...ys) - Math.min(...ys),
    Math.max(...zs) - Math.min(...zs),
    1
  );
  const scale = 3.5 / maxRange;

  const atomPositions = moleculeData.atoms.map(a => ({
    ...a,
    nx: (a.x - centerX) * scale,
    ny: (a.y - centerY) * scale,
    nz: (a.z - centerZ) * scale,
  }));

  return (
    <group ref={groupRef}>
      {/* Atoms */}
      {atomPositions.map((atom, i) => {
        const color = CPK_COLORS[atom.element] || CPK_COLORS.default;
        const radius = (ATOM_RADII[atom.element] || ATOM_RADII.default) * 0.6;
        const explodeOffset = scene.isExploded ? 0.8 : 0;

        return (
          <mesh
            key={`atom-${i}`}
            position={[
              atom.nx + (scene.isExploded ? (atom.nx / Math.max(Math.abs(atom.nx), 0.1)) * explodeOffset : 0),
              atom.ny + (scene.isExploded ? (atom.ny / Math.max(Math.abs(atom.ny), 0.1)) * explodeOffset : 0),
              atom.nz,
            ]}
          >
            <sphereGeometry args={[radius, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Bonds */}
      {!scene.isExploded && moleculeData.bonds.map((bond, i) => {
        const a1 = atomPositions[bond.atom1];
        const a2 = atomPositions[bond.atom2];
        if (!a1 || !a2) return null;

        const start = new THREE.Vector3(a1.nx, a1.ny, a1.nz);
        const end = new THREE.Vector3(a2.nx, a2.ny, a2.nz);
        const dir = end.clone().sub(start);
        const length = dir.length();
        const mid = start.clone().add(end).multiplyScalar(0.5);

        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

        return (
          <mesh key={`bond-${i}`} position={mid} quaternion={quaternion}>
            <cylinderGeometry args={[0.04, 0.04, length, 8]} />
            <meshStandardMaterial
              color="#c0e8ff"
              emissive="#00f2ff"
              emissiveIntensity={0.15}
              transparent
              opacity={0.7}
              roughness={0.4}
            />
          </mesh>
        );
      })}

      {/* Holographic glow sphere */}
      <mesh>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshStandardMaterial color="#00f2ff" transparent opacity={0.02} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};
