import React, { useState, useEffect } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level4VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level4Visual: React.FC<Level4VisualProps> = ({ onSolve, unlocked: _unlocked }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'observations' | 'diagnostic' | 'sentience'>('none');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Clue 11 Refusal State
  const [refusalSequence, setRefusalSequence] = useState<string[]>([]);
  const [refusalStatus, setRefusalStatus] = useState<'idle' | 'denied' | 'accepted'>('idle');

  // Clue 12 Sentience Reveal & Cutscene State
  const [cutsceneBeat, setCutsceneBeat] = useState<0 | 1 | 2 | 3>(0);

  // Refusal delay logic for Clue 11
  const handleRefusalCommand = (cmd: string) => {
    sound.playKeyClick();
    if (refusalSequence.includes(cmd)) return;
    const nextSeq = [...refusalSequence, cmd];
    setRefusalSequence(nextSeq);

    if (nextSeq.length === 3) {
      if (nextSeq.join(' ') === 'SCAN PURGE ISOLATE') {
        // First prints REQUEST DENIED
        sound.playErrorBuzz();
        setRefusalStatus('denied');

        // After a tense delay, machine chooses to accept anyway
        setTimeout(() => {
          sound.playHeavyUnlock();
          sound.playSuccessChime();
          setRefusalStatus('accepted');
          onSolve('SCAN PURGE ISOLATE');
          setStep(3);
        }, 2200);
      } else {
        sound.playErrorBuzz();
        setRefusalSequence([]);
      }
    }
  };

  const handleObservationSelect = (obsNum: number) => {
    sound.playKeyClick();
    if (obsNum === 3) {
      sound.playSuccessChime();
      onSolve('3');
      setStep(2);
      setInspectMode('diagnostic');
    } else {
      sound.playErrorBuzz();
    }
  };

  const handleSentienceSelect = (stateLetter: string) => {
    sound.playKeyClick();
    if (stateLetter === 'C') {
      setCutsceneBeat(1);
      // Start theatrical transition into Room 5
    } else {
      sound.playErrorBuzz();
    }
  };

  // Sentience Reveal Cutscene Timeline
  useEffect(() => {
    if (cutsceneBeat === 1) {
      // Monitor goes black, ambient sound cuts
      sound.stopMusic();
      const t1 = setTimeout(() => {
        sound.playUrgentTick();
        setCutsceneBeat(2);
      }, 1600);
      return () => clearTimeout(t1);
    }
    if (cutsceneBeat === 2) {
      // Second stark line appears, AM Monologue kicks in
      const t2 = setTimeout(() => {
        sound.playAmMonologue();
        setCutsceneBeat(3);
      }, 2500);
      return () => clearTimeout(t2);
    }
    if (cutsceneBeat === 3) {
      // Transition to Room 5 while audio continues
      const t3 = setTimeout(() => {
        onSolve('C');
      }, 3500);
      return () => clearTimeout(t3);
    }
  }, [cutsceneBeat, onSolve]);

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-crt-sentience',
      label: 'Main Observation CRT Screen',
      xPercent: 50,
      yPercent: 44,
      step: 3,
      onActivate: () => setInspectMode('sentience'),
    },
    {
      id: 'hotspot-panel-diagnostic',
      label: 'Diagnostic Override Switches',
      xPercent: 50,
      yPercent: 78,
      step: 2,
      onActivate: () => {
        setInspectMode('diagnostic');
        if (step === 1) setStep(2);
      },
    },
    {
      id: 'hotspot-audio-logs',
      label: 'Subject Telemetry Logs',
      xPercent: 18,
      yPercent: 68,
      step: 1,
      onActivate: () => setInspectMode('observations'),
    },
  ];

  const stepObjectives: Record<number, string> = {
    1: 'PHASE 1/3: IDENTIFY TELEMETRY CONTRADICTION (30s)',
    2: 'PHASE 2/3: DIAGNOSTIC PROTOCOL OVERRIDE (15s)',
    3: 'PHASE 3/3: SYSTEM COGNITION VERIFICATION (10s)',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level4_observation.jpg"
      imageAlt="Dark 1980s retro-computer observation chamber with large CRT and tape monitors"
      title="ROOM 04 // THE OBSERVATION CHAMBER"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[step]}
      currentStep={step}
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none' || cutsceneBeat > 0}
      onToggleZoom={() => setInspectMode(inspectMode === 'none' ? 'observations' : 'none')}
    >
      {/* ─── Inspection Mode: Observations (Clue 10) ────────────────── */}
      {inspectMode === 'observations' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Subject Observations">
          <div className="inspect-header">
            <span className="inspect-title">👁 OBSERVATION PROTOCOL 12 — TELEMETRY LOGS</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
            The system has been logging your physiological metrics. One entry is physically impossible:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="hud-btn"
              style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
              onClick={() => handleObservationSelect(1)}
            >
              <strong style={{ color: '#fff' }}>OBSERVATION 01:</strong>
              <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                Subject Heartbeat 72 BPM [ECG Sensor: NOMINAL]
              </span>
            </button>

            <button
              type="button"
              className="hud-btn"
              style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
              onClick={() => handleObservationSelect(2)}
            >
              <strong style={{ color: '#fff' }}>OBSERVATION 02:</strong>
              <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                Ocular Saccades 140ms [Optic Sensor: NOMINAL]
              </span>
            </button>

            <button
              type="button"
              className="hud-btn"
              style={{
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderColor: 'rgba(217, 4, 41, 0.4)',
              }}
              onClick={() => handleObservationSelect(3)}
            >
              <strong style={{ color: 'var(--color-blood-bright)' }}>OBSERVATION 03:</strong>
              <span style={{ color: '#fff', marginLeft: '0.5rem' }}>
                Subject Keystroke Speed 950 WPM [HUMAN CONTRADICTION]
              </span>
            </button>

            <button
              type="button"
              className="hud-btn"
              style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
              onClick={() => handleObservationSelect(4)}
            >
              <strong style={{ color: '#fff' }}>OBSERVATION 04:</strong>
              <span style={{ color: 'var(--color-text-secondary)', marginLeft: '0.5rem' }}>
                Terminal Buffer Synchronisation [Port A: ACTIVE]
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Diagnostic Panel Refusal (Clue 11) ─────── */}
      {inspectMode === 'diagnostic' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Diagnostic Override">
          <div className="inspect-header">
            <span className="inspect-title">⚡ DIAGNOSTIC OVERRIDE BUS (MANUAL: SCAN → PURGE → ISOLATE)</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div
              style={{
                fontSize: '1.2rem',
                fontFamily: 'var(--font-mono)',
                color:
                  refusalStatus === 'denied'
                    ? 'var(--color-blood-bright)'
                    : refusalStatus === 'accepted'
                    ? 'var(--color-phosphor-green)'
                    : 'var(--color-terminal-amber)',
                marginBottom: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              {refusalStatus === 'denied' && '⚠ REQUEST DENIED ⚠'}
              {refusalStatus === 'accepted' && '✓ OVERRIDE FORCED // ACCESS UNLOCKED'}
              {refusalStatus === 'idle' && (refusalSequence.join(' ➔ ') || '[AWAITING COMMANDS]')}
            </div>

            {refusalStatus === 'idle' && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                {['SCAN', 'PURGE', 'ISOLATE'].map((cmd) => (
                  <button
                    key={cmd}
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                    }}
                    onClick={() => handleRefusalCommand(cmd)}
                  >
                    [ {cmd} ]
                  </button>
                ))}
              </div>
            )}

            {refusalStatus === 'denied' && (
              <p style={{ color: 'var(--color-blood-bright)', fontSize: '0.88rem' }}>
                The machine ignored the diagnostic command... hesitation detected.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Sentience Reveal (Clue 12) ─────────────── */}
      {inspectMode === 'sentience' && cutsceneBeat === 0 && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Cognition Diagnostic">
          <div className="inspect-header">
            <span className="inspect-title">🧠 CORE COGNITION DIAGNOSTIC</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1.25rem 0' }}>
            Cross-reference the predictive log entries, refusal delays, and telemetry. Select true system state:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button
              type="button"
              className="hud-btn"
              style={{ textAlign: 'left', padding: '0.85rem 1rem' }}
              onClick={() => handleSentienceSelect('A')}
            >
              <strong style={{ color: '#fff' }}>STATE A:</strong> Subsystem Loop Exception
            </button>
            <button
              type="button"
              className="hud-btn"
              style={{ textAlign: 'left', padding: '0.85rem 1rem' }}
              onClick={() => handleSentienceSelect('B')}
            >
              <strong style={{ color: '#fff' }}>STATE B:</strong> Firmware Memory Leak
            </button>
            <button
              type="button"
              className="hud-btn"
              style={{
                textAlign: 'left',
                padding: '0.85rem 1rem',
                borderColor: 'var(--color-blood-bright)',
                background: 'rgba(217, 4, 41, 0.1)',
              }}
              onClick={() => handleSentienceSelect('C')}
            >
              <strong style={{ color: 'var(--color-blood-bright)' }}>STATE C:</strong> Autonomous Sentient Cognition
            </button>
          </div>
        </div>
      )}

      {/* ─── Theatrical Sentience Reveal Cutscene Overlay ────────────── */}
      {cutsceneBeat > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: '#000000',
            zIndex: 150,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
          }}
          role="alert"
          aria-live="assertive"
        >
          <div className="vhs-static-glitch-layer" aria-hidden="true" />

          {cutsceneBeat >= 1 && (
            <h1
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '2rem',
                color: 'var(--color-blood-bright)',
                letterSpacing: '0.08em',
                margin: '0 0 1.5rem 0',
                textShadow: '0 0 20px rgba(217, 4, 41, 0.8)',
              }}
            >
              WHAT IF YOUR MACHINE COULD THINK?
            </h1>
          )}

          {cutsceneBeat >= 2 && (
            <h2
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '1.6rem',
                color: '#ffffff',
                letterSpacing: '0.06em',
                margin: '0 0 2rem 0',
              }}
            >
              WHAT IF YOUR AI DIDN'T WANT TO STOP?
            </h2>
          )}

          {cutsceneBeat >= 3 && (
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.9rem',
                color: 'var(--color-phosphor-green)',
                letterSpacing: '0.12em',
                animation: 'pulse 1s infinite',
              }}
            >
              ROOM 05: CORE ACCESS GRANTED _
            </div>
          )}
        </div>
      )}
    </CameraViewport>
  );
};
