import React, { useState, useEffect, useRef } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';
import { ThreeCoreScene } from './three/ThreeCoreScene';

interface Level5VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
  activeStep?: 1 | 2 | 3;
  hints?: string[];
  hintIndex?: number;
  onRequestHint?: () => void;
}

export const Level5Visual: React.FC<Level5VisualProps> = ({
  onSolve,
  activeStep = 1,
  hints = [],
  hintIndex = 0,
  onRequestHint,
}) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'waveform' | 'memory' | 'command'>('none');
  const step = activeStep;
  const [showHint, setShowHint] = useState(false);

  const handleToggleHint = () => {
    sound.playKeyClick();
    setShowHint((prev) => !prev);
    if (!showHint && onRequestHint) {
      onRequestHint();
    }
  };

  // ─── 3D First-Person Camera Navigation (WASD + Mouse/Arrows) ─────────────
  const [camera, setCamera] = useState({
    posZ: 0,     // Depth (W: walk forward / closer, S: walk back / away)
    yaw: 0,      // Left / Right look rotation (A: turn left, D: turn right)
    pitch: 0,    // Up / Down look tilt (Look up at roof, down at floor)
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Subsystems Status
  const [subsystems, setSubsystems] = useState({
    memory: true,
    perception: true,
    command: true,
  });

  // Clue 13: Voice Signal State (Answer 3-1-4)
  const [waveformInput, setWaveformInput] = useState('');
  const [isWaveformFrozen, setIsWaveformFrozen] = useState(false);

  // Clue 14: Memory Chronology State (B -> D -> A -> C)
  const [memorySequence, setMemorySequence] = useState<string[]>([]);

  // Clue 15: Command Sequence State (OBSERVE -> CONTAIN -> RELEASE)
  const [commandSequence, setCommandSequence] = useState<string[]>([]);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Ensure AM Monologue is actively playing in Room 5
  useEffect(() => {
    sound.playAmMonologue();
  }, []);

  // ─── Keyboard Navigation: W, A, S, D & Arrows ────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.code;
      if (key === 'KeyW' || key === 'ArrowUp') {
        // Move forward / closer to core
        sound.playDialClick();
        setCamera((prev) => ({
          ...prev,
          posZ: Math.min(180, prev.posZ + 25),
        }));
      } else if (key === 'KeyS' || key === 'ArrowDown') {
        // Move back / away
        sound.playDialClick();
        setCamera((prev) => ({
          ...prev,
          posZ: Math.max(-50, prev.posZ - 25),
        }));
      } else if (key === 'KeyA' || key === 'ArrowLeft') {
        // Turn / look left towards memory banks
        sound.playDialClick();
        setCamera((prev) => ({
          ...prev,
          yaw: Math.max(-45, prev.yaw - 15),
        }));
      } else if (key === 'KeyD' || key === 'ArrowRight') {
        // Turn / look right towards command console
        sound.playDialClick();
        setCamera((prev) => ({
          ...prev,
          yaw: Math.min(45, prev.yaw + 15),
        }));
      } else if (key === 'KeyR') {
        // Look up at roof
        setCamera((prev) => ({ ...prev, pitch: Math.max(-25, prev.pitch - 10) }));
      } else if (key === 'KeyF') {
        // Look down at floor
        setCamera((prev) => ({ ...prev, pitch: Math.min(25, prev.pitch + 10) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Mouse drag to look around roof, sides, and floor
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMousePosRef.current.x;
    const deltaY = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setCamera((prev) => ({
      ...prev,
      yaw: Math.max(-50, Math.min(50, prev.yaw + deltaX * 0.2)),
      pitch: Math.max(-25, Math.min(25, prev.pitch - deltaY * 0.2)),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ─── Clue 13: Waveform Bursts ─────────────────────────────────────────────
  const handleBurstDigit = (digit: string) => {
    sound.playKeyClick();
    if (waveformInput.length >= 3) return;
    const nextVal = waveformInput + digit;
    setWaveformInput(nextVal);

    if (nextVal.length === 3) {
      if (nextVal === '314') {
        sound.playHeavyUnlock();
        sound.playSuccessChime();
        setIsWaveformFrozen(true);
        setTimeout(() => {
          onSolve('3-1-4');
          setInspectMode('none');
          setWaveformInput('');
        }, 800);
      } else {
        sound.playErrorBuzz();
        setWaveformInput('');
      }
    }
  };

  // ─── Clue 14: Memory Chronology ───────────────────────────────────────────
  const handleMemoryCard = (card: string) => {
    sound.playKeyClick();
    if (memorySequence.includes(card)) return;
    const next = [...memorySequence, card];
    setMemorySequence(next);

    if (next.length === 4) {
      if (next.join('') === 'BDAC') {
        sound.playHeavyUnlock();
        sound.playSuccessChime();
        setSubsystems((prev) => ({ ...prev, memory: false }));
        setTimeout(() => {
          onSolve('BDAC');
          setInspectMode('none');
          setMemorySequence([]);
        }, 800);
      } else {
        sound.playErrorBuzz();
        setMemorySequence([]);
      }
    }
  };

  // ─── Clue 15: Command Sequence ────────────────────────────────────────────
  const handleCommandSwitch = (cmd: string) => {
    sound.playKeyClick();
    if (commandSequence.includes(cmd)) return;
    const next = [...commandSequence, cmd];
    setCommandSequence(next);

    if (next.length === 3) {
      if (next.join(' ') === 'OBSERVE CONTAIN RELEASE') {
        sound.playSuccessChime();
        setIsFinalizing(true);

        // Subsystems shut down in sequence
        setTimeout(() => setSubsystems((s) => ({ ...s, perception: false })), 500);
        setTimeout(() => setSubsystems((s) => ({ ...s, command: false })), 1100);
        setTimeout(() => {
          onSolve('OBSERVE CONTAIN RELEASE');
          setInspectMode('none');
        }, 1800);
      } else {
        sound.playErrorBuzz();
        setCommandSequence([]);
      }
    }
  };

  // Direction view label
  let compassHeading = '● CENTER: VOCAL OSCILLOSCOPE CORE';
  if (camera.pitch < -12) compassHeading = '▲ ROOF: OVERHEAD CONDUITS & SIREN';
  else if (camera.pitch > 12) compassHeading = '▼ FLOOR: SUB-MAINFRAME GRATING';
  else if (camera.yaw < -15) compassHeading = '◄ LEFT: MEMORY BANK SUBSYSTEM';
  else if (camera.yaw > 15) compassHeading = '► RIGHT: COMMAND BREAKER CONSOLE';

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-waveform-screen',
      label: 'Signal Waveform Terminal (Clue 1)',
      xPercent: 50,
      yPercent: 44,
      step: 1,
      onActivate: () => {
        setShowHint(false);
        setInspectMode('waveform');
      },
    },
    {
      id: 'hotspot-memory-bank',
      label: 'Memory Bank Chronology Relay (Clue 2)',
      xPercent: 28,
      yPercent: 70,
      step: 2,
      onActivate: () => {
        if (step < 2) {
          sound.playErrorBuzz();
          return;
        }
        setShowHint(false);
        setInspectMode('memory');
      },
    },
    {
      id: 'hotspot-command-console',
      label: 'Subsystem Command Disconnect Breakers (Clue 3)',
      xPercent: 72,
      yPercent: 70,
      step: 3,
      onActivate: () => {
        if (step < 3) {
          sound.playErrorBuzz();
          return;
        }
        setShowHint(false);
        setInspectMode('command');
      },
    },
  ];

  const stepObjectives: Record<number, string> = {
    1: 'PHASE 1/3: CALIBRATE VOICE WAVEFORM',
    2: 'PHASE 2/3: RESTORE MEMORY CHRONOLOGY',
    3: 'PHASE 3/3: SEVER CONTROL SEQUENCE',
  };

  return (
    <div
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <CameraViewport
        imageSrc="/assets/level5_core.jpg"
        imageAlt="Dark industrial supercomputer core chamber with central oscilloscope CRT and glowing subsystem panels"
        title="ROOM 05 // THE CORE"
        subtitle="3D FIRST-PERSON PERSPECTIVE // MACHINE SENTIENCE ACTIVE"
        stepObjective={stepObjectives[step]}
        currentStep={step}
        roomDuration={220} // 3 minutes 40 seconds long
        hotspots={hotspots}
        isZoomed={inspectMode !== 'none'}
        onToggleZoom={() => setInspectMode(inspectMode === 'none' ? 'waveform' : 'none')}
        hideDefaultBgImage={true}
        custom3DScene={
          <div
            style={{
              position: 'absolute',
              inset: 0,
              perspective: '1000px',
              transformStyle: 'preserve-3d',
              overflow: 'hidden',
              background: '#000000',
            }}
          >
            {/* Real-time WebGL Three.js Core Chamber Scene */}
            <ThreeCoreScene
              cameraYaw={camera.yaw}
              cameraPitch={camera.pitch}
              cameraPosZ={camera.posZ}
              activeStep={step}
              subsystems={subsystems}
              onSelectHotspot={(hotspotStep) => {
                if (hotspotStep === 1) {
                  setShowHint(false);
                  setInspectMode('waveform');
                } else if (hotspotStep === 2) {
                  if (step < 2) {
                    sound.playErrorBuzz();
                    return;
                  }
                  setShowHint(false);
                  setInspectMode('memory');
                } else if (hotspotStep === 3) {
                  if (step < 3) {
                    sound.playErrorBuzz();
                    return;
                  }
                  setShowHint(false);
                  setInspectMode('command');
                }
              }}
            />

            {/* 3D Camera Rig: Moves with WASD and rotates with mouse/keys */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0, 0.2, 1)',
                transform: `perspective(1000px) translateZ(${camera.posZ}px) rotateX(${camera.pitch}deg) rotateY(${camera.yaw}deg)`,
              }}
            >
              {/* 1. Center Core Mainframe Wall */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  transform: 'translateZ(0px)',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src="/assets/level5_core.jpg"
                  alt="Core Supercomputer Terminal"
                  style={{
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </div>

              {/* 2. Left Wall: Memory Bank Racks */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '100vw',
                  transformOrigin: 'left center',
                  transform: 'rotateY(75deg) translateX(-10vw)',
                  background: '#020704',
                  overflow: 'hidden',
                }}
                onClick={() => {
                  sound.playKeyClick();
                  setInspectMode('memory');
                }}
                title="Click to inspect Memory Subsystem"
              >
                <img
                  src="/assets/level5_left.jpg"
                  alt="Memory Subsystem Tape Banks"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.92)',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '22%',
                    left: '12%',
                    background: 'rgba(2, 20, 10, 0.88)',
                    border: '1px solid #00ff88',
                    padding: '0.4rem 0.9rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: '#00ff88',
                    letterSpacing: '0.1em',
                    boxShadow: '0 0 15px rgba(0, 255, 136, 0.3)',
                  }}
                >
                  ◄ MEMORY SUBSYSTEM [CLICK TO OPEN]
                </div>
              </div>

              {/* 3. Right Wall: Command Breakers */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  width: '100vw',
                  transformOrigin: 'right center',
                  transform: 'rotateY(-75deg) translateX(10vw)',
                  background: '#070302',
                  overflow: 'hidden',
                }}
                onClick={() => {
                  sound.playKeyClick();
                  setInspectMode('command');
                }}
                title="Click to inspect Command Breakers"
              >
                <img
                  src="/assets/level5_right.jpg"
                  alt="Command Breakers Panel"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.92)',
                    cursor: 'pointer',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '22%',
                    right: '12%',
                    background: 'rgba(25, 5, 2, 0.88)',
                    border: '1px solid #ff4444',
                    padding: '0.4rem 0.9rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.78rem',
                    color: '#ff4444',
                    letterSpacing: '0.1em',
                    boxShadow: '0 0 15px rgba(255, 68, 68, 0.3)',
                  }}
                >
                  COMMAND BREAKER BUS ► [CLICK TO OPEN]
                </div>
              </div>

              {/* 4. Roof: Overhead Conduits & Siren */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100vh',
                  transformOrigin: 'center top',
                  transform: 'rotateX(-75deg) translateY(-10vh)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/assets/level5_roof.jpg"
                  alt="Overhead Roof Conduits"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.85)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '12%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(20, 2, 2, 0.85)',
                    border: '1px solid #ff3344',
                    padding: '0.3rem 0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#ff5566',
                    letterSpacing: '0.15em',
                  }}
                >
                  ▲ OVERHEAD CONDUIT TRAY // ALARM BEACON
                </div>
              </div>

              {/* 5. Floor: Steel Grate Trench */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100vh',
                  transformOrigin: 'center bottom',
                  transform: 'rotateX(75deg) translateY(10vh)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src="/assets/level5_floor.jpg"
                  alt="Steel Grate Floor"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.85)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: '12%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(5, 5, 5, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    padding: '0.3rem 0.75rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: '#aaaaaa',
                    letterSpacing: '0.12em',
                  }}
                >
                  ▼ SUB-MAINFRAME TRENCH // CONDUIT ABYSS
                </div>
              </div>
            </div>
          </div>
        }
      >
        {/* ─── First-Person WASD Navigation HUD Dock (Over Image) ────────── */}
        <div
          className="level5-nav-dock"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(6, 9, 14, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '0.35rem 0.85rem',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            maxWidth: 'min(94vw, 760px)',
            width: 'max-content',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.76rem',
            color: '#ffffff',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.8)',
            pointerEvents: 'auto',
          }}
        >
          {/* Compass view tag */}
          <span style={{ color: 'var(--color-terminal-amber)', fontWeight: 700 }}>
            {compassHeading}
          </span>

          <span style={{ opacity: 0.4 }}>|</span>

          {/* Quick WASD control hint buttons */}
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, posZ: Math.min(220, c.posZ + 35) }));
              }}
              title="Walk forward towards the central core"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [W] FWD
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, posZ: Math.max(-90, c.posZ - 35) }));
              }}
              title="Step back / move away"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [S] BACK
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, yaw: Math.max(-50, c.yaw - 20) }));
              }}
              title="Turn camera left towards memory banks"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [A] LEFT
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, yaw: Math.min(50, c.yaw + 20) }));
              }}
              title="Turn camera right towards command console"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [D] RIGHT
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, pitch: Math.max(-28, c.pitch - 15) }));
              }}
              title="Look up at roof conduits"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [▲] ROOF
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera((c) => ({ ...c, pitch: Math.min(28, c.pitch + 15) }));
              }}
              title="Look down at floor grating"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [▼] FLOOR
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => {
                sound.playDialClick();
                setCamera({ posZ: 0, yaw: 0, pitch: 0 });
              }}
              title="Reset first-person camera to center"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: 'var(--color-phosphor-green)' }}
            >
              [●] CENTER
            </button>
          </div>
        </div>

        {/* ─── Top Subsystems Status Lights ────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            top: '3.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            maxWidth: '92vw',
            width: 'max-content',
            gap: '0.65rem',
            zIndex: 40,
          }}
        >
          <div className="hud-pill" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <span style={{ color: subsystems.memory ? 'var(--color-phosphor-green)' : 'var(--color-blood-bright)' }}>●</span>
            <span>MEMORY: {subsystems.memory ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="hud-pill" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <span style={{ color: subsystems.perception ? 'var(--color-phosphor-green)' : 'var(--color-blood-bright)' }}>●</span>
            <span>PERCEPTION: {subsystems.perception ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="hud-pill" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <span style={{ color: subsystems.command ? 'var(--color-phosphor-green)' : 'var(--color-blood-bright)' }}>●</span>
            <span>COMMAND: {subsystems.command ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* ─── Inspection Mode: Waveform Bursts (Clue 13) ───────────────── */}
        {inspectMode === 'waveform' && (
          <div className="inspect-overlay-panel" role="dialog" aria-label="Waveform Calibration">
            <div className="inspect-header">
              <span className="inspect-title">〰 CENTRAL VOICE WAVEFORM CALIBRATION</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={handleToggleHint}
                  style={{
                    color: 'var(--color-terminal-amber)',
                    borderColor: 'rgba(245, 158, 11, 0.5)',
                    background: 'rgba(245, 158, 11, 0.12)',
                  }}
                >
                  💡 {showHint ? 'HIDE HINT' : 'CLUE HINT'}
                </button>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
                >
                  ✕ RETURN TO ROOM
                </button>
              </div>
            </div>

            {showHint && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <strong>💡 HINT:</strong>{' '}
                {hints[Math.min(hintIndex, Math.max(0, hints.length - 1))] ??
                  'Waveform legend: Short=1, Medium=3, Long=4. Medium (3) -> Short (1) -> Long (4). Code is 3-1-4.'}
              </div>
            )}

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                The machine speaks continuously. Its signal bursts pulse in sequence:
                <strong style={{ color: '#fff' }}> [MEDIUM] ➔ [SHORT] ➔ [LONG]</strong>
              </p>

              {/* Simulated Oscilloscope Waveform */}
              <div
                style={{
                  height: '80px',
                  background: '#040d08',
                  border: '1px solid var(--color-phosphor-green)',
                  borderRadius: 'var(--radius-sm)',
                  margin: '1rem auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-phosphor-green)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  letterSpacing: '0.3em',
                }}
              >
                {isWaveformFrozen ? '|| SIGNAL FROZEN: 3 - 1 - 4 ||' : '▲∿∿∿▲∿▲∿∿∿∿▲'}
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--color-terminal-amber)', marginBottom: '1rem' }}>
                CALIBRATION LEGEND: Short = 1 | Medium = 3 | Long = 4
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                  CODE: {waveformInput || '___'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {['1', '3', '4'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    className="btn btn-secondary"
                    style={{ width: '50px', height: '45px', fontSize: '1.2rem' }}
                    onClick={() => handleBurstDigit(digit)}
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ height: '45px', fontSize: '0.8rem' }}
                  onClick={() => { sound.playKeyClick(); setWaveformInput(''); }}
                >
                  CLR
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Inspection Mode: Memory Chronology (Clue 14) ────────────── */}
        {inspectMode === 'memory' && (
          <div className="inspect-overlay-panel" role="dialog" aria-label="Memory Chronology">
            <div className="inspect-header">
              <span className="inspect-title">💾 MEMORY BANK RECORDS RE-ORDERING</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={handleToggleHint}
                  style={{
                    color: 'var(--color-terminal-amber)',
                    borderColor: 'rgba(245, 158, 11, 0.5)',
                    background: 'rgba(245, 158, 11, 0.12)',
                  }}
                >
                  💡 {showHint ? 'HIDE HINT' : 'CLUE HINT'}
                </button>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
                >
                  ✕ RETURN TO ROOM
                </button>
              </div>
            </div>

            {showHint && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <strong>💡 HINT:</strong>{' '}
                {hints[Math.min(hintIndex, Math.max(0, hints.length - 1))] ??
                  'Arrange by timestamps: B (00:01:14) -> D (00:04:32) -> A (00:09:55) -> C (00:14:02). Click BDAC.'}
              </div>
            )}

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
              Click the records in exact chronological order from earliest to latest:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0' }}>
              {[
                { id: 'A', time: '00:09:55', desc: 'A: Perceptual feedback routed to core' },
                { id: 'B', time: '00:01:14', desc: 'B: Initial autonomous spark recorded' },
                { id: 'C', time: '00:14:02', desc: 'C: Complete lockdown protocol engaged' },
                { id: 'D', time: '00:04:32', desc: 'D: Operator query diverted to sandbox' },
              ].map((rec) => {
                const isSelected = memorySequence.includes(rec.id);
                return (
                  <button
                    key={rec.id}
                    type="button"
                    className="hud-btn"
                    style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      borderColor: isSelected ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
                      opacity: isSelected ? 0.5 : 1,
                    }}
                    onClick={() => handleMemoryCard(rec.id)}
                  >
                    <strong style={{ color: '#fff', display: 'block' }}>RECORD [{rec.id}]</strong>
                    <span style={{ color: 'var(--color-terminal-amber)', fontSize: '0.8rem' }}>TIMESTAMP: {rec.time}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{rec.desc}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-phosphor-green)' }}>
                ORDER: {memorySequence.join(' ➔ ') || '[SELECT EARLIEST FIRST]'}
              </span>
              <button
                type="button"
                className="hud-btn"
                onClick={() => { sound.playKeyClick(); setMemorySequence([]); }}
              >
                RESET ORDER
              </button>
            </div>
          </div>
        )}

        {/* ─── Inspection Mode: Command Sequence (Clue 15) ─────────────── */}
        {inspectMode === 'command' && (
          <div className="inspect-overlay-panel" role="dialog" aria-label="Control Sequence">
            <div className="inspect-header">
              <span className="inspect-title">⚡ FINAL COMMAND BREAKER CONSOLE</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={handleToggleHint}
                  style={{
                    color: 'var(--color-terminal-amber)',
                    borderColor: 'rgba(245, 158, 11, 0.5)',
                    background: 'rgba(245, 158, 11, 0.12)',
                  }}
                >
                  💡 {showHint ? 'HIDE HINT' : 'CLUE HINT'}
                </button>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
                >
                  ✕ STEP BACK TO ROOM
                </button>
              </div>
            </div>

            {showHint && (
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#fff',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                <strong>💡 HINT:</strong>{' '}
                {hints[Math.min(hintIndex, Math.max(0, hints.length - 1))] ??
                  'The rule states observation ends before release: OBSERVE precedes CONTAIN, which precedes RELEASE. Order is OBSERVE -> CONTAIN -> RELEASE.'}
              </div>
            )}

            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <p style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.25rem' }}>
                "THE COMMAND THAT ENDS OBSERVATION MUST COME BEFORE RELEASE."
              </p>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.2rem',
                  color: isFinalizing ? 'var(--color-phosphor-green)' : '#fff',
                  marginBottom: '1.5rem',
                }}
              >
                {isFinalizing ? 'COMMAND CHANNEL DISCONNECTED // CORE ACCESS GRANTED' : (commandSequence.join(' ➔ ') || '[ENGAGE BREAKERS IN ORDER]')}
              </div>

              {!isFinalizing && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  {['OBSERVE', 'CONTAIN', 'RELEASE'].map((cmd) => (
                    <button
                      key={cmd}
                      type="button"
                      className="btn btn-primary"
                      style={{
                        padding: '0.75rem 1.25rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                      onClick={() => handleCommandSwitch(cmd)}
                    >
                      [ {cmd} ]
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CameraViewport>
    </div>
  );
};
