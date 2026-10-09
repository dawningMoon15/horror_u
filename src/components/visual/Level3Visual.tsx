import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level3VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level3Visual: React.FC<Level3VisualProps> = ({ onSolve, unlocked }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'keypad' | 'tumbler' | 'bolts'>('none');
  const [enteredCode, setEnteredCode] = useState('');
  const [isOpening, setIsOpening] = useState(unlocked);
  const [statusMessage, setStatusMessage] = useState('ENTER 5-DIGIT ESCAPE CIPHER');

  const handleKeyPress = (num: string) => {
    sound.playKeyClick();
    if (enteredCode.length < 5) {
      setEnteredCode((prev) => prev + num);
    }
  };

  const handleClear = () => {
    sound.playKeyClick();
    setEnteredCode('');
    setStatusMessage('ENTER 5-DIGIT ESCAPE CIPHER');
  };

  const handleEnter = () => {
    sound.playKeyClick();
    if (enteredCode === '31987') {
      sound.playHeavyUnlock();
      setIsOpening(true);
      setStatusMessage('ACCESS GRANTED // BOLTS RETRACTING');
      onSolve('31987');
    } else {
      sound.playErrorBuzz();
      setStatusMessage('INVALID CODE // COMBINE LVL 1 + LVL 2');
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-keypad',
      label: 'Electronic Keypad & Relays',
      xPercent: 50,
      yPercent: 44,
      onActivate: () => setInspectMode('keypad'),
    },
    {
      id: 'hotspot-tumbler',
      label: 'Rotating Mechanical Safe Dial',
      xPercent: 50,
      yPercent: 58,
      onActivate: () => setInspectMode('tumbler'),
    },
    {
      id: 'hotspot-bolts',
      label: 'Hydraulic Locking Deadbolts',
      xPercent: 32,
      yPercent: 49,
      onActivate: () => setInspectMode('bolts'),
    },
  ];

  return (
    <CameraViewport
      imageSrc="/assets/level3_vault.jpg"
      imageAlt="Massive heavy steel vault door with keypad and yellow hazard stripes"
      title="ROOM 03 // THE VAULT EXIT"
      subtitle="ENTER 5-DIGIT CONCATENATED CIPHER"
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode(inspectMode === 'none' ? 'keypad' : 'none')}
    >
      {/* ─── Inspection Mode: Keypad Workspace ─────────────────────── */}
      {inspectMode === 'keypad' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Vault Keypad">
          <div className="inspect-header">
            <span className="inspect-title">🔢 VAULT LOCKING KEYPAD</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: isOpening ? 'var(--color-phosphor-green)' : 'var(--color-text-secondary)' }}>
              {statusMessage}
            </span>
          </div>

          <div className="level3-vault-keypad">
            {/* LED Display Screen */}
            <div className="keypad-display-screen">
              <div className="keypad-display-digits">
                {enteredCode.padEnd(5, '_')}
              </div>
            </div>

            {/* Matrix Buttons */}
            <div className="keypad-matrix-grid">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  className="keypad-num-btn"
                  onClick={() => handleKeyPress(digit)}
                  disabled={isOpening}
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                className="keypad-num-btn clear"
                onClick={handleClear}
                disabled={isOpening}
              >
                CLR
              </button>

              <button
                type="button"
                className="keypad-num-btn"
                onClick={() => handleKeyPress('0')}
                disabled={isOpening}
              >
                0
              </button>

              <button
                type="button"
                id="btn-keypad-enter"
                className="keypad-num-btn enter"
                onClick={handleEnter}
                disabled={isOpening || enteredCode.length === 0}
              >
                ENT ↵
              </button>
            </div>

            <div style={{ marginTop: '1.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
              💡 Combine Level 1 count (<strong>3</strong>) + Level 2 year (<strong>1987</strong>)
            </div>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Mechanical Tumbler ────────────────────── */}
      {inspectMode === 'tumbler' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Vault Dial">
          <div className="inspect-header">
            <span className="inspect-title">⚙️ ROTARY VAULT CIPHER TUMBLER</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>The heavy bronze dial coordinates the electronic relay. It requires input at the primary keypad.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { sound.playKeyClick(); setInspectMode('keypad'); }}
            >
              SWITCH TO ELECTRONIC KEYPAD →
            </button>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Hydraulic Deadbolts ──────────────────── */}
      {inspectMode === 'bolts' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Hydraulic Deadbolts">
          <div className="inspect-header">
            <span className="inspect-title">🔩 HYDRAULIC LOCKING DEADBOLTS</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#fff' }}>Three high-tensile solid steel cylinders block the vault door. They retract electronically when the correct 5-digit sequence is verified.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { sound.playKeyClick(); setInspectMode('keypad'); }}
            >
              GO TO KEYPAD (ENTER 31987) →
            </button>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
