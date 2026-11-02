import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { ASSISTANT_LANGUAGES, assistantCopyComplete, assistantText, initialAssistantLanguage } from './assistantLanguages';
import { localAnswer } from './assistantModel';
import { initialFleet } from '../state/fleet';
import { createInitialState } from '../simulation/engine';
import { VoiceAssistant } from './VoiceAssistant';
vi.mock('../state/GrowboxProvider', () => ({ useGrowbox: () => { const state=createInitialState(); const fleet=initialFleet(state); return {state, boxes:fleet.boxes, selectedBox:fleet.boxes[0], requestBoxSelection:vi.fn(), pendingBoxId:null}; } }));
vi.mock('./Speech', () => ({ useSpeech: () => ({ stop: vi.fn() }) }));
const commands = ['Öffne die Growbox und nenne die Daten','Open the growbox and tell me the data','Ouvre la growbox et donne-moi les données','Abre la growbox y dime los datos','Apri la growbox e dimmi i dati','Open de growbox en noem de gegevens','Otwórz growbox i podaj dane','Otevři growbox a řekni mi údaje','Growbox aç ve verileri söyle'];
class Utterance { lang = ''; voice = null; onend = null; onerror = null; constructor(public text: string) {} }
class Recognition {
  static latest: Recognition; lang = ''; continuous = false; interimResults = false;
  onresult: ((event: {results: {transcript:string}[][]}) => void) | null = null;
  onerror: ((event:{error:string}) => void) | null = null;
  onend: (() => void) | null = null;
  constructor() { Recognition.latest = this; }
  start = vi.fn(); abort = vi.fn();
}
function Location() { return <output data-testid="location">{useLocation().pathname}</output>; }
function setup() { return render(<MemoryRouter><VoiceAssistant /><Location /></MemoryRouter>); }
let speak = vi.fn();
beforeEach(() => {
  localStorage.clear(); speak = vi.fn();
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({json:async()=>({configured:false})}));
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  vi.stubGlobal('SpeechRecognition', Recognition);
  vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak, getVoices: () => ASSISTANT_LANGUAGES.map(l => ({lang:l.locale})), addEventListener:vi.fn(), removeEventListener:vi.fn() });
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
describe('Neun Assistentensprachen', () => {
  it('enthält sämtliche Rückmeldungen in allen neun Sprachen und toleriert ungültigen Speicher', () => {
    expect(assistantCopyComplete()).toBe(true); localStorage.setItem('mycobox.assistant.language','unknown'); expect(initialAssistantLanguage('de-DE')).toBe('de-DE');
  });
  it.each(ASSISTANT_LANGUAGES.map((l,i)=>({...l,command:commands[i]})))('$name: bindet Erkennung, Befehl, Ausgabe und Mikrofonfehler an die Auswahl', async ({locale,command}) => {
    localStorage.setItem('mycobox.assistant.language',locale);
    setup(); await act(async()=>{});
    fireEvent.click(screen.getByRole('button',{name:new RegExp(assistantText(locale,'launch'))}));
    expect(speak.mock.calls[0][0].lang).toBe(locale);
    fireEvent.click(screen.getByRole('button',{name:assistantText(locale,'listen')}));
    expect(Recognition.latest.lang).toBe(locale);
    act(()=>Recognition.latest.onresult?.({results:[[{transcript:command}]]}));
    expect(screen.getByTestId('location')).toHaveTextContent('/growbox');
    expect(speak.mock.calls.at(-1)?.[0].lang).toBe(locale);
    expect(screen.getByText(new RegExp(assistantText(locale,'diagnosis').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')))).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button',{name:assistantText(locale,'listen')}));
    act(()=>Recognition.latest.onerror?.({error:'not-allowed'}));
    expect(screen.getByRole('alert')).toHaveTextContent(assistantText(locale,'micDenied'));
    act(()=>Recognition.latest.onerror?.({error:'language-not-supported'}));
    expect(screen.getByRole('alert')).toHaveTextContent(assistantText(locale,'languageUnsupported'));
  });
  it('wechselt während der Aufnahme die Sprache, stoppt alte Erkennung und erhält den Gesprächsverlauf', async () => {
    setup(); await act(async()=>{}); fireEvent.click(screen.getByRole('button',{name:/Mit Champ sprechen/}));
    fireEvent.click(screen.getByRole('button',{name:'Zuhören'})); const old = Recognition.latest;
    fireEvent.change(screen.getByLabelText('Sprache des Assistenten'),{target:{value:'fr-FR'}});
    expect(old.abort).toHaveBeenCalled(); expect(localStorage.getItem('mycobox.assistant.language')).toBe('fr-FR');
    expect(screen.getByText(/Hallo! Ich bin Champ/)).toBeInTheDocument();
    act(()=>old.onresult?.({results:[[{transcript:'Öffne die Growbox'}]]})); expect(screen.getByTestId('location').textContent).toBe('/');
    fireEvent.click(screen.getByRole('button',{name:'Écouter'})); expect(Recognition.latest.lang).toBe('fr-FR');
  });
  it('meldet eine fehlende Gerätestimme und nutzt keine Stimme einer anderen Sprache', async () => {
    vi.stubGlobal('speechSynthesis',{cancel:vi.fn(),speak,getVoices:()=>[{lang:'de-DE'}]});
    localStorage.setItem('mycobox.assistant.language','cs-CZ'); setup(); await act(async()=>{});
    fireEvent.click(screen.getByRole('button',{name:'Mluvit s Champem Stiskněte dvakrát F'}));
    expect(screen.getByText(assistantText('cs-CZ','noVoice'))).toBeInTheDocument(); expect(speak).not.toHaveBeenCalled();
  });
  it.each(ASSISTANT_LANGUAGES)('$name: formatiert Temperatur und Einheiten und verändert keine Einstellungen', ({locale,code}) => {
    const state=createInitialState(); state.reading.temperature=23.5; const before=JSON.stringify(state.settings);
    const reply=localAnswer('data temperature 23,5',state,locale);
    expect(reply.reply).toContain(new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(23.5));
    expect(reply.language).toBe(locale); expect(JSON.stringify(state.settings)).toBe(before);
    expect(reply.reply).toContain(code==='de'?'Grad Celsius':code==='fr'?'degrés Celsius':code==='es'?'grados Celsius':code==='it'?'gradi Celsius':code==='nl'?'graden Celsius':code==='pl'?'stopni Celsjusza':code==='cs'?'stupňů Celsia':code==='tr'?'derece Celsius':'degrees Celsius');
  });
});
