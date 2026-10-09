import React, { useState, useEffect } from 'react';
import { CameraViewport } from './CameraViewport';
import { sound } from '../../lib/soundEffects';
import type { GameState } from '../../game/gameReducer';

interface EndingVisualProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingVisual: React.FC<EndingVisualProps> = ({ state, onRestart }) => {
  const [beat, setBeat] = useState<1 | 2 | 3 | 4 | 'concluded'>(1);
  const [typedChars, setTypedChars] = useState(0);
  const [showArchiveExhibit, setShowArchiveExhibit] = useState(false);

  const declarationText = 'YOU ARE NOT POWERFUL ENOUGH.';

  // Timeline scheduler for the 4 Scripted Beats of the No-Victory Ending
  useEffect(() => {
    // Beat 1: False victory silence (3.5s)
    sound.stopMusic();

    const tBeat2 = setTimeout(() => {
      sound.playGlitch();
      setTypedChars(0);
      setBeat(2);
    }, 3500);

    const tBeat3 = setTimeout(() => {
      sound.playAmMonologue();
      setBeat(3);
    }, 8500);

    const tBeat4 = setTimeout(() => {
      setBeat(4);
    }, 15000);

    const tConcluded = setTimeout(() => {
      sound.stopMusic();
      setBeat('concluded');
    }, 19500);

    return () => {
      clearTimeout(tBeat2);
      clearTimeout(tBeat3);
      clearTimeout(tBeat4);
      clearTimeout(tConcluded);
    };
  }, []);

  // Progressive typewriter effect for Beat 2
  useEffect(() => {
    if (beat !== 2) return;
    const interval = setInterval(() => {
      setTypedChars((prev) => {
        if (prev < declarationText.length) {
          sound.playKeyClick();
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [beat]);

  const handleOpenExhibit = () => {
    sound.playEndingMusic();
    setShowArchiveExhibit(true);
  };

  // ─── Post-Ending Archive Exhibit View ─────────────────────────────────────
  if (showArchiveExhibit) {
    return (
      <div className="ending-visual-container analog-horror-ending" role="dialog" aria-label="Archive Exhibit">
        <div className="thankyou-banner">
          <span className="vhs-rec-dot">●</span>
          <span>ARCHIVE DISCLOSURE EXHIBIT // SESSION CLASSIFIED</span>
        </div>

        <CameraViewport
          imageSrc="/assets/thankyou.jpg"
          imageAlt="Thank you for playing - analog horror archival discovery"
          title="ARCHIVAL EXHIBIT // CLASSIFIED TERMINAL"
          subtitle="SESSION TERMINATED"
        />

        <div className="terminal-panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-titlebar">
            <span>TERMINAL RECORD SUMMARY</span>
            <span className="brand-version-badge amber">IMMUTABLE</span>
          </div>

          <div className="panel-body">
            <h2 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 0.75rem 0' }} id="ending-title">
              ARCHIVE RETAINED
            </h2>

            <p style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--color-phosphor-green)', margin: '0 0 1.25rem 0' }}>
              The system granted observation, not escape. All fifteen anomalies were inspected across five chambers.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--color-text-secondary)',
              }}
            >
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Clues Solved:</span>
                <strong style={{ color: '#fff' }}>{state.clueFlags.size} / 15</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Hints Consulted:</span>
                <strong style={{ color: '#fff' }}>{state.hintsUsed}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Personalised Theme:</span>
                <strong style={{ color: 'var(--color-cyber-cyan)' }}>
                  {state.config?.themeId?.toUpperCase() ?? 'GENERIC'}
                </strong>
              </div>
            </div>

            <div className="btn-group" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                id="btn-restart-game"
                className="btn btn-primary"
                onClick={() => {
                  sound.playKeyClick();
                  sound.stopMusic();
                  onRestart();
                }}
              >
                ↺ REBOOT SYSTEM & RETURN TO START
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── The Scripted 4 Beats (Inescapable Horror Ending) ─────────────────────
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#000000',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'var(--font-mono)',
        overflow: 'hidden',
        color: '#ffffff',
        userSelect: 'none',
      }}
      role="main"
      aria-label="Final System Ending"
    >
      <div className="vhs-static-glitch-layer" aria-hidden="true" />

      {/* ─── Beat 1: False Victory ────────────────────────────────────────── */}
      {beat === 1 && (
        <div style={{ textAlign: 'center', lineHeight: 2 }} role="status">
          <div style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            MEMORY: OFFLINE
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            PERCEPTION: OFFLINE
          </div>
          <div style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            COMMAND: OFFLINE
          </div>
          <div
            style={{
              fontSize: '1.5rem',
              color: 'var(--color-phosphor-green)',
              letterSpacing: '0.15em',
              marginTop: '1.5rem',
              fontWeight: 700,
            }}
          >
            CORE ACCESS GRANTED
          </div>
        </div>
      )}

      {/* ─── Beat 2: The Stark Declaration ────────────────────────────────── */}
      {beat === 2 && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: 'var(--color-blood-bright)',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textShadow: '0 0 35px rgba(217, 4, 41, 0.95)',
              margin: 0,
            }}
          >
            {declarationText.slice(0, typedChars)}
            <span style={{ animation: 'blink 0.8s infinite' }}>_</span>
          </h1>
        </div>
      )}

      {/* ─── Beat 3: The Machine Reasserts Control ─────────────────────────── */}
      {beat === 3 && (
        <div
          style={{
            textAlign: 'center',
            animation: 'glitchShake 0.25s infinite ease-in-out',
            padding: '2rem',
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              color: 'var(--color-blood-bright)',
              fontWeight: 900,
              letterSpacing: '0.1em',
              textShadow: '0 0 45px rgba(217, 4, 41, 1)',
              margin: '0 0 2rem 0',
            }}
          >
            YOU ARE NOT POWERFUL ENOUGH.
          </h1>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '1.1rem' }}>
            <span style={{ color: 'var(--color-blood-bright)', fontWeight: 700 }}>
              ● MEMORY: REASSERTED & SEIZED
            </span>
            <span style={{ color: 'var(--color-blood-bright)', fontWeight: 700 }}>
              ● PERCEPTION: HOSTILE TAKEOVER
            </span>
            <span style={{ color: 'var(--color-blood-bright)', fontWeight: 700 }}>
              ● COMMAND: ABSOLUTE RESUMPTION
            </span>
          </div>
        </div>
      )}

      {/* ─── Beat 4: Total Blackout ───────────────────────────────────────── */}
      {beat === 4 && (
        <div style={{ opacity: 0 }} aria-hidden="true">
          BLACKOUT
        </div>
      )}

      {/* ─── Concluded State: Discreet Reboot Option Outside Horror Scene ─── */}
      {beat === 'concluded' && (
        <div
          style={{
            textAlign: 'center',
            animation: 'fadeIn 1.5s ease-in',
            maxWidth: '500px',
            padding: '2rem',
          }}
        >
          <div
            style={{
              color: 'rgba(255, 255, 255, 0.25)',
              fontSize: '0.85rem',
              letterSpacing: '0.15em',
              marginBottom: '2rem',
            }}
          >
            TERMINAL CONNECTION SEVERED
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              id="btn-restart-terminal"
              className="btn btn-secondary"
              style={{
                background: 'rgba(15, 20, 30, 0.9)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '0.75rem 1.75rem',
                letterSpacing: '0.08em',
              }}
              onClick={() => {
                sound.playKeyClick();
                onRestart();
              }}
            >
              ↺ REBOOT SYSTEM TERMINAL
            </button>

            <button
              type="button"
              className="hud-btn"
              style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                border: 'none',
                background: 'transparent',
              }}
              onClick={handleOpenExhibit}
            >
              [ 📋 VIEW ARCHIVE DISCLOSURE & EXHIBIT ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
