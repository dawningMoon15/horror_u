import React, { useState } from 'react';
import { sound } from '../lib/soundEffects';

interface LandingPageProps {
  onStartConsent: () => void;
  onStartGeneric: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConsent,
  onStartGeneric,
}) => {
  const [showDataPolicy, setShowDataPolicy] = useState(false);

  const handlePersonalised = () => {
    sound.playKeyClick();
    onStartConsent();
  };

  const handleGeneric = () => {
    sound.playKeyClick();
    onStartGeneric();
  };

  return (
    <>
      {/* Ambient Looping Video Plate (Cinematic Void Portal) */}
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

      <main className="landing-screen" role="main" style={{ position: 'relative', zIndex: 1 }}>
        {/* Streamlined Status Badge */}
        <div className="badge-tag green anim-rise anim-delay-1" style={{ borderColor: 'rgba(217, 4, 41, 0.4)' }}>
          <span style={{ color: 'var(--color-blood-bright)' }} aria-hidden="true">●</span> EXPERIMENTAL ANOMALY // OFFLINE RUNTIME
        </div>

        {/* Punchy Title & Subtitle */}
        <h1 className="screen-title anim-rise anim-delay-2" style={{ textShadow: '0 0 30px rgba(217, 4, 41, 0.35)' }}>
          THE CONTEXT
        </h1>
        <p className="screen-subtitle anim-rise anim-delay-3" style={{ maxWidth: '600px', marginBottom: '1.5rem' }}>
          An AI-personalised psychological horror escape room. Explore an antiquated terminal where
          your digital curiosities manifest inside a sinister fictional anomaly.
        </p>

        {/* Streamlined Narrative Terminal Window */}
        <section
          className="terminal-panel anim-rise anim-delay-4"
          aria-label="Terminal Log Entry"
          style={{ borderColor: 'rgba(217, 4, 41, 0.3)', marginBottom: '1.5rem' }}
        >
          <div className="panel-titlebar" style={{ background: 'rgba(20, 4, 8, 0.65)' }}>
            <div className="panel-window-controls">
              <span className="panel-dot red" aria-hidden="true" />
              <span className="panel-dot yellow" aria-hidden="true" />
              <span className="panel-dot green" aria-hidden="true" />
            </div>
            <span>ARCHIVE_MANIFEST // 0x7F-BOOT</span>
            <span className="brand-version-badge" style={{ color: 'var(--color-blood-bright)', borderColor: 'rgba(217, 4, 41, 0.3)' }}>
              RED ALERT
            </span>
          </div>
          <div className="panel-body" style={{ padding: '1rem 1.25rem' }}>
            <p style={{ margin: 0, lineHeight: 1.5, fontSize: '0.92rem', color: 'var(--color-text-primary)' }}>
              &gt; SYSTEM RESTORED. You awaken in front of a blood-stained CRT terminal.
              <br />
              &gt; To unlock the blast doors before the containment loop purge, examine the records and solve three visual puzzles.
            </p>
          </div>
        </section>

        {/* Streamlined Visual 3-Step Flow */}
        <div className="feature-grid anim-rise anim-delay-5" style={{ margin: '1.25rem 0', gap: '1rem' }}>
          <div className="feature-card" style={{ padding: '1rem', background: 'rgba(18, 10, 16, 0.65)' }}>
            <div className="feature-card-header" style={{ marginBottom: '0.4rem' }}>
              <span className="feature-card-number">01</span>
              <h3 className="feature-card-title" style={{ fontSize: '1rem' }}>Copy Prompt</h3>
            </div>
            <p className="feature-card-desc" style={{ fontSize: '0.82rem', margin: 0 }}>
              Feed the safe prompt into your AI to extract an encrypted memory capsule.
            </p>
          </div>

          <div className="feature-card" style={{ padding: '1rem', background: 'rgba(18, 10, 16, 0.65)' }}>
            <div className="feature-card-header" style={{ marginBottom: '0.4rem' }}>
              <span className="feature-card-number" style={{ color: 'var(--color-blood-bright)', background: 'rgba(217, 4, 41, 0.15)' }}>02</span>
              <h3 className="feature-card-title" style={{ fontSize: '1rem' }}>Ingest Capsule</h3>
            </div>
            <p className="feature-card-desc" style={{ fontSize: '0.82rem', margin: 0 }}>
              The capsule reshapes room lighting, lore, audio frequencies, and puzzle skin.
            </p>
          </div>

          <div className="feature-card" style={{ padding: '1rem', background: 'rgba(18, 10, 16, 0.65)' }}>
            <div className="feature-card-header" style={{ marginBottom: '0.4rem' }}>
              <span className="feature-card-number" style={{ color: 'var(--color-terminal-amber)', background: 'rgba(245, 158, 11, 0.15)' }}>03</span>
              <h3 className="feature-card-title" style={{ fontSize: '1rem' }}>Escape Chamber</h3>
            </div>
            <p className="feature-card-desc" style={{ fontSize: '0.82rem', margin: 0 }}>
              Manipulate 3D dials, keypads, and bloody files to escape the anomaly.
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div
          className="btn-group anim-rise anim-delay-6"
          style={{ justifyContent: 'flex-start', margin: '1.75rem 0 1.25rem 0', gap: '0.85rem' }}
        >
          <button
            type="button"
            id="btn-start-consent"
            className="btn btn-primary"
            onClick={handlePersonalised}
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00b462 100%)',
              boxShadow: '0 0 25px rgba(0, 255, 136, 0.4)',
              padding: '0.85rem 1.6rem',
            }}
          >
            <span>⚡</span> ENTER THE ARCHIVE (Personalised Mode)
          </button>

          <button
            type="button"
            id="btn-start-generic"
            className="btn btn-secondary"
            onClick={handleGeneric}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              padding: '0.85rem 1.4rem',
            }}
          >
            <span>◈</span> PLAY WITHOUT PERSONALISATION (Generic Mode)
          </button>
        </div>

        {/* Streamlined Footnote Bar with Privacy Policy Modal Link */}
        <footer className="footer-trust-strip anim-fade anim-delay-7" role="contentinfo" style={{ marginTop: '2rem', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              <span style={{ color: 'var(--color-phosphor-green)' }}>🔒</span>
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
                fontSize: '0.78rem',
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
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
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
                background: '#090d16',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                maxWidth: '620px',
                width: '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: '1.75rem',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🛡️</span> DATA HANDLING & PRIVACY DISCLOSURE
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
                  This escape room operates 100% in your browser. There is no remote backend database, no telemetry tracker, and no third-party analytics script.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>2. Machine-Enforced Vercel CSP:</strong>
                  <br />
                  Enforced via HTTP Content Security Policy headers (<code>connect-src 'none'</code>), physically prohibiting the browser from exfiltrating data anywhere.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>3. Allowlist-Only Capsule Ingestion:</strong>
                  <br />
                  Personalisation is derived strictly from harmless interest tokens (e.g. astronomy, botany, retro-computing). Passwords, real names, GPS data, or raw chat logs are strictly blocked by cryptographic schemas.
                </p>

                <p style={{ margin: 0 }}>
                  <strong style={{ color: '#fff' }}>4. Instant Memory Purge:</strong>
                  <br />
                  The base64 payload is converted into opaque runtime flags and instantly purged from memory. Refreshing or closing the tab leaves zero traces.
                </p>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowDataPolicy(false)}
                  style={{ padding: '0.5rem 1.25rem', fontSize: '0.82rem' }}
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
