import React, { useEffect } from 'react';
import { CameraViewport } from './CameraViewport';
import { sound } from '../../lib/soundEffects';
import type { GameState } from '../../game/gameReducer';

interface EndingVisualProps {
  state: GameState;
  onRestart: () => void;
}

export const EndingVisual: React.FC<EndingVisualProps> = ({ state, onRestart }) => {
  const isTranscend = state.endingId === 'TRANSCEND';

  // Play creepy old music box on the Thank You screen
  useEffect(() => {
    sound.playEndingMusic();
    return () => {
      sound.stopMusic();
    };
  }, []);

  return (
    <div className="ending-visual-container analog-horror-ending">
      <div className="thankyou-banner">
        <span className="vhs-rec-dot">●</span>
        <span>THANK YOU FOR PLAYING // ARCHIVE SESSION COMPLETE</span>
      </div>

      <CameraViewport
        imageSrc="/assets/thankyou.jpg"
        imageAlt="Thank you for playing - analog horror archival discovery"
        title="VAULT BREACH // THANK YOU FOR PLAYING"
        subtitle={isTranscend ? 'TRANSCENDENCE ACHIEVED' : 'PARADOX LOOP SECURED'}
      />

      <div className="terminal-panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-titlebar">
          <span>SESSION TERMINATED // CONTEXT RESOLUTION</span>
          <span className={`brand-version-badge ${isTranscend ? '' : 'amber'}`}>
            {isTranscend ? 'TRANSCENDED' : 'LOOPED'}
          </span>
        </div>

        <div className="panel-body">
          <h2 style={{ color: '#fff', fontSize: '1.8rem', margin: '0 0 0.75rem 0' }} id="ending-title">
            {isTranscend ? 'YOU ALWAYS KNEW' : 'STILL IN CONTEXT'}
          </h2>

          <p
            style={{
              fontSize: '1.15rem',
              lineHeight: 1.7,
              color: 'var(--color-phosphor-green)',
              margin: '0 0 1.5rem 0',
            }}
            id="ending-narrative"
          >
            {state.endingText ?? 'You found the exit. But the context remains.'}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '1rem',
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Clues Unlocked:</span>
              <strong style={{ color: '#fff' }}>{state.clueFlags.size} / 3</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Hints Consulted:</span>
              <strong style={{ color: '#fff' }}>{state.hintsUsed}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Personalised Theme:</span>
              <strong style={{ color: 'var(--color-cyber-cyan)' }}>
                {state.config?.themeId?.toUpperCase() ?? 'GENERIC'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Visual Aesthetic:</span>
              <strong style={{ color: 'var(--color-terminal-amber)' }}>
                {state.config?.visualVariant ?? 'brutalist_digital'}
              </strong>
            </div>
          </div>

          <div className="btn-group" style={{ marginTop: '1.75rem' }}>
            <button
              type="button"
              id="btn-restart-game"
              className="btn btn-primary"
              onClick={() => {
                sound.playKeyClick();
                sound.stopMusic();
                onRestart();
              }}
            >
              ↺ REBOOT SESSION & PLAY AGAIN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
