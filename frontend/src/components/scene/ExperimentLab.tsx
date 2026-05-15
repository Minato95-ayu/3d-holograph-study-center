import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ExperimentLab: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const engineGroupRef = useRef<THREE.Group | null>(null);
  const [selectedPart, setSelectedPart] = useState<THREE.Object3D | null>(null);
  const [hoveredPart, setHoveredPart] = useState<THREE.Object3D | null>(null);
  const { scene: sceneState } = useStudoStore();
  const level = sceneState.level;

  useEffect(() => {
    if (!mountRef.current) return;

    // =====================================
    // 1. SETUP SCENE
    // =====================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e27); // Dark space blue
    scene.fog = new THREE.Fog(0x0a0e27, 100, 500);
    sceneRef.current = scene;

    // =====================================
    // 2. SETUP CAMERA
    // =====================================
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    camera.position.y = 1;
    cameraRef.current = camera;

    // =====================================
    // 3. SETUP RENDERER
    // =====================================
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // =====================================
    // 4. SETUP LIGHTING
    // =====================================
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main point light - cyan
    const mainLight = new THREE.PointLight(0x00f0ff, 1.5, 50);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Secondary light - magenta
    const secondaryLight = new THREE.PointLight(0xff00ff, 1, 40);
    secondaryLight.position.set(-5, 3, -5);
    scene.add(secondaryLight);

    // =====================================
    // 5. CREATE CONTENT BASED ON LEVEL
    // =====================================
    const contentGroup = new THREE.Group();
    engineGroupRef.current = contentGroup;
    scene.add(contentGroup);

    if (level === 'system' || level === 'organism') {
      // ENGINE MODEL (Standard view)
      const cylinderGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
      const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0x440044, shininess: 100 });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.name = 'cylinder';
      contentGroup.add(cylinder);

      const pistonGeometry = new THREE.SphereGeometry(0.4, 32, 32);
      const pistonMaterial = new THREE.MeshPhongMaterial({ color: 0x00f0ff, emissive: 0x004466, shininess: 150 });
      const piston = new THREE.Mesh(pistonGeometry, pistonMaterial);
      piston.position.y = 1.8;
      piston.name = 'piston';
      contentGroup.add(piston);

      const crankshaftGeometry = new THREE.CylinderGeometry(0.25, 0.25, 3, 16);
      const crankshaftMaterial = new THREE.MeshPhongMaterial({ color: 0x00d0ff, emissive: 0x003344, shininess: 120 });
      const crankshaft = new THREE.Mesh(crankshaftGeometry, crankshaftMaterial);
      crankshaft.rotation.z = Math.PI / 2;
      crankshaft.name = 'crankshaft';
      contentGroup.add(crankshaft);
    } 
    else if (level === 'organ' || level === 'tissue') {
      // TISSUE/STRUCTURE MODEL (Abstract biological/mechanical structure)
      const structureGeometry = new THREE.IcosahedronGeometry(1.5, 2);
      const structureMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff44aa, 
        wireframe: true,
        emissive: 0x220011,
        transparent: true,
        opacity: 0.6
      });
      const structure = new THREE.Mesh(structureGeometry, structureMaterial);
      structure.name = 'tissue-layer';
      contentGroup.add(structure);

      // Add "internal" components
      for (let i = 0; i < 8; i++) {
        const component = new THREE.Mesh(
          new THREE.SphereGeometry(0.3, 16, 16),
          new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x003333 })
        );
        component.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(2);
        component.name = `sub-component-${i}`;
        contentGroup.add(component);
      }
    }
    else if (level === 'cell') {
      // UNIT CELL MODEL
      const cellGeometry = new THREE.SphereGeometry(1.8, 32, 32);
      const cellMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x00ff88, 
        transparent: true, 
        opacity: 0.3,
        shininess: 200,
        side: THREE.BackSide
      });
      const cellWall = new THREE.Mesh(cellGeometry, cellMaterial);
      cellWall.name = 'unit-cell-wall';
      contentGroup.add(cellWall);

      // Nucleus / Core
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0xff00ff, emissive: 0x330033 })
      );
      nucleus.name = 'nucleus';
      contentGroup.add(nucleus);

      // DNA / Data Strands
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, -1, 0),
        new THREE.Vector3(-0.5, 0.5, 0.5),
        new THREE.Vector3(0.5, -0.5, -0.5),
        new THREE.Vector3(1, 1, 0),
      ]);
      const dnaGeom = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
      const dnaMat = new THREE.MeshPhongMaterial({ color: 0x00f0ff });
      const dna = new THREE.Mesh(dnaGeom, dnaMat);
      dna.name = 'core-data-strand';
      contentGroup.add(dna);
    }

    // =====================================
    // 6. ADD GROUND PLANE
    // =====================================
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f1a3d,
      metalness: 0.3,
      roughness: 0.7,
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2;
    ground.receiveShadow = true;
    scene.add(ground);

    // =====================================
    // 7. MOUSE/RAYCASTER SETUP
    // =====================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const originalMaterials = new Map<THREE.Object3D, THREE.Material | THREE.Material[]>();

    // Store original materials
    engineGroup.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        originalMaterials.set(child, child.material);
      }
    });

    // =====================================
    // 8. EVENT LISTENERS
    // =====================================

    // Mouse move for hover effect
    const onMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(engineGroup.children);

      // Reset previous hover
      if (hoveredPart && hoveredPart instanceof THREE.Mesh) {
        const originalMat = originalMaterials.get(hoveredPart);
        if (originalMat) {
          hoveredPart.material = originalMat;
        }
      }

      // Highlight new hover
      if (intersects.length > 0) {
        const hovered = intersects[0].object;
        setHoveredPart(hovered);

        if (hovered instanceof THREE.Mesh) {
          const hoverMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x009900,
            shininess: 200,
          });
          hovered.material = hoverMaterial;
        }
      } else {
        setHoveredPart(null);
      }
    };

    // Mouse click for selection
    const onMouseClick = (event: MouseEvent) => {
      if (!mountRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(engineGroup.children);

      if (intersects.length > 0) {
        const clicked = intersects[0].object;
        setSelectedPart(clicked);
        console.log(`🔧 Selected: ${clicked.name}`);

        // Dispatch custom event for other components
        window.dispatchEvent(
          new CustomEvent('part-selected', {
            detail: { partName: clicked.name, object: clicked },
          })
        );

        // Highlight selected
        if (clicked instanceof THREE.Mesh) {
          const selectMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0xffaa00,
            shininess: 200,
          });
          clicked.material = selectMaterial;
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onMouseClick);

    // =====================================
    // 9. ANIMATION LOOP
    // =====================================
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Auto-rotate engine
      engineGroup.rotation.y += 0.005;
      engineGroup.rotation.x += 0.001;

      // Animate piston (up and down motion)
      const pistonMesh = engineGroup.children.find((child) => child.name === 'piston');
      if (pistonMesh) {
        pistonMesh.position.y = 1.8 + Math.sin(Date.now() * 0.005) * 0.4;
      }

      // Rotate crankshaft
      const crankshaftMesh = engineGroup.children.find((child) => child.name === 'crankshaft');
      if (crankshaftMesh) {
        crankshaftMesh.rotation.z += 0.02;
      }

      // Animate valves (open/close)
      const valveInlet = engineGroup.children.find((child) => child.name === 'valve-inlet');
      const valveExhaust = engineGroup.children.find((child) => child.name === 'valve-exhaust');
      if (valveInlet && valveExhaust) {
        const valveOpen = Math.sin(Date.now() * 0.008) * 0.3;
        valveInlet.position.y = 1.8 + valveOpen;
        valveExhaust.position.y = 1.8 - valveOpen;
      }

      renderer.render(scene, camera);
    };

    animate();

    // =====================================
    // 10. WINDOW RESIZE HANDLER
    // =====================================
    const onWindowResize = () => {
      if (!mountRef.current) return;

      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;

      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
      }

      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', onWindowResize);

    // =====================================
    // 11. CLEANUP
    // =====================================
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onWindowResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onMouseClick);

      // Dispose resources
      cylinderGeometry.dispose();
      cylinderMaterial.dispose();
      pistonGeometry.dispose();
      pistonMaterial.dispose();
      crankshaftGeometry.dispose();
      crankshaftMaterial.dispose();
      valveGeometry.dispose();
      valveMaterial.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      renderer.dispose();

      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '8px',
        border: '2px solid #00f0ff',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1)',
      }}
    >
      {/* Tooltip for selected part */}
      {selectedPart && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(10, 14, 39, 0.9)',
            border: '1px solid #00f0ff',
            padding: '12px 16px',
            borderRadius: '6px',
            color: '#00f0ff',
            fontSize: '14px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.5)',
          }}
        >
          🔧 {selectedPart.name}
        </div>
      )}
    </div>
  );
};
