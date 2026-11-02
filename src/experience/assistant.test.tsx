import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { initialFleet } from '../state/fleet';
import { createInitialState } from '../simulation/engine';
import { assistantContext, localAnswer } from './assistantModel';
import { VoiceAssistant } from './VoiceAssistant';
const stop = vi.fn();
vi.mock('../state/GrowboxProvider', () => ({ useGrowbox: () => { const state=createInitialState(); const fleet=initialFleet(state); return {state, boxes:fleet.boxes, selectedBox:fleet.boxes[0], requestBoxSelection:vi.fn(), pendingBoxId:null}; } }));
vi.mock('./Speech', () => ({ useSpeech: () => ({ stop }) }));
function Location() { return <output data-testid="location">{useLocation().pathname}</output>; }
function setup() { return render(<MemoryRouter><input aria-label="Andere Eingabe" /><VoiceAssistant /><Location /></MemoryRouter>); }
describe('Sprachassistent', () => {
  beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => ({ configured: false }) })); });
  afterEach(() => { vi.unstubAllGlobals(); });
  it('verwendet die aktuellen Demo-Werte und behauptet keine Diagnose', () => {
    const state = createInitialState(); state.reading.temperature = 25.4; state.water.level = null;
    const answer = localAnswer('Öffne die Growbox und nenne mir die Daten und den Zustand der Pflanze', state);
    expect(answer.navigate).toBe('/growbox'); expect(answer.reply).toContain('25,4'); expect(answer.reply).toContain('Sensor nicht verfügbar'); expect(answer.reply).toContain('nicht sicher beurteilen');
    expect(assistantContext(state).reading).toBe(state.reading);
  });
  it('öffnet bei zwei F, ignoriert gehaltene Tasten und Texteingaben und stellt den Fokus wieder her', async () => {
    setup(); await act(async () => {});
    const button = screen.getByRole('button', { name: /Mit Champ sprechen/ }); button.focus();
    fireEvent.keyDown(window, { key: 'f' }); fireEvent.keyDown(window, { key: 'f', repeat: true });
    expect(screen.queryByRole('region', { name: 'Champ Sprachassistent' })).toBeNull();
    fireEvent.keyDown(screen.getByLabelText('Andere Eingabe'), { key: 'f' }); fireEvent.keyDown(screen.getByLabelText('Andere Eingabe'), { key: 'f' });
    expect(screen.queryByRole('region', { name: 'Champ Sprachassistent' })).toBeNull();
    fireEvent.keyDown(window, { key: 'f' }); fireEvent.keyDown(window, { key: 'f' });
    expect(screen.getByRole('region', { name: 'Champ Sprachassistent' })).toHaveFocus();
    expect(screen.getByText(/Hallo! Ich bin Champ/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' }); expect(button).toHaveFocus();
    expect(screen.queryByRole('region', { name: 'Champ Sprachassistent' })).toBeNull();
  });
  it('navigiert und beantwortet Datenfragen auch ohne API-Schlüssel per Text', async () => {
    setup(); await act(async () => {}); fireEvent.click(screen.getByRole('button', { name: /Mit Champ sprechen/ }));
    fireEvent.change(screen.getByLabelText(/Deine Frage/), { target: { value: 'Öffne die Growbox und nenne die Daten' } });
    fireEvent.click(screen.getByRole('button', { name: 'Frage senden' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/growbox'); expect(screen.getByText(/Alle Angaben sind simuliert/)).toBeInTheDocument();
  });
});

describe('KI-Anbindung', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('sendet Gespräch und aktuelle Daten und antwortet mit der erkannten Sprache', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce({ json: async () => ({ configured: true }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ reply: 'Your growbox is open.', language: 'en-GB', navigate: '/growbox', close: false }) });
    vi.stubGlobal('fetch', fetcher);
    setup(); await act(async () => {});
    fireEvent.click(screen.getByRole('button', { name: /Mit Champ sprechen/ }));
    fireEvent.change(screen.getByLabelText(/Deine Frage/), { target: { value: 'Open my growbox' } });
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Frage senden' })); });
    expect(screen.getByText('Your growbox is open.')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/growbox');
    const body = JSON.parse(fetcher.mock.calls[1][1].body);
    expect(body.context.simulated).toBe(true); expect(body.messages.at(-1).content).toBe('Open my growbox');
  });
  it('führt verspätete KI-Antworten nach Escape nicht aus', async () => {
    let resolve: (value: unknown) => void = () => {};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({ json: async () => ({ configured: true }) }).mockImplementationOnce(() => new Promise(r => { resolve = r; })));
    setup(); await act(async () => {}); fireEvent.click(screen.getByRole('button', { name: /Mit Champ sprechen/ }));
    fireEvent.change(screen.getByLabelText(/Deine Frage/), { target: { value: 'Open my growbox' } });
    fireEvent.click(screen.getByRole('button', { name: 'Frage senden' })); fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => { resolve({ ok: true, json: async () => ({ reply: 'Opened', language: 'en', navigate: '/growbox', close: false }) }); });
    expect(screen.getByTestId('location').textContent).toBe('/');
    expect(screen.queryByRole('region', { name: 'Champ Sprachassistent' })).toBeNull();
  });
});
