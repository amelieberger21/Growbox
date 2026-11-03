import { createPortal } from 'react-dom';
import { fleetCommand, boxContext, offlineSummary } from './fleetCommands';
import { HelpButton } from '../components/HelpButton';
import { tr } from '../i18n';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Square, Send, X, Volume2 } from 'lucide-react';
import { useGrowbox } from '../state/GrowboxProvider';
import { useSpeech } from './Speech';
import { assistantContext, localAnswer } from './assistantModel';
import { currentLocale } from '../i18n';
import { ASSISTANT_LANGUAGES, assistantText, initialAssistantLanguage, isAssistantLanguage, languageInfo, type AssistantCopyKey } from './assistantLanguages';

type Message = { role: 'user' | 'assistant'; content: string };
type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { [n: number]: { [n: number]: { transcript: string } } } }) => void) | null; onerror: ((e: {error: string}) => void) | null; onend: (() => void) | null; start: () => void; abort: () => void };
type VoiceWindow = Window & { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
export function VoiceAssistant({launchTarget=null}:{launchTarget?:HTMLElement|null}={}) {
  const { state, boxes, selectedBox, requestBoxSelection, pendingBoxId } = useGrowbox(); const reader = useSpeech(); const navigate = useNavigate();
  const [open, setOpen] = useState(false); const [configured, setConfigured] = useState(false);
  const [status, setStatus] = useState<AssistantCopyKey>('ready'); const [error, setError] = useState('');
  const [messages, setMessages] = useState<Message[]>([]); const [draft, setDraft] = useState('');
  const [language, setLanguage] = useState(() => initialAssistantLanguage(currentLocale()));
  const [followWebsite,setFollowWebsite] = useState(() => { try { return localStorage.getItem("mycobox.assistant.followWebsite") === "true" || !localStorage.getItem("mycobox.assistant.language"); } catch {return true;} });
  const websiteLocale = currentLocale();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const t = (key: AssistantCopyKey) => assistantText(language, key);
  const greeting = t('greeting');
  useEffect(()=>{if(followWebsite && isAssistantLanguage(websiteLocale) && websiteLocale!==language) changeLanguage(websiteLocale);},[websiteLocale,followWebsite]);
  const voiceAvailable = voices.some(voice => voice.lang.toLowerCase().startsWith(languageInfo(language).code)); const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const active = useRef(false); const generation = useRef(0); const controller = useRef<AbortController | null>(null);
  const recognition = useRef<Recognition | null>(null); const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null); const audioContext = useRef<AudioContext | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const messageList = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null); const panel = useRef<HTMLElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null); const conversation = useRef<Message[]>([]);
  const latest = useRef({ state, configured, language, boxes, selectedBox }); latest.current = { state, configured, language, boxes, selectedBox };
  const actions = useRef({ activate: () => {}, close: () => {}, listen: () => {}, submit: (_text: string) => {} });
  const previousBox = useRef(selectedBox.id);
  useEffect(()=>{
    if(previousBox.current===selectedBox.id)return;
    previousBox.current=selectedBox.id; generation.current++;controller.current?.abort();stopInput();window.speechSynthesis?.cancel();setBusy(false);setStatus('ready');
  },[selectedBox.id]);

  useEffect(() => {
    const abort = new AbortController();
    fetch('/api/assistant/status', { signal: abort.signal }).then(r => r.json()).then(d => setConfigured(d.configured === true)).catch(() => {});
    return () => abort.abort();
  }, []);
  useEffect(() => {
    const synth = window.speechSynthesis;
    const update = () => setVoices(synth?.getVoices?.() ?? []);
    update(); synth?.addEventListener?.('voiceschanged', update);
    return () => synth?.removeEventListener?.('voiceschanged', update);
  }, []);
  function changeLanguage(value: string) {
    if (!isAssistantLanguage(value)) return;
    generation.current++; controller.current?.abort(); stopInput(); window.speechSynthesis?.cancel();
    setBusy(false); setError(''); setStatus('ready'); setLanguage(value);
    latest.current.language = value;
    try { localStorage.setItem('mycobox.assistant.language', value); } catch { /* Session state still works. */ }
  }
  function stopInput() {
    if (timer.current) clearInterval(timer.current); timer.current = null;
    recognition.current?.abort(); recognition.current = null;
    if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); }
    recorder.current = null; stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
    void audioContext.current?.close(); audioContext.current = null;
    setListening(false);
  }
  function close() {
    active.current = false; generation.current++; controller.current?.abort(); stopInput();
    window.speechSynthesis?.cancel(); setOpen(false); setBusy(false);
    (previousFocus.current?.isConnected ? previousFocus.current : trigger.current)?.focus();
  }
  function speak(text: string, lang: string, after?: () => void) {
    window.speechSynthesis?.cancel();
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setError(t('noVoice')); setStatus('ready'); after?.(); return;
    }
    const voice = window.speechSynthesis.getVoices?.().find(v => v.lang.toLowerCase().startsWith(languageInfo(lang).code));
    if (!voice) { setStatus('ready'); after?.(); return; }
    const turn = generation.current; const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = lang; utterance.rate = 1; setStatus('speaking');
    utterance.onend = () => { if (active.current && turn === generation.current) { setStatus('ready'); after?.(); } };
    utterance.onerror = (e) => { if (active.current && turn === generation.current && e.error !== 'canceled' && e.error !== 'interrupted') { setError(t('noVoice')); setStatus('ready'); } };
    window.speechSynthesis.speak(utterance);
  }
  async function request(path: string, body: BodyInit, type: string) {
    controller.current = new AbortController();
    const response = await fetch(`/api/assistant/${path}`, { method: 'POST', headers: { 'Content-Type': type, 'X-Assistant-Language': latest.current.language }, body, signal: controller.current.signal });
    const data = await response.json().catch(() => ({})); if (!response.ok) throw new Error(t(response.status === 503 ? 'notConfigured' : data.code === 'QUOTA' ? 'quota' : data.code === 'KEY_REJECTED' ? 'keyRejected' : 'requestFailed')); return data;
  }
  async function submit(text: string) {
    text = text.trim(); if (!text || !active.current) return;
    const turn = ++generation.current; controller.current?.abort(); stopInput(); window.speechSynthesis?.cancel();
    if (localAnswer(text, latest.current.state, latest.current.language).close) { close(); return; }
    setError(''); setBusy(true); setStatus('thinking'); setDraft('');
    const history = [...conversation.current, { role: 'user' as const, content: text }].slice(-20);
    conversation.current = history; setMessages(history);
    try {
      const localFleet = fleetCommand(text, latest.current.boxes, latest.current.selectedBox);
      const context = {...assistantContext(latest.current.state), ...boxContext(latest.current.selectedBox, latest.current.boxes)};
      if (!latest.current.selectedBox.hasData) Object.assign(context,{reading:null,water:null,devices:null,alerts:[]});
      if (!latest.current.selectedBox.connected) Object.assign(context,{devices:null});
      const answer = localFleet ? {...localFleet,language:latest.current.language,close:false} : latest.current.configured ? await request('chat', JSON.stringify({ messages: history, context, language: latest.current.language }), 'application/json') : localAnswer(text, latest.current.state, latest.current.language);
      if (!active.current || turn !== generation.current) return;
      if ('selectBoxId' in answer && typeof answer.selectBoxId==='string') {const switched=requestBoxSelection(answer.selectBoxId);if(!switched){answer.navigate='';answer.reply=tr('Bitte bestätige den Growbox-Wechsel im Dialog oder brich ihn ab.');}}
      if (!latest.current.selectedBox.connected && !localFleet) answer.reply = offlineSummary(latest.current.selectedBox) + ' ' + answer.reply;
      if (!latest.current.selectedBox.hasData && !localFleet) answer.reply = offlineSummary(latest.current.selectedBox);
      if (answer.navigate && ['/', '/growbox', '/pilze', '/wachstum', '/wachstum/klima', '/einstellungen', '/hilfe', '/projekt'].includes(answer.navigate)) navigate(answer.navigate);
      const updated = [...history, { role: 'assistant' as const, content: answer.reply }]; conversation.current = updated; setMessages(updated);
      setBusy(false);
      speak(answer.reply, latest.current.language, () => answer.close ? close() : actions.current.listen());
    } catch (e) { if (active.current && turn === generation.current) { setBusy(false); setStatus('ready'); const message = e instanceof Error && !(e instanceof TypeError) ? e.message : t('requestFailed'); setError(message); speak(message, latest.current.language); } }
  }
  async function listen() {
    if (!active.current) return;
    generation.current++; stopInput(); window.speechSynthesis?.cancel(); setError(''); setListening(true); setStatus('listening');
    const turn = generation.current;
    if (!latest.current.configured) {
      const API = (window as VoiceWindow).SpeechRecognition ?? (window as VoiceWindow).webkitSpeechRecognition;
      if (!API) { setListening(false); const msg = t('noRecognition'); setError(msg); speak(msg, latest.current.language); return; }
      const r = new API(); recognition.current = r; r.lang = latest.current.language; r.continuous = false; r.interimResults = false;
      r.onresult = e => { if (active.current && turn === generation.current) void actions.current.submit(e.results[0][0].transcript); };
      r.onerror = e => { if (active.current && turn === generation.current && e.error !== 'aborted') { setListening(false); setStatus('ready'); const msg = e.error === 'not-allowed' ? t('micDenied') : e.error === 'language-not-supported' ? t('languageUnsupported') : t('notUnderstood'); setError(msg); speak(msg, latest.current.language); } };
      r.onend = () => { if (recognition.current === r) { recognition.current = null; setListening(false); setStatus('ready'); } };
      try { r.start(); } catch { setListening(false); setError(t('noAudio')); } return;
    }
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) throw new Error(t('noAudio'));
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
      if (!active.current || turn !== generation.current) { media.getTracks().forEach(t => t.stop()); return; }
      stream.current = media; const rec = new MediaRecorder(media); recorder.current = rec; const chunks: Blob[] = [];
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      rec.onstop = async () => {
        if (timer.current) clearInterval(timer.current); timer.current = null;
        media.getTracks().forEach(t => t.stop()); void audioContext.current?.close(); audioContext.current = null; recorder.current = null;
        if (!active.current || turn !== generation.current) return;
        setListening(false); setBusy(true); setStatus('transcribing');
        try {
          const result = await request('transcribe', new Blob(chunks, { type: rec.mimeType }), rec.mimeType);
          if (!active.current || turn !== generation.current) return;
          if (!result.text?.trim()) { setBusy(false); setStatus('ready'); speak(t('notUnderstood'), latest.current.language); return; }
          void actions.current.submit(result.text);
        } catch (e) { if (active.current && turn === generation.current) { setBusy(false); setStatus('ready'); const msg = e instanceof Error && !(e instanceof TypeError) ? e.message : t('requestFailed'); setError(msg); speak(msg, latest.current.language); } }
      };
      rec.start();
      const ctx = new AudioContext(); audioContext.current = ctx; await ctx.resume();
      const analyser = ctx.createAnalyser(); analyser.fftSize = 2048; ctx.createMediaStreamSource(media).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize); const start = Date.now(); let lastVoice = start; let heard = false;
      timer.current = setInterval(() => {
        analyser.getByteTimeDomainData(samples); const rms = Math.sqrt(samples.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / samples.length);
        if (rms > .018) { heard = true; lastVoice = Date.now(); }
        if ((heard && Date.now() - lastVoice > 1500) || Date.now() - start > 25000) {
          if (!heard) { stopInput(); setStatus('ready'); speak(t('noInput'), latest.current.language); }
          else if (rec.state === 'recording') rec.stop();
        }
      }, 100);
    } catch (e) { if (active.current && turn === generation.current) { stopInput(); setStatus('ready'); const msg = e instanceof DOMException && e.name === 'NotAllowedError' ? t('micDenied') : t('noAudio'); setError(msg); speak(msg, latest.current.language); } }
  }
  function activate() {
    if (active.current) { window.speechSynthesis?.cancel(); controller.current?.abort(); generation.current++; setBusy(false); void listen(); return; }
    previousFocus.current = document.activeElement as HTMLElement; reader.stop(); active.current = true; generation.current++;
    conversation.current = [{ role: 'assistant', content: greeting }]; setMessages(conversation.current); setOpen(true); setError('');
    speak(greeting + ' ' + t(latest.current.configured ? 'privacy' : 'localPrivacy'), latest.current.language, () => actions.current.listen());
  }
  actions.current = { activate, close, listen: () => { void listen(); }, submit: text => { void submit(text); } };
  useEffect(() => {
    let last: number | null = null;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && active.current) { e.preventDefault(); actions.current.close(); return; }
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
      const target = e.target as HTMLElement;
      if (target instanceof HTMLElement && target.closest('input, textarea, select, [contenteditable="true"], [role="textbox"]')) { last = null; return; }
      if (e.key.toLowerCase() !== 'f') { last = null; return; }
      const now = Date.now(); if (last !== null && now - last <= 650) { e.preventDefault(); last = null; actions.current.activate(); } else last = now;
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); active.current = false; controller.current?.abort(); recognition.current?.abort(); if (timer.current) clearInterval(timer.current); if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); } stream.current?.getTracks().forEach(t => t.stop()); void audioContext.current?.close(); window.speechSynthesis?.cancel(); };
  }, []);
  useEffect(() => { if (open) panel.current?.focus(); }, [open]);
  useEffect(() => { const list = messageList.current; if (list) list.scrollTop = list.scrollHeight; }, [messages]);
  return <>
    {launchTarget ? createPortal(<button ref={trigger} className="voice-launch" onClick={activate} aria-expanded={open} aria-controls="voice-assistant" aria-keyshortcuts="F F"><Mic size={20} /><span>{t('launch')} <small>{t('shortcut')}</small></span></button>,launchTarget) : <button ref={trigger} className="voice-launch" onClick={activate} aria-expanded={open} aria-controls="voice-assistant" aria-keyshortcuts="F F"><Mic size={20} /><span>{t('launch')} <small>{t('shortcut')}</small></span></button>}
    {open && <section ref={panel} id="voice-assistant" className="voice-assistant" role="region" aria-label={language === 'de-DE' ? "Champ Sprachassistent" : t('title')} lang={language} tabIndex={-1}>
      <header><div><strong>{t('title')}</strong><small>{t(configured ? 'connected' : 'local')}</small></div><button className="icon-button" onClick={close} aria-label={t('close')}><X /></button></header>
      <HelpButton topic="assistant"/>
      <label className="voice-follow"><input type="checkbox" checked={followWebsite} onChange={e=>{setFollowWebsite(e.target.checked);try {localStorage.setItem("mycobox.assistant.followWebsite",String(e.target.checked));if(e.target.checked)localStorage.removeItem("mycobox.assistant.language");}catch{}}}/>{tr("Sprache der Website verwenden")}</label>
      {followWebsite&&!isAssistantLanguage(websiteLocale)&&<p className="voice-capability" role="status">{tr("Für diese Website-Sprache ist der Sprachassistent noch nicht verfügbar. Bitte wähle eine der angebotenen Gesprächssprachen.")}</p>}
      {pendingBoxId&&<p role="status">{tr("Nicht übernommene Änderungen")}: {tr("Bitte bestätige den Growbox-Wechsel im Dialog oder brich ihn ab.")}</p>}
      <label className="voice-language" htmlFor="assistant-language">{t('language')}<select id="assistant-language" value={language} onChange={e => {setFollowWebsite(false);try{localStorage.setItem("mycobox.assistant.followWebsite","false");}catch{}changeLanguage(e.target.value);}}>{ASSISTANT_LANGUAGES.map(item => <option key={item.locale} value={item.locale}>{item.name}</option>)}</select></label>
      {!voiceAvailable && <p className="voice-capability" role="status">{t('noVoice')}</p>}
      <p className="voice-status" role="status">{t(status)}</p>
      <div ref={messageList} className="voice-messages" role="log" aria-label={t('log')} aria-live="off">{messages.map((m, i) => <p key={i} className={m.role} dir="auto"><b>{m.role === 'user' ? t('you') : 'Champ'}</b>{m.content}</p>)}</div>
      {error && <p className="voice-error" role="alert">{error}</p>}
      <div className="voice-actions"><button className="button button-outline" disabled={busy} onClick={() => listening ? recorder.current?.state === 'recording' ? recorder.current.stop() : stopInput() : void listen()}>{listening ? <Square size={16} /> : <Mic size={16} />}{t(listening ? 'finish' : 'listen')}</button><button className="button button-outline" onClick={() => { generation.current++; controller.current?.abort(); stopInput(); window.speechSynthesis?.cancel(); setBusy(false); setStatus('paused'); }}><Square size={16} />{t('pause')}</button><button className="icon-button" disabled={busy} aria-label={t('repeat')} onClick={() => { stopInput(); const last = [...messages].reverse().find(m => m.role === 'assistant'); if (last) speak(last.content, language); }}><Volume2 size={18} /></button></div>
      <form onSubmit={e => { e.preventDefault(); void submit(draft); }}><label htmlFor="voice-question">{t('question')}</label><div><input id="voice-question" value={draft} maxLength={3000} onChange={e => setDraft(e.target.value)} placeholder={t('question')} /><button className="icon-button" disabled={busy || !draft.trim()} aria-label={t('send')}><Send size={19} /></button></div></form>
      <small>{t(configured ? 'privacy' : 'localPrivacy')}</small>
    </section>}
  </>;
}
