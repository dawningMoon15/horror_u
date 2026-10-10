import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../lib/soundEffects';

interface LandingPageProps {
  onStartConsent: () => void;
  onStartGeneric: () => void;
  isReload?: boolean;
}

// ─── Punctuation Delay Calculator ───────────────────────────────────────────
const getCharDelay = (
  char: string,
  nextChar: string | undefined,
  baseSpeed: number,
  isReload?: boolean
): number => {
  const fullStopPause = isReload ? 70 : 180;
  const commaPause = isReload ? 35 : 90;

  // Pause on full stops, exclamation marks, question marks, colons
  if (char === '.' || char === '!' || char === '?' || char === ':') {
    if (nextChar && /[a-zA-Z0-9]/.test(nextChar)) {
      return baseSpeed + 35;
    }
    return baseSpeed + fullStopPause;
  }

  // Medium pause on commas, semicolons, em-dashes, en-dashes
  if (char === ',' || char === ';' || char === '—' || char === '–') {
    return baseSpeed + commaPause;
  }

  return baseSpeed;
};

// ─── Core Progressive Typewriter Component with Deliberate Cadence ───────────
interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
  active?: boolean;
  onComplete?: () => void;
  cursorColor?: string;
  startDelay?: number;
  forceComplete?: boolean;
  isReload?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 16,
  className,
  style,
  as: Component = 'span',
  active = true,
  onComplete,
  cursorColor = 'var(--color-blood-bright)',
  startDelay = 0,
  forceComplete = false,
  isReload = false,
}) => {
  const isTestOrReduced =
    typeof IntersectionObserver === 'undefined' ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  const [displayedText, setDisplayedText] = useState(() => (isTestOrReduced ? text : ''));
  const [isFinished, setIsFinished] = useState(() => Boolean(isTestOrReduced));
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // If forceComplete is triggered (e.g. click anywhere or test), trigger onComplete callback
  useEffect(() => {
    if (forceComplete) {
      onCompleteRef.current?.();
    }
  }, [forceComplete]);

  useEffect(() => {
    if (isTestOrReduced || forceComplete) {
      onCompleteRef.current?.();
      return;
    }

    if (!active) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;
    let currentIndex = 0;

    const effectiveSpeed = isReload ? Math.max(5, Math.floor(speed * 0.4)) : speed;

    const startTyping = () => {
      if (cancelled) return;

      const typeNextChar = () => {
        if (cancelled) return;

        if (currentIndex >= text.length) {
          setIsFinished(true);
          onCompleteRef.current?.();
          return;
        }

        const char = text[currentIndex];
        const nextChar = text[currentIndex + 1];
        currentIndex += 1;
        setDisplayedText(text.slice(0, currentIndex));

        if (currentIndex < text.length) {
          const delay = getCharDelay(char, nextChar, effectiveSpeed, isReload);
          timeoutId = setTimeout(typeNextChar, delay);
        } else {
          setIsFinished(true);
          onCompleteRef.current?.();
        }
      };

      typeNextChar();
    };

    if (startDelay > 0 && !isReload) {
      timeoutId = setTimeout(startTyping, startDelay);
    } else {
      startTyping();
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [active, text, speed, startDelay, isTestOrReduced, forceComplete, isReload]);

  const Tag = Component as unknown as React.ElementType;
  const renderedText = forceComplete || isTestOrReduced ? text : displayedText;
  const isDone = forceComplete || isTestOrReduced || isFinished;

  return (
    <Tag className={className} style={style}>
      {renderedText}
      {active && !isDone && (
        <span
          style={{
            animation: 'blink 0.7s infinite',
            color: cursorColor,
            fontWeight: 700,
            marginLeft: '2px',
          }}
          aria-hidden="true"
        >
          _
        </span>
      )}
    </Tag>
  );
};

// ─── Scroll-Triggered Progressive Typewriter Wrapper ────────────────────────
const ScrollTypewriter: React.FC<
  TypewriterTextProps & {
    threshold?: number;
  }
> = ({ threshold = 0.1, active = true, onComplete, ...props }) => {
  const isTestOrReduced =
    typeof IntersectionObserver === 'undefined' ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);

  const [inView, setInView] = useState(() => Boolean(isTestOrReduced));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTestOrReduced || inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, isTestOrReduced, inView]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <TypewriterText
        {...props}
        active={active && inView}
        onComplete={onComplete}
      />
    </div>
  );
};

const MANIFEST_LINES = [
  '> SYSTEM RESTORED. You wake up seated in front of an illuminated monochromatic monitor.',
  '> The directory trees, audio frequencies, and log files seem faintly familiar—as if woven from fragments of thoughts you explored only moments ago.',
  '> To unlock the exit before the session loops, you must examine the records and solve three linked logical puzzles.',
];

const FEATURE_STEPS = [
  {
    step: 'STEP 01',
    title: 'Copy Prompt',
    desc: 'Copy the structured prompt into ChatGPT, Claude, Gemini, or your preferred AI. The prompt restricts output to strict allowlists (e.g. astronomy, retro-computing, mythology).',
  },
  {
    step: 'STEP 02',
    title: 'Memory Capsule',
    desc: 'Your assistant encodes harmless interest categories into a compact base64 payload. No passwords, personal names, locations, or direct quotes are ever permitted.',
  },
  {
    step: 'STEP 03',
    title: 'Escape The Room',
    desc: "Paste the capsule to awaken the room's skin, audio tone, and clue variants. Every puzzle remains 100% deterministic, verifiable, and solvable.",
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConsent,
  onStartGeneric,
  isReload = false,
}) => {
  const [showDataPolicy, setShowDataPolicy] = useState(false);
  const [forceCompleteAll, setForceCompleteAll] = useState(false);
  const [heroTitleDone, setHeroTitleDone] = useState(() =>
    typeof IntersectionObserver === 'undefined'
  );

  // Sequential typing state for Narrative Terminal
  const [terminalInView, setTerminalInView] = useState(() =>
    typeof IntersectionObserver === 'undefined'
  );
  const [activeManifestLine, setActiveManifestLine] = useState(() =>
    typeof IntersectionObserver === 'undefined' ? 3 : 0
  );
  const terminalRef = useRef<HTMLElement>(null);

  // Sequential line-by-line typing state for Feature Tabs (Steps 01 -> 02 -> 03)
  const [featureInView, setFeatureInView] = useState(() =>
    typeof IntersectionObserver === 'undefined'
  );
  const [activeStepIndex, setActiveStepIndex] = useState(() =>
    typeof IntersectionObserver === 'undefined' ? 3 : 0
  );
  const featureGridRef = useRef<HTMLDivElement>(null);

  // Play Creepy Old Music Box on homescreen; cleanly halt when unmounting
  useEffect(() => {
    sound.playHomescreenMusic();
    return () => {
      sound.stopHomescreenMusic();
    };
  }, []);

  // Trigger terminal manifest lines sequentially when in viewport
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || terminalInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTerminalInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (terminalRef.current) {
      observer.observe(terminalRef.current);
    }

    return () => observer.disconnect();
  }, [terminalInView]);

  // Trigger feature cards sequentially when in viewport
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || featureInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setFeatureInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (featureGridRef.current) {
      observer.observe(featureGridRef.current);
    }

    return () => observer.disconnect();
  }, [featureInView]);

  const handlePersonalised = () => {
    sound.playKeyClick();
    sound.stopHomescreenMusic();
    // Kiosk fullscreen mode like HirePro / exam proctoring
    document.documentElement.requestFullscreen?.().catch(() => {});
    onStartConsent();
  };

  const handleGeneric = () => {
    sound.playKeyClick();
    sound.stopAllAudio();
    // Kiosk fullscreen mode
    document.documentElement.requestFullscreen?.().catch(() => {});
    onStartGeneric();
  };

  return (
    <>
      {/* Ambient Looping Video Plate (Cinematic Portal in Dark Void) */}
      <div className="ambient-video-plate" aria-hidden="true">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260808_112712_da9d53df-6d27-4b12-bdf6-aa9dc2622bdf.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <main
        className="landing-screen"
        role="main"
        style={{ position: 'relative', zIndex: 3 }}
        onClick={() => setForceCompleteAll(true)}
      >
        {/* Subtle Status Badge */}
        <div className="badge-tag green anim-rise anim-delay-1">
          <span style={{ color: 'var(--color-phosphor-green)' }} aria-hidden="true">●</span> EXPERIMENTAL RETRO-COMPUTING MYSTERY
        </div>

        {/* Cinematic Title & Subtitle with Sequential Typewriter Cadence */}
        <TypewriterText
          as="h1"
          text="THE CONTEXT"
          speed={18}
          className="screen-title anim-rise anim-delay-2"
          active={true}
          forceComplete={forceCompleteAll}
          isReload={isReload}
          onComplete={() => setHeroTitleDone(true)}
        />

        <TypewriterText
          as="p"
          text="A short browser-based psychological horror escape room personalised by your chosen AI assistant. Explore an antiquated terminal where your harmless digital curiosities reappear inside an eerie fictional anomaly."
          speed={12}
          className="screen-subtitle anim-rise anim-delay-3"
          active={heroTitleDone}
          forceComplete={forceCompleteAll}
          isReload={isReload}
          startDelay={80}
        />

        {/* Narrative Terminal Window */}
        <section
          ref={terminalRef}
          className="terminal-panel anim-rise anim-delay-4"
          aria-label="Terminal Log Entry"
        >
          <div className="panel-titlebar">
            <div className="panel-window-controls">
              <span className="panel-dot red" aria-hidden="true" />
              <span className="panel-dot yellow" aria-hidden="true" />
              <span className="panel-dot green" aria-hidden="true" />
            </div>
            <span>ARCHIVE_MANIFEST // GX7F-BOOT</span>
            <span className="brand-version-badge">
              OFFLINE MODE
            </span>
          </div>
          <div
            className="panel-body"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              minHeight: '7rem',
            }}
          >
            {MANIFEST_LINES.map((line, idx) => (
              <div key={idx} style={{ minHeight: '1.4rem' }}>
                <TypewriterText
                  as="p"
                  text={line}
                  speed={14}
                  active={terminalInView && activeManifestLine >= idx}
                  forceComplete={forceCompleteAll}
                  isReload={isReload}
                  cursorColor="var(--color-phosphor-green)"
                  onComplete={() => {
                    if (activeManifestLine === idx && idx < MANIFEST_LINES.length - 1) {
                      setTimeout(() => {
                        setActiveManifestLine((curr) => Math.max(curr, idx + 1));
                      }, isReload ? 100 : 220);
                    }
                  }}
                  style={{
                    margin: 0,
                    lineHeight: 1.6,
                    color: idx === 0 ? 'var(--color-phosphor-green)' : 'var(--color-text-primary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* List-Based Steps Section Header */}
        <ScrollTypewriter
          as="h2"
          text="HOW PERSONALISATION WORKS"
          speed={18}
          className="anim-rise anim-delay-5"
          forceComplete={forceCompleteAll}
          isReload={isReload}
          style={{
            fontSize: '1.15rem',
            color: 'var(--color-text-primary)',
            margin: '2rem 0 0.85rem 0',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-display)',
          }}
        />

        {/* Full-Width Whole-Line List-Based Steps Progression */}
        <div ref={featureGridRef} className="steps-list anim-rise anim-delay-5" role="list">
          {FEATURE_STEPS.map((stepItem, idx) => {
            const isCurrentTyping = featureInView && activeStepIndex === idx;
            return (
              <div
                key={stepItem.step}
                className={`step-list-item ${isCurrentTyping ? 'is-active-typing' : ''}`}
                role="listitem"
              >
                <div className="step-list-lead">
                  <span className="feature-card-number">{stepItem.step}</span>
                  <span className="step-list-title">{stepItem.title}</span>
                  <span className="step-list-sep" aria-hidden="true">—</span>
                </div>
                <div className="step-list-desc">
                  <TypewriterText
                    as="span"
                    text={stepItem.desc}
                    speed={15}
                    active={featureInView && activeStepIndex >= idx}
                    forceComplete={forceCompleteAll}
                    isReload={isReload}
                    cursorColor="var(--color-cyber-cyan)"
                    onComplete={() => {
                      if (activeStepIndex === idx && idx < FEATURE_STEPS.length - 1) {
                        setTimeout(() => {
                          setActiveStepIndex((curr) => Math.max(curr, idx + 1));
                        }, isReload ? 100 : 200);
                      } else if (activeStepIndex === idx) {
                        setActiveStepIndex(FEATURE_STEPS.length);
                      }
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Primary Action Buttons with Blood-Red Emergency Glow */}
        <div
          className="btn-group anim-rise anim-delay-6"
          style={{ justifyContent: 'flex-start', margin: '2.5rem 0 1.5rem 0', gap: '1rem' }}
        >
          <button
            type="button"
            id="btn-start-consent"
            className="btn btn-primary"
            onClick={handlePersonalised}
          >
            <span>⚡</span> ENTER THE ARCHIVE (Personalised Mode)
          </button>

          <button
            type="button"
            id="btn-start-generic"
            className="btn btn-secondary"
            onClick={handleGeneric}
          >
            <span>◈</span> PLAY WITHOUT PERSONALISATION (Generic Mode)
          </button>
        </div>

        {/* Footnote Bar with Learn More / Privacy Policy Modal Trigger */}
        <footer className="footer-trust-strip anim-fade anim-delay-7" role="contentinfo">
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: '#ff3366' }}>🔒</span>
              <span>100% Client-Side Ingestion. Zero Server Logs. Machine-Enforced Privacy.</span>
            </div>

            <button
              type="button"
              className="footnote-link"
              onClick={() => {
                sound.playKeyClick();
                setShowDataPolicy(true);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-cyber-cyan)',
                fontSize: '0.8rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                padding: '0.2rem 0.4rem',
              }}
            >
              How data is handled & maintained (Learn More) →
            </button>
          </div>
        </footer>

        {/* Data Policy Footnote Modal */}
        {showDataPolicy && (
          <div
            className="data-policy-modal-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(10px)',
              zIndex: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.25rem',
            }}
            onClick={() => setShowDataPolicy(false)}
          >
            <div
              className="data-policy-modal"
              style={{
                background: '#0c060a',
                border: '1px solid rgba(217, 4, 41, 0.5)',
                borderRadius: 'var(--radius-md)',
                maxWidth: '620px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95), 0 0 40px rgba(217, 4, 41, 0.25)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(217, 4, 41, 0.3)', paddingBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#ff3366' }}>🛡️</span> DATA HANDLING & PRIVACY PROTOCOL
                </h2>
                <button
                  type="button"
                  className="hud-btn"
                  onClick={() => setShowDataPolicy(false)}
                  style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-subtle)', color: '#fff' }}
                >
                  ✕ CLOSE
                </button>
              </div>

              <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>1. Zero Server Storage & Zero Telemetry:</strong>
                  <br />
                  This escape room operates 100% inside your browser session. There are no remote backend servers, no analytics databases, and no tracking cookies.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>2. Machine-Enforced Vercel CSP:</strong>
                  <br />
                  HTTP Content Security Policy headers (<code>connect-src 'none'</code>) physically prevent the web page from making network outbound requests.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>3. Strict Allowlist-Only Token Ingestion:</strong>
                  <br />
                  Personalisation is derived strictly from harmless category tokens (e.g. astronomy, botany, retro-computing). Passwords, real names, GPS data, or raw chat logs are strictly blocked by cryptographic schemas.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>4. Instant Memory Purge:</strong>
                  <br />
                  The base64 payload is converted into opaque runtime flags and purged from memory. Refreshing or closing the tab leaves zero traces.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowDataPolicy(false)}
                  style={{ padding: '0.55rem 1.35rem', fontSize: '0.82rem' }}
                >
                  UNDERSTOOD ↵
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};
