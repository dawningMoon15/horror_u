import React, { useState, useEffect, useRef } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level5VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level5Visual: React.FC<Level5VisualProps> = ({ onSolve }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'waveform' | 'memory' | 'command'>('none');
  const [step, setStep] = useState<1 | 2 | 3>(1);

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
        setIsWaveformFrozen(true);
        onSolve('3-1-4');
        setStep(2);
        setInspectMode('memory');
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
        setSubsystems((prev) => ({ ...prev, memory: false }));
        onSolve('BDAC');
        setStep(3);
        setInspectMode('command');
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
      label: 'Signal Waveform Terminal',
      xPercent: 50,
      yPercent: 44,
      step: 1,
      onActivate: () => setInspectMode('waveform'),
    },
    {
      id: 'hotspot-memory-bank',
      label: 'Memory Bank Chronology Relay',
      xPercent: 28,
      yPercent: 70,
      step: 2,
      onActivate: () => {
        setInspectMode('memory');
        if (step === 1) setStep(2);
      },
    },
    {
      id: 'hotspot-command-console',
      label: 'Subsystem Command Disconnect Breakers',
      xPercent: 72,
      yPercent: 70,
      step: 3,
      onActivate: () => {
        setInspectMode('command');
        if (step < 3) setStep(3);
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
      >
        {/* ─── 3D First-Person Room Perspective Composition ─────────────── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            perspective: '900px',
            transformStyle: 'preserve-3d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 12,
          }}
          aria-hidden="true"
        >
          {/* Main 3D Camera Rig */}
          <div
            style={{
              position: 'relative',
              width: '100vw',
              height: '100vh',
              transformStyle: 'preserve-3d',
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
              transform: `rotateX(${camera.pitch}deg) rotateY(${camera.yaw}deg) translateZ(${camera.posZ}px)`,
            }}
          >
            {/* Overhead Roof / Ceiling Conduits Panel */}
            <div
              style={{
                position: 'absolute',
                top: '-15%',
                left: '10%',
                right: '10%',
                height: '35%',
                background: 'linear-gradient(to bottom, rgba(5, 5, 5, 0.95), transparent)',
                transform: 'rotateX(-60deg) translateY(-100px)',
                borderBottom: '1px solid rgba(217, 4, 41, 0.3)',
                boxShadow: '0 0 40px rgba(217, 4, 41, 0.2) inset',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                paddingTop: '1rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 80, 80, 0.8)', letterSpacing: '0.15em' }}>
                [ROOF CONDUIT OVERHEAD CABLE TRAY // SIREN BEACON]
              </span>
            </div>

            {/* Left Wall: Memory Bank Indicator Layer */}
            <div
              style={{
                position: 'absolute',
                left: '-5%',
                top: '20%',
                bottom: '20%',
                width: '30%',
                background: 'linear-gradient(to right, rgba(0, 30, 20, 0.8), transparent)',
                transform: 'rotateY(55deg) translateZ(50px)',
                borderRight: '1px solid rgba(0, 255, 136, 0.3)',
                padding: '1.5rem',
                color: 'var(--color-phosphor-green)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>◄ MEMORY SUBSYSTEM</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>TAPE REEL RACKS</div>
              <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', color: subsystems.memory ? '#00ff88' : '#ff4444' }}>
                STATUS: {subsystems.memory ? 'ACTIVE RECORDING' : 'DISCONNECTED'}
              </div>
            </div>

            {/* Right Wall: Command Breakers Indicator Layer */}
            <div
              style={{
                position: 'absolute',
                right: '-5%',
                top: '20%',
                bottom: '20%',
                width: '30%',
                background: 'linear-gradient(to left, rgba(30, 10, 10, 0.8), transparent)',
                transform: 'rotateY(-55deg) translateZ(50px)',
                borderLeft: '1px solid rgba(217, 4, 41, 0.3)',
                padding: '1.5rem',
                color: 'var(--color-blood-bright)',
                fontFamily: 'var(--font-mono)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>COMMAND BREAKER ►</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>KNIFE SWITCH BUS</div>
              <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', color: subsystems.command ? '#ffaa00' : '#444444' }}>
                STATUS: {subsystems.command ? 'ENFORCED' : 'OFFLINE'}
              </div>
            </div>

            {/* Bottom Floor Grating Panel */}
            <div
              style={{
                position: 'absolute',
                bottom: '-15%',
                left: '10%',
                right: '10%',
                height: '35%',
                background: 'linear-gradient(to top, rgba(2, 2, 2, 0.95), transparent)',
                transform: 'rotateX(60deg) translateY(100px)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                paddingBottom: '1rem',
              }}
            >
              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '0.12em' }}>
                [METAL GRATE FLOOR // CONDUIT ABYSS]
              </span>
            </div>
          </div>
        </div>

        {/* ─── First-Person WASD Navigation HUD Dock (Over Image) ────────── */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(6, 9, 14, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 1rem',
            zIndex: 40,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem',
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
              onClick={() => setCamera((c) => ({ ...c, posZ: Math.min(180, c.posZ + 35) }))}
              title="Walk forward towards the central core"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [W] FORWARD
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => setCamera((c) => ({ ...c, posZ: Math.max(-50, c.posZ - 35) }))}
              title="Step back / move away"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [S] BACK
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => setCamera((c) => ({ ...c, yaw: Math.max(-45, c.yaw - 20) }))}
              title="Turn camera left towards memory banks"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [A] LEFT
            </button>
            <button
              type="button"
              className="hud-btn"
              onClick={() => setCamera((c) => ({ ...c, yaw: Math.min(45, c.yaw + 20) }))}
              title="Turn camera right towards command console"
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
            >
              [D] RIGHT
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
            gap: '0.85rem',
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
              <button
                type="button"
                className="hud-btn"
                onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
              >
                ✕ STEP BACK TO ROOM
              </button>
            </div>

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
              <button
                type="button"
                className="hud-btn"
                onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
              >
                ✕ STEP BACK TO ROOM
              </button>
            </div>

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
              <button
                type="button"
                className="hud-btn"
                onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
              >
                ✕ STEP BACK TO ROOM
              </button>
            </div>

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
