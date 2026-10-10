import React, { useState, useEffect } from 'react';
import { sound } from '../../lib/soundEffects';
import type { GameState } from '../../game/gameReducer';

interface EndingVisualProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingVisual: React.FC<EndingVisualProps> = () => {
  const [beat, setBeat] = useState<
    'victory' | 'glitch' | 'not_strong_enough' | 'monologue_monolith' | 'blank_void' | 'eternal_end'
  >('victory');
  const [typedChars, setTypedChars] = useState(0);

  const declarationText = 'YOU ARE NOT STRONG ENOUGH.';

  useEffect(() => {
    // Room 5 music is paused while displaying initial false victory screen
    sound.pauseAmMonologue();

    // ─── Beat 1 -> Glitch Transition ─────────────────────────────────────────
    const tGlitch = setTimeout(() => {
      sound.playGlitch();
      setBeat('glitch');
    }, 2400);

    // ─── Beat 2: Not Strong Enough Display -> Resume Monologue from where it was cut off ───
    const tMessage = setTimeout(() => {
      sound.playGlitch();
      setTypedChars(0);
      setBeat('not_strong_enough');
      // Resumes Room 5 music exactly from the timestamp where it was paused
      sound.resumeAmMonologue(() => {
        handleMonologueConcluded();
      });
    }, 4200);

    // ─── Beat 3: Monolith Vignettes in while Monologue Continues ─────────────
    const tMonolith = setTimeout(() => {
      setBeat('monologue_monolith');
      sound.resumeAmMonologue(() => {
        handleMonologueConcluded();
      });
    }, 9500);

    // Safety timeout in case audio is blocked or running in headless test
    const tSafetyBlank = setTimeout(() => {
      handleMonologueConcluded();
    }, 235000);

    const handleMonologueConcluded = () => {
      // ─── Beat 4: All audio concludes, dead silence & pitch-black screen ───
      sound.stopAllAudio();
      setBeat('blank_void');

      // ─── Beat 5: Final State — AM Monolith with starting creepy music box ──
      setTimeout(() => {
        sound.playHomescreenMusic();
        setBeat('eternal_end');
      }, 4000);
    };

    const cleanupMonologueListener = sound.onMonologueEnded(() => {
      handleMonologueConcluded();
    });

    return () => {
      clearTimeout(tGlitch);
      clearTimeout(tMessage);
      clearTimeout(tMonolith);
      clearTimeout(tSafetyBlank);
      cleanupMonologueListener();
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

      {/* ─── Beat 4: Pitch Black Void (All Audio Terminated, Dead Silence) ─── */}
      {beat === 'blank_void' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#000000',
            zIndex: 300,
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Beat 5: Eternal Ending (Monolith Image + Creepy Music Box Loop) ── */}
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
            animation: 'fadeIn 2.5s ease-in forwards',
            zIndex: 300,
          }}
          role="img"
          aria-label="The Monolith Entity - Eternal Ending"
        >
          <img
            src="/assets/am_monolith.png"
            alt="The Monolith"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              filter: 'contrast(1.2) brightness(0.9)',
            }}
          />
          {/* Vignette border */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.8) 85%, #000000 100%)',
            }}
          />
        </div>
      )}
    </div>
  );
};
