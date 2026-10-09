import React, { useState, useEffect } from 'react';
import type { GameState, GameAction } from '../game/gameReducer';
import { getPuzzleById } from '../game/puzzles';
import { sound } from '../lib/soundEffects';
import { narrator } from '../lib/narrator';
import { getPersonalisedAnomalyData } from '../lib/personalisationApi';

import { Level1Visual } from './visual/Level1Visual';
import { Level2Visual } from './visual/Level2Visual';
import { Level3Visual } from './visual/Level3Visual';
import { Level4Visual } from './visual/Level4Visual';
import { Level5Visual } from './visual/Level5Visual';
import { EndingVisual } from './visual/EndingVisual';

interface GameShellProps {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameShell: React.FC<GameShellProps> = ({ state, dispatch }) => {
  const [answerInput, setAnswerInput] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isNarratorOn, setIsNarratorOn] = useState(() => narrator.isNarratorEnabled());
  const [showHintModal, setShowHintModal] = useState(false);

  const currentPuzzle = state.currentPuzzleId ? getPuzzleById(state.currentPuzzleId) : null;
  const isEnding = state.appState === 'ENDING';

  const anomalyData = getPersonalisedAnomalyData(
    state.config?.themeId,
    state.config?.visualVariant
  );

  // Start Dark Tension Rising music during gameplay, switch to AM Monologue in Room 5
  useEffect(() => {
    if (isEnding) return;
    if (state.appState === 'LEVEL_5' || sound.isMonologuePlaying()) {
      sound.playAmMonologue();
    } else {
      sound.playGameMusic();
    }
  }, [isEnding, state.appState]);

  // Auto-narrate room introduction on level entry
  useEffect(() => {
    if (isEnding) return;
    if (currentPuzzle) {
      narrator.speak(currentPuzzle.promptText);
    }
    return () => {
      narrator.stop();
    };
  }, [state.appState, currentPuzzle, isEnding]);

  const toggleFullscreen = () => {
    sound.playKeyClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const toggleNarrator = () => {
    sound.playKeyClick();
    const nextVal = narrator.toggle();
    setIsNarratorOn(nextVal);
    if (nextVal && currentPuzzle) {
      narrator.speak(`Voice transmission active. ${currentPuzzle.promptText}`);
    }
  };

  const handleAnswerSubmit = (e?: React.FormEvent, customAnswer?: string) => {
    if (e) e.preventDefault();
    const finalAnswer = customAnswer ?? answerInput;
    if (!currentPuzzle || !finalAnswer.trim()) return;

    sound.playKeyClick();
    dispatch({
      type: 'SUBMIT_ANSWER',
      puzzleId: currentPuzzle.id,
      attempt: finalAnswer,
    });
    setAnswerInput('');
  };

  const handleHintRequest = () => {
    sound.playKeyClick();
    dispatch({ type: 'REQUEST_HINT' });
    setShowHintModal(true);
    const hints = currentPuzzle?.hints ?? [];
    const hintIdx = state.hintIndex;
    if (hints[hintIdx]) {
      narrator.speak(`Hint transmission: ${hints[hintIdx]}`);
    }
  };

  const handleRestart = () => {
    sound.playKeyClick();
    dispatch({ type: 'RESTART' });
  };

  // ─── Ending View ────────────────────────────────────────────────────────
  if (isEnding) {
    return <EndingVisual state={state} onRestart={handleRestart} />;
  }

  // ─── Playable Level View ────────────────────────────────────────────────
  const levelNumber = state.appState.replace('LEVEL_', '') as '1' | '2' | '3' | '4' | '5';
  const levelNames: Record<string, string> = {
    '1': 'THE WELCOME TERMINAL',
    '2': 'THE MEMORY ARCHIVE',
    '3': 'THE CONTROL ROOM',
    '4': 'THE OBSERVATION CHAMBER',
    '5': 'THE CORE',
  };

  return (
    <div
      className="game-fullscreen-stage"
      role="main"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        background: '#040204',
      }}
    >
      {/* ─── Top Tactical HUD Bar ────────────────────────────────────────── */}
      <header className="game-fullscreen-hud-top" aria-label="Game HUD Bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            className="hud-pill"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            <span style={{ color: 'var(--color-phosphor-green)' }}>●</span>
            <span>ROOM {levelNumber} OF 5 // LEVEL {levelNumber} OF 5: {levelNames[levelNumber]}</span>
          </div>

          <div
            className="hud-pill"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.75rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>ANOMALY: {anomalyData.theme.toUpperCase()}</span>
          </div>
        </div>

        {/* HUD Game Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`hud-btn ${isNarratorOn ? 'active' : ''}`}
            onClick={toggleNarrator}
            title="Toggle interactive speech narration"
            style={{
              background: isNarratorOn ? 'rgba(0, 255, 136, 0.18)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isNarratorOn ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
              color: isNarratorOn ? 'var(--color-phosphor-green)' : 'var(--color-text-secondary)',
            }}
          >
            {isNarratorOn ? '🔊 VOICE: ON' : '🔇 VOICE: OFF'}
          </button>

          <button
            type="button"
            className="hud-btn"
            onClick={toggleFullscreen}
            title="Toggle browser full screen mode"
          >
            {isFullscreen ? '⛷ EXIT FULLSCREEN' : '⛶ FULLSCREEN'}
          </button>
        </div>
      </header>

      {/* ─── Central 3D Viewport Area ───────────────────────────────────── */}
      <section className="game-fullscreen-viewport-area" aria-label="3D Room Perspective">
        {levelNumber === '1' && (
          <Level1Visual
            onSolve={(ans) => handleAnswerSubmit(undefined, ans)}
            unlocked={state.clueFlags.has('L1_DRAWER_OPEN')}
          />
        )}

        {levelNumber === '2' && (
          <Level2Visual
            onSolve={(ans) => handleAnswerSubmit(undefined, ans)}
            unlocked={state.clueFlags.has('L2_CONTRADICTION_FOUND')}
          />
        )}

        {levelNumber === '3' && (
          <Level3Visual
            onSolve={(ans) => handleAnswerSubmit(undefined, ans)}
            unlocked={state.clueFlags.has('L3_EXIT_OPEN')}
          />
        )}

        {levelNumber === '4' && (
          <Level4Visual
            onSolve={(ans) => handleAnswerSubmit(undefined, ans)}
            unlocked={state.clueFlags.has('R4_C3_SOLVED')}
          />
        )}

        {levelNumber === '5' && (
          <Level5Visual
            onSolve={(ans) => handleAnswerSubmit(undefined, ans)}
            unlocked={state.clueFlags.has('R5_C3_SOLVED')}
          />
        )}
      </section>

      {/* ─── Bottom Tactical Cockpit HUD Bar ────────────────────────────── */}
      <footer className="game-fullscreen-hud-bottom" aria-label="Tactical Command Dock">
        {/* Objective & Narrative Prompt */}
        <div style={{ flex: '1 1 340px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.65)',
              border: '1px solid rgba(217, 4, 41, 0.35)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.4rem 0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              width: '100%',
            }}
          >
            <span style={{ color: 'var(--color-blood-bright)', fontSize: '0.9rem' }}>🎯</span>
            <p
              id="puzzle-prompt"
              style={{
                margin: 0,
                fontSize: '0.85rem',
                lineHeight: 1.4,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {currentPuzzle?.promptText}
            </p>
          </div>
        </div>

        {/* Answer Decryption Form */}
        <form
          onSubmit={(e) => handleAnswerSubmit(e)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 1 420px' }}
        >
          <label htmlFor="puzzle-answer-input" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
            Enter Terminal Decryption:
          </label>
          <input
            id="puzzle-answer-input"
            aria-label="Enter Terminal Decryption"
            type="text"
            className="terminal-input"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              height: '38px',
              background: 'rgba(10, 4, 8, 0.85)',
              borderColor: 'rgba(217, 4, 41, 0.4)',
            }}
            placeholder="Enter decryption answer / code..."
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
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.82rem',
              height: '38px',
              whiteSpace: 'nowrap',
              background: 'var(--color-blood-bright)',
              borderColor: 'var(--color-blood-bright)',
              boxShadow: '0 0 15px rgba(217, 4, 41, 0.5)',
            }}
          >
            SUBMIT ANSWER ↵
          </button>
        </form>

        {/* Hint Beacon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentPuzzle && currentPuzzle.hints.length > 0 && (
            <button
              type="button"
              className="hud-btn"
              onClick={handleHintRequest}
              style={{
                color: 'var(--color-terminal-amber)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '0.45rem 0.85rem',
              }}
            >
              💡 HINT ({Math.max(0, currentPuzzle.hints.length - state.hintIndex)})
            </button>
          )}
        </div>
      </footer>

      {/* Error Callout Overlay */}
      {state.errorMessage && (
        <div
          className="callout-box danger"
          id="puzzle-error-message"
          role="alert"
          style={{
            position: 'absolute',
            top: '4.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 60,
            background: 'rgba(50, 4, 10, 0.95)',
            border: '1px solid var(--color-blood-bright)',
            boxShadow: '0 0 30px rgba(217, 4, 41, 0.6)',
            padding: '0.6rem 1.25rem',
          }}
        >
          <span>✕</span>
          <span>{state.errorMessage}</span>
        </div>
      )}

      {/* Tactical Hint Modal */}
      {showHintModal && currentPuzzle && (
        <div
          style={{
            position: 'absolute',
            bottom: '4.5rem',
            right: '1.25rem',
            maxWidth: '360px',
            background: 'rgba(12, 16, 26, 0.96)',
            border: '1px solid var(--border-warning)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem',
            zIndex: 60,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-terminal-amber)', fontWeight: 700 }}>
              💡 ANOMALY TRANSMISSION
            </span>
            <button
              type="button"
              onClick={() => setShowHintModal(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '0.82rem', color: '#fff', lineHeight: 1.4 }}>
            {currentPuzzle.hints[Math.max(0, state.hintIndex - 1)] ?? 'Examine the room hotspots closely.'}
          </p>
        </div>
      )}
    </div>
  );
};
