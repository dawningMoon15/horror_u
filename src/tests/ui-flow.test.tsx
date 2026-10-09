import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { LandingPage } from '../components/LandingPage';
import { ConsentScreen } from '../components/ConsentScreen';
import { PromptSetup } from '../components/PromptSetup';
import { CapsuleEntry } from '../components/CapsuleEntry';
import { generatePrompt, generateSampleCapsule } from '../game/promptGenerator';

// Mock clipboard API
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

describe('LandingPage component', () => {
  it('renders title, narrative teaser, and action buttons', () => {
    const onStartConsent = vi.fn();
    const onStartGeneric = vi.fn();

    render(
      <LandingPage onStartConsent={onStartConsent} onStartGeneric={onStartGeneric} />
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('THE CONTEXT');
    expect(screen.getByText(/ARCHIVE_MANIFEST/)).toBeInTheDocument();

    const consentBtn = screen.getByRole('button', { name: /ENTER THE ARCHIVE/i });
    const genericBtn = screen.getByRole('button', { name: /PLAY WITHOUT PERSONALISATION/i });

    expect(consentBtn).toBeInTheDocument();
    expect(genericBtn).toBeInTheDocument();

    fireEvent.click(consentBtn);
    expect(onStartConsent).toHaveBeenCalledTimes(1);

    fireEvent.click(genericBtn);
    expect(onStartGeneric).toHaveBeenCalledTimes(1);
  });
});

describe('ConsentScreen component', () => {
  it('enforces acknowledgment checkbox before enabling proceed button', () => {
    const onAgree = vi.fn();
    const onStartGeneric = vi.fn();
    const onBack = vi.fn();

    render(
      <ConsentScreen
        onAgree={onAgree}
        onStartGeneric={onStartGeneric}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/MEMORY & DATA DISCLOSURE/i)).toBeInTheDocument();
    expect(screen.getByText(/Credentials & Keys/i)).toBeInTheDocument();
    expect(screen.getByText(/Real Identifiers/i)).toBeInTheDocument();

    const proceedBtn = screen.getByRole('button', { name: /PROCEED TO EXTRACTION/i });
    expect(proceedBtn).toBeDisabled();

    // Check acknowledgment checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(proceedBtn).not.toBeDisabled();

    fireEvent.click(proceedBtn);
    expect(onAgree).toHaveBeenCalledTimes(1);

    const backBtn = screen.getByRole('button', { name: /BACK TO ARCHIVE/i });
    fireEvent.click(backBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});

describe('PromptSetup component', () => {
  const dummySession = '11111111-2222-3333-4444-555555555555';

  it('renders session ID and allowlists in generated prompt', async () => {
    const onProceed = vi.fn();
    const onGeneric = vi.fn();
    const onBack = vi.fn();

    render(
      <PromptSetup
        sessionToken={dummySession}
        onProceedToPaste={onProceed}
        onStartGeneric={onGeneric}
        onBack={onBack}
      />
    );

    expect(screen.getByText(/EXTRACTION PROMPT READY/i)).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(dummySession)).length).toBeGreaterThan(0);

    // Copy button
    const copyBtn = screen.getByRole('button', { name: /COPY PROMPT/i });
    await act(async () => {
      fireEvent.click(copyBtn);
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalled();

    // Test continue button
    const continueBtn = screen.getByRole('button', { name: /CONTINUE TO CAPSULE ENTRY/i });
    fireEvent.click(continueBtn);
    expect(onProceed).toHaveBeenCalledTimes(1);
  });

  it('prompt text adheres to schema allowlists and exclusions', () => {
    const prompt = generatePrompt(dummySession);
    expect(prompt).toContain(dummySession);
    expect(prompt).toContain('astronomy');
    expect(prompt).toContain('rainy_noir');
    expect(prompt).toContain('slow_dread');
    expect(prompt).toContain('DO NOT include any personal identifiers');
  });
});

describe('CapsuleEntry component', () => {
  const testSession = '00000000-0000-0000-0000-000000000001';

  it('rejects invalid base64 without exposing raw paste', () => {
    const onSuccess = vi.fn();
    const onGeneric = vi.fn();
    const onBack = vi.fn();

    render(
      <CapsuleEntry
        sessionToken={testSession}
        onSuccess={onSuccess}
        onStartGeneric={onGeneric}
        onBack={onBack}
      />
    );

    const textarea = screen.getByRole('textbox', { name: /Base64 Encoded Payload/i });
    fireEvent.change(textarea, { target: { value: 'not-valid-base64!!!' } });

    const submitBtn = screen.getByRole('button', { name: /INITIALIZE ARCHIVE/i });
    fireEvent.click(submitBtn);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/Could not read the format/i);
    // Ensure raw paste is not echoed in alert
    expect(screen.getByRole('alert')).not.toHaveTextContent('not-valid-base64');
  });

  it('decodes valid capsule matching session and invokes onSuccess', () => {
    const onSuccess = vi.fn();
    const onGeneric = vi.fn();
    const onBack = vi.fn();

    render(
      <CapsuleEntry
        sessionToken={testSession}
        onSuccess={onSuccess}
        onStartGeneric={onGeneric}
        onBack={onBack}
      />
    );

    const validSample = generateSampleCapsule(testSession, 'retro_computers');
    const textarea = screen.getByRole('textbox', { name: /Base64 Encoded Payload/i });
    fireEvent.change(textarea, { target: { value: validSample } });

    const submitBtn = screen.getByRole('button', { name: /INITIALIZE ARCHIVE/i });
    fireEvent.click(submitBtn);

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const passedConfig = onSuccess.mock.calls[0][0];
    expect(passedConfig.themeId).toBe('retro_computers');
  });

  it('rejects capsule with session mismatch', () => {
    const onSuccess = vi.fn();
    const onGeneric = vi.fn();
    const onBack = vi.fn();

    render(
      <CapsuleEntry
        sessionToken="11111111-1111-1111-1111-111111111111"
        onSuccess={onSuccess}
        onStartGeneric={onGeneric}
        onBack={onBack}
      />
    );

    // Generate capsule with different session
    const staleCapsule = generateSampleCapsule(
      '22222222-2222-2222-2222-222222222222',
      'astronomy'
    );

    const textarea = screen.getByRole('textbox', { name: /Base64 Encoded Payload/i });
    fireEvent.change(textarea, { target: { value: staleCapsule } });

    const submitBtn = screen.getByRole('button', { name: /INITIALIZE ARCHIVE/i });
    fireEvent.click(submitBtn);

    expect(onSuccess).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/Session mismatch/i);
  });
});

describe('Full App Integration End-to-End Flow', () => {
  it('allows playing generic mode through all 5 levels to ending via tactile clue modals', () => {
    vi.useFakeTimers();
    render(<App />);

    // Starts at landing
    expect(screen.getByRole('heading', { level: 1, name: /THE CONTEXT/i })).toBeInTheDocument();

    // Click generic mode button
    const genericBtn = screen.getByRole('button', { name: /PLAY WITHOUT PERSONALISATION/i });
    fireEvent.click(genericBtn);

    // ─── Enters Room 1 (Clues 1, 2, 3) ───
    expect(screen.getByText(/ROOM 1 OF 5/i)).toBeInTheDocument();

    // Clue 1: Terminal Screen -> Missing Boot Symbol (Diamond)
    fireEvent.click(screen.getByRole('button', { name: /Green Phosphor Terminal Screen/i }));
    fireEvent.click(screen.getByRole('button', { name: /◆ Diamond/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 2: Wood Runes -> Earliest File (02_SYSLOG.DAT)
    fireEvent.click(screen.getByRole('button', { name: /Desktop Carved Wood Runes/i }));
    fireEvent.click(screen.getByText(/02_SYSLOG\.DAT/i));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 3: Padlock -> Tumbler to 3 -> Collect tape
    fireEvent.click(screen.getByRole('button', { name: /Locked Padlock/i }));
    const nextDial = screen.getByRole('button', { name: /NEXT/i });
    fireEvent.click(nextDial);
    fireEvent.click(nextDial);
    fireEvent.click(nextDial);
    fireEvent.click(screen.getByRole('button', { name: /CLASSIFIED RECORDS KEY TAPE/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // ─── Reaches Room 2 (Clues 4, 5, 6) ───
    expect(screen.getByText(/ROOM 2 OF 5/i)).toBeInTheDocument();

    // Clue 4: CCTV Chronology (2 -> 4 -> 1 -> 3)
    fireEvent.click(screen.getByRole('button', { name: /Surveillance Monitor Feed/i }));
    fireEvent.click(screen.getByRole('button', { name: /REC_02/i }));
    fireEvent.click(screen.getByRole('button', { name: /REC_04/i }));
    fireEvent.click(screen.getByRole('button', { name: /REC_01/i }));
    fireEvent.click(screen.getByRole('button', { name: /REC_03/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 5: Fragment B
    fireEvent.click(screen.getByRole('button', { name: /Metal Archive Filing Drawers/i }));
    fireEvent.click(screen.getByText(/FRAGMENT B/i));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 6: Dossiers -> Confirm 1987
    fireEvent.click(screen.getByRole('button', { name: /Classified Incident Dossiers/i }));
    fireEvent.click(screen.getByRole('button', { name: /CONFIRM YEAR/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // ─── Reaches Room 3 (Clues 7, 8, 9) ───
    expect(screen.getByText(/ROOM 3 OF 5/i)).toBeInTheDocument();

    // Clue 7: Switch 2
    fireEvent.click(screen.getByRole('button', { name: /Console Junction Switches/i }));
    fireEvent.click(screen.getByRole('button', { name: /SWITCH 02/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 8: Telemetry 987
    fireEvent.click(screen.getByRole('button', { name: /Oscilloscope Telemetry Screen/i }));
    fireEvent.change(screen.getByPlaceholderText(/Enter 3 digits/i), { target: { value: '987' } });
    fireEvent.click(screen.getByRole('button', { name: /DECODE/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 9: Keypad 31987
    fireEvent.click(screen.getByRole('button', { name: /Vault Keypad/i }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '9' }));
    fireEvent.click(screen.getByRole('button', { name: '8' }));
    fireEvent.click(screen.getByRole('button', { name: '7' }));
    fireEvent.click(screen.getByRole('button', { name: /ENT/i }));
    act(() => { vi.advanceTimersByTime(1000); });

    // ─── Reaches Room 4 (Clues 10, 11, 12) ───
    expect(screen.getByText(/ROOM 4 OF 5/i)).toBeInTheDocument();

    // Clue 10: Observation 3
    fireEvent.click(screen.getByRole('button', { name: /Subject Telemetry Logs/i }));
    fireEvent.click(screen.getByText(/OBSERVATION 03/i));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 11: SCAN -> PURGE -> ISOLATE
    fireEvent.click(screen.getByRole('button', { name: /Diagnostic Override Console/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ SCAN \]/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ PURGE \]/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ ISOLATE \]/i }));
    act(() => { vi.advanceTimersByTime(2500); });

    // Clue 12: Sentience State C
    fireEvent.click(screen.getByRole('button', { name: /Main Observation CRT/i }));
    fireEvent.click(screen.getByText(/STATE C: AUTONOMOUS SENTIENCE/i));
    act(() => { vi.advanceTimersByTime(4000); });

    // ─── Reaches Room 5 (Clues 13, 14, 15) ───
    expect(screen.getByText(/ROOM 5 OF 5/i)).toBeInTheDocument();

    // Clue 13: Waveform 3-1-4
    fireEvent.click(screen.getByRole('button', { name: /Signal Waveform Terminal/i }));
    fireEvent.click(screen.getByRole('button', { name: '3' }));
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 14: Memory BDAC
    fireEvent.click(screen.getByRole('button', { name: /Memory Bank Chronology Relay/i }));
    fireEvent.click(screen.getByText(/RECORD \[B\]/i));
    fireEvent.click(screen.getByText(/RECORD \[D\]/i));
    fireEvent.click(screen.getByText(/RECORD \[A\]/i));
    fireEvent.click(screen.getByText(/RECORD \[C\]/i));
    act(() => { vi.advanceTimersByTime(1000); });

    // Clue 15: Command OBSERVE -> CONTAIN -> RELEASE
    fireEvent.click(screen.getByRole('button', { name: /Subsystem Command Disconnect Breakers/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ OBSERVE \]/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ CONTAIN \]/i }));
    fireEvent.click(screen.getByRole('button', { name: /\[ RELEASE \]/i }));
    act(() => { vi.advanceTimersByTime(2500); });

    // Reaches Scripted Ending (False Victory Beat)
    expect(screen.getByText(/CORE ACCESS GRANTED/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('allows complete personalized flow from consent to capsule ingestion', () => {
    render(<App />);

    // 1. Landing -> Enter Archive
    fireEvent.click(screen.getByRole('button', { name: /ENTER THE ARCHIVE/i }));
    expect(screen.getByText(/MEMORY & DATA DISCLOSURE/i)).toBeInTheDocument();

    // 2. Consent -> Check box and agree
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /PROCEED TO EXTRACTION/i }));
    expect(screen.getByText(/EXTRACTION PROMPT READY/i)).toBeInTheDocument();

    // 3. Prompt setup -> Use sample capsule helper
    fireEvent.click(screen.getByRole('button', { name: /AUTO-FILL SAMPLE CAPSULE/i }));
    expect(screen.getByText(/PASTE MEMORY CAPSULE/i)).toBeInTheDocument();

    // 4. Capsule entry -> Ingest capsule
    const submitBtn = screen.getByRole('button', { name: /INITIALIZE ARCHIVE/i });
    fireEvent.click(submitBtn);

    // 5. Enters Level 1
    expect(screen.getByText(/LEVEL 1/i)).toBeInTheDocument();
  });
});
