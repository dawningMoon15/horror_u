import React from 'react';
import { sound } from '../lib/soundEffects';

interface HeaderProps {
  appState: string;
  sessionToken: string;
  scanlinesEnabled: boolean;
  onToggleScanlines: () => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  reducedMotion: boolean;
  onToggleMotion: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  appState,
  sessionToken,
  scanlinesEnabled,
  onToggleScanlines,
  audioMuted,
  onToggleAudio,
  reducedMotion,
  onToggleMotion,
}) => {
  const shortSession = sessionToken.slice(0, 8);

  const handleAudioClick = () => {
    sound.playKeyClick();
    onToggleAudio();
  };

  const handleScanlineClick = () => {
    sound.playKeyClick();
    onToggleScanlines();
  };

  const handleMotionClick = () => {
    sound.playKeyClick();
    onToggleMotion();
  };

  return (
    <header className="terminal-header" role="banner">
      <div className="brand-section">
        <span className="brand-logo-text" id="app-title">THE CONTEXT</span>
        <span className="brand-version-badge" title="Schema Version 1.0">v1.0</span>
      </div>

      <div className="header-status-group">
        <div className="status-indicator" title={`System status: ${appState}`}>
          <div className="status-dot" aria-hidden="true" />
          <span>STATUS: {appState}</span>
        </div>

        <div
          className="session-chip"
          title={`Correlation Session Token: ${sessionToken}`}
          id="header-session-chip"
        >
          SES: #{shortSession}
        </div>

        <button
          type="button"
          id="btn-toggle-audio"
          className={`icon-btn-toggle ${audioMuted ? '' : 'active'}`}
          onClick={handleAudioClick}
          aria-label={audioMuted ? 'Unmute Audio' : 'Mute Audio'}
          title="Toggle procedural audio atmosphere"
        >
          {audioMuted ? '🔇 MUTED' : '🔊 AUDIO'}
        </button>

        <button
          type="button"
          id="btn-toggle-scanlines"
          className={`icon-btn-toggle ${scanlinesEnabled ? 'active' : ''}`}
          onClick={handleScanlineClick}
          aria-label="Toggle CRT Scanlines"
          title="Toggle retro CRT scanlines"
        >
          CRT: {scanlinesEnabled ? 'ON' : 'OFF'}
        </button>

        <button
          type="button"
          id="btn-toggle-motion"
          className={`icon-btn-toggle ${reducedMotion ? 'active' : ''}`}
          onClick={handleMotionClick}
          aria-label="Toggle Reduced Motion"
          title="Toggle animation intensity"
        >
          MOTION: {reducedMotion ? 'MIN' : 'FULL'}
        </button>
      </div>
    </header>
  );
};
