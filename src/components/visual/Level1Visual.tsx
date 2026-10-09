import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level1VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
  activeStep?: 1 | 2 | 3;
  hints?: string[];
  hintIndex?: number;
  onRequestHint?: () => void;
}

export const Level1Visual: React.FC<Level1VisualProps> = ({
  onSolve,
  unlocked,
  activeStep = 1,
  hints = [],
  hintIndex = 0,
  onRequestHint,
}) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'c1' | 'c2' | 'c3'>('none');
  const [showHint, setShowHint] = useState(false);
  const [dialValue, setDialValue] = useState(0);
  const [isDrawerUnlocked, setIsDrawerUnlocked] = useState(unlocked);
  const [solveMessage, setSolveMessage] = useState<string | null>(null);

  // Clue 1: Missing boot symbol selection
  const handleSelectBootSymbol = (symbol: string) => {
    sound.playKeyClick();
    if (symbol === '◆' || symbol.toLowerCase() === 'diamond') {
      sound.playSuccessChime();
      setSolveMessage('BOOT PATTERN ACCEPTED');
      setTimeout(() => {
        onSolve('diamond');
        setInspectMode('none');
        setSolveMessage(null);
      }, 700);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('INCORRECT BOOT SYMBOL');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 2: Earliest file selection
  const handleSelectFile = (fileName: string) => {
    sound.playKeyClick();
    if (fileName === '02_SYSLOG.DAT') {
      sound.playSuccessChime();
      setSolveMessage('FILE METADATA VERIFIED // PIN PREFIX: 3');
      setTimeout(() => {
        onSolve('02_syslog.dat');
        setInspectMode('none');
        setSolveMessage(null);
      }, 800);
    } else {
      sound.playErrorBuzz();
      setSolveMessage('TIMESTAMP TOO RECENT // CHECK MODIFICATION TIME');
      setTimeout(() => setSolveMessage(null), 1200);
    }
  };

  // Clue 3: Rotary padlock dial
  const handleDialChange = (delta: number) => {
    sound.playDialClick();
    const nextVal = (dialValue + delta + 10) % 10;
    setDialValue(nextVal);

    if (nextVal === 3 && !isDrawerUnlocked) {
      sound.playHeavyUnlock();
      sound.playDrawerSlide();
      setIsDrawerUnlocked(true);
    }
  };

  const handleCollectFloppy = () => {
    sound.playSuccessChime();
    setSolveMessage('KEY TAPE COLLECTED // LEVEL 1 CLEARED');
    setTimeout(() => {
      onSolve('3');
      setInspectMode('none');
      setSolveMessage(null);
    }, 700);
  };

  const handleToggleHint = () => {
    sound.playKeyClick();
    setShowHint((prev) => !prev);
    if (!showHint && onRequestHint) {
      onRequestHint();
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-c1',
      label: 'Green Phosphor Terminal Screen (Clue 1)',
      xPercent: 62,
      yPercent: 44,
      step: 1,
      onActivate: () => {
        setShowHint(false);
        setInspectMode('c1');
      },
    },
    {
      id: 'hotspot-c2',
      label: 'Desktop Carved Wood Runes & Log Files (Clue 2)',
      xPercent: 65,
      yPercent: 74,
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
      label: 'Locked Padlock & Center Desk Drawer (Clue 3)',
      xPercent: 57,
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
    1: 'PHASE 1/3: LOCATE & INSPECT ILLUMINATED MONITOR',
    2: 'PHASE 2/3: LOCATE & EXAMINE LOG FILES ON DESK',
    3: 'PHASE 3/3: LOCATE PADLOCK & CRACK COMBINATION',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level1_desk.jpg"
      imageAlt="Dark 1980s control room desk with locked drawer and green monitor"
      title="ROOM 01 // THE WELCOME TERMINAL"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[activeStep]}
      currentStep={activeStep}
      roomDuration={120}
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode('none')}
    >
      {/* ─── CLUE 1 POP-UP: The Repeating Signal ──────────────────────────── */}
      {inspectMode === 'c1' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Terminal Clue 1">
          <div className="inspect-header">
            <span className="inspect-title">🖥️ CLUE 1/3: THE REPEATING BOOT PATTERN</span>
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

          {/* Embedded Diegetic Clue Hint */}
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
                'The sequence cycles: Triangle, Square, Diamond, Circle. Select the missing glyph.'}
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
              padding: '1.5rem',
              color: 'var(--color-phosphor-green)',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.8,
            }}
          >
            <div style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              &gt; BOOTLOADER RECOVERY // SIGNAL CYCLE:<br />
              &gt; [ ▲ Triangle ] &nbsp; [ ■ Square ] &nbsp; [ &nbsp;?&nbsp; Missing ] &nbsp; [ ● Circle ]
            </div>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Click the correct shape to restore the corrupted cycle:
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { label: '▲ Triangle', val: '▲' },
                { label: '■ Square', val: '■' },
                { label: '◆ Diamond', val: '◆' },
                { label: '● Circle', val: '●' },
                { label: '★ Star', val: '★' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '0.95rem', padding: '0.6rem 1.1rem' }}
                  onClick={() => handleSelectBootSymbol(item.val)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 2 POP-UP: File Metadata & Earliest Record ───────────────── */}
      {inspectMode === 'c2' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Terminal Clue 2">
          <div className="inspect-header">
            <span className="inspect-title">📁 CLUE 2/3: DESKTOP FILE TIMESTAMPS</span>
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
                'Compare timestamps: 01_KERNEL is 04:15, 02_SYSLOG is 01:05, 03_AUTH is 09:30. Click the earliest one.'}
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
              Three system files are archived on the magnetic diskette. Click the file that was modified <strong>first</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: '01_KERNEL.LOG', time: '04:15 AM', size: '14 KB' },
                { name: '02_SYSLOG.DAT', time: '01:05 AM', size: '42 KB' },
                { name: '03_AUTH.BIN', time: '09:30 AM', size: '8 KB' },
              ].map((file) => (
                <div
                  key={file.name}
                  onClick={() => handleSelectFile(file.name)}
                  style={{
                    background: 'rgba(10, 20, 15, 0.8)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    padding: '0.85rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div>
                    <strong style={{ color: 'var(--color-phosphor-green)', fontSize: '0.95rem' }}>📄 {file.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Sector Cluster // {file.size}</div>
                  </div>
                  <span style={{ color: '#ffffff', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>MODIFIED: {file.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CLUE 3 POP-UP: Rotary Padlock & Center Drawer ────────────────── */}
      {inspectMode === 'c3' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Padlock Mechanism">
          <div className="inspect-header">
            <span className="inspect-title">🔒 CLUE 3/3: HEAVY BRASS ROTARY PADLOCK</span>
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
                'Review the prefix revealed by FILE_02 metadata (or count straight-edged wood runes). The code is 3.'}
            </div>
          )}

          {solveMessage && (
            <div style={{ textAlign: 'center', margin: '0.5rem 0', color: 'var(--color-phosphor-green)', fontWeight: 700 }}>
              {solveMessage}
            </div>
          )}

          <div className="level1-workspace">
            {/* Mechanism Dial */}
            <div className="padlock-mechanism-box">
              <div className={`padlock-shackle ${isDrawerUnlocked ? 'open' : ''}`} aria-hidden="true" />

              <div
                className="rotary-dial-container"
                onClick={() => handleDialChange(1)}
                title="Click dial to rotate tumbler"
              >
                <span className="rotary-dial-number">{dialValue}</span>
              </div>

              <div className="rotary-dial-controls">
                <button
                  type="button"
                  id="btn-dial-down"
                  className="hud-btn"
                  onClick={() => handleDialChange(-1)}
                >
                  ◀ PREV ( - )
                </button>
                <button
                  type="button"
                  id="btn-dial-up"
                  className="hud-btn"
                  onClick={() => handleDialChange(1)}
                >
                  NEXT ( + ) ▶
                </button>
              </div>

              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                Rotate dial to match the PIN code revealed from File 02 (Code: 3).
              </span>
            </div>

            {/* Drawer Interior Drawer State */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
              }}
            >
              <h3 style={{ margin: '0 0 0.75rem 0', color: '#fff' }}>
                {isDrawerUnlocked ? '🔓 DRAWER SLID OPEN!' : '🔒 DRAWER BOLTED SHUT'}
              </h3>

              {isDrawerUnlocked ? (
                <div>
                  <p style={{ color: 'var(--color-phosphor-green)', fontSize: '0.9rem' }}>
                    The brass shackle clicked open. Inside the velvet lining rests the classified magnetic key tape:
                  </p>

                  <div
                    style={{
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '2px dashed var(--color-phosphor-green)',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      margin: '1.25rem 0',
                      cursor: 'pointer',
                    }}
                    onClick={handleCollectFloppy}
                    id="btn-collect-drawer-item"
                    role="button"
                    tabIndex={0}
                  >
                    <span style={{ fontSize: '2rem', display: 'block' }}>💾</span>
                    <strong style={{ color: '#fff' }}>CLASSIFIED RECORDS KEY TAPE</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-phosphor-green)' }}>
                      [CLICK TO COLLECT & SOLVE LEVEL 1]
                    </div>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                  The center drawer is fastened with a hardened brass lock. Turn the tumbler to the correct number.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
