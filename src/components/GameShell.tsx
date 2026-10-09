import React, { useState, useEffect } from 'react';
import type { GameState, GameAction } from '../game/gameReducer';
import { getPuzzleById } from '../game/puzzles';
import { sound } from '../lib/soundEffects';
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
  const [isFullscreen, setIsFullscreen] = useState(() =>
    Boolean(typeof document !== 'undefined' && document.fullscreenElement)
  );
  const [isAudioMuted, setIsAudioMuted] = useState(() => sound.isMuted());

  const currentPuzzle = state.currentPuzzleId ? getPuzzleById(state.currentPuzzleId) : null;
  const isEnding = state.appState === 'ENDING';

  const anomalyData = getPersonalisedAnomalyData(
    state.config?.themeId,
    state.config?.visualVariant
  );

  // Auto-request fullscreen like exam proctoring systems (HirePro) on game entry
  useEffect(() => {
    if (!document.fullscreenElement && typeof document !== 'undefined') {
      document.documentElement.requestFullscreen?.().catch(() => {
        // Browser policy may require explicit click
      });
    }
  }, []);

  // Synchronize fullscreen state with browser
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Audio track management: Room 5 switches to AM Monologue, earlier rooms play game tension music
  useEffect(() => {
    if (isEnding) return;
    if (state.appState === 'LEVEL_5' || sound.isMonologuePlaying()) {
      sound.playAmMonologue();
    } else {
      sound.playGameMusic();
    }
  }, [isEnding, state.appState]);

  // Responsive Top Toggle Handlers
  const toggleAudio = () => {
    sound.playKeyClick();
    const nextMuted = sound.toggleMute();
    setIsAudioMuted(nextMuted);
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

  const handleAnswerSubmit = (customAnswer: string) => {
    if (!currentPuzzle || !customAnswer.trim()) return;

    sound.playKeyClick();
    dispatch({
      type: 'SUBMIT_ANSWER',
      puzzleId: currentPuzzle.id,
      attempt: customAnswer,
    });
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

  // Derive active sequential step (1, 2, or 3) for the current room
  let activeStepInRoom: 1 | 2 | 3 = 1;
  if (levelNumber === '1') {
    if (state.clueFlags.has('R1_C2_SOLVED')) activeStepInRoom = 3;
    else if (state.clueFlags.has('R1_C1_SOLVED')) activeStepInRoom = 2;
  } else if (levelNumber === '2') {
    if (state.clueFlags.has('R2_C2_SOLVED')) activeStepInRoom = 3;
    else if (state.clueFlags.has('R2_C1_SOLVED')) activeStepInRoom = 2;
  } else if (levelNumber === '3') {
    if (state.clueFlags.has('R3_C2_SOLVED')) activeStepInRoom = 3;
    else if (state.clueFlags.has('R3_C1_SOLVED')) activeStepInRoom = 2;
  } else if (levelNumber === '4') {
    if (state.clueFlags.has('R4_C2_SOLVED')) activeStepInRoom = 3;
    else if (state.clueFlags.has('R4_C1_SOLVED')) activeStepInRoom = 2;
  } else if (levelNumber === '5') {
    if (state.clueFlags.has('R5_C2_SOLVED')) activeStepInRoom = 3;
    else if (state.clueFlags.has('R5_C1_SOLVED')) activeStepInRoom = 2;
  }

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
          {/* Audio / Music Mute Toggle (Controls Tension Music and Room 5 AM Monologue) */}
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

          {/* Browser Fullscreen Toggle (HirePro Kiosk Mode) */}
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

      {/* ─── Central Visual Viewport (Occupies 100% of Screen — Only Game Window) ─── */}
      <section
        className="game-fullscreen-viewport-area"
        aria-label="Chamber Interface"
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
            onSolve={handleAnswerSubmit}
            unlocked={state.clueFlags.has('L1_DRAWER_OPEN')}
            activeStep={activeStepInRoom}
            hints={currentPuzzle?.hints ?? []}
            hintIndex={state.hintIndex}
            onRequestHint={handleHintRequest}
          />
        )}

        {levelNumber === '2' && (
          <Level2Visual
            onSolve={handleAnswerSubmit}
            unlocked={state.clueFlags.has('L2_CONTRADICTION_FOUND')}
            activeStep={activeStepInRoom}
            hints={currentPuzzle?.hints ?? []}
            hintIndex={state.hintIndex}
            onRequestHint={handleHintRequest}
          />
        )}

        {levelNumber === '3' && (
          <Level3Visual
            onSolve={handleAnswerSubmit}
            unlocked={state.clueFlags.has('L3_EXIT_OPEN')}
            activeStep={activeStepInRoom}
            hints={currentPuzzle?.hints ?? []}
            hintIndex={state.hintIndex}
            onRequestHint={handleHintRequest}
          />
        )}

        {levelNumber === '4' && (
          <Level4Visual
            onSolve={handleAnswerSubmit}
            unlocked={state.clueFlags.has('R4_C3_SOLVED')}
            activeStep={activeStepInRoom}
            hints={currentPuzzle?.hints ?? []}
            hintIndex={state.hintIndex}
            onRequestHint={handleHintRequest}
          />
        )}

        {levelNumber === '5' && (
          <Level5Visual
            onSolve={handleAnswerSubmit}
            unlocked={state.clueFlags.has('R5_C3_SOLVED')}
            activeStep={activeStepInRoom}
            hints={currentPuzzle?.hints ?? []}
            hintIndex={state.hintIndex}
            onRequestHint={handleHintRequest}
          />
        )}
      </section>

      {/* Floating Error Callout on Image Screen */}
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
