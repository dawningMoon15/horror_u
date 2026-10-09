import React, { useState } from 'react';
import { CameraViewport, type Hotspot } from './CameraViewport';
import { sound } from '../../lib/soundEffects';

interface Level2VisualProps {
  onSolve: (answer: string) => void;
  unlocked: boolean;
}

export const Level2Visual: React.FC<Level2VisualProps> = ({ onSolve, unlocked }) => {
  const [inspectMode, setInspectMode] = useState<'none' | 'dossiers' | 'cctv' | 'cabinet'>('none');
  const [revealedA, setRevealedA] = useState(unlocked);
  const [revealedB, setRevealedB] = useState(unlocked);

  const handleRevealA = () => {
    sound.playPaperRustle();
    setRevealedA(true);
  };

  const handleRevealB = () => {
    sound.playPaperRustle();
    setRevealedB(true);
  };

  const handleVerifyYear = (yearToTest = '1987') => {
    if (yearToTest.trim() === '1987') {
      sound.playSuccessChime();
      sound.playHeavyUnlock();
      onSolve('1987');
      setInspectMode('none');
    } else {
      sound.playErrorBuzz();
    }
  };

  const hotspots: Hotspot[] = [
    {
      id: 'hotspot-dossiers',
      label: 'Classified Dossiers & Reports',
      xPercent: 65,
      yPercent: 68,
      onActivate: () => setInspectMode('dossiers'),
    },
    {
      id: 'hotspot-cctv',
      label: 'Surveillance Monitor Feed',
      xPercent: 22,
      yPercent: 52,
      onActivate: () => setInspectMode('cctv'),
    },
    {
      id: 'hotspot-cabinet',
      label: 'Metal Archive Filing Drawers',
      xPercent: 55,
      yPercent: 35,
      onActivate: () => setInspectMode('cabinet'),
    },
  ];

  return (
    <CameraViewport
      imageSrc="/assets/level2_records.jpg"
      imageAlt="Classified underground records room with dossiers and filing cabinets"
      title="ROOM 02 // RECORDS ARCHIVE"
      subtitle="COMPARE CONTRADICTORY DOSSIERS"
      hotspots={hotspots}
      isZoomed={inspectMode !== 'none'}
      onToggleZoom={() => setInspectMode(inspectMode === 'none' ? 'dossiers' : 'none')}
    >
      {/* ─── Inspection Mode: Dossiers & Redactions ────────────────── */}
      {inspectMode === 'dossiers' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Classified Dossiers">
          <div className="inspect-header">
            <span className="inspect-title">📑 CONTRADICTORY INCIDENT CASEFILES</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>

          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: '0 0 1rem 0' }}>
            Click the blacked-out redacted bars on both dossiers to remove the censorship ink.
            Find which year appears in both records.
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

          {/* Verification Bar */}
          <div
            style={{
              marginTop: '1.25rem',
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ color: '#fff', fontSize: '0.88rem', display: 'block' }}>
                {revealedA && revealedB
                  ? '✨ Both records reveal matching year: 1987'
                  : 'Examine both reports to uncover the common year.'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Compare the creation dates and metadata.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                id="btn-auto-solve-l2"
                className="btn btn-primary"
                onClick={() => handleVerifyYear('1987')}
              >
                VERIFY YEAR (1987) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: CCTV Monitor Feed ────────────────────── */}
      {inspectMode === 'cctv' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="CCTV Feed">
          <div className="inspect-header">
            <span className="inspect-title">📼 SURVEILLANCE FEED // 06:36 AM</span>
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
              padding: '1.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-phosphor-green)',
            }}
          >
            <p style={{ margin: 0, lineHeight: 1.7 }}>
              &gt; FOOTAGE ARCHIVE LOADED: SUBJECT 7B LOG.<br />
              &gt; THE LOG FILE DATES CONTRADICT ONE ANOTHER (1984 vs 1987).<br />
              &gt; COMMON YEAR REFERENCED ACROSS BOTH DOSSIERS IS 1987.<br />
              <br />
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => { sound.playKeyClick(); setInspectMode('dossiers'); }}
              >
                EXAMINE THE DOSSIERS NOW →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ─── Inspection Mode: Filing Cabinet ───────────────────────── */}
      {inspectMode === 'cabinet' && (
        <div className="inspect-overlay-panel" role="dialog" aria-label="Filing Cabinet">
          <div className="inspect-header">
            <span className="inspect-title">🗄️ ARCHIVE DRAWER R78-B</span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => { sound.playKeyClick(); setInspectMode('none'); }}
            >
              ✕ STEP BACK TO ROOM
            </button>
          </div>
          <div style={{ padding: '1.25rem', color: '#fff' }}>
            <p>Drawer R78-B is already unlatched. The two primary files have been pulled onto the examination table.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => { sound.playKeyClick(); setInspectMode('dossiers'); }}
            >
              EXAMINE DOSSIERS ON TABLE →
            </button>
          </div>
        </div>
      )}
    </CameraViewport>
  );
};
