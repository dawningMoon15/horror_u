import { useReducer, useState, useEffect } from 'react';
import { gameReducer, INITIAL_STATE, saveProgress, clearProgress } from './game/gameReducer';
import { GENERIC_GAME_CONFIG } from './game/mapPersonalisation';
import { generateSessionToken } from './game/session';
import type { GameConfig } from './game/schema';
import { sound } from './lib/soundEffects';

import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ConsentScreen } from './components/ConsentScreen';
import { PromptSetup } from './components/PromptSetup';
import { CapsuleEntry } from './components/CapsuleEntry';
import { GameShell } from './components/GameShell';

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const [sessionToken, setSessionToken] = useState<string>(() => generateSessionToken());
  const [sampleCapsule, setSampleCapsule] = useState<string>('');
  const [scanlinesEnabled, setScanlinesEnabled] = useState(true);
  const [audioMuted, setAudioMuted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Save progress safely on level changes (stores only opaque flags and level number)
  useEffect(() => {
    if (['LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5'].includes(state.appState)) {
      saveProgress(state);
    }
  }, [state]);

  // Audio toggles
  const handleToggleAudio = () => {
    const nextMuted = sound.toggleMute();
    setAudioMuted(nextMuted);
  };

  const handleToggleScanlines = () => {
    setScanlinesEnabled((prev) => !prev);
  };

  const handleToggleMotion = () => {
    setReducedMotion((prev) => !prev);
  };

  // ─── Flow Navigation Handlers ───────────────────────────────────────────

  const handleStartConsent = () => {
    dispatch({ type: 'START_CONSENT' });
  };

  const handleStartGeneric = () => {
    clearProgress();
    dispatch({ type: 'START_GENERIC' });
    dispatch({ type: 'SETUP_COMPLETE', config: GENERIC_GAME_CONFIG });
  };

  const handleAgreeConsent = () => {
    dispatch({ type: 'PROMPT_READY' });
  };

  const handleCancelConsent = () => {
    dispatch({ type: 'CANCEL_CONSENT' });
  };

  const handleProceedToPaste = (sample?: string) => {
    if (sample) {
      setSampleCapsule(sample);
    }
    dispatch({ type: 'OPEN_CAPSULE_ENTRY' });
  };

  const handleBackToConsent = () => {
    dispatch({ type: 'START_CONSENT' });
  };

  const handleCapsuleSuccess = (config: GameConfig) => {
    clearProgress();
    setSampleCapsule('');
    dispatch({ type: 'SETUP_COMPLETE', config });
  };

  const handleBackToPrompt = () => {
    dispatch({ type: 'PROMPT_READY' });
  };

  const handleRestart = () => {
    clearProgress();
    setSessionToken(generateSessionToken());
    setSampleCapsule('');
    dispatch({ type: 'RESTART' });
  };

  // ─── Screen Renderer ───────────────────────────────────────────────────

  const renderCurrentScreen = () => {
    switch (state.appState) {
      case 'LANDING':
        return (
          <LandingPage
            onStartConsent={handleStartConsent}
            onStartGeneric={handleStartGeneric}
          />
        );

      case 'CONSENT':
        return (
          <ConsentScreen
            onAgree={handleAgreeConsent}
            onStartGeneric={handleStartGeneric}
            onBack={handleCancelConsent}
          />
        );

      case 'PROMPT_READY':
        return (
          <PromptSetup
            sessionToken={sessionToken}
            onProceedToPaste={handleProceedToPaste}
            onStartGeneric={handleStartGeneric}
            onBack={handleBackToConsent}
          />
        );

      case 'CAPSULE_ENTRY':
        return (
          <CapsuleEntry
            sessionToken={sessionToken}
            initialPaste={sampleCapsule}
            onSuccess={handleCapsuleSuccess}
            onStartGeneric={handleStartGeneric}
            onBack={handleBackToPrompt}
          />
        );

      case 'LEVEL_1':
      case 'LEVEL_2':
      case 'LEVEL_3':
      case 'LEVEL_4':
      case 'LEVEL_5':
      case 'ENDING':
        return (
          <GameShell
            state={state}
            dispatch={(action) => {
              if (action.type === 'RESTART') {
                handleRestart();
              } else {
                dispatch(action);
              }
            }}
          />
        );

      default:
        return (
          <LandingPage
            onStartConsent={handleStartConsent}
            onStartGeneric={handleStartGeneric}
          />
        );
    }
  };

  return (
    <div className={`theme-wrapper ${reducedMotion ? 'reduced-motion' : ''}`}>
      {/* CRT Scanline & Atmosphere Layers */}
      {scanlinesEnabled && <div className="crt-overlay crt-scanline-drift" aria-hidden="true" />}
      <div className="crt-vignette" aria-hidden="true" />
      <div className="vhs-tracking-jitter" aria-hidden="true" />

      {/* Main Terminal Frame */}
      <div className="app-container">
        <Header
          appState={state.appState}
          sessionToken={sessionToken}
          scanlinesEnabled={scanlinesEnabled}
          onToggleScanlines={handleToggleScanlines}
          audioMuted={audioMuted}
          onToggleAudio={handleToggleAudio}
          reducedMotion={reducedMotion}
          onToggleMotion={handleToggleMotion}
        />

        {renderCurrentScreen()}
      </div>
    </div>
  );
}
