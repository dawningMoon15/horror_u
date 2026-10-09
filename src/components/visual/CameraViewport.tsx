import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../lib/soundEffects';

export interface Hotspot {
  id: string;
  label: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  onActivate: () => void;
}

interface CameraViewportProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  hotspots?: Hotspot[];
  isZoomed?: boolean;
  onToggleZoom?: () => void;
  children?: React.ReactNode;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  hotspots = [],
  isZoomed = false,
  onToggleZoom,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    containerRef.current.style.setProperty('--mouse-x', `${xPercent}%`);
    containerRef.current.style.setProperty('--mouse-y', `${yPercent}%`);

    // Subtle 3D tilt
    const tiltX = ((y / rect.height) - 0.5) * -7;
    const tiltY = ((x / rect.width) - 0.5) * 7;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--mouse-x', '50%');
      containerRef.current.style.setProperty('--mouse-y', '50%');
    }
  }, [imageSrc]);

  return (
    <div
      ref={containerRef}
      className="viewport-scene-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={imageAlt}
    >
      {/* 3D Camera Tilt Rig */}
      <div
        className="viewport-3d-rig"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`viewport-bg-image ${isZoomed ? 'zoomed' : ''}`}
        />
        <div className="viewport-spotlight-layer" aria-hidden="true" />
      </div>

      {/* Top HUD Bar */}
      <div className="viewport-hud-bar">
        <div className="hud-pill">
          <span style={{ color: 'var(--color-phosphor-green)' }}>●</span>
          <span>{title}</span>
          {subtitle && <span style={{ opacity: 0.65 }}>// {subtitle}</span>}
        </div>

        {onToggleZoom && (
          <button
            type="button"
            className="hud-btn"
            onClick={() => {
              sound.playKeyClick();
              onToggleZoom();
            }}
          >
            {isZoomed ? '🔍 ZOOM OUT (WIDE)' : '🔎 INSPECT CLOSE-UP'}
          </button>
        )}
      </div>

      {/* Hotspots (Rendered in wide mode) */}
      {!isZoomed &&
        hotspots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className="hotspot-marker"
            style={{
              left: `${spot.xPercent}%`,
              top: `${spot.yPercent}%`,
            }}
            onClick={() => {
              sound.playKeyClick();
              spot.onActivate();
            }}
            aria-label={spot.label}
          >
            <div className="hotspot-pulse-ring" aria-hidden="true" />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-phosphor-green)' }}>🔍</span>
            <span className="hotspot-label-tooltip">{spot.label}</span>
          </button>
        ))}

      {/* Inspection Overlay Workspace (if children provided) */}
      {children}
    </div>
  );
};
