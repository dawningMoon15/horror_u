import React from 'react';
import { sound } from '../lib/soundEffects';

interface LandingPageProps {
  onStartConsent: () => void;
  onStartGeneric: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartConsent,
  onStartGeneric,
}) => {
  const handlePersonalised = () => {
    sound.playKeyClick();
    onStartConsent();
  };

  const handleGeneric = () => {
    sound.playKeyClick();
    onStartGeneric();
  };

  return (
    <main className="landing-screen" role="main">
      <div className="badge-tag green">
        <span aria-hidden="true">●</span> EXPERIMENTAL RETRO-COMPUTING MYSTERY
      </div>

      <h1 className="screen-title">THE CONTEXT</h1>
      <p className="screen-subtitle">
        A short browser-based psychological horror escape room personalised by your chosen AI
        assistant. Explore an antiquated terminal where your harmless digital curiosities
        reappear inside an eerie fictional anomaly.
      </p>

      {/* Narrative Terminal Window */}
      <section className="terminal-panel" aria-label="Terminal Log Entry">
        <div className="panel-titlebar">
          <div className="panel-window-controls">
            <span className="panel-dot red" aria-hidden="true" />
            <span className="panel-dot yellow" aria-hidden="true" />
            <span className="panel-dot green" aria-hidden="true" />
          </div>
          <span>ARCHIVE_MANIFEST // 0x7F-BOOT</span>
          <span className="brand-version-badge">OFFLINE MODE</span>
        </div>
        <div className="panel-body">
          <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
            &gt; SYSTEM RESTORED. You wake up seated in front of an illuminated monochromatic monitor.
            <br />
            &gt; The directory trees, audio frequencies, and log files seem faintly familiar—as if woven
            from fragments of thoughts you explored only moments ago.
            <br />
            &gt; To unlock the exit before the session loops, you must examine the records and solve
            three linked logical puzzles.
          </p>
        </div>
      </section>

      {/* Feature Grid: How It Works */}
      <h2 style={{ fontSize: '1.25rem', color: '#ffffff', margin: '2rem 0 1rem 0' }}>
        HOW PERSONALISATION WORKS
      </h2>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-card-number">STEP 01</span>
            <h3 className="feature-card-title">Copy Prompt</h3>
          </div>
          <p className="feature-card-desc">
            Copy the structured prompt into ChatGPT, Claude, Gemini, or your preferred AI. The prompt
            restricts output to strict allowlists (e.g. astronomy, retro-computing, mythology).
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-card-number">STEP 02</span>
            <h3 className="feature-card-title">Memory Capsule</h3>
          </div>
          <p className="feature-card-desc">
            Your assistant encodes harmless interest categories into a compact base64 payload.
            No passwords, personal names, locations, or direct quotes are ever permitted.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-card-header">
            <span className="feature-card-number">STEP 03</span>
            <h3 className="feature-card-title">Escape The Room</h3>
          </div>
          <p className="feature-card-desc">
            Paste the capsule to awaken the room’s skin, audio tone, and clue variants.
            Every puzzle remains 100% deterministic, verifiable, and solvable.
          </p>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="btn-group" style={{ justifyContent: 'flex-start', margin: '2.5rem 0 1.5rem 0' }}>
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

      {/* Technical Trust Strip */}
      <footer className="footer-trust-strip" role="contentinfo">
        <div className="trust-badge-item">
          <span style={{ color: 'var(--color-phosphor-green)' }}>🔒</span>
          <span>Zero Server Storage</span>
        </div>
        <div className="trust-badge-item">
          <span style={{ color: 'var(--color-cyber-cyan)' }}>🛡️</span>
          <span>Vercel CSP Enforced (connect-src 'none')</span>
        </div>
        <div className="trust-badge-item">
          <span style={{ color: 'var(--color-terminal-amber)' }}>⚙️</span>
          <span>Deterministic Puzzles (No AI in runtime loop)</span>
        </div>
        <div className="trust-badge-item">
          <span style={{ color: 'var(--color-phosphor-green)' }}>🧹</span>
          <span>Ephemeral Ingestion (Input purged on entry)</span>
        </div>
      </footer>
    </main>
  );
};
