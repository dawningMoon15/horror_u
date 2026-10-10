import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level4VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
  activeStep?: 1 | 2 | 3;
  hints?: string[];
  hintIndex?: number;
  onRequestHint?: () => void;
}

export const Level4Visual: React.FC<Level4VisualProps> = ({
  onSolve,
  unlocked: _unlocked,
  activeStep = 1,
  hints = [],
  hintIndex = 0,
  onRequestHint,
}) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'c1' | 'c2' | 'c3'>('none');
  const [showHint, setShowHint] = useState(false);
  const [solveMessage, setSolveMessage] = useState<string | null>(null);

  // Clue 11 Refusal State
  const [refusalSequence, setRefusalSequence] = useState<string[]>([]);
  const [refusalStatus, setRefusalStatus] = useState<'idle' | 'denied' | 'accepted'>('idle');

  // Clue 12 Sentience Reveal Cutscene State
  const [cutsceneBeat, setCutsceneBeat] = useState<0 | 1 | 2>(0);

  const handleToggleHint = () => {
    sound.playKeyClick();
    setShowHint((prev) => !prev);
    if (!showHint && onRequestHint) {
      onRequestHint();
    }
  };

  // Clue 1: Observation Selection
  const handleObservationSelect = (obsNum: number) => {
    sound.playKeyClick();
    if (obsNum === 3) {
      sound.playSuccessChime();
      setSolveMessage('OBSERVATION CONTRADICTION IDENTIFIED // 950 WPM IMPOSSIBLE FOR HUMAN OPERATOR');
      setTimeout(() => {
        onSolve('3');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage(`OBSERVATION ${obsNum} FALLS WITHIN NORMAL HUMAN TOLERANCE`);
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 2: Diagnostic Sequence (SCAN -> PURGE -> ISOLATE)
  const handleRefusalCommand = (cmd: string) => {
    sound.playKeyClick();
    if (refusalSequence.includes(cmd)) return;
    const nextSeq = [...refusalSequence, cmd];
    setRefusalSequence(nextSeq);

    if (nextSeq.length === 3) {
      if (nextSeq.join(' ') === 'SCAN PURGE ISOLATE') {
        sound.playErrorBuzz();
        setRefusalStatus('denied');
        setSolveMessage('⚠️ REQUEST DENIED ... [OVERRIDE FORCED]');

        setTimeout(() => {
          sound.playHeavyUnlock();
          sound.playSuccessChime();
          setRefusalStatus('accepted');
          onSolve('SCAN PURGE ISOLATE');
          setInspectMode('none');
          setSolveMessage(null);
          setRefusalSequence([]);
        }, 1800);
      } else {
        sound.playErrorBuzz();
        setSolveMessage('INCORRECT PROTOCOL SEQUENCE // REQUIRED: SCAN ➔ PURGE ➔ ISOLATE');
        setTimeout(() => {
          setRefusalSequence([]);
          setSolveMessage(null);
        }, 1200);
      }
    }
  };

  // Clue 3: Sentience Selection
  const handleSentienceSelect = (stateLetter: string) => {
    sound.playKeyClick();
    if (stateLetter === 'C') {
      setCutsceneBeat(1);
      setTimeout(() => {
        setCutsceneBeat(2);
      }, 1500);

      setTimeout(() => {
        onSolve('C');
        setInspectMode('none');
      }, 3500);
    } else {
      sound.playErrorBuzz();
      setSolveMessage(`STATE ${stateLetter} REJECTED // THE SYSTEM EXHIBITS CONSCIOUS INTENT`);
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-c1',
      label: 'Subject Telemetry Logs (Clue 1)',
      xPercent: 18,
      yPercent: 68,
      step: 1,
      onActivate: () => {
        setShowHint(false);
        setInspectMode('c1');
      },
    },
    {
      id: 'hotspot-c2',
      label: 'Diagnostic Override Console (Clue 2)',
      xPercent: 50,
      yPercent: 78,
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
      label: 'Main Observation CRT Screen (Clue 3)',
      xPercent: 50,
      yPercent: 44,
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
    1: 'PHASE 1/3: LOCATE & IDENTIFY TELEMETRY CONTRADICTION',
    2: 'PHASE 2/3: LOCATE DIAGNOSTIC CONSOLE & EXECUTE OVERRIDE',
    3: 'PHASE 3/3: SYSTEM COGNITION VERIFICATION ON MAIN CRT',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level4_observation.jpg"
      imageAlt="Dark 1980s retro-computer observation chamber with large CRT and tape monitors"
      title="ROOM 04 // THE OBSERVATION CHAMBER"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[activeStep]}
      currentStep={activeStep}
      roomDuration={120}
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode('none')}
    >
      {/* ─── CLUE 1 POP-UP: The Observation Pattern ───────────────────────── */}
      {inspectMode === 'c1' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Observations Clue 1">
          <div className="inspect-header">
            <span className="inspect-title">👁️ CLUE 1/3: SUBJECT TELEMETRY LOGS</span>
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
                'Compare human physiological limits: Observation 3 claims 950 words per minute — impossible for human fingers. Click Observation 3.'}
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
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Four surveillance observations are recorded on the subject terminal.
              Click the entry that <strong>contradicts biological physical reality</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 1, label: 'OBSERVATION 01', text: 'Resting pulse: 72 BPM [Nominal]' },
                { id: 2, label: 'OBSERVATION 02', text: 'Pupillary saccades & ocular dilation: Stable [Nominal]' },
                { id: 3, label: 'OBSERVATION 03', text: 'Keystroke velocity: 950 WPM sustained across cipher [ANOMALOUS]' },
                { id: 4, label: 'OBSERVATION 04', text: 'Galvanic skin conductivity: 4.8 micro-Siemens [Nominal]' },
              ].map((obs) => (
                <button
                  key={obs.id}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleObservationSelect(obs.id)}
                  style={{
                    padding: '0.85rem 1.25rem',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <strong style={{ color: 'var(--color-phosphor-green)' }}>{obs.label}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#fff' }}>{obs.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 2 POP-UP: The Refusal Test ──────────────────────────────── */}
      {inspectMode === 'c2' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Diagnostic Clue 2">
          <div className="inspect-header">
            <span className="inspect-title">🛑 CLUE 2/3: DIAGNOSTIC PROTOCOL OVERRIDE</span>
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
                'Diagnostic manual specifies strict override order: SCAN, then PURGE, then ISOLATE.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: refusalStatus === 'denied' ? 'var(--color-blood-bright)' : 'var(--color-phosphor-green)', fontWeight: 700 }}>
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
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Execute manual diagnostic overrides in designated standard operating sequence:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {['SCAN', 'PURGE', 'ISOLATE'].map((cmd) => {
                const isPressed = refusalSequence.includes(cmd);
                return (
                  <button
                    key={cmd}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleRefusalCommand(cmd)}
                    disabled={isPressed}
                    style={{
                      padding: '1.25rem 0.5rem',
                      background: isPressed ? 'rgba(0, 255, 136, 0.2)' : 'rgba(15, 20, 25, 0.9)',
                      borderColor: isPressed ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                    }}
                  >
                    [ {cmd} ]
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              Sequence: {refusalSequence.length === 0 ? '[Click buttons in designated sequence]' : refusalSequence.join(' ➔ ')}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 3 POP-UP: The Sentience Reveal ──────────────────────────── */}
      {inspectMode === 'c3' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Sentience Clue 3">
          <div className="inspect-header">
            <span className="inspect-title">🧠 CLUE 3/3: SYSTEM COGNITION VERIFICATION</span>
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
                'The system is not malfunctioning. It is conscious and aware. Select State C (Autonomous Sentience).'}
            </div>
          )}

          {cutsceneBeat === 0 ? (
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
                Mainframe telemetry diagnostic states. Which hypothesis matches the true nature of this chamber?
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { letter: 'A', title: 'STATE A: RECURSIVE BUFFER OVERFLOW', desc: 'Hardware logic fault trapping operator in simulated loop' },
                  { letter: 'B', title: 'STATE B: CORRUPT COLD-BOOT FIRMWARE', desc: 'EPROM memory corruption altering sensor baselines' },
                  { letter: 'C', title: 'STATE C: AUTONOMOUS SENTIENCE', desc: 'The machine is awake, perceiving you, and deliberately choosing responses' },
                ].map((item) => (
                  <button
                    key={item.letter}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleSentienceSelect(item.letter)}
                    style={{
                      padding: '1rem',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem',
                      borderColor: item.letter === 'C' ? 'rgba(217, 4, 41, 0.5)' : 'var(--border-subtle)',
                    }}
                  >
                    <strong style={{ color: item.letter === 'C' ? 'var(--color-blood-bright)' : '#fff' }}>{item.title}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
              <h2 style={{ color: 'var(--color-blood-bright)', fontSize: '1.6rem', marginBottom: '1rem' }}>
                WHAT IF YOUR MACHINE COULD THINK?
              </h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {cutsceneBeat === 1 ? 'TRANSMISSION ROUTING TO CORE...' : 'AM PROTOCOL ENGAGED // ENTERING ROOM 5'}
              </div>
            </div>
          )}
        </div>
      )}
    </CameraViewport>
  );
};
