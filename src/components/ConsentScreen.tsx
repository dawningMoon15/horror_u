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
    sound.stopAllAudio();
    onStartGeneric();
  };

  const handleBack = () => {
    sound.playKeyClick();
    onBack();
  };

  return (
    <main className="consent-screen" role="main" style={{ maxWidth: '780px', margin: '0 auto' }}>
      <div className="badge-tag amber">
        <span aria-hidden="true">🔒</span> PRIVACY PROTOCOL // ZERO SERVER STORAGE
      </div>

      <h1 className="screen-title" style={{ fontSize: '2rem' }}>
        MEMORY & DATA DISCLOSURE
      </h1>
      <p className="screen-subtitle" style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
        Your personal privacy is machine-enforced. Only harmless categorical tokens (e.g. astronomy, botany, retro-computing) enter the game engine.
      </p>

      {/* Streamlined Exclusion Badges */}
      <section className="terminal-panel" aria-label="Strict Exclusions" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-titlebar">
          <span>STRICT ALLOWLIST FILTER</span>
          <span className="brand-version-badge" style={{ color: 'var(--color-crimson-alert)', borderColor: 'var(--border-danger)' }}>
            SCHEMA-ENFORCED
          </span>
        </div>
        <div className="panel-body" style={{ padding: '1rem 1.25rem' }}>
          <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            The prompt and Zod schema physically prohibit sensitive data from entering the chamber:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.65rem' }}>
            <div style={{ background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#ffb3ba' }}>
              ✕ Credentials & Keys (Forbidden)
            </div>
            <div style={{ background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#ffb3ba' }}>
              ✕ Real Identifiers & PII (Forbidden)
            </div>
            <div style={{ background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#ffb3ba' }}>
              ✕ Freeform Prompts (Forbidden)
            </div>
            <div style={{ background: 'rgba(0, 255, 136, 0.08)', border: '1px solid rgba(0, 255, 136, 0.25)', borderRadius: '4px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#b3ffd9' }}>
              ✓ Strict Allowlist Only
            </div>
          </div>
        </div>
      </section>

      {/* Streamlined Checkbox Acknowledgment */}
      <div style={{ background: 'rgba(12, 18, 30, 0.7)', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
        <label className="checkbox-container" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={hasAcknowledged}
            onChange={handleCheckboxChange}
            aria-required="true"
          />
          <span style={{ fontSize: '0.88rem', color: '#ffffff', fontWeight: 500 }}>
            I understand no personal data is stored, and only harmless interest themes are ingested.
          </span>
        </label>
      </div>

      {/* Actions */}
      <div className="btn-group" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
        <button
          type="button"
          id="btn-agree-consent"
          className="btn btn-primary"
          disabled={!hasAcknowledged}
          onClick={handleProceed}
          style={{ padding: '0.75rem 1.4rem' }}
        >
          <span>→</span> PROCEED TO EXTRACTION
        </button>

        <button
          type="button"
          id="btn-generic-consent"
          className="btn btn-secondary"
          onClick={handleGeneric}
          style={{ padding: '0.75rem 1.25rem' }}
        >
          PLAY GENERIC (NO PERSONALISATION)
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleBack}
          style={{ opacity: 0.7, padding: '0.75rem 1rem' }}
        >
          BACK TO ARCHIVE
        </button>
      </div>
    </main>
  );
};
