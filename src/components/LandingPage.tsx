import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../lib/soundEffects';

interface LandingPageProps {
  onStartConsent: () => void;
  onStartGeneric: () => void;
}

// ─── Scroll-Triggered Progressive Typewriter Component ───────────────────────
const ScrollTypewriter: React.FC<{
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div' | 'span';
}> = ({ text, speed = 20, className, style, as: Component = 'span' }) => {
  const [displayedText, setDisplayedText] = useState(() =>
    typeof IntersectionObserver === 'undefined' ? text : ''
  );
  const [hasStarted, setHasStarted] = useState(() =>
    typeof IntersectionObserver === 'undefined'
  );
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [text]);

  useEffect(() => {
    if (!hasStarted) return;
    let idx = 0;
    const interval = setInterval(() => {
      idx += 1;
      setDisplayedText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [hasStarted, text, speed]);

  const Tag = Component as unknown as React.ElementType;

  return (
    <Tag ref={elementRef} className={className} style={style}>
      {hasStarted ? displayedText : ''}
      {hasStarted && displayedText.length < text.length && (
        <span style={{ animation: 'blink 0.7s infinite', color: 'var(--color-blood-bright)' }}>_</span>
      )}
    </Tag>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConsent,
  onStartGeneric,
}) => {
  const [showDataPolicy, setShowDataPolicy] = useState(false);

  // Play Creepy Old Music Box on homescreen: load immediately + gesture fallback
  useEffect(() => {
    sound.playHomescreenMusic();

    const handleFirstGesture = () => {
      sound.playHomescreenMusic();
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('pointerdown', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('scroll', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('scroll', handleFirstGesture);
    };
  }, []);

  const handlePersonalised = () => {
    sound.playKeyClick();
    // Kiosk fullscreen mode like HirePro / exam proctoring
    document.documentElement.requestFullscreen?.().catch(() => {});
    onStartConsent();
  };

  const handleGeneric = () => {
    sound.playKeyClick();
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

      <main className="landing-screen" role="main" style={{ position: 'relative', zIndex: 3 }}>
        {/* Subtle Status Badge */}
        <div className="badge-tag green anim-rise anim-delay-1">
          <span style={{ color: 'var(--color-phosphor-green)' }} aria-hidden="true">●</span> EXPERIMENTAL RETRO-COMPUTING MYSTERY
        </div>

        {/* Cinematic Title & Subtitle with Scroll-Triggered Typewriter Format */}
        <ScrollTypewriter
          as="h1"
          text="THE CONTEXT"
          speed={45}
          className="screen-title anim-rise anim-delay-2"
        />

        <ScrollTypewriter
          as="p"
          text="A short browser-based psychological horror escape room personalised by your chosen AI assistant. Explore an antiquated terminal where your harmless digital curiosities reappear inside an eerie fictional anomaly."
          speed={15}
          className="screen-subtitle anim-rise anim-delay-3"
        />

        {/* Narrative Terminal Window */}
        <section
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
          <div className="panel-body">
            <ScrollTypewriter
              as="p"
              text="> SYSTEM RESTORED. You wake up seated in front of an illuminated monochromatic monitor. > The directory trees, audio frequencies, and log files seem faintly familiar—as if woven from fragments of thoughts you explored only moments ago. > To unlock the exit before the session loops, you must examine the records and solve three linked logical puzzles."
              speed={12}
              style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        </section>

        {/* Feature Grid: How It Works */}
        <ScrollTypewriter
          as="h2"
          text="HOW PERSONALISATION WORKS"
          speed={30}
          className="anim-rise anim-delay-5"
          style={{
            fontSize: '1.25rem',
            color: 'var(--color-text-primary)',
            margin: '2rem 0 1rem 0',
            letterSpacing: '0.05em',
            fontFamily: 'var(--font-display)',
          }}
        />

        <div className="feature-grid anim-rise anim-delay-5">
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-number">STEP 01</span>
              <h3 className="feature-card-title">Copy Prompt</h3>
            </div>
            <ScrollTypewriter
              as="p"
              text="Copy the structured prompt into ChatGPT, Claude, Gemini, or your preferred AI. The prompt restricts output to strict allowlists (e.g. astronomy, retro-computing, mythology)."
              speed={14}
              className="feature-card-desc"
            />
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-number">STEP 02</span>
              <h3 className="feature-card-title">Memory Capsule</h3>
            </div>
            <ScrollTypewriter
              as="p"
              text="Your assistant encodes harmless interest categories into a compact base64 payload. No passwords, personal names, locations, or direct quotes are ever permitted."
              speed={14}
              className="feature-card-desc"
            />
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span className="feature-card-number">STEP 03</span>
              <h3 className="feature-card-title">Escape The Room</h3>
            </div>
            <ScrollTypewriter
              as="p"
              text="Paste the capsule to awaken the room's skin, audio tone, and clue variants. Every puzzle remains 100% deterministic, verifiable, and solvable."
              speed={14}
              className="feature-card-desc"
            />
          </div>
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
