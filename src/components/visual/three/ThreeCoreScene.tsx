import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCoreSceneProps {
  cameraYaw: number;   // -50 to 50
  cameraPitch: number; // -25 to 25
  cameraPosZ: number;  // -50 to 180
  activeStep: 1 | 2 | 3;
  subsystems: { memory: boolean; perception: boolean; command: boolean };
  onSelectHotspot: (step: 1 | 2 | 3) => void;
}

export const ThreeCoreScene: React.FC<ThreeCoreSceneProps> = ({
  cameraYaw,
  cameraPitch,
  cameraPosZ,
  activeStep,
  subsystems,
  onSelectHotspot,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const coreLightRef = useRef<THREE.PointLight | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Synchronize camera orientation with props
  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.rotation.y = THREE.MathUtils.degToRad(-cameraYaw);
    cameraRef.current.rotation.x = THREE.MathUtils.degToRad(-cameraPitch);
    cameraRef.current.position.z = 8 - (cameraPosZ / 100) * 4;
  }, [cameraYaw, cameraPitch, cameraPosZ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.zIndex = '5';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020406);

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);
    cameraRef.current = camera;

    // ─── Chamber Lighting ───────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x0a1418, 1.2);
    scene.add(ambientLight);

    const coreLight = new THREE.PointLight(
      subsystems.memory && subsystems.command ? 0x00ff88 : 0xd90429,
      3.2,
      25,
      1.5
    );
    coreLight.position.set(0, 0, 0);
    scene.add(coreLight);
    coreLightRef.current = coreLight;

    // ─── Chamber Cube Textures ──────────────────────────────────────────────
    const loader = new THREE.TextureLoader();
    const loadTex = (url: string) => {
      const tex = loader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };

    const frontTex = loadTex('/assets/level5_core.jpg');
    const roofTex = loadTex('/assets/level5_roof.jpg');
    const floorTex = loadTex('/assets/level5_floor.jpg');
    const leftTex = loadTex('/assets/level5_left.jpg');
    const rightTex = loadTex('/assets/level5_right.jpg');

    // 5-sided Room Chamber Box (Inverted Inside-Out)
    const roomGeo = new THREE.BoxGeometry(24, 16, 24);
    const roomMats = [
      new THREE.MeshStandardMaterial({ map: rightTex, side: THREE.BackSide, roughness: 0.8 }), // +X (Right)
      new THREE.MeshStandardMaterial({ map: leftTex, side: THREE.BackSide, roughness: 0.8 }),  // -X (Left)
      new THREE.MeshStandardMaterial({ map: roofTex, side: THREE.BackSide, roughness: 0.9 }),  // +Y (Roof)
      new THREE.MeshStandardMaterial({ map: floorTex, side: THREE.BackSide, roughness: 0.7 }), // -Y (Floor)
      new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.BackSide }),               // +Z (Rear)
      new THREE.MeshStandardMaterial({ map: frontTex, side: THREE.BackSide, roughness: 0.7 }), // -Z (Front Center)
    ];

    const roomMesh = new THREE.Mesh(roomGeo, roomMats);
    roomMesh.position.set(0, 0, 0);
    scene.add(roomMesh);

    // ─── Central Glowing Monolith Pillar & Rotating Particle Ring ───────────
    const pillarGeo = new THREE.CylinderGeometry(0.85, 1.15, 6, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x050a0f,
      roughness: 0.4,
      metalness: 0.8,
      wireframe: false,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.set(0, -1, -5);
    scene.add(pillar);

    // Floating Core Orbiting Energy Rings
    const ringGeo = new THREE.TorusGeometry(1.6, 0.04, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.7,
      wireframe: true,
    });
    const energyRing = new THREE.Mesh(ringGeo, ringMat);
    energyRing.position.set(0, 0.8, -5);
    scene.add(energyRing);

    // ─── Interactive 3D Hitbox Volumes for Clues ────────────────────────────
    const hitboxes: { mesh: THREE.Mesh; step: 1 | 2 | 3 }[] = [];

    // Clue 1: Center Oscilloscope
    const c1Geo = new THREE.BoxGeometry(3.5, 3, 2);
    const c1Mat = new THREE.MeshBasicMaterial({ visible: false });
    const c1Mesh = new THREE.Mesh(c1Geo, c1Mat);
    c1Mesh.position.set(0, 0.5, -9);
    scene.add(c1Mesh);
    hitboxes.push({ mesh: c1Mesh, step: 1 });

    // Clue 2: Left Memory Bank
    const c2Geo = new THREE.BoxGeometry(4, 5, 4);
    const c2Mat = new THREE.MeshBasicMaterial({ visible: false });
    const c2Mesh = new THREE.Mesh(c2Geo, c2Mat);
    c2Mesh.position.set(-8.5, -1, -4);
    scene.add(c2Mesh);
    hitboxes.push({ mesh: c2Mesh, step: 2 });

    // Clue 3: Right Command Breakers
    const c3Geo = new THREE.BoxGeometry(4, 5, 4);
    const c3Mat = new THREE.MeshBasicMaterial({ visible: false });
    const c3Mesh = new THREE.Mesh(c3Geo, c3Mat);
    c3Mesh.position.set(8.5, -1, -4);
    scene.add(c3Mesh);
    hitboxes.push({ mesh: c3Mesh, step: 3 });

    // Handle Click on 3D objects
    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseVecRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(hitboxes.map((h) => h.mesh));

      if (intersects.length > 0) {
        const hit = hitboxes.find((h) => h.mesh === intersects[0].object);
        if (hit) {
          onSelectHotspot(hit.step);
        }
      }
    };

    renderer.domElement.addEventListener('click', handleClick);

    // ─── Render Loop ────────────────────────────────────────────────────────
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotate energy ring
      energyRing.rotation.x = time * 0.6;
      energyRing.rotation.y = time * 0.9;

      // Core light breathing pulse
      if (coreLightRef.current) {
        const pulse = Math.sin(time * 3.5) * 0.6;
        coreLightRef.current.intensity = 3.2 + pulse;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      roomGeo.dispose();
      pillarGeo.dispose();
      ringGeo.dispose();
      c1Geo.dispose();
      c2Geo.dispose();
      c3Geo.dispose();
      frontTex.dispose();
      roofTex.dispose();
      floorTex.dispose();
      leftTex.dispose();
      rightTex.dispose();
      renderer.dispose();
    };
  }, [activeStep, onSelectHotspot, subsystems]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        cursor: 'grab',
      }}
      aria-label="3D Core Chamber Viewport"
    />
  );
};
