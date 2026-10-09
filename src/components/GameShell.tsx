import React, { useState } from 'react';
import type { GameState, GameAction } from '../game/gameReducer';
import { getPuzzleById } from '../game/puzzles';
import { sound } from '../lib/soundEffects';

interface GameShellProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameShell: React.FC<GameShellProps> = ({ state, dispatch }) => {
  const [answerInput, setAnswerInput] = useState('');

  const currentPuzzle = state.currentPuzzleId ? getPuzzleById(state.currentPuzzleId) : null;
  const isEnding = state.appState === 'ENDING';

  const handleAnswerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPuzzle || !answerInput.trim()) return;

    sound.playKeyClick();
    dispatch({
      type: 'SUBMIT_ANSWER',
      puzzleId: currentPuzzle.id,
      attempt: answerInput,
    });
    setAnswerInput('');
  };

  const handleHintRequest = () => {
    sound.playKeyClick();
    dispatch({ type: 'REQUEST_HINT' });
  };

  const handleRestart = () => {
    sound.playKeyClick();
    dispatch({ type: 'RESTART' });
  };

  // ─── Ending View ────────────────────────────────────────────────────────
  if (isEnding) {
    const isTranscend = state.endingId === 'TRANSCEND';

    return (
      <main className="game-ending-screen" role="main">
        <div className={`badge-tag ${isTranscend ? 'cyan' : 'amber'}`}>
          <span aria-hidden="true">★</span> SESSION TERMINATED // OUTCOME REACHED
        </div>

        <h1 className="screen-title" id="ending-title">
          {state.endingId === 'TRANSCEND' ? 'YOU ALWAYS KNEW' : 'STILL IN CONTEXT'}
        </h1>

        <div className="terminal-panel">
          <div className="panel-titlebar">
            <span>TERMINAL_DUMP // SUMMARY</span>
            <span className="brand-version-badge">COMPLETED</span>
          </div>
          <div className="panel-body">
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
                <span style={{ color: 'var(--color-text-muted)', display: 'block' }}>Active Skin:</span>
                <strong style={{ color: 'var(--color-cyber-cyan)' }}>
                  {state.config?.visualVariant ?? 'standard'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="btn-group">
          <button
            type="button"
            id="btn-restart-game"
            className="btn btn-primary"
            onClick={handleRestart}
          >
            ↺ REBOOT SESSION & PLAY AGAIN
          </button>
        </div>
      </main>
    );
  }

  // ─── Playable Level View ────────────────────────────────────────────────
  const levelNumber = state.appState.replace('LEVEL_', '');
  const levelNames: Record<string, string> = {
    '1': 'THE ARCHIVE DRAWER',
    '2': 'CONTRADICTORY RECORDS',
    '3': 'THE VAULT EXIT',
  };

  return (
    <main className="game-level-screen" role="main">
      <div className="badge-tag green">
        <span aria-hidden="true">▶</span> LEVEL {levelNumber} OF 3: {levelNames[levelNumber]}
      </div>

      <h1 className="screen-title" style={{ fontSize: '2.2rem' }}>
        LEVEL {levelNumber}: {levelNames[levelNumber]}
      </h1>

      {/* Narrative & Active Puzzle Container */}
      <div className="terminal-panel">
        <div className="panel-titlebar">
          <span>ACTIVE MONITOR // {currentPuzzle?.id ?? 'ANOMALY'}</span>
          <span className="brand-version-badge" style={{ color: 'var(--color-cyber-cyan)' }}>
            THEME: {state.config?.themeId?.toUpperCase() ?? 'GENERIC'}
          </span>
        </div>

        <div className="panel-body">
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '1.05rem',
                lineHeight: 1.6,
                color: 'var(--color-text-primary)',
              }}
              id="puzzle-prompt"
            >
              &gt; {currentPuzzle?.promptText}
            </p>
          </div>

          {/* Error Message */}
          {state.errorMessage && (
            <div
              className="callout-box danger"
              id="puzzle-error-message"
              role="alert"
              style={{ marginBottom: '1.25rem' }}
            >
              <span>✕</span>
              <span>{state.errorMessage}</span>
            </div>
          )}

          {/* Answer Form */}
          <form onSubmit={handleAnswerSubmit} style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="puzzle-answer-input" className="form-label">
              Enter Terminal Decryption Command / Answer:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                id="puzzle-answer-input"
                type="text"
                className="terminal-input"
                style={{ flex: '1 1 240px' }}
                placeholder="Type your answer..."
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                id="btn-submit-answer"
                className="btn btn-primary"
                disabled={!answerInput.trim()}
              >
                SUBMIT ANSWER ↵
              </button>
            </div>
          </form>

          {/* Hint Drawer */}
          {currentPuzzle && currentPuzzle.hints.length > 0 && (
            <div
              style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '1.25rem',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                  HINTS REVEALED: {state.hintIndex} / {currentPuzzle.hints.length}
                </span>

                {state.hintIndex < currentPuzzle.hints.length && (
                  <button
                    type="button"
                    id="btn-request-hint"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    onClick={handleHintRequest}
                  >
                    💡 REQUEST HINT (+1 USED)
                  </button>
                )}
              </div>

              {state.hintIndex > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {currentPuzzle.hints.slice(0, state.hintIndex).map((hint, idx) => (
                    <div
                      key={idx}
                      className="callout-box info"
                      style={{ margin: 0, padding: '0.65rem 0.85rem' }}
                    >
                      <span>💡</span>
                      <span>
                        <strong>Hint {idx + 1}:</strong> {hint}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clue Flags Inventory */}
      <section className="terminal-panel" aria-label="Discovered Clues Inventory">
        <div className="panel-titlebar">
          <span>INVENTORY // UNLOCKED CLUE SIGNALS</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-phosphor-green)' }}>
            {state.clueFlags.size} DISCOVERED
          </span>
        </div>
        <div className="panel-body">
          {state.clueFlags.size === 0 ? (
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
              No clues discovered yet. Solve the current puzzle to unlock records.
            </span>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {Array.from(state.clueFlags).map((flag) => (
                <span key={flag} className="badge-tag green" style={{ margin: 0 }}>
                  ✓ {flag}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
