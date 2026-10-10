import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Level1Visual } from '../components/visual/Level1Visual';
import { Level2Visual } from '../components/visual/Level2Visual';
import { Level3Visual } from '../components/visual/Level3Visual';
import { Level4Visual } from '../components/visual/Level4Visual';
import { Level5Visual } from '../components/visual/Level5Visual';
import { EndingVisual } from '../components/visual/EndingVisual';
import { INITIAL_STATE } from '../game/gameReducer';

describe('Level1Visual interactive room', () => {
  it('renders sequential hotspots and solves puzzle when rotary dial reaches 3', async () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();
    render(<Level1Visual onSolve={onSolve} unlocked={false} activeStep={3} />);

    // Padlock Hotspot for Step 3
    const padlockSpot = screen.getByRole('button', { name: /Locked Padlock/i });
    expect(padlockSpot).toBeInTheDocument();

    // Click padlock hotspot to inspect lock
    fireEvent.click(padlockSpot);
    expect(screen.getByText(/HEAVY BRASS ROTARY PADLOCK/i)).toBeInTheDocument();

    // Click next dial button 3 times (0 -> 1 -> 2 -> 3)
    const nextBtn = screen.getByRole('button', { name: /NEXT/i });
    fireEvent.click(nextBtn); // 1
    fireEvent.click(nextBtn); // 2
    fireEvent.click(nextBtn); // 3

    // Drawer opens and collectible key tape appears
    expect(screen.getByText(/DRAWER SLID OPEN/i)).toBeInTheDocument();
    const collectBtn = screen.getByRole('button', { name: /CLASSIFIED RECORDS KEY TAPE/i });
    fireEvent.click(collectBtn);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSolve).toHaveBeenCalledWith('3');
    vi.useRealTimers();
  });
});

describe('Level2Visual interactive room', () => {
  it('allows un-redacting dossiers and verifying year 1987', async () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();
    render(<Level2Visual onSolve={onSolve} unlocked={false} activeStep={3} />);

    // Click dossiers hotspot
    fireEvent.click(screen.getByRole('button', { name: /Classified Incident Dossiers/i }));
    expect(screen.getByText(/CONTRADICTORY INCIDENT CASEFILES/i)).toBeInTheDocument();

    // Un-redact both reports
    fireEvent.click(screen.getByText(/REPORT 01: INCIDENT LOG/i));
    fireEvent.click(screen.getByText(/REPORT 02: SERVER RECOVERY/i));

    // Verify year
    const verifyBtn = screen.getByRole('button', { name: /CONFIRM YEAR/i });
    fireEvent.click(verifyBtn);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSolve).toHaveBeenCalledWith('1987');
    vi.useRealTimers();
  });
});

describe('Level3Visual interactive room', () => {
  it('allows entering 31987 on tactile keypad to unlock vault', async () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();
    render(<Level3Visual onSolve={onSolve} unlocked={false} activeStep={3} />);

    // Click keypad hotspot
    fireEvent.click(screen.getByRole('button', { name: /Vault Keypad/i }));
    expect(screen.getByText(/ELECTRONIC VAULT KEYPAD/i)).toBeInTheDocument();

    // Click buttons 3, 1, 9, 8, 7
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '9' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));

    // Press ENTER
    const enterBtn = screen.getByRole('button', { name: /ENT/i });
    fireEvent.click(enterBtn);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSolve).toHaveBeenCalledWith('31987');
    vi.useRealTimers();
  });
});

describe('Level4Visual interactive room', () => {
  it('allows detecting telemetry contradiction in observation chamber', async () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();
    render(<Level4Visual onSolve={onSolve} unlocked={false} activeStep={1} />);

    // Click audio logs hotspot
    fireEvent.click(screen.getByRole('button', { name: /Subject Telemetry Logs/i }));
    expect(screen.getByText(/SUBJECT TELEMETRY LOGS/i)).toBeInTheDocument();

    // Select Observation 3 (contradiction)
    const obs3Btn = screen.getByText(/OBSERVATION 03/i);
    fireEvent.click(obs3Btn);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSolve).toHaveBeenCalledWith('3');
    vi.useRealTimers();
  });
});

describe('Level5Visual interactive 3D room', () => {
  it('allows calibrating voice waveform sequence 3-1-4', async () => {
    vi.useFakeTimers();
    const onSolve = vi.fn();
    render(<Level5Visual onSolve={onSolve} unlocked={false} activeStep={1} />);

    // Click waveform terminal hotspot
    fireEvent.click(screen.getByRole('button', { name: /Signal Waveform Terminal/i }));
    expect(screen.getByText(/CENTRAL VOICE WAVEFORM CALIBRATION/i)).toBeInTheDocument();

    // Enter digits 3, 1, 4
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onSolve).toHaveBeenCalledWith('3-1-4');
    vi.useRealTimers();
  });
});

describe('EndingVisual interactive room', () => {
  it('renders false victory beat and handles ending state', () => {
    const onRestart = vi.fn();
    const endingState = {
      ...INITIAL_STATE,
      appState: 'ENDING' as const,
      endingId: 'INCORRUPTIBLE',
      endingText: 'The machine took control.',
    };

    render(<EndingVisual state={endingState} onRestart={onRestart} />);
    expect(screen.getByText(/CORE ACCESS GRANTED/i)).toBeInTheDocument();
    expect(screen.getByText(/MEMORY SUBSYSTEM: SEVERED/i)).toBeInTheDocument();
  });
});

describe('Multi-screen Laptop Responsiveness', () => {
  it('renders fullscreen responsive stage in CameraViewport for cross-laptop alignment', () => {
    const { container } = render(
      <Level1Visual onSolve={vi.fn()} unlocked={false} activeStep={1} />
    );

    // Responsive stage exists to span the viewport seamlessly
    const stage = container.querySelector('.viewport-responsive-stage');
    expect(stage).toBeInTheDocument();
    expect(stage).toHaveStyle({ width: '100%' });

    // Hotspot is rendered inside the stage
    const hotspot = screen.getByRole('button', { name: /Green Phosphor Terminal Screen/i });
    expect(stage).toContainElement(hotspot);
  });
});

