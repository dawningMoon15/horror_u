import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface FlashlightAtmosphereCanvasProps {
  mouseXPercent: number; // 0 to 100
  mouseYPercent: number; // 0 to 100
  active: boolean;
}

export const FlashlightAtmosphereCanvas: React.FC<FlashlightAtmosphereCanvasProps> = ({
  mouseXPercent,
  mouseYPercent,
  active,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const targetPosRef = useRef({ x: 0, y: 0 });
  const currentPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    targetPosRef.current = {
      x: (mouseXPercent / 100) * 2 - 1,
      y: -(mouseYPercent / 100) * 2 + 1,
    };
  }, [mouseXPercent, mouseYPercent]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container || !active) return;

    // Safety check for WebGL support (graceful fallback in test environments)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '15';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 10;

    // ─── 3D Flashlight Spotlight & Ambient Glow ─────────────────────────────
    const spotLight = new THREE.SpotLight(0xfff5dd, 4.5, 25, (Math.PI / 4) * 0.75, 0.65, 1.2);
    spotLight.position.set(0, 0, 8);
    const lightTarget = new THREE.Object3D();
    lightTarget.position.set(0, 0, 0);
    spotLight.target = lightTarget;
    scene.add(spotLight);
    scene.add(lightTarget);

    const ambientLight = new THREE.AmbientLight(0x05080c, 0.4);
    scene.add(ambientLight);

    // ─── Procedural Floating Dust Motes (Tyndall Effect in Spotlight Beam) ───
    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      // Initialize particles distributed within the active spotlight region
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 2.2;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.sin(angle) * r;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.003;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.003 + 0.001; // gentle upward draft
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.002;

      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular soft particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 250, 230, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 235, 180, 0.7)');
      gradient.addColorStop(0.8, 'rgba(255, 220, 150, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Reduced size 2x (0.28 -> 0.14) with dynamic vertex colors for Tyndall scattering
    const material = new THREE.PointsMaterial({
      size: 0.14,
      map: particleTexture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ─── Animation Loop ─────────────────────────────────────────────────────
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Smooth lag dampening on flashlight motion
      currentPosRef.current.x += (targetPosRef.current.x - currentPosRef.current.x) * 0.12;
      currentPosRef.current.y += (targetPosRef.current.y - currentPosRef.current.y) * 0.12;

      const worldTargetX = currentPosRef.current.x * 7;
      const worldTargetY = currentPosRef.current.y * 4.5;

      spotLight.position.x = worldTargetX * 0.6;
      spotLight.position.y = worldTargetY * 0.6;
      lightTarget.position.x = worldTargetX;
      lightTarget.position.y = worldTargetY;

      // Realistic filament micro-flicker
      const flicker = Math.sin(time * 28) * 0.05 + Math.cos(time * 47) * 0.03;
      spotLight.intensity = 4.5 + flicker;

      // ─── Tyndall Effect: particles only scatter light inside the spotlight beam
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;
      const colArray = colAttr.array as Float32Array;

      // Beam radius in world units corresponding to the 210px flashlight spotlight
      const beamRadius = 2.15;

      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i * 3];
        posArray[i * 3 + 1] += velocities[i * 3 + 1];
        posArray[i * 3 + 2] += velocities[i * 3 + 2];

        const dx = posArray[i * 3] - worldTargetX;
        const dy = posArray[i * 3 + 1] - worldTargetY;
        const dist = Math.hypot(dx, dy);

        // If particle drifted too far from current spotlight, respawn it inside the beam
        if (dist > beamRadius * 1.5) {
          const spawnAngle = Math.random() * Math.PI * 2;
          const spawnR = Math.random() * beamRadius * 0.95;
          posArray[i * 3] = worldTargetX + Math.cos(spawnAngle) * spawnR;
          posArray[i * 3 + 1] = worldTargetY + Math.sin(spawnAngle) * spawnR;
          posArray[i * 3 + 2] = (Math.random() - 0.5) * 4;
        }

        const activeDist = Math.hypot(posArray[i * 3] - worldTargetX, posArray[i * 3 + 1] - worldTargetY);

        // Outside spotlight cone: 0 light scattering (completely dark/invisible)
        // Inside spotlight cone: authentic Tyndall optical scattering with smooth radial falloff
        let scattering = 0;
        if (activeDist < beamRadius) {
          const falloff = 1 - activeDist / beamRadius;
          scattering = falloff * falloff * (3 - 2 * falloff); // smoothstep
        }

        const shimmer = 0.85 + 0.15 * Math.sin(time * 7 + i * 2.1);
        const illumination = scattering * shimmer * (1.0 + flicker * 0.2);

        colArray[i * 3] = illumination * 1.0;       // Red
        colArray[i * 3 + 1] = illumination * 0.95;  // Green (warm cream)
        colArray[i * 3 + 2] = illumination * 0.82;  // Blue
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 15,
      }}
      aria-hidden="true"
    />
  );
};
