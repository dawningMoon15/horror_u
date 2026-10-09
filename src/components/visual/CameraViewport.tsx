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

interface CameraViewportProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle?: string;
  stepObjective?: string;
  currentStep?: 1 | 2 | 3;
  roomDuration?: number; // Duration in seconds (120s for rooms 1-4, 220s for room 5)
  hotspots?: Hotspot[];
  isZoomed?: boolean;
  onToggleZoom?: () => void;
  onRestart?: () => void;
  children?: React.ReactNode;
}

export const CameraViewport: React.FC<CameraViewportProps> = ({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  stepObjective,
  currentStep = 1,
  roomDuration = 120, // 2 minutes default per room
  hotspots = [],
  isZoomed = false,
  onToggleZoom,
  onRestart,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  // ─── Countdown Timer: 120s (2 min) for Rooms 1-4, 220s (3m 40s) for Room 5 ───
  const [timeLeft, setTimeLeft] = useState(() => roomDuration);
  const [isJumpscare, setIsJumpscare] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [prevImage, setPrevImage] = useState(imageSrc);

  // Synchronize state when room image or duration changes
  if (imageSrc !== prevImage) {
    setPrevImage(imageSrc);
    setTimeLeft(roomDuration);
    setIsJumpscare(false);
    setIsGameOver(false);
  }

  // Timer countdown loop (active while exploring in dark room)
  useEffect(() => {
    if (isZoomed || isJumpscare || isGameOver) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Trigger Jumpscare
          setIsJumpscare(true);
          sound.playJumpscareStinger();
          return 0;
        }
        if (prev <= 6) {
          sound.playUrgentTick();
          if (prev % 2 === 0) sound.playHeartbeat();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isZoomed, isJumpscare, isGameOver, currentStep]);

  // Jumpscare auto-advance to Game Over
  useEffect(() => {
    if (!isJumpscare) return;

    // Safety timeout in case video ends or cannot play
    const timer = setTimeout(() => {
      setIsJumpscare(false);
      setIsGameOver(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [isJumpscare]);

  const handleVideoEnded = () => {
    setIsJumpscare(false);
    setIsGameOver(true);
  };

  const handleRetryRoom = () => {
    sound.playKeyClick();
    setIsJumpscare(false);
    setIsGameOver(false);
    setTimeLeft(roomDuration);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPercent = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setMousePos({ x: xPercent, y: yPercent });
    containerRef.current.style.setProperty('--mouse-x', `${xPercent}%`);
    containerRef.current.style.setProperty('--mouse-y', `${yPercent}%`);

    // Subtle 3D camera parallax tilt
    const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -6;
    const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 6;
    setTilt({ x: tiltX, y: tiltY });
  };

  // Mask follows cursor position across pitch-black room
  const spotlightMask = isZoomed
    ? 'none'
    : `radial-gradient(circle 140px at ${mousePos.x}% ${mousePos.y}%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 50%, rgba(0,0,0,0.2) 80%, rgba(0,0,0,0) 100%)`;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      ref={containerRef}
      className="viewport-scene-container analog-horror-frame"
      onMouseMove={handleMouseMove}
      role="region"
      aria-label={imageAlt}
      style={{
        backgroundColor: '#000000',
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 5,
      }}
    >
      {/* ─── Analog Horror VHS OSD Overlay ─────────────────────────────── */}
      <div className="vhs-osd-overlay" aria-hidden="true">
        <div className="vhs-osd-top">
          <div className="vhs-rec-tag">
            <span className="vhs-rec-dot">●</span> REC
          </div>
          <div className="vhs-tracking-code">SP 10/12/1987</div>
        </div>

        {/* Urgent Countdown Timer Display */}
        <div className={`vhs-timer-tag ${timeLeft <= 10 ? 'critical' : ''}`}>
          <span>TIME LIMIT: {formattedTime}</span>
        </div>
      </div>

      {/* ─── 3D Camera Tilt Rig ────────────────────────────────────────── */}
      <div
        className="viewport-3d-rig"
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Background Image: pitch black except where the cursor spotlight shines */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className={`viewport-bg-image ${isZoomed ? 'zoomed' : ''}`}
          style={{
            maskImage: spotlightMask,
            WebkitMaskImage: spotlightMask,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
          }}
        />

        {/* Ambient Spotlight Cone Beam following cursor */}
        {!isZoomed && !isGameOver && !isJumpscare && (
          <div
            className="viewport-spotlight-beam"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle 165px at ${mousePos.x}% ${mousePos.y}%, rgba(255, 255, 235, 0.16) 0%, rgba(255, 255, 240, 0.04) 55%, transparent 100%)`,
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

      {/* Stealth Clue Hotspots (Discovered by moving cursor spotlight over them) */}
      {!isZoomed &&
        !isGameOver &&
        !isJumpscare &&
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
              width: '120px',
              height: '120px',
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

      {/* ─── Jumpscare Video Overlay ───────────────────────────────────── */}
      {isJumpscare && (
        <div className="jumpscare-video-overlay" role="alert" aria-live="assertive">
          <video
            ref={videoRef}
            src="/assets/jumpscare.mp4"
            autoPlay
            playsInline
            onEnded={handleVideoEnded}
            className="jumpscare-video"
          />
          <button
            type="button"
            onClick={handleVideoEnded}
            className="jumpscare-skip-btn"
          >
            SKIP ⏭
          </button>
        </div>
      )}

      {/* ─── Analog Horror Game Over Screen ─────────────────────────────── */}
      {isGameOver && (
        <div className="analog-gameover-overlay" role="dialog" aria-modal="true" aria-label="Game Over">
          <div className="vhs-static-glitch-layer" aria-hidden="true" />

          <div className="gameover-content-card">
            <div className="gameover-header">
              <span className="vhs-rec-dot">●</span>
              <span>SIGNAL TERMINATED // TIME EXPIRED</span>
            </div>

            <h2 className="gameover-title">YOU WERE TAKEN</h2>

            <p className="gameover-body">
              The anomaly collapsed before the clue was uncovered in time.
              <br />
              Subject bio-telemetry ceased at timestamp 11:47:03.
            </p>

            <div className="gameover-btn-group">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleRetryRoom}
              >
                ↺ RETRY THIS CLUE
              </button>

              {onRestart && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    sound.playKeyClick();
                    onRestart();
                  }}
                >
                  ⏮ REBOOT ENTIRE SESSION
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inspection Overlay Workspace */}
      {children}
    </div>
  );
};
