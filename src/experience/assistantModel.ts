import { assistantText, assistantTerms, languageInfo, type AssistantCopyKey } from './assistantLanguages';
import type { PersistedAppState } from '../types';
import { getEntry, PHASES, species } from '../data/catalog';
import { percent, phaseAt, cultureDay, ALERT_LABELS } from '../simulation/engine';
import { deviceState } from '../simulation/hardware';
export function assistantContext(state: PersistedAppState) {
  const entry = state.cycle ? getEntry(state.cycle.slug) : undefined;
  return { simulated: true, culture: entry?.name ?? null, profile: entry ? species[entry.speciesId] : null,
    status: state.cycle?.status ?? 'Keine Kultur', day: cultureDay(state), progress: Math.round(percent(state)),
    phase: state.cycle ? PHASES[phaseAt(percent(state))].name : null,
    reading: state.reading, settings: state.settings, devices: deviceState(state), water: state.water,
    alerts: state.alerts.map(a => ALERT_LABELS[a]), observation: state.observation, events: state.events.slice(-6) };
}
const openWords = /öffne|oeffne|open|zeig|wechsel|geh|ouvre|ouvrir|montre|abre|abrir|muestra|apri|mostra|toon|otworz|otwórz|pokaz|pokaż|otevri|otevři|zobraz|aç|ac |goster|göster/;
const stopWords = /^(stopp|stop|ende|schließen|beenden|close|goodbye|arrete|arrête|fermer|quitter|parar|detener|cerrar|ferma|chiudi|sluiten|stoppen|zakoncz|zakończ|zamknij|konec|zavrit|zavřít|dur|kapat|bitir)[.! ]*$/;
export function localAnswer(text: string, state: PersistedAppState, locale = 'de-DE') {
  const q = text.toLowerCase(); const data = assistantContext(state);
  const { code } = languageInfo(locale); const words = assistantTerms[code];
  const t = (key: AssistantCopyKey) => assistantText(locale, key);
  const n = (value: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
  let navigate = '';
  const settingsRequest = /(?:stell|set |regle|règle|ajust|imposta|ustaw|nastav|ayarla)/.test(q);
  if (openWords.test(q) || settingsRequest) {
    if (/growbox|grow box|kweekkast|yetistirme|yetiştirme|culture|cultivo/.test(q) || settingsRequest) navigate = '/growbox';
    else if (/klima|climat|clima|iklim/.test(q)) navigate = '/wachstum/klima';
    else if (/wachstum|growth|croissance|crecimiento|crescita|groei|wzrost|růst|rust|büyüme|buyume/.test(q)) navigate = '/wachstum';
    else if (/bibliothek|library|pilze|biblioth|bibliot|catalog|katalog|kütüphane|kutuphane|knihovn/.test(q)) navigate = '/pilze';
    else if (/einstellung|settings|paramètre|parametre|ajustes|impostaz|instelling|ustawieni|nastavení|nastaveni|ayar/.test(q)) navigate = '/einstellungen';
    else if (/dashboard|startseite|accueil|inicio|home|pulpit|přehled|prehled|ana sayfa/.test(q)) navigate = '/';
    else if (/hilfe|help|aide|ayuda|aiuto|hulp|pomoc|yardım|yardim/.test(q)) navigate = '/hilfe';
  }
  const requestedData = /daten|zustand|pflanze|pilz|temperatuur|température|temperatur|feucht|co2|co₂|tank|status|data|condition|humidity|donn|état|etat|champignon|humidité|humidite|datos|estado|hongo|humedad|dati|stato|fungo|umidit|gegevens|toestand|vocht|dane|stan|grzyb|wilgot|teplota|údaj|udaj|vlhk|stav|veri|durum|mantar|sıcak|sicak|nem/.test(q);
  const phase = words[14 + phaseAt(percent(state))];
  const status = state.cycle ? words[19 + ['Bereit','Läuft','Pausiert','Beendet','Abgeschlossen'].indexOf(state.cycle.status)] : '';
  const culture = code === 'de' ? data.culture : data.profile?.scientificName;
  const summary = `${words[0]}. ${state.cycle ? `${words[1]}: ${culture}. ${words[2]}: ${status}. ${words[3]} ${n(data.day)}. ${words[4]} ${n(data.progress)} ${words[9]}. ${words[5]}: ${phase}.` : t('noCulture')} ${words[6]} ${n(data.reading.temperature, 1)} ${words[7]}. ${words[8]} ${n(data.reading.humidity)} ${words[9]}. ${words[10]} ${n(data.reading.co2)} ppm. ${words[11]}: ${state.water.level === null ? t('unknown') : `${n(state.water.level)} ${words[9]}`}. ${state.alerts.length ? `${words[12]}: ${state.alerts.map(a => words[a === 'temperature' ? 6 : a === 'humidity' ? 8 : 10]).join(', ')}.` : t('noAlerts')} ${state.observation ? `${words[13]}.` : ''} ${t('diagnosis')}`;
  return { reply: settingsRequest ? t('settingsHelp') : `${navigate ? t('opened') + ' ' : ''}${requestedData ? summary : navigate ? '' : t('localHelp')}`, language: locale, navigate, close: stopWords.test(q) };
}
