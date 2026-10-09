import React, { useState } from 'react';
import { sound } from '../lib/soundEffects';

interface ConsentScreenProps {
  onAgree: () => void;
  onStartGeneric: () => void;
  onBack: () => void;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  onAgree,
  onStartGeneric,
  onBack,
}) => {
  const [hasAcknowledged, setHasAcknowledged] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sound.playKeyClick();
    setHasAcknowledged(e.target.checked);
  };

  const handleProceed = () => {
    if (!hasAcknowledged) return;
    sound.playKeyClick();
    onAgree();
  };

  const handleGeneric = () => {
    sound.playKeyClick();
    onStartGeneric();
  };

  const handleBack = () => {
    sound.playKeyClick();
    onBack();
  };

  return (
    <main className="consent-screen" role="main">
      <div className="badge-tag amber">
        <span aria-hidden="true">⚠</span> PRIVACY & TRUST PROTOCOL
      </div>

      <h1 className="screen-title">MEMORY & DATA DISCLOSURE</h1>
      <p className="screen-subtitle">
        THE CONTEXT is designed around machine-enforced privacy. Before generating a prompt for your
        AI assistant, please review how personalization operates and what is strictly prohibited.
      </p>

      {/* Excluded Categories Section */}
      <section className="terminal-panel" aria-label="Excluded Categories">
        <div className="panel-titlebar">
          <span>STRICT CATEGORY EXCLUSIONS</span>
          <span className="brand-version-badge" style={{ color: 'var(--color-crimson-alert)', borderColor: 'var(--border-danger)' }}>
            NON-NEGOTIABLE
          </span>
        </div>
        <div className="panel-body">
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            The prompt explicitly commands your assistant to omit sensitive autobiographical context.
            The following categories are forbidden by both prompt rules and Zod schema allowlists:
          </p>

          <div className="exclusion-grid">
            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Credentials & Keys</strong>
                Passwords, tokens, credentials, and API secrets.
              </div>
            </div>

            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Real Identifiers</strong>
                Full names, usernames, email addresses, phone numbers.
              </div>
            </div>

            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Financial & Medical</strong>
                Bank cards, account balances, medical or health conditions.
              </div>
            </div>

            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Locations & Addresses</strong>
                Home addresses, cities, employer locations, GPS coordinates.
              </div>
            </div>

            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Raw Quotes & Logs</strong>
                Verbatim chat logs, private confessions, autobiographical trauma.
              </div>
            </div>

            <div className="exclusion-item">
              <span className="exclusion-icon" aria-hidden="true">✕</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Arbitrary HTML/Code</strong>
                Scripts, links, unescaped tags, or arbitrary executable strings.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Guarantees Section */}
      <section className="terminal-panel" aria-label="Technical Privacy Guarantees">
        <div className="panel-titlebar">
          <span>MACHINE-ENFORCED PRIVACY ARCHITECTURE</span>
          <span className="brand-version-badge">ZERO NETWORK LEAKAGE</span>
        </div>
        <div className="panel-body">
          <div className="guarantee-grid">
            <div className="guarantee-item">
              <span className="guarantee-icon" aria-hidden="true">✓</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Content Security Policy</strong>
                HTTP headers set <code>connect-src 'none'</code>. The browser is technically barred from
                sending requests anywhere.
              </div>
            </div>

            <div className="guarantee-item">
              <span className="guarantee-icon" aria-hidden="true">✓</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Zero Storage of Capsule</strong>
                Raw capsule and decoded data are never stored in localStorage, cookies, or IndexedDB.
              </div>
            </div>

            <div className="guarantee-item">
              <span className="guarantee-icon" aria-hidden="true">✓</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Data Shrinks Instantly</strong>
                Input is parsed into opaque IDs (e.g. <code>themeId: "retro_computers"</code>), then raw
                strings are destroyed in memory.
              </div>
            </div>

            <div className="guarantee-item">
              <span className="guarantee-icon" aria-hidden="true">✓</span>
              <div>
                <strong style={{ color: '#fff', display: 'block' }}>Always Voluntary</strong>
                You can decline personalization at any point and play the entire 3-level game in Generic Mode.
              </div>
            </div>
          </div>

          <div className="callout-box warning" style={{ marginTop: '1.25rem' }}>
            <span>ℹ</span>
            <div>
              <strong>Client-Side Best-Effort Notice:</strong> While the prompt instructs your AI to
              exclude sensitive details, LLMs can occasionally behave unexpectedly. You are in full control
              and can inspect the base64 payload before pasting it.
            </div>
          </div>
        </div>
      </section>

      {/* Acknowledgment Checkbox */}
      <label className="checkbox-container">
        <input
          type="checkbox"
          id="consent-checkbox"
          checked={hasAcknowledged}
          onChange={handleCheckboxChange}
        />
        <span>
          I understand how the memory capsule operates, acknowledge the category exclusions, and wish to
          proceed to prompt generation.
        </span>
      </label>

      {/* Button Group */}
      <div className="btn-group">
        <button
          type="button"
          id="btn-agree-consent"
          className="btn btn-primary"
          disabled={!hasAcknowledged}
          onClick={handleProceed}
        >
          <span>→</span> PROCEED TO EXTRACTION (GENERATE PROMPT)
        </button>

        <button
          type="button"
          id="btn-consent-generic"
          className="btn btn-secondary"
          onClick={handleGeneric}
        >
          <span>◈</span> PLAY IN GENERIC MODE (NO CAPSULE)
        </button>

        <button
          type="button"
          id="btn-consent-back"
          className="btn btn-ghost"
          onClick={handleBack}
        >
          <span>←</span> BACK TO ARCHIVE
        </button>
      </div>
    </main>
  );
};
