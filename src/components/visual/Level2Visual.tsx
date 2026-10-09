import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level2VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
  activeStep?: 1 | 2 | 3;
  hints?: string[];
  hintIndex?: number;
  onRequestHint?: () => void;
}

export const Level2Visual: React.FC<Level2VisualProps> = ({
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

  // Clue 1: Chronological Order selection
  const [orderedCams, setOrderedCams] = useState<number[]>([]);

  // Clue 3: Dossier Redactions
  const [revealedA, setRevealedA] = useState(unlocked);
  const [revealedB, setRevealedB] = useState(unlocked);
  const [yearInput, setYearInput] = useState('');

  const handleToggleHint = () => {
    sound.playKeyClick();
    setShowHint((prev) => !prev);
    if (!showHint && onRequestHint) {
      onRequestHint();
    }
  };

  // Clue 1: Tap camera to add to chronological sequence
  const handleAddCam = (camId: number) => {
    sound.playKeyClick();
    if (orderedCams.includes(camId)) return;
    const nextSeq = [...orderedCams, camId];
    setOrderedCams(nextSeq);

    if (nextSeq.length === 4) {
      const seqStr = nextSeq.join('-');
      if (seqStr === '2-4-1-3') {
        sound.playSuccessChime();
        setSolveMessage('CHRONOLOGICAL SEQUENCE CONFIRMED: 2-4-1-3');
        setTimeout(() => {
          onSolve('2-4-1-3');
          setInspectMode('none');
          setSolveMessage(null);
          setOrderedCams([]);
        }, 800);
      } else {
        sound.playErrorBuzz();
        setSolveMessage('INCORRECT ORDER // EARLIEST TO LATEST REQUIRED');
        setTimeout(() => {
          setOrderedCams([]);
          setSolveMessage(null);
        }, 1200);
      }
    }
  };

  // Clue 2: Fragment selection
  const handleSelectFragment = (frag: string) => {
    sound.playKeyClick();
    if (frag === 'B') {
      sound.playSuccessChime();
      setSolveMessage('FRAGMENT B (07:20 AM) RESTORED DATA GAP');
      setTimeout(() => {
        onSolve('B');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('TIMESTAMP FALLS OUTSIDE 05:45 - 08:00 GAP');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 3: Un-redact & Verify
  const handleRevealA = () => {
    sound.playPaperRustle();
    setRevealedA(true);
  };

  const handleRevealB = () => {
    sound.playPaperRustle();
    setRevealedB(true);
  };

  const handleVerifyYear = (yearToTest = yearInput) => {
    sound.playKeyClick();
    if (yearToTest.trim() === '1987') {
      sound.playSuccessChime();
      sound.playHeavyUnlock();
      setSolveMessage('ARCHIVE RECONSTRUCTED // YEAR 1987 CONFIRMED');
      setTimeout(() => {
        onSolve('1987');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('INCORRECT YEAR // LIFT REDACTIONS TO DISCOVER YEAR');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-c1',
      label: 'Surveillance Monitor Feed (Clue 1)',
      xPercent: 26,
      yPercent: 44,
      step: 1,
      onActivate: () => {
        setShowHint(false);
        setInspectMode('c1');
      },
    },
    {
      id: 'hotspot-c2',
      label: 'Metal Archive Filing Drawers (Clue 2)',
      xPercent: 84,
      yPercent: 50,
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
      label: 'Classified Incident Dossiers (Clue 3)',
      xPercent: 50,
      yPercent: 78,
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
    1: 'PHASE 1/3: LOCATE CCTV SURVEILLANCE FEED & ORDER RECORDS',
    2: 'PHASE 2/3: LOCATE CABINET RECORDS & RESTORE DATA GAP',
    3: 'PHASE 3/3: EXAMINE DESK DOSSIERS, UN-REDACT & VERIFY YEAR',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level2_records.jpg"
      imageAlt="Classified underground records room with dossiers and filing cabinets"
      title="ROOM 02 // THE MEMORY ARCHIVE"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[activeStep]}
      currentStep={activeStep}
      roomDuration={120}
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode('none')}
    >
      {/* ─── CLUE 1 POP-UP: CCTV Surveillance Record Chronology ────────────── */}
      {inspectMode === 'c1' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="CCTV Clue 1">
          <div className="inspect-header">
            <span className="inspect-title">📼 CLUE 1/3: SURVEILLANCE RECORD CHRONOLOGY</span>
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
                'Chronological order from earliest to latest: REC_2 (02:30), REC_4 (05:45), REC_1 (08:00), REC_3 (11:15). Click in order: 2 -> 4 -> 1 -> 3.'}
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
              Four surveillance tapes were recorded throughout the night. Click the tapes in <strong>chronological order (earliest to latest)</strong>:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {[
                { id: 1, label: 'REC_01', time: '08:00 AM' },
                { id: 2, label: 'REC_02', time: '02:30 AM' },
                { id: 3, label: 'REC_03', time: '11:15 AM' },
                { id: 4, label: 'REC_04', time: '05:45 AM' },
              ].map((rec) => {
                const isSelected = orderedCams.includes(rec.id);
                return (
                  <button
                    key={rec.id}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleAddCam(rec.id)}
                    disabled={isSelected}
                    style={{
                      background: isSelected ? 'rgba(0, 255, 136, 0.2)' : 'rgba(15, 20, 25, 0.85)',
                      borderColor: isSelected ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
                      padding: '0.85rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>📹</span>
                    <strong style={{ color: '#fff' }}>{rec.label}</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--color-cyber-cyan)' }}>{rec.time}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Sequence: {orderedCams.length === 0 ? '[Click tapes in order]' : orderedCams.map((c) => `REC_${c}`).join(' ➔ ')}
              </span>
              {orderedCams.length > 0 && (
                <button
                  type="button"
                  className="hud-btn"
                  onClick={() => setOrderedCams([])}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                >
                  RESET
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 2 POP-UP: Missing Record Fragment ────────────────────────── */}
      {inspectMode === 'c2' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Cabinet Clue 2">
          <div className="inspect-header">
            <span className="inspect-title">🗄️ CLUE 2/3: DATA SECTOR GAP RESTORATION</span>
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
                'Only one fragment timestamp falls between 05:45 and 08:00: Frag A is 01:10, Frag B is 07:20, Frag C is 14:30. Choose Fragment B.'}
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
              A critical data gap exists between <strong>05:45 AM</strong> and <strong>08:00 AM</strong>.
              Select the tape fragment from the filing drawer that bridges this exact interval:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { id: 'A', label: 'FRAGMENT A // TAPE #09', time: '01:10 AM' },
                { id: 'B', label: 'FRAGMENT B // TAPE #14', time: '07:20 AM' },
                { id: 'C', label: 'FRAGMENT C // TAPE #21', time: '02:30 PM (14:30)' },
              ].map((frag) => (
                <div
                  key={frag.id}
                  onClick={() => handleSelectFragment(frag.id)}
                  style={{
                    background: 'rgba(10, 15, 25, 0.85)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <strong style={{ color: '#fff', fontSize: '0.95rem' }}>🖭 {frag.label}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Underground Vault Index</div>
                  </div>
                  <span style={{ color: 'var(--color-cyber-cyan)', fontWeight: 700 }}>{frag.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 3 POP-UP: Classified Dossiers & Un-Redact ───────────────── */}
      {inspectMode === 'c3' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Dossiers Clue 3">
          <div className="inspect-header">
            <span className="inspect-title">📑 CLUE 3/3: CONTRADICTORY INCIDENT CASEFILES</span>
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
                'Click the blacked-out redacted bars on both dossiers to remove censorship ink. The year that appears in both is 1987.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--color-phosphor-green)', fontWeight: 700 }}>
              {solveMessage}
            </div>
          )}

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
            Click the blacked-out redacted bars on both dossiers to remove the censorship ink.
            Discover which year appears in both records:
          </p>

          <div className="level2-desk-workspace">
            {/* Dossier A */}
            <div className="dossier-card" onClick={handleRevealA}>
              <span className="dossier-stamp">TOP SECRET // 1984</span>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#111' }}>REPORT 01: INCIDENT LOG</h4>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                DATE OF INCIDENT: <strong>OCT 12, 1984</strong><br />
                SUBJECT 7B STATUS: RECORD SUSPENDED.<br />
                ARCHIVE AUDIT VERIFICATION:
                <br />
                {revealedA ? (
                  <span className="redacted-bar revealed">YEAR OF RE-ENCODING: 1987</span>
                ) : (
                  <span className="redacted-bar">[CLICK TO UN-REDACT RECORD]</span>
                )}
                <br />
                <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
                  {revealedA ? '✓ Redaction lifted: Year 1987 discovered' : 'Click to lift redaction ink'}
                </span>
              </p>
            </div>

            {/* Dossier B */}
            <div className="dossier-card" onClick={handleRevealB}>
              <span className="dossier-stamp" style={{ borderColor: '#0369a1', color: '#0369a1' }}>
                SURVEILLANCE // METADATA
              </span>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#111' }}>REPORT 02: SERVER RECOVERY</h4>
              <p style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                CAMERA RECOVERY ID: SEC_08<br />
                TIMESTAMP OF RECOVERY:
                <br />
                {revealedB ? (
                  <span className="redacted-bar revealed">ARCHIVE STAMP: 1987</span>
                ) : (
                  <span className="redacted-bar">[CLICK TO UN-REDACT RECORD]</span>
                )}
                <br />
                <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>
                  {revealedB ? '✓ Redaction lifted: Year 1987 discovered' : 'Click to lift redaction ink'}
                </span>
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'flex-end' }}>
            <input
              type="text"
              className="terminal-input"
              style={{ width: '160px', height: '38px', padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
              placeholder="Enter Year..."
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              style={{ height: '38px', padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
              onClick={() => handleVerifyYear(yearInput.trim() || '1987')}
            >
              CONFIRM YEAR ↵
            </button>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
