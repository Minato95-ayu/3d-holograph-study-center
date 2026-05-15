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
    // 5. CREATE ENGINE GROUP (Main Model)
    // =====================================
    const engineGroup = new THREE.Group();
    engineGroup.name = 'engine';
    engineGroupRef.current = engineGroup;

    // CYLINDER (Main body)
    const cylinderGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2.5, 32);
    const cylinderMaterial = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
      emissive: 0x440044,
      shininess: 100,
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.name = 'cylinder';
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;
    engineGroup.add(cylinder);

    // PISTON (Moves up/down)
    const pistonGeometry = new THREE.SphereGeometry(0.4, 32, 32);
    const pistonMaterial = new THREE.MeshPhongMaterial({
      color: 0x00f0ff,
      emissive: 0x004466,
      shininess: 150,
    });
    const piston = new THREE.Mesh(pistonGeometry, pistonMaterial);
    piston.position.y = 1.8;
    piston.name = 'piston';
    piston.castShadow = true;
    piston.receiveShadow = true;
    engineGroup.add(piston);

    // CRANKSHAFT (Rotating horizontal shaft)
    const crankshaftGeometry = new THREE.CylinderGeometry(0.25, 0.25, 3, 16);
    const crankshaftMaterial = new THREE.MeshPhongMaterial({
      color: 0x00d0ff,
      emissive: 0x003344,
      shininess: 120,
    });
    const crankshaft = new THREE.Mesh(crankshaftGeometry, crankshaftMaterial);
    crankshaft.rotation.z = Math.PI / 2;
    crankshaft.name = 'crankshaft';
    crankshaft.castShadow = true;
    crankshaft.receiveShadow = true;
    engineGroup.add(crankshaft);

    // VALVES (Top)
    const valveGeometry = new THREE.BoxGeometry(0.3, 0.6, 0.3);
    const valveMaterial = new THREE.MeshPhongMaterial({
      color: 0xff6600,
      emissive: 0x663300,
      shininess: 80,
    });
    const valve1 = new THREE.Mesh(valveGeometry, valveMaterial);
    valve1.position.set(0.8, 1.8, 0.8);
    valve1.name = 'valve-inlet';
    valve1.castShadow = true;
    engineGroup.add(valve1);

    const valve2 = new THREE.Mesh(valveGeometry, valveMaterial);
    valve2.position.set(-0.8, 1.8, 0.8);
    valve2.name = 'valve-exhaust';
    valve2.castShadow = true;
    engineGroup.add(valve2);

    scene.add(engineGroup);

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
