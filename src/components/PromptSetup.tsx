import React, { useState } from 'react';
import { generatePrompt, generateSampleCapsule } from '../game/promptGenerator';
import { sound } from '../lib/soundEffects';

interface PromptSetupProps {
  sessionToken: string;
  onProceedToPaste: (sampleCapsule?: string) => void;
  onStartGeneric: () => void;
  onBack: () => void;
}

export const PromptSetup: React.FC<PromptSetupProps> = ({
  sessionToken,
  onProceedToPaste,
  onStartGeneric,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'chatgpt' | 'claude' | 'gemini' | 'local'>('chatgpt');

  const promptText = generatePrompt(sessionToken);

  const handleCopy = async () => {
    sound.playKeyClick();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(promptText);
      } else {
        // Fallback for non-secure contexts / older browsers
        const textarea = document.createElement('textarea');
        textarea.value = promptText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleUseSample = () => {
    sound.playKeyClick();
    const sample = generateSampleCapsule(sessionToken, 'astronomy');
    onProceedToPaste(sample);
  };

  const handleContinue = () => {
    sound.playKeyClick();
    onProceedToPaste();
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
    <main className="prompt-setup-screen" role="main">
      <div className="badge-tag cyan">
        <span aria-hidden="true">◈</span> STEP 1: AI PROMPT GENERATION
      </div>

      <h1 className="screen-title">EXTRACTION PROMPT READY</h1>
      <p className="screen-subtitle">
        Copy the prompt below and paste it into your AI assistant. The prompt includes your active
        session identifier and allowlists so your assistant can compile a safe, compact capsule.
      </p>

      {/* Session correlation banner */}
      <div className="callout-box info" style={{ marginBottom: '1.25rem' }}>
        <span>ℹ</span>
        <div>
          <strong>Session Correlation ID:</strong> <code>{sessionToken}</code>
          <br />
          This ID ensures that only capsules generated for this active session are accepted. It is not
          a secret key.
        </div>
      </div>

      {/* Prompt Display Panel */}
      <section className="terminal-panel" aria-label="Generated AI Prompt">
        <div className="panel-titlebar">
          <span>AI_PROMPT_PAYLOAD // STRICT SCHEMA v1.0</span>
          <button
            type="button"
            id="btn-copy-prompt"
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
            onClick={handleCopy}
          >
            {copied ? '✓ COPIED TO CLIPBOARD!' : '📋 COPY PROMPT'}
          </button>
        </div>

        <div className="panel-body" style={{ padding: '1rem' }}>
          <pre
            className="code-preview-box"
            id="prompt-text-display"
            tabIndex={0}
            aria-label="Prompt text"
          >
            {promptText}
          </pre>
        </div>
      </section>

      {/* Assistant Specific Tips Tabs */}
      <section className="terminal-panel" aria-label="Assistant Guidance">
        <div className="panel-titlebar">
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className={`icon-btn-toggle ${activeTab === 'chatgpt' ? 'active' : ''}`}
              onClick={() => { sound.playKeyClick(); setActiveTab('chatgpt'); }}
            >
              ChatGPT
            </button>
            <button
              type="button"
              className={`icon-btn-toggle ${activeTab === 'claude' ? 'active' : ''}`}
              onClick={() => { sound.playKeyClick(); setActiveTab('claude'); }}
            >
              Claude
            </button>
            <button
              type="button"
              className={`icon-btn-toggle ${activeTab === 'gemini' ? 'active' : ''}`}
              onClick={() => { sound.playKeyClick(); setActiveTab('gemini'); }}
            >
              Gemini
            </button>
            <button
              type="button"
              className={`icon-btn-toggle ${activeTab === 'local' ? 'active' : ''}`}
              onClick={() => { sound.playKeyClick(); setActiveTab('local'); }}
            >
              Local / Ollama
            </button>
          </div>
          <span>PROVIDER INSTRUCTIONS</span>
        </div>

        <div className="panel-body" style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
          {activeTab === 'chatgpt' && (
            <p style={{ margin: 0 }}>
              <strong>ChatGPT:</strong> Paste directly into your conversation. If Memory is enabled, it
              will pick high-level topics (e.g. astronomy or gaming) from past discussions without sharing
              raw personal details. Copy only the base64 string response.
            </p>
          )}
          {activeTab === 'claude' && (
            <p style={{ margin: 0 }}>
              <strong>Claude:</strong> Works seamlessly in any Claude chat or Project. Claude excels at
              following strict schema formatting and will return the base64 string.
            </p>
          )}
          {activeTab === 'gemini' && (
            <p style={{ margin: 0 }}>
              <strong>Gemini:</strong> Paste the prompt into Gemini. If it wraps the output in code
              fences, our parser automatically handles and strips the fences.
            </p>
          )}
          {activeTab === 'local' && (
            <p style={{ margin: 0 }}>
              <strong>Local Models (Ollama, Mistral, Llama 3):</strong> Paste into any local runner.
              Zero internet access is needed anywhere in this entire flow.
            </p>
          )}
        </div>
      </section>

      {/* Fast Demo / Instant Test Helper */}
      <div
        className="callout-box success"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <strong>🧪 Quick Testing / Offline Preview:</strong>
          <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>
            Don't have an assistant open right now? Generate a valid sample capsule matching your session
            and jump straight into testing.
          </div>
        </div>
        <button
          type="button"
          id="btn-use-sample-capsule"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.9rem' }}
          onClick={handleUseSample}
        >
          ⚡ AUTO-FILL SAMPLE CAPSULE
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="btn-group">
        <button
          type="button"
          id="btn-to-capsule-entry"
          className="btn btn-primary"
          onClick={handleContinue}
        >
          <span>→</span> CONTINUE TO CAPSULE ENTRY
        </button>

        <button
          type="button"
          id="btn-prompt-generic"
          className="btn btn-secondary"
          onClick={handleGeneric}
        >
          <span>◈</span> PLAY IN GENERIC MODE
        </button>

        <button
          type="button"
          id="btn-prompt-back"
          className="btn btn-ghost"
          onClick={handleBack}
        >
          <span>←</span> BACK TO CONSENT
        </button>
      </div>
    </main>
  );
};
