import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface CrtHorrorShaderCanvasProps {
  intensity?: number; // 0 to 1
  glitchActive?: boolean;
}

export const CrtHorrorShaderCanvas: React.FC<CrtHorrorShaderCanvasProps> = ({
  intensity = 0.65,
  glitchActive = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const uniformsRef = useRef<{
    uTime: { value: number };
    uIntensity: { value: number };
    uGlitch: { value: number };
    uResolution: { value: THREE.Vector2 };
  } | null>(null);

  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uIntensity.value = intensity;
      uniformsRef.current.uGlitch.value = glitchActive ? 1.0 : 0.0;
    }
  }, [intensity, glitchActive]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.inset = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '35';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uIntensity: { value: 0.6 },
      uGlitch: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(width, height) },
    };
    uniformsRef.current = uniforms;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uGlitch;
      uniform vec2 uResolution;
      varying vec2 vUv;

      // Pseudo-random noise
      float rand(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      void main() {
        vec2 uv = vUv;

        // Subtle CRT barrel curvature
        vec2 centered = uv - 0.5;
        float dist = dot(centered, centered);
        uv = uv + centered * (dist * 0.08 * uIntensity);

        // Discard pixels outside barrel
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          discard;
        }

        // Horizontal scanlines
        float scanline = sin(uv.y * uResolution.y * 1.5 + uTime * 2.0) * 0.06 * uIntensity;

        // VHS tracking sweep glitch bar
        float vhsBar = smoothstep(0.02, 0.0, abs(fract(uv.y * 1.2 - uTime * 0.35) - 0.5)) * 0.12 * (uGlitch > 0.5 ? 2.5 : uIntensity);

        // Static film grain
        float noise = (rand(uv + vec2(uTime * 0.1, uTime * 0.15)) - 0.5) * 0.05 * (uGlitch > 0.5 ? 2.0 : 1.0);

        // Vignette falloff at screen corners
        float vignette = smoothstep(0.75, 0.25, length(centered));

        // Subtle phosphor tint & shadow
        vec3 color = vec3(0.0);
        float alpha = clamp(scanline + vhsBar + noise + (1.0 - vignette) * 0.18, 0.0, 0.65) * uIntensity;

        // Green-cyan phosphor aberration glow on scanlines
        color.r = (noise + vhsBar * 0.4) * 0.1;
        color.g = (scanline * 0.8 + vhsBar * 0.9 + noise * 0.4) * 0.15;
        color.b = (vhsBar * 0.5 + noise * 0.3) * 0.1;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || window.innerWidth;
      const newHeight = container.clientHeight || window.innerHeight;
      renderer.setSize(newWidth, newHeight);
      uniforms.uResolution.value.set(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 35,
      }}
      aria-hidden="true"
    />
  );
};
