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
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(typeof document !== 'undefined' && document.fullscreenElement));
  const [isAudioMuted, setIsAudioMuted] = useState(() => sound.isMuted());
  const [isNarratorOn, setIsNarratorOn] = useState(() => narrator.isNarratorEnabled());
  const [showHintModal, setShowHintModal] = useState(false);
  const [showTerminalInput, setShowTerminalInput] = useState(false);

  const currentPuzzle = state.currentPuzzleId ? getPuzzleById(state.currentPuzzleId) : null;
  const isEnding = state.appState === 'ENDING';

  const anomalyData = getPersonalisedAnomalyData(
    state.config?.themeId,
    state.config?.visualVariant
  );

  // Synchronize fullscreen state with browser
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Audio track management
  useEffect(() => {
    if (isEnding) return;
    if (state.appState === 'LEVEL_5' || sound.isMonologuePlaying()) {
      sound.playAmMonologue();
    } else {
      sound.playGameMusic();
    }
  }, [isEnding, state.appState]);

  // Voice narration on level / clue entry
  useEffect(() => {
    if (isEnding) return;
    if (currentPuzzle) {
      narrator.speak(currentPuzzle.promptText);
    }
    return () => {
      narrator.stop();
    };
  }, [state.appState, currentPuzzle, isEnding]);

  // Responsive Top Toggle Handlers
  const toggleAudio = () => {
    sound.playKeyClick();
    const nextMuted = sound.toggleMute();
    setIsAudioMuted(nextMuted);
  };

  const toggleNarrator = () => {
    sound.playKeyClick();
    const nextVal = narrator.toggle();
    setIsNarratorOn(nextVal);
    if (nextVal && currentPuzzle) {
      narrator.speak(`Transmission active: ${currentPuzzle.promptText}`);
    }
  };

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
    setShowTerminalInput(false);
  };

  const handleHintRequest = () => {
    sound.playKeyClick();
    dispatch({ type: 'REQUEST_HINT' });
    setShowHintModal(true);
    const hints = currentPuzzle?.hints ?? [];
    const hintIdx = state.hintIndex;
    if (hints[hintIdx]) {
      narrator.speak(`Hint memorandum: ${hints[hintIdx]}`);
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
        background: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* ─── Top Responsive Tactical HUD Overlay (Directly on Image) ─────── */}
      <header
        className="game-fullscreen-hud-top"
        aria-label="Game HUD Bar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.6rem 1rem',
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 70%, transparent 100%)',
          borderBottom: 'none',
          pointerEvents: 'auto',
        }}
      >
        {/* Left: Diegetic Room & Anomaly Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            className="hud-pill"
            style={{
              background: 'rgba(10, 15, 20, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}
          >
            <span style={{ color: 'var(--color-phosphor-green)' }}>●</span>
            <span>ROOM {levelNumber} OF 5 // LEVEL {levelNumber} OF 5: {levelNames[levelNumber]}</span>
          </div>

          <div
            className="hud-pill"
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.74rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <span>ANOMALY: {anomalyData.theme.toUpperCase()}</span>
          </div>
        </div>

        {/* Right: Highly Responsive Top Game Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {/* Audio / Music Mute Toggle */}
          <button
            type="button"
            className={`hud-btn ${!isAudioMuted ? 'active' : ''}`}
            onClick={toggleAudio}
            title="Toggle music and background sound effects"
            style={{
              background: !isAudioMuted ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 50, 50, 0.15)',
              borderColor: !isAudioMuted ? 'var(--color-phosphor-green)' : 'rgba(255, 50, 50, 0.5)',
              color: !isAudioMuted ? 'var(--color-phosphor-green)' : '#ff8888',
            }}
          >
            {isAudioMuted ? '🔇 MUSIC: OFF' : '🔊 MUSIC: ON'}
          </button>

          {/* Voice Narration Toggle */}
          <button
            type="button"
            className={`hud-btn ${isNarratorOn ? 'active' : ''}`}
            onClick={toggleNarrator}
            title="Toggle interactive speech narration"
            style={{
              background: isNarratorOn ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: isNarratorOn ? 'var(--color-phosphor-green)' : 'var(--border-subtle)',
              color: isNarratorOn ? 'var(--color-phosphor-green)' : 'var(--color-text-secondary)',
            }}
          >
            {isNarratorOn ? '🗣️ VOICE: ON' : '🤐 VOICE: OFF'}
          </button>

          {/* Floating Hint Trigger */}
          {currentPuzzle && (
            <button
              type="button"
              className="hud-btn"
              onClick={handleHintRequest}
              title="Request clue hint overlay on the image"
              style={{
                color: 'var(--color-terminal-amber)',
                borderColor: 'rgba(245, 158, 11, 0.45)',
                background: 'rgba(245, 158, 11, 0.12)',
              }}
            >
              💡 HINT ({Math.max(0, currentPuzzle.hints.length - state.hintIndex)})
            </button>
          )}

          {/* Terminal Command Input Toggle */}
          <button
            type="button"
            className={`hud-btn ${showTerminalInput ? 'active' : ''}`}
            onClick={() => {
              sound.playKeyClick();
              setShowTerminalInput((prev) => !prev);
            }}
            title="Toggle floating keyboard command entry overlay"
            style={{
              borderColor: showTerminalInput ? 'var(--color-cyber-cyan)' : 'var(--border-subtle)',
              color: showTerminalInput ? 'var(--color-cyber-cyan)' : '#ffffff',
            }}
          >
            ⌨️ COMMAND
          </button>

          {/* Browser Fullscreen Toggle */}
          <button
            type="button"
            className="hud-btn"
            onClick={toggleFullscreen}
            title="Toggle true browser fullscreen mode"
          >
            {isFullscreen ? '⛷ EXIT FS' : '⛶ FULLSCREEN'}
          </button>

          {/* Session Restart */}
          <button
            type="button"
            className="hud-btn"
            onClick={handleRestart}
            title="Reboot current escape session"
            style={{ color: 'var(--color-text-muted)' }}
          >
            ↺
          </button>
        </div>
      </header>

      {/* ─── Central Visual Viewport (Occupies 100% of Screen) ──────────── */}
      <section
        className="game-fullscreen-viewport-area"
        aria-label="3D Room Perspective"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 10,
        }}
      >
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

      {/* ─── Floating In-Image Hint Memorandum Modal ────────────────────── */}
      {showHintModal && currentPuzzle && (
        <div
          role="dialog"
          aria-label="Clue Hint Memorandum"
          style={{
            position: 'absolute',
            top: '4.75rem',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'min(92vw, 440px)',
            background: 'rgba(12, 16, 26, 0.96)',
            border: '1px solid var(--border-warning)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95), 0 0 25px rgba(245, 158, 11, 0.25)',
            padding: '1.25rem',
            zIndex: 90,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-terminal-amber)', fontWeight: 700, letterSpacing: '0.05em' }}>
              💡 ANOMALY HINT MEMORANDUM
            </span>
            <button
              type="button"
              className="hud-btn"
              onClick={() => setShowHintModal(false)}
              style={{ padding: '0.2rem 0.5rem' }}
            >
              ✕ CLOSE
            </button>
          </div>

          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#ffffff', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }}>
            {currentPuzzle.hints[Math.max(0, state.hintIndex - 1)] ?? 'Search the illuminated areas of the room with your cursor flashlight.'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              Hint {Math.min(state.hintIndex, currentPuzzle.hints.length)} of {currentPuzzle.hints.length}
            </span>
            {state.hintIndex < currentPuzzle.hints.length && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                onClick={() => {
                  sound.playKeyClick();
                  dispatch({ type: 'REQUEST_HINT' });
                }}
              >
                NEXT HINT ▶
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Floating Decryption Command Entry (On-Demand / Floating over Image) ─── */}
      {/* Kept always accessible in DOM for accessibility & automated tests */}
      <div
        style={{
          position: 'absolute',
          bottom: showTerminalInput ? '1.5rem' : '-9999px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(92vw, 560px)',
          background: 'rgba(8, 6, 12, 0.94)',
          border: '1px solid rgba(217, 4, 41, 0.5)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(217, 4, 41, 0.4)',
          padding: '1rem',
          zIndex: 85,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-blood-bright)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            ⌨️ MANUAL CIPHER INJECTION PORT
          </span>
          <button
            type="button"
            onClick={() => setShowTerminalInput(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <p
          id="puzzle-prompt"
          style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.8rem',
            color: 'var(--color-text-secondary)',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {currentPuzzle?.promptText}
        </p>

        <form onSubmit={(e) => handleAnswerSubmit(e)} style={{ display: 'flex', gap: '0.5rem' }}>
          <label htmlFor="puzzle-answer-input" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
            Enter Terminal Decryption:
          </label>
          <input
            id="puzzle-answer-input"
            aria-label="Enter Terminal Decryption"
            type="text"
            className="terminal-input"
            style={{
              flex: 1,
              height: '38px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              background: 'rgba(0, 0, 0, 0.8)',
              borderColor: 'rgba(217, 4, 41, 0.4)',
            }}
            placeholder="Type answer or code..."
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
              height: '38px',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              background: 'var(--color-blood-bright)',
              borderColor: 'var(--color-blood-bright)',
            }}
          >
            SUBMIT ANSWER ↵
          </button>
        </form>
      </div>

      {/* Floating Error Callout on Image */}
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
            zIndex: 95,
            background: 'rgba(40, 2, 8, 0.95)',
            border: '1px solid var(--color-blood-bright)',
            boxShadow: '0 0 25px rgba(217, 4, 41, 0.7)',
            padding: '0.5rem 1.25rem',
          }}
        >
          <span>✕ {state.errorMessage}</span>
        </div>
      )}
    </div>
  );
};
