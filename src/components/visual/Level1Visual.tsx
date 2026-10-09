import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level1VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level1Visual: React.FC<Level1VisualProps> = ({ onSolve, unlocked }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'lock' | 'runes' | 'terminal'>('none');
  const [dialValue, setDialValue] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(unlocked);

  const handleDialChange = (delta: number) => {
    sound.playDialClick();
    const nextVal = (dialValue + delta + 10) % 10;
    setDialValue(nextVal);

    if (nextVal === 3 && !isUnlocked) {
      sound.playHeavyUnlock();
      sound.playDrawerSlide();
      setIsUnlocked(true);
    }
  };

  const handleCollectFloppy = () => {
    sound.playSuccessChime();
    onSolve('3');
    setInspectMode('none');
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-lock',
      label: 'Locked Padlock & Center Drawer',
      xPercent: 50,
      yPercent: 78,
      onActivate: () => setInspectMode('lock'),
    },
    {
      id: 'hotspot-runes',
      label: 'Carved Wood Geometric Runes',
      xPercent: 48,
      yPercent: 62,
      onActivate: () => setInspectMode('runes'),
    },
    {
      id: 'hotspot-crt',
      label: 'Green Phosphor Terminal Log',
      xPercent: 50,
      yPercent: 28,
      onActivate: () => setInspectMode('terminal'),
    },
  ];

  return (
    <CameraViewport
      imageSrc="/assets/level1_desk.jpg"
      imageAlt="Dark 1980s control room desk with locked drawer and green monitor"
      title="ROOM 01 // ARCHIVE CONTROL DESK"
      subtitle="EXAMINE WOODEN CARVINGS & PADLOCK"
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode(inspectMode === 'none' ? 'lock' : 'none')}
    >
      {/* ─── Inspection Mode: Padlock & Drawer ────────────────────────── */}
      {inspectMode === 'lock' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Padlock Mechanism">
          <div className="inspect-header">
            <span className="inspect-title">🔒 HEAVY BRASS COMBINATION PADLOCK</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <div className="level1-workspace">
            {/* Mechanism Dial */}
            <div className="padlock-mechanism-box">
              <div className={`padlock-shackle ${isUnlocked ? 'open' : ''}`} aria-hidden="true" />

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
                Rotate dial to match the count of straight-edged carved runes.
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
                {isUnlocked ? '🔓 DRAWER SLID OPEN!' : '🔒 DRAWER BOLTED SHUT'}
              </h3>

              {isUnlocked ? (
                <div>
                  <p style={{ color: 'var(--color-phosphor-green)', fontSize: '0.9rem' }}>
                    The brass shackle clicked open. Inside the velvet lining rests a classified magnetic tape:
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
                      [CLICK TO COLLECT & UNLOCK LEVEL 2]
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.88rem' }}>
                    Etched above the lock is a clue: <em>"Count only the shapes with straight edges."</em>
                  </p>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => { sound.playKeyClick(); setInspectMode('runes'); }}
                  >
                    🔍 EXAMINE CARVED RUNES
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Geometric Runes ────────────────────────── */}
      {inspectMode === 'runes' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Geometric Runes">
          <div className="inspect-header">
            <span className="inspect-title">📐 CARVED WOOD RUNES (UV INSPECTION)</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <div className="runes-inspection-board">
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
              Drag your cursor over the carved runes. Note which shapes have <strong>straight edges</strong>:
            </p>

            <div className="carved-shape-item highlighted">
              <svg className="shape-svg-icon" viewBox="0 0 24 24">
                <polygon points="12,3 22,21 2,21" />
              </svg>
              <div>
                <strong style={{ color: '#fff' }}>Triangle Rune</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-phosphor-green)', display: 'block' }}>
                  ✓ 3 straight edges (VALID)
                </span>
              </div>
            </div>

            <div className="carved-shape-item highlighted">
              <svg className="shape-svg-icon" viewBox="0 0 24 24">
                <rect x="4" y="4" width="16" height="16" />
              </svg>
              <div>
                <strong style={{ color: '#fff' }}>Square Rune</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-phosphor-green)', display: 'block' }}>
                  ✓ 4 straight edges (VALID)
                </span>
              </div>
            </div>

            <div className="carved-shape-item highlighted">
              <svg className="shape-svg-icon" viewBox="0 0 24 24">
                <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" />
              </svg>
              <div>
                <strong style={{ color: '#fff' }}>Hexagonal Chevron</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-phosphor-green)', display: 'block' }}>
                  ✓ 6 straight edges (VALID)
                </span>
              </div>
            </div>

            <div className="carved-shape-item">
              <svg className="shape-svg-icon" viewBox="0 0 24 24" style={{ stroke: '#64748b' }}>
                <circle cx="12" cy="12" r="9" />
              </svg>
              <div>
                <strong style={{ color: '#94a3b8' }}>Spiral Orbit Circle</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  ✕ Continuous curve (0 straight edges - IGNORE)
                </span>
              </div>
            </div>

            <div className="carved-shape-item">
              <svg className="shape-svg-icon" viewBox="0 0 24 24" style={{ stroke: '#64748b' }}>
                <path d="M12 3 A9 9 0 0 0 12 21 A6 6 0 0 1 12 3" />
              </svg>
              <div>
                <strong style={{ color: '#94a3b8' }}>Crescent Glyph</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block' }}>
                  ✕ Curved arc (0 straight edges - IGNORE)
                </span>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--color-phosphor-green)', fontSize: '0.9rem' }}>
                ✨ TOTAL STRAIGHT-EDGED SYMBOLS: <strong>3</strong>
              </span>

              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                onClick={() => { sound.playKeyClick(); setInspectMode('lock'); }}
              >
                GO TO PADLOCK (ENTER 3) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: CRT Terminal Screen ─────────────────────── */}
      {inspectMode === 'terminal' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Terminal Screen">
          <div className="inspect-header">
            <span className="inspect-title">🖥️ MONITOR DIAGNOSTIC // DEC 14 '87</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
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
            &gt; SYSTEM HALT: PERIPHERAL LOCK DETECTED.<br />
            &gt; DRAWER SENSOR: INTERLOCK ENGAGED.<br />
            &gt; CLUE SEQUENCE: COUNT STRAIGHT-EDGED GEOMETRIES ETCHED IN CONSOLE WOOD.<br />
            &gt; OPERATOR NOTE: "Look at the symbols more carefully. Count only the shapes with straight edges. There are exactly three."<br />
            <br />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { sound.playKeyClick(); setInspectMode('lock'); }}
            >
              OPEN PADLOCK ROTARY DIAL →
            </button>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
