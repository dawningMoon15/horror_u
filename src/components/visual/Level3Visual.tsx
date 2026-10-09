import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level3VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
  activeStep?: 1 | 2 | 3;
  hints?: string[];
  hintIndex?: number;
  onRequestHint?: () => void;
}

export const Level3Visual: React.FC<Level3VisualProps> = ({
  onSolve,
  unlocked,
  activeStep = 1,
  hints = [],
  hintIndex = 0,
  onRequestHint,
}) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'c1' | 'c2' | 'c3'>('none');
  const [showHint, setShowHint] = useState(false);
  const [solveMessage, setSolveMessage] = useState<string | null>(null);

  // Clue 1: Switches
  const [activeSwitch, setActiveSwitch] = useState<number | null>(null);

  // Clue 2: Telemetry
  const [telemetryInput, setTelemetryInput] = useState('');

  // Clue 3: Keypad Code
  const [enteredCode, setEnteredCode] = useState('');
  const [isBoltsOpening, setIsBoltsOpening] = useState(unlocked);

  const handleToggleHint = () => {
    sound.playKeyClick();
    setShowHint((prev) => !prev);
    if (!showHint && onRequestHint) {
      onRequestHint();
    }
  };

  // Clue 1: Toggle Switch
  const handleToggleSwitch = (switchNum: number) => {
    sound.playKeyClick();
    setActiveSwitch(switchNum);

    if (switchNum === 2) {
      sound.playSuccessChime();
      setSolveMessage('CIRCUIT LINK ESTABLISHED // SWITCH 2 ROUTES TO GAMMA');
      setTimeout(() => {
        onSolve('2');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage(`SWITCH ${switchNum} MISROUTED // CHECK INDICATOR LEGEND`);
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 2: Telemetry Code
  const handleTelemetrySubmit = () => {
    sound.playKeyClick();
    if (telemetryInput.trim() === '987' || telemetryInput.trim() === '9-8-7') {
      sound.playSuccessChime();
      setSolveMessage('TELEMETRY DECODED // SEQUENCE 987 VERIFIED');
      setTimeout(() => {
        onSolve('987');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('INCORRECT GLYPH SEQUENCE // MATCH Ω, Ψ, λ TO LEGEND');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 3: Keypad
  const handleKeyPress = (num: string) => {
    sound.playKeyClick();
    if (enteredCode.length < 5) {
      setEnteredCode((prev) => prev + num);
    }
  };

  const handleClear = () => {
    sound.playKeyClick();
    setEnteredCode('');
  };

  const handleKeypadEnter = () => {
    sound.playKeyClick();
    if (enteredCode === '31987') {
      sound.playHeavyUnlock();
      setIsBoltsOpening(true);
      setSolveMessage('ACCESS GRANTED // COMBINED CODE 31987 ACCEPTED');
      setTimeout(() => {
        onSolve('31987');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('INVALID CODE // COMBINE LVL 1 (3) + LVL 2 (1987)');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-c1',
      label: 'Console Junction Switches (Clue 1)',
      xPercent: 50,
      yPercent: 54,
      step: 1,
      onActivate: () => {
        setShowHint(false);
        setInspectMode('c1');
      },
    },
    {
      id: 'hotspot-c2',
      label: 'Oscilloscope Telemetry Screen (Clue 2)',
      xPercent: 22,
      yPercent: 44,
      step: 2,
      onActivate: () => {
        if (activeStep < 2) {
          sound.playErrorBuzz();
          return;
        }
        setShowHint(false);
        setInspectMode('c2');
      },
    },
    {
      id: 'hotspot-c3',
      label: 'Vault Keypad & Deadbolts (Clue 3)',
      xPercent: 88,
      yPercent: 58,
      step: 3,
      onActivate: () => {
        if (activeStep < 3) {
          sound.playErrorBuzz();
          return;
        }
        setShowHint(false);
        setInspectMode('c3');
      },
    },
  ];

  const stepObjectives: Record<number, string> = {
    1: 'PHASE 1/3: LOCATE CONSOLE JUNCTION TOGGLE SWITCHES',
    2: 'PHASE 2/3: LOCATE & DECODE OSCILLOSCOPE TELEMETRY',
    3: 'PHASE 3/3: INPUT 5-DIGIT ESCAPE CIPHER ON KEYPAD',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level3_vault.jpg"
      imageAlt="Massive heavy steel vault door with keypad and yellow hazard stripes"
      title="ROOM 03 // THE CONTROL ROOM"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[activeStep]}
      currentStep={activeStep}
      roomDuration={120}
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode('none')}
    >
      {/* ─── CLUE 1 POP-UP: The Misrouted Switch ──────────────────────────── */}
      {inspectMode === 'c1' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Switches Clue 1">
          <div className="inspect-header">
            <span className="inspect-title">⚡ CLUE 1/3: CONSOLE JUNCTION SWITCHES</span>
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
                onClick={() => {
                  sound.playKeyClick();
                  setInspectMode('none');
                }}
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
                'Circuit wiring: Switch 1 routes to Beta, Switch 2 routes to Gamma, Switch 3 routes to Alpha. Toggle Switch 2.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--color-phosphor-green)', fontWeight: 700 }}>
              {solveMessage}
            </div>
          )}

          <div
            style={{
              background: '#040b06',
              border: '2px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              color: '#fff',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
              Circuit routing schematic: Switch 1 ➔ Beta, Switch 2 ➔ Gamma, Switch 3 ➔ Alpha.<br />
              <strong>Which switch controls indicator Gamma?</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { id: 1, label: 'SWITCH 01', routesTo: 'BETA' },
                { id: 2, label: 'SWITCH 02', routesTo: 'GAMMA' },
                { id: 3, label: 'SWITCH 03', routesTo: 'ALPHA' },
              ].map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleToggleSwitch(sw.id)}
                  style={{
                    padding: '1.25rem 0.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: activeSwitch === sw.id ? 'rgba(0, 255, 136, 0.2)' : 'rgba(15, 20, 30, 0.9)',
                    borderColor: activeSwitch === sw.id ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
                  }}
                >
                  <span style={{ fontSize: '1.75rem' }}>{activeSwitch === sw.id ? '🟢' : '⚪'}</span>
                  <strong style={{ color: '#fff' }}>{sw.label}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-cyber-cyan)' }}>➔ {sw.routesTo}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 2 POP-UP: The Corrupted Display ─────────────────────────── */}
      {inspectMode === 'c2' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Oscilloscope Clue 2">
          <div className="inspect-header">
            <span className="inspect-title">📊 CLUE 2/3: OSCILLOSCOPE TELEMETRY</span>
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
                onClick={() => {
                  sound.playKeyClick();
                  setInspectMode('none');
                }}
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
                'Legend: Ω=9, Ψ=8, λ=7. The glyph sequence [Ω][Ψ][λ] translates directly to 987.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--color-phosphor-green)', fontWeight: 700 }}>
              {solveMessage}
            </div>
          )}

          <div
            style={{
              background: '#040b06',
              border: '2px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '1.25rem',
              color: 'var(--color-phosphor-green)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <div style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '0.4em', margin: '1rem 0' }}>
              [ Ω ] &nbsp; [ Ψ ] &nbsp; [ λ ]
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.7)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', marginBottom: '1.25rem', color: 'var(--color-text-secondary)' }}>
              CALIBRATION LEGEND: &nbsp; Ω = 9 &nbsp;|&nbsp; Ψ = 8 &nbsp;|&nbsp; λ = 7
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <input
                type="text"
                className="terminal-input"
                style={{ width: '180px', height: '38px', padding: '0.4rem 0.75rem', fontSize: '0.9rem', textAlign: 'center' }}
                placeholder="Enter 3 digits..."
                value={telemetryInput}
                onChange={(e) => setTelemetryInput(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ height: '38px', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
                onClick={handleTelemetrySubmit}
              >
                DECODE ↵
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 3 POP-UP: Electronic Keypad & Retracting Deadbolts ────────── */}
      {inspectMode === 'c3' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Keypad Clue 3">
          <div className="inspect-header">
            <span className="inspect-title">🔢 CLUE 3/3: ELECTRONIC VAULT KEYPAD</span>
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
                onClick={() => {
                  sound.playKeyClick();
                  setInspectMode('none');
                }}
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
                'Combine Level 1 (3) + Level 2 (1987) = 31987.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--color-phosphor-green)', fontWeight: 700 }}>
              {solveMessage}
            </div>
          )}

          <div className="level3-vault-keypad">
            <div className="keypad-display-screen">
              <div className="keypad-display-digits">
                {enteredCode.padEnd(5, '_')}
              </div>
            </div>

            <div className="keypad-matrix-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="keypad-num-btn"
                  onClick={() => handleKeyPress(digit)}
                  disabled={isBoltsOpening}
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                className="keypad-num-btn clear"
                onClick={handleClear}
                disabled={isBoltsOpening}
              >
                CLR
              </button>
              <button
                type="button"
                className="keypad-num-btn"
                onClick={() => handleKeyPress('0')}
                disabled={isBoltsOpening}
              >
                0
              </button>
              <button
                type="button"
                className="keypad-num-btn enter"
                onClick={handleKeypadEnter}
                disabled={isBoltsOpening || enteredCode.length === 0}
              >
                ENT ↵
              </button>
            </div>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
