import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useExperience } from "./ExperienceProvider";
import { localeFor } from "../i18n/languages";
import { useT } from "../i18n";
import { Pause, Play, RotateCcw, Square, Volume2, X } from "lucide-react";

interface SpeechContext {
  supported: boolean;
  status: "idle" | "speaking" | "paused";
  text: string;
  word: [number, number] | null;
  error: string;
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
}
const Context = createContext<SpeechContext | null>(null);
export function SpeechProvider({ children }: { children: ReactNode }) {
  const { experience } = useExperience();
  const preferences = experience.preferences;
  const [status, setStatus] = useState<SpeechContext["status"]>("idle");
  const [text, setText] = useState("");
  const [word, setWord] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");
  const active = useRef<HTMLElement | null>(null);
  const generation = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;
  const stop = () => {
    generation.current++;
    if (supported) window.speechSynthesis?.cancel();
    active.current?.classList.remove("speech-reading");
    active.current = null;
    utteranceRef.current = null;
    setStatus("idle");
    setWord(null);
  };
  useEffect(() => {
    stop();
    setText("");
    setError("");
    return () => {
      generation.current++;
      if (supported) window.speechSynthesis?.cancel();
      active.current?.classList.remove("speech-reading");
    };
  }, [preferences.language, preferences.readerEnabled]); // A changed language never continues in the old voice.
  const start = () => {
    stop();
    setError("");
    if (!supported) {
      setError(
        "Dein Browser unterstützt die Vorlesefunktion nicht. Tastatur und Screenreader bleiben nutzbar.",
      );
      return;
    }
    if (!preferences.readerEnabled) {
      setError("Aktiviere zuerst die Vorlesefunktion in den Einstellungen.");
      return;
    }
    const scope =
      document.querySelector("dialog[open]") ??
      document.querySelector(".tour-popover") ??
      document.querySelector("main");
    const blocks = scope
      ? Array.from(
          scope.querySelectorAll<HTMLElement>(
            "h1,h2,h3,p,dt,dd,label,summary,li",
          ),
        ).filter(
          (el) =>
            el.getClientRects().length > 0 &&
            !(el.tagName === "LI" && el.querySelector("p,li")) &&
            !el.closest('[aria-hidden="true"],.sr-only,.speech-panel') &&
            (el.innerText ?? el.textContent ?? "").trim(),
        )
      : [];
    if (!blocks.length) {
      setError("Auf dieser Seite wurde kein lesbarer Text gefunden.");
      return;
    }
    const snapshots = blocks.map((element) => ({
      element,
      text: (element.innerText ?? element.textContent ?? "").trim(),
    }));
    const token = generation.current;
    const speak = (index: number) => {
      if (generation.current !== token) return;
      if (index >= snapshots.length) {
        active.current?.classList.remove("speech-reading");
        active.current = null;
        setStatus("idle");
        setWord(null);
        return;
      }
      const block = snapshots[index];
      active.current?.classList.remove("speech-reading");
      active.current = block.element;
      block.element.classList.add("speech-reading");
      setText(block.text);
      setWord(null);
      const utterance = new SpeechSynthesisUtterance(block.text);
      utteranceRef.current = utterance;
      utterance.lang =
        localeFor(preferences.language);
      utterance.rate = preferences.speechRate;
      const voices = window.speechSynthesis.getVoices();
      const voice =
        voices.find(
          (v) => v.lang.startsWith(preferences.language) && v.localService,
        ) ?? voices.find((v) => v.lang.startsWith(preferences.language));
      if (voice) utterance.voice = voice;
      else if (voices.length) { setError("Für diese Sprache ist keine passende Stimme verfügbar. Der Text bleibt lesbar."); setStatus("idle"); return; }
      utterance.onstart = () => {
        if (generation.current === token) setStatus("speaking");
      };
      utterance.onboundary = (event) => {
        if (generation.current !== token || event.name !== "word") return;
        const startIndex = event.charIndex;
        const remainder = block.text.slice(startIndex);
        const length =
          event.charLength || remainder.match(/^\S+/u)?.[0].length || 0;
        if (length > 0) setWord([startIndex, startIndex + length]);
      };
      utterance.onend = () => {
        if (generation.current === token) speak(index + 1);
      };
      utterance.onerror = (event) => {
        if (
          generation.current !== token ||
          ["interrupted", "canceled"].includes(event.error)
        )
          return;
        setError(
          "Die Sprachausgabe ist auf diesem Gerät oder für diese Sprache nicht verfügbar. Bitte prüfe die installierten Stimmen.",
        );
        setStatus("idle");
        active.current?.classList.remove("speech-reading");
        setWord(null);
      };
      setStatus("speaking");
      window.speechSynthesis.speak(utterance);
    };
    speak(0);
  };
  const pause = () => {
    if (supported && status === "speaking") {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  };
  const resume = () => {
    if (supported && status === "paused") {
      window.speechSynthesis.resume();
      setStatus("speaking");
    }
  };
  return (
    <Context.Provider
      value={{
        supported,
        status,
        text,
        word,
        error,
        start,
        stop,
        pause,
        resume,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSpeech() {
  const context = useContext(Context);
  if (!context) throw new Error("SpeechProvider fehlt.");
  return context;
}
export function SpeechPanel() {
  const tx = useT();
  const reader = useSpeech();
  const { experience, setPreferences } = useExperience();
  if (!experience.preferences.readerEnabled) return null;
  return (
    <section
      className={`speech-panel ${reader.status !== "idle" ? "is-reading" : ""}`}
      aria-label={tx("Vorlesefunktion")}
      data-no-read
    >
      <div className="speech-toolbar">
        <strong>
          <Volume2 size={17} />
          {tx("Vorlesen")}
        </strong>
        <div>
          <button
            className="icon-button"
            aria-label={tx("Vorlesen starten")}
            disabled={!reader.supported}
            onClick={reader.start}
          >
            <Play size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={tx(
              reader.status === "paused"
                ? "Vorlesen fortsetzen"
                : "Vorlesen pausieren",
            )}
            disabled={reader.status === "idle"}
            onClick={reader.status === "paused" ? reader.resume : reader.pause}
          >
            {reader.status === "paused" ? (
              <Play size={17} />
            ) : (
              <Pause size={17} />
            )}
          </button>
          <button
            className="icon-button"
            aria-label={tx("Vorlesen stoppen")}
            onClick={reader.stop}
          >
            <Square size={16} />
          </button>
          <button
            className="icon-button"
            aria-label={tx("Text erneut vorlesen")}
            disabled={!reader.supported}
            onClick={reader.start}
          >
            <RotateCcw size={16} />
          </button>
          <label className="speech-speed">
            <span className="sr-only">{tx("Vorlesegeschwindigkeit")}</span>
            <select
              value={experience.preferences.speechRate}
              onChange={(event) => {
                reader.stop();
                setPreferences({ speechRate: Number(event.target.value) });
              }}
            >
              {[0.6, 0.8, 1, 1.2, 1.4, 1.6].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}×
                </option>
              ))}
            </select>
          </label>
          <button
            className="icon-button"
            aria-label={tx("Vorlesefunktion deaktivieren")}
            onClick={() => {
              reader.stop();
              setPreferences({ readerEnabled: false });
            }}
          >
            <X size={17} />
          </button>
        </div>
      </div>
      {!reader.supported ? (
        <p role="status">
          {tx(
            "Dein Browser unterstützt die Vorlesefunktion nicht. Tastatur und Screenreader bleiben nutzbar.",
          )}
        </p>
      ) : reader.text ? (
        <>
          <p className="speech-text" aria-live="off">
            {reader.word ? (
              <>
                {reader.text.slice(0, reader.word[0])}
                <mark>{reader.text.slice(...reader.word)}</mark>
                {reader.text.slice(reader.word[1])}
              </>
            ) : (
              reader.text
            )}
          </p>
          <small>
            {tx(
              reader.word
                ? "Wortmarkierung über die Wortgrenzen der Stimme."
                : "Abschnittsmarkierung: Diese Stimme liefert möglicherweise keine zuverlässigen Wortgrenzen.",
            )}
          </small>
        </>
      ) : (
        <p>
          {tx("Starte das Vorlesen. Es beginnt beim aktuellen Seiteninhalt.")}
        </p>
      )}
      {reader.error && (
        <p className="field-error" role="status">
          {tx(reader.error)}
        </p>
      )}
    </section>
  );
}
