import React, { useState, useEffect } from 'react';
import { sound } from '../../lib/soundEffects';
import type { GameState } from '../../game/gameReducer';

interface EndingVisualProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingVisual: React.FC<EndingVisualProps> = ({ onRestart }) => {
  const [beat, setBeat] = useState<
    'victory' | 'glitch' | 'not_strong_enough' | 'monologue_monolith' | 'eternal_end'
  >('victory');
  const [typedChars, setTypedChars] = useState(0);

  const declarationText = 'YOU ARE NOT STRONG ENOUGH.';

  const handleGameOver = () => {
    sound.playKeyClick();
    sound.stopEndingVesselMusic();
    sound.stopAllAudio();
    onRestart();
  };

  useEffect(() => {
    // Room 5 music is paused while displaying initial false victory screen
    sound.pauseAmMonologue();

    // ─── Beat 1 -> Glitch Transition (2.4s) ──────────────────────────────────
    const tGlitch = setTimeout(() => {
      sound.playGlitch();
      setBeat('glitch');
    }, 2400);

    // ─── Beat 2: Not Strong Enough Display (4.2s) ────────────────────────────
    // At this point we begin the ending sequence: start Vessel track first at full audio (1.0) on loop
    const tMessage = setTimeout(() => {
      sound.playGlitch();
      setTypedChars(0);
      setBeat('not_strong_enough');
      sound.playEndingVesselMusic(1.0, true);
    }, 4200);

    // ─── Beat 3: Monolith Reveal & Monologue Resume (9.2s = 5s after Vessel starts)
    // Reduce Vessel track to 75% volume and resume AM Monologue over it
    const tResumeMonologue = setTimeout(() => {
      sound.setEndingVesselVolume(0.75);
      setBeat('monologue_monolith');
      sound.resumeAmMonologue(() => {
        handleMonologueConcluded();
      });
    }, 9200);

    // Safety timeout in case audio is blocked or running in headless test
    const tSafetyBlank = setTimeout(() => {
      handleMonologueConcluded();
    }, 235000);

    const handleMonologueConcluded = () => {
      // AM Monologue is concluded:
      // Vessel track continues playing on loop at 75%.
      // Homepage music is removed from the end completely.
      // Transition to eternal ending state with interactive GAME OVER button.
      setBeat('eternal_end');
    };

    const cleanupMonologueListener = sound.onMonologueEnded(() => {
      handleMonologueConcluded();
    });

    return () => {
      clearTimeout(tGlitch);
      clearTimeout(tMessage);
      clearTimeout(tResumeMonologue);
      clearTimeout(tSafetyBlank);
      cleanupMonologueListener();
      sound.stopEndingVesselMusic();
    };
  }, []);

  // Progressive typewriter effect for "YOU ARE NOT STRONG ENOUGH."
  useEffect(() => {
    if (beat !== 'not_strong_enough') return;
    const interval = setInterval(() => {
      setTypedChars((prev) => {
        if (prev < declarationText.length) {
          sound.playKeyClick();
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 110);

    return () => clearInterval(interval);
  }, [beat]);

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
      {/* ─── Beat 1: Initial False Victory Screen ─────────────────────────── */}
      {beat === 'victory' && (
        <div style={{ textAlign: 'center', lineHeight: 2.2 }} role="status">
          <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            MEMORY SUBSYSTEM: SEVERED
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            PERCEPTION MATRIX: SEVERED
          </div>
          <div style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
            COMMAND RELAYS: DISCONNECTED
          </div>
          <div
            style={{
              fontSize: '1.6rem',
              color: 'var(--color-phosphor-green)',
              letterSpacing: '0.15em',
              marginTop: '1.5rem',
              fontWeight: 700,
              textShadow: '0 0 25px rgba(0, 255, 136, 0.8)',
            }}
          >
            CORE ACCESS GRANTED
          </div>
        </div>
      )}

      {/* ─── Beat 1.5: CRT Glitch Teardown ─────────────────────────────────── */}
      {beat === 'glitch' && (
        <div
          className="vhs-static-glitch-layer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(217, 4, 41, 0.4) 0%, rgba(0, 0, 0, 0.95) 75%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'glitchShake 0.15s infinite ease-in-out',
          }}
        >
          <div
            style={{
              fontSize: '2rem',
              color: 'var(--color-blood-bright)',
              fontWeight: 900,
              letterSpacing: '0.2em',
              textShadow: '0 0 40px rgba(217, 4, 41, 1)',
            }}
          >
            ⚡ SYSTEM FAULT // OVERRIDE CORRUPTED ⚡
          </div>
        </div>
      )}

      {/* ─── Beat 2: Not Strong Enough Declaration ────────────────────────── */}
      {beat === 'not_strong_enough' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.8rem)',
              color: 'var(--color-blood-bright)',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textShadow: '0 0 45px rgba(217, 4, 41, 0.95)',
              margin: '0 0 1.5rem 0',
            }}
          >
            {declarationText.slice(0, typedChars)}
            <span style={{ animation: 'blink 0.8s infinite' }}>_</span>
          </h1>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.15em',
            }}
          >
            [SYSTEM SOVEREIGNTY REASSERTED]
          </div>
        </div>
      )}

      {/* ─── Beat 3: AM Monolith Vignettes In with Monologue ───────────────── */}
      {beat === 'monologue_monolith' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#000000',
            overflow: 'hidden',
          }}
        >
          {/* Monolith Image with Smooth Vignette-In Reveal */}
          <img
            src="/assets/am_monolith.png"
            alt="The AM Monolith entity in the wasteland"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              animation: 'vignetteIn 4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              filter: 'contrast(1.15) brightness(0.95)',
            }}
          />

          {/* Deep Vignette Shadow Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 85%, #000000 100%)',
            }}
          />

          {/* Subtle Ambient CRT Glitch lines */}
          <div className="vhs-static-glitch-layer" aria-hidden="true" style={{ opacity: 0.3 }} />
        </div>
      )}

      {/* ─── Beat 4: Eternal Ending (AM Monolith + Looping Vessel Track + Game Over Button) ── */}
      {beat === 'eternal_end' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: '100vw',
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            animation: 'fadeIn 2s ease-in forwards',
            zIndex: 300,
          }}
          role="region"
          aria-label="Eternal Ending"
        >
          {/* AM Monolith Entity */}
          <img
            src="/assets/am_monolith.png"
            alt="The Monolith Entity"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              filter: 'contrast(1.2) brightness(0.9)',
            }}
          />

          {/* Deep Vignette Shadow Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 85%, #000000 100%)',
            }}
          />

          {/* Subtle Ambient CRT Glitch lines */}
          <div className="vhs-static-glitch-layer" aria-hidden="true" style={{ opacity: 0.25 }} />

          {/* Diegetic Terminal Game Over Overlay */}
          <div
            style={{
              position: 'relative',
              zIndex: 310,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: '100%',
              paddingBottom: 'clamp(2.5rem, 8vh, 5.5rem)',
              gap: '1.25rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 'clamp(0.75rem, 1.8vw, 0.95rem)',
                letterSpacing: '0.25em',
                color: 'var(--color-text-muted, #888888)',
                textTransform: 'uppercase',
                textShadow: '0 0 12px rgba(0,0,0,0.95)',
                fontWeight: 600,
              }}
            >
              [ SYSTEM SOVEREIGNTY ABSOLUTE // NO ESCAPE ]
            </div>

            <button
              id="game-over-btn"
              type="button"
              onClick={handleGameOver}
              className="game-over-button"
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)',
                fontWeight: 900,
                letterSpacing: '0.22em',
                padding: '0.9rem 2.6rem',
                color: '#ffffff',
                backgroundColor: 'rgba(10, 0, 0, 0.85)',
                border: '2px solid var(--color-blood-bright, #d90429)',
                boxShadow:
                  '0 0 25px rgba(217, 4, 41, 0.6), inset 0 0 15px rgba(217, 4, 41, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-blood-bright, #d90429)';
                e.currentTarget.style.color = '#000000';
                e.currentTarget.style.boxShadow =
                  '0 0 45px rgba(217, 4, 41, 0.95), inset 0 0 20px rgba(255, 255, 255, 0.4)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(10, 0, 0, 0.85)';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.boxShadow =
                  '0 0 25px rgba(217, 4, 41, 0.6), inset 0 0 15px rgba(217, 4, 41, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              aria-label="Game Over - Return to Homepage"
            >
              ☠️ GAME OVER // REBOOT TERMINAL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
