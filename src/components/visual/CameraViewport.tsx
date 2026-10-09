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
  isRedAlert?: boolean;
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
  isRedAlert = true,
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
        {/* Blood-red vignette and crimson emergency hazard strobe */}
        <div className="viewport-blood-vignette" aria-hidden="true" />
        {isRedAlert && <div className="viewport-emergency-strobe" aria-hidden="true" />}
        <svg
          className="blood-lens-splatters"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M780,0 Q820,60 850,40 Q880,120 900,30 Q940,90 980,10 L1000,0 Z"
            fill="rgba(138, 3, 3, 0.45)"
          />
          <circle cx="95" cy="520" r="14" fill="rgba(120, 2, 2, 0.35)" />
          <circle cx="120" cy="535" r="9" fill="rgba(120, 2, 2, 0.3)" />
          <circle cx="75" cy="505" r="6" fill="rgba(140, 2, 2, 0.4)" />
          <path d="M40,590 Q120,530 140,600 Z" fill="rgba(100, 2, 2, 0.35)" />
        </svg>
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
            className="hotspot-marker blood-variant"
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
            <span style={{ fontSize: '0.85rem' }}>🩸</span>
            <span className="hotspot-label-tooltip">{spot.label}</span>
          </button>
        ))}

      {/* Inspection Overlay Workspace (if children provided) */}
      {children}
    </div>
  );
};
