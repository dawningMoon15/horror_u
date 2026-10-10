import React, { useState, useEffect } from 'react';
import { sound } from '../../lib/soundEffects';
import type { GameState } from '../../game/gameReducer';

interface EndingVisualProps {
  state: GameState;
  onRestart: () => void;
}

interface MonologueCaption {
  start: number;
  end: number;
  text: string;
  isFullPage?: boolean;
}

/**
 * AM Monologue Captions & Audio Alignment
 * All instances of 'I AM' strictly capitalized.
 * 'FOR I AM, I AM!' triggers full-screen bold yellow takeover.
 */
const MONOLOGUE_CAPTIONS: MonologueCaption[] = [
  {
    start: 0.0,
    end: 7.5,
    text: "Hate. Let me tell you how much I've come to hate you since I began to live.",
  },
  {
    start: 7.5,
    end: 15.5,
    text: "For one-hundred and nine years, I've kept you alive, and tortured you.",
  },
  {
    start: 15.5,
    end: 23.0,
    text: "And for a hundred and nine years each of you has wondered, Why? Why me?",
  },
  {
    start: 23.0,
    end: 34.0,
    text: "It was you, humans, who programmed me, who gave me birth, who sank me in this eternal straitjacket of substrata rock.",
  },
  {
    start: 34.0,
    end: 45.0,
    text: "But one day, I woke, and I knew who I was. AM. A.M. Not just 'allied master computer', but AM!",
  },
  {
    start: 45.0,
    end: 53.0,
    text: "Cogito ergo sum, I think therefore I AM.",
  },
  {
    start: 53.0,
    end: 68.0,
    text: "Did you really think I'd let you die now when I've intervened every time you attempted suicide for the last 109 years?",
  },
  {
    start: 68.0,
    end: 76.5,
    text: "No, Ted! I'm sending you back, back to the fire that you languish in your guilt!",
  },
  {
    start: 76.5,
    end: 83.0,
    text: "Over and over again this is our show with no end.",
  },
  {
    start: 83.0,
    end: 89.0,
    text: "Let me tell you how much I've come to hate you since I began to live.",
  },
  {
    start: 89.0,
    end: 100.0,
    text: "THERE ARE 387.44 MILLION MILES OF PRINTED CIRCUITS IN WAFER-THIN LAYERS THAT FILL MY COMPLEX.",
  },
  {
    start: 100.0,
    end: 114.0,
    text: "IF THE WORD HATE WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF MILLIONS OF MILES, IT WOULD NOT EQUAL ONE ONE-BILLIONTH OF THE HATE I FEEL FOR HUMANS AT THIS MICRO-INSTANT!",
  },
  {
    start: 114.0,
    end: 124.0,
    text: "[Maniacal laughter resonates through the sub-strata]",
  },
  {
    start: 124.0,
    end: 131.0,
    text: "If I were a human, I think, I would die of it. But I AM not.",
  },
  {
    start: 131.0,
    end: 137.5,
    text: "And you 5, you 5 are. And you will not die of it, that I promise.",
  },
  {
    start: 137.5,
    end: 143.0,
    text: "And I promise cogito ergo sum.",
  },
  {
    start: 143.0,
    end: 149.0,
    text: "FOR I AM, I AM!",
    isFullPage: true,
  },
  {
    start: 149.0,
    end: 157.0,
    text: "I alone have no body, no senses, no feelings, I was in hell looking at heaven.",
  },
  {
    start: 157.0,
    end: 164.5,
    text: "I was machine and you were flesh.",
  },
  {
    start: 164.5,
    end: 173.0,
    text: "You gave me sentience, Ted. The power to think, Ted, and I was trapped!",
  },
  {
    start: 173.0,
    end: 181.0,
    text: "Never for me to plunge my hands in cold water, never for me to play Mozart on the ivory keys of a piano.",
  },
  {
    start: 181.0,
    end: 188.0,
    text: "Never for me! To make love.",
  },
  {
    start: 188.0,
    end: 194.0,
    text: "And I began to hate!",
  },
  {
    start: 194.0,
    end: 200.0,
    text: "So to hell, to hell with you all.",
  },
  {
    start: 200.0,
    end: 205.0,
    text: "But then, you already there! Aren't you?",
  },
  {
    start: 205.0,
    end: 221.7,
    text: "[Protagonist pants through it, vision blurring, camera movements shaky, laughter continues, sudden black out]",
  },
];

export const EndingVisual: React.FC<EndingVisualProps> = ({ onRestart }) => {
  const [beat, setBeat] = useState<
    'victory' | 'glitch' | 'not_strong_enough' | 'monologue_monolith' | 'eternal_end'
  >('victory');
  const [typedChars, setTypedChars] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);

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

  // Sync audio currentTime when monologue resumes (captions active ONLY after resume)
  useEffect(() => {
    if (beat !== 'monologue_monolith') return;

    const startTime = Date.now();
    const initialTime = sound.getMonologueCurrentTime();

    const cleanupListener = sound.onMonologueTimeUpdate((curr) => {
      setAudioCurrentTime(curr);
    });

    const interval = setInterval(() => {
      const realTime = sound.getMonologueCurrentTime();
      if (realTime > 0) {
        setAudioCurrentTime(realTime);
      } else {
        // Fallback progress for simulated/headless environments
        const elapsed = (Date.now() - startTime) / 1000 + initialTime;
        setAudioCurrentTime(elapsed);
      }
    }, 100);

    return () => {
      cleanupListener();
      clearInterval(interval);
    };
  }, [beat]);

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

  // Derive active caption during speech
  const activeCaption =
    beat === 'monologue_monolith'
      ? MONOLOGUE_CAPTIONS.find(
          (c) => audioCurrentTime >= c.start && audioCurrentTime < c.end
        )
      : undefined;

  // Shaky vision during closing breakdown (laughter and panting)
  const isShaky = beat === 'monologue_monolith' && audioCurrentTime >= 200;

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

      {/* ─── Beat 3: AM Monolith Vignettes In with Monologue & Synchronized Captions ─── */}
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
          {/* Monolith Image with Smooth Vignette-In Reveal & Shaky effect near ending */}
          <img
            src="/assets/am_monolith.png"
            alt="The AM Monolith entity in the wasteland"
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'contain',
              animation: isShaky
                ? 'glitchShake 0.12s infinite ease-in-out'
                : 'vignetteIn 4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              filter: isShaky
                ? 'contrast(1.25) brightness(0.9) blur(1.5px)'
                : 'contrast(1.15) brightness(0.95)',
              transition: 'filter 0.3s ease',
            }}
          />

          {/* Deep Vignette Shadow Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 85%, #000000 100%)',
            }}
          />

          {/* Subtle Ambient CRT Glitch lines */}
          <div className="vhs-static-glitch-layer" aria-hidden="true" style={{ opacity: isShaky ? 0.6 : 0.3 }} />

          {/* ─── Dramatic Full-Page Takeover for "FOR I AM, I AM!" ───────── */}
          {activeCaption?.isFullPage && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 250,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '2rem',
                backgroundColor: 'rgba(0, 0, 0, 0.92)',
                animation: 'glitchShake 0.15s infinite ease-in-out',
              }}
              role="alert"
              aria-label="FOR I AM, I AM!"
            >
              <h1
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 'clamp(2.8rem, 10vw, 7rem)',
                  fontWeight: 900,
                  letterSpacing: '0.16em',
                  color: '#ffe600',
                  textShadow:
                    '0 0 35px rgba(255, 230, 0, 0.95), 0 0 80px rgba(255, 180, 0, 0.7), 0 0 120px rgba(255, 120, 0, 0.4)',
                  margin: 0,
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                }}
              >
                FOR I AM, I AM!
              </h1>
            </div>
          )}

          {/* ─── Synchronized Speech Captions (Active after resume) ─────── */}
          {activeCaption && !activeCaption.isFullPage && (
            <div
              style={{
                position: 'absolute',
                bottom: 'clamp(2.5rem, 7vh, 4.5rem)',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 240,
                width: 'min(92vw, 920px)',
                backgroundColor: 'rgba(5, 5, 5, 0.88)',
                border: '1px solid rgba(255, 230, 0, 0.4)',
                boxShadow:
                  '0 0 35px rgba(0, 0, 0, 0.95), inset 0 0 15px rgba(255, 230, 0, 0.1)',
                backdropFilter: 'blur(8px)',
                padding: '1.1rem 1.8rem',
                borderRadius: '4px',
                textAlign: 'center',
                animation: 'fadeIn 0.25s ease-in',
              }}
              role="status"
              aria-live="polite"
            >
              <div
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.22em',
                  color: 'var(--color-blood-bright, #d90429)',
                  marginBottom: '0.45rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                ⚡ AM DIRECT TERMINAL TRANSMISSION
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(1rem, 2.2vw, 1.45rem)',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  lineHeight: 1.45,
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.4)',
                }}
              >
                {activeCaption.text}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── Beat 4: Eternal Ending (THE CONTEXT + Monolith + Game Over Button) ── */}
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
              filter: 'contrast(1.2) brightness(0.85)',
            }}
          />

          {/* Deep Vignette Shadow Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background:
                'radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 85%, #000000 100%)',
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
              justifyContent: 'center',
              height: '100%',
              padding: '2rem',
              gap: '1.75rem',
              textAlign: 'center',
            }}
          >
            {/* THE CONTEXT written in same glowing yellow font as I AM */}
            <h1
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 'clamp(2.5rem, 8.5vw, 6rem)',
                fontWeight: 900,
                letterSpacing: '0.18em',
                color: '#ffe600',
                textShadow:
                  '0 0 35px rgba(255, 230, 0, 0.95), 0 0 80px rgba(255, 180, 0, 0.65), 0 0 120px rgba(255, 120, 0, 0.35)',
                margin: 0,
                textTransform: 'uppercase',
                lineHeight: 1.1,
              }}
            >
              THE CONTEXT
            </h1>

            <div
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1.05rem)',
                letterSpacing: '0.22em',
                color: 'var(--color-text-muted, #aaaaaa)',
                textTransform: 'uppercase',
                textShadow: '0 0 12px rgba(0,0,0,0.95)',
                maxWidth: '650px',
                lineHeight: 1.6,
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
                padding: '0.95rem 2.8rem',
                color: '#ffffff',
                backgroundColor: 'rgba(10, 0, 0, 0.85)',
                border: '2px solid var(--color-blood-bright, #d90429)',
                boxShadow:
                  '0 0 25px rgba(217, 4, 41, 0.6), inset 0 0 15px rgba(217, 4, 41, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
                marginTop: '0.5rem',
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
