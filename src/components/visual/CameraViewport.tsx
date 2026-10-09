import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../lib/soundEffects';

export interface Hotspot {
  id: string;
  label: string;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  onActivate: () => void;
  step?: number;
}

export interface SpotlightCoords {
  xPercent: number;
  yPercent: number;
  radius?: number; // spotlight radius in px (default ~150px)
}

interface CameraViewportProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  stepObjective?: string;
  hotspots?: Hotspot[];
  isZoomed?: boolean;
  onToggleZoom?: () => void;
  spotlightCoords?: SpotlightCoords;
  children?: React.ReactNode;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  stepObjective,
  hotspots = [],
  isZoomed = false,
  onToggleZoom,
  spotlightCoords,
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

    // Subtle 3D camera parallax tilt
    const tiltX = ((y / rect.height) - 0.5) * -5;
    const tiltY = ((x / rect.width) - 0.5) * 5;
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

  // Spotlight coordinates default to current clue or center
  const spotX = spotlightCoords?.xPercent ?? 50;
  const spotY = spotlightCoords?.yPercent ?? 50;
  const spotRadius = spotlightCoords?.radius ?? 150;

  // Mask creates a pitch-black room except for the circular pool of spotlight
  const spotlightMask = isZoomed
    ? 'none'
    : `radial-gradient(circle ${spotRadius}px at ${spotX}% ${spotY}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.25) 82%, rgba(0,0,0,0) 100%)`;

  return (
    <div
      ref={containerRef}
      className="viewport-scene-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="region"
      aria-label={imageAlt}
      style={{
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D Camera Tilt Rig */}
      <div
        className="viewport-3d-rig"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Background Image: completely blacked out except in the spotlight zone */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`viewport-bg-image ${isZoomed ? 'zoomed' : ''}`}
          style={{
            maskImage: spotlightMask,
            WebkitMaskImage: spotlightMask,
            transition: 'mask-image 0.7s cubic-bezier(0.2, 0.8, 0.2, 1), -webkit-mask-image 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
        />

        {/* Ambient Spotlight Cone Beam illumination */}
        {!isZoomed && (
          <div
            className="viewport-spotlight-beam"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle ${spotRadius + 20}px at ${spotX}% ${spotY}%, rgba(255, 255, 235, 0.12) 0%, rgba(255, 255, 240, 0.04) 55%, transparent 100%)`,
              transition: 'background 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)',
              zIndex: 6,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Top HUD Bar */}
      <div className="viewport-hud-bar">
        <div className="hud-pill" style={{ background: 'rgba(6, 9, 14, 0.92)', borderColor: 'var(--border-subtle)' }}>
          <span style={{ color: 'var(--color-phosphor-green)' }}>●</span>
          <span>{title}</span>
          {subtitle && <span style={{ opacity: 0.65 }}>// {subtitle}</span>}
          {stepObjective && (
            <span style={{ color: 'var(--color-terminal-amber)', fontWeight: 600, marginLeft: '0.4rem' }}>
              [{stepObjective}]
            </span>
          )}
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
            {isZoomed ? '🔍 STEP BACK (WIDE)' : '🔎 INSPECT CLOSE-UP'}
          </button>
        )}
      </div>

      {/* Stealth Clue Hotspots (No visible markers on clue; user discovers by exploring illuminated area) */}
      {!isZoomed &&
        hotspots.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className="hotspot-stealth-area"
            style={{
              position: 'absolute',
              left: `${spot.xPercent}%`,
              top: `${spot.yPercent}%`,
              transform: 'translate(-50%, -50%)',
              width: '110px',
              height: '110px',
              background: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'crosshair',
              zIndex: 25,
              outline: 'none',
            }}
            onClick={() => {
              sound.playKeyClick();
              spot.onActivate();
            }}
            aria-label={spot.label}
          />
        ))}

      {/* Inspection Overlay Workspace */}
      {children}
    </div>
  );
};
