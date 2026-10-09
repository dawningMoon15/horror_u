import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level3VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level3Visual: React.FC<Level3VisualProps> = ({ onSolve, unlocked }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'keypad' | 'tumbler' | 'bolts'>('none');
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
      xPercent: 88,
      yPercent: 58,
      step: 3,
      onActivate: () => setInspectMode('keypad'),
    },
    {
      id: 'hotspot-tumbler',
      label: 'Console Junction Toggle Switches',
      xPercent: 50,
      yPercent: 54,
      step: 2,
      onActivate: () => {
        setInspectMode('tumbler');
        if (step === 1) setStep(2);
      },
    },
    {
      id: 'hotspot-bolts',
      label: 'Hydraulic Locking Deadbolts',
      xPercent: 22,
      yPercent: 44,
      step: 1,
      onActivate: () => setInspectMode('bolts'),
    },
  ];

  const stepObjectives: Record<number, string> = {
    1: 'PHASE 1/3: INSPECT VAULT DEADBOLT SYSTEM',
    2: 'PHASE 2/3: CONSOLE JUNCTION TOGGLES',
    3: 'PHASE 3/3: INPUT CIPHER ON ENTRY KEYPAD',
  };

  return (
    <CameraViewport
      imageSrc="/assets/level3_vault.jpg"
      imageAlt="Massive heavy steel vault door with keypad and yellow hazard stripes"
      title="ROOM 03 // THE CONTROL ROOM"
      subtitle="ANALOG FLASHLIGHT EXPLORATION"
      stepObjective={stepObjectives[step]}
      currentStep={step}
      roomDuration={120}
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
              💡 Concatenate Level 1 tape code (<strong>3</strong>) + Level 2 incident year (<strong>1987</strong>)
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
              onClick={() => {
                sound.playKeyClick();
                setInspectMode('none');
                setStep(3); // Advance spotlight to keypad
              }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#fff', lineHeight: 1.7 }}>
              The heavy bronze safe tumbler is linked to the primary digital relay.<br />
              An etched plaque reads: <em>"Combine Room 1 Tape code [1 digit] with Room 2 Incident Year [4 digits]. Total length: 5 digits."</em>
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                sound.playKeyClick();
                setStep(3);
                setInspectMode('keypad');
              }}
            >
              PROCEED TO KEYPAD (ENTER 31987) →
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
              onClick={() => {
                sound.playKeyClick();
                setInspectMode('none');
                setStep(2); // Advance spotlight to mechanical dial
              }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            <p style={{ color: '#fff', lineHeight: 1.7 }}>
              Three high-tensile solid steel cylinders block the vault door.<br />
              Hydraulic telemetry states: <em>"Mechanical Tumbler and Electronic Keypad interlocks engaged."</em>
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                sound.playKeyClick();
                setStep(2);
                setInspectMode('tumbler');
              }}
            >
              INSPECT SAFE TUMBLER DIAL →
            </button>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
