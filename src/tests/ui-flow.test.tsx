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
  it('allows playing generic mode through all 3 levels to ending', () => {
    render(<App />);

    // Starts at landing
    expect(screen.getByRole('heading', { level: 1, name: /THE CONTEXT/i })).toBeInTheDocument();

    // Click generic mode button
    const genericBtn = screen.getByRole('button', { name: /PLAY WITHOUT PERSONALISATION/i });
    fireEvent.click(genericBtn);

    // Enters Level 1
    expect(screen.getByText(/LEVEL 1 OF 3/i)).toBeInTheDocument();
    expect(screen.getByText(/The drawer is locked/i)).toBeInTheDocument();

    // Submit answer for Level 1 ("3")
    const answerInput1 = screen.getByRole('textbox', { name: /Enter Terminal Decryption/i });
    fireEvent.change(answerInput1, { target: { value: '3' } });
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT ANSWER/i }));

    // Reaches Level 2
    expect(screen.getByText(/LEVEL 2 OF 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Two files. The dates contradict/i)).toBeInTheDocument();

    // Submit answer for Level 2 ("1987")
    const answerInput2 = screen.getByRole('textbox', { name: /Enter Terminal Decryption/i });
    fireEvent.change(answerInput2, { target: { value: '1987' } });
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT ANSWER/i }));

    // Reaches Level 3
    expect(screen.getByText(/LEVEL 3 OF 3/i)).toBeInTheDocument();
    expect(screen.getByText(/The exit requires a code/i)).toBeInTheDocument();

    // Submit answer for Level 3 ("31987")
    const answerInput3 = screen.getByRole('textbox', { name: /Enter Terminal Decryption/i });
    fireEvent.change(answerInput3, { target: { value: '31987' } });
    fireEvent.click(screen.getByRole('button', { name: /SUBMIT ANSWER/i }));

    // Reaches Ending
    expect(screen.getByText(/SESSION TERMINATED/i)).toBeInTheDocument();

    // Restart returns to Landing
    const restartBtn = screen.getByRole('button', { name: /REBOOT SESSION/i });
    fireEvent.click(restartBtn);
    expect(screen.getByRole('button', { name: /ENTER THE ARCHIVE/i })).toBeInTheDocument();
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
    expect(screen.getByText(/LEVEL 1 OF 3/i)).toBeInTheDocument();
  });
});
