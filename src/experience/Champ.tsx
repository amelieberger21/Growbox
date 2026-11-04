import { useEffect, useRef, useState, useId } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Volume2, X } from "lucide-react";
import { Modal } from "../components/ui";
import { useExperience } from "./ExperienceProvider";
import { useT } from "../i18n";
import { useGrowbox } from "../state/GrowboxProvider";

// Original vector mascot, distinct from the species photographs.
export function ChampArt({ small = false }: { small?: boolean }) {
  const tx = useT();
  return (
    <svg
      className={`champ-art ${small ? "small" : ""}`}
      viewBox="0 0 160 170"
      role="img"
      aria-label={tx(
        "Champ, ein freundlicher Pilz mit Gesicht und winkenden Armen",
      )}
    >
      <ellipse cx="80" cy="154" rx="45" ry="7" fill="#6e845422" />
      <path
        d="M57 102Q33 108 26 91M107 104Q136 107 139 75"
        stroke="#b89a69"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M62 144l-8 10m44-10l9 10"
        stroke="#806f4e"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d="M58 72Q57 106 53 136Q79 158 109 137Q99 103 102 72"
        fill="#f1dfb6"
        stroke="#cbb38a"
        strokeWidth="2"
      />
      <path d="M18 79C20 7 140 5 145 79Q82 113 18 79Z" fill="#a76549" />
      <path d="M21 76Q75 95 141 76Q90 116 21 76" fill="#e4c99d" />
      <path
        d="M33 56Q47 25 78 25"
        fill="none"
        stroke="#ddaa83"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <ellipse
        cx="59"
        cy="53"
        rx="10"
        ry="6"
        fill="#e7bca0"
        transform="rotate(-20 59 53)"
      />
      <ellipse cx="104" cy="42" rx="12" ry="8" fill="#e7bca0" />
      <circle cx="66" cy="115" r="3.5" fill="#3f4935" />
      <circle cx="94" cy="115" r="3.5" fill="#3f4935" />
      <path
        d="M73 127q8 8 15 0"
        fill="none"
        stroke="#725338"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      <ellipse cx="58" cy="123" rx="6" ry="3" fill="#d8997b66" />
      <ellipse cx="102" cy="123" rx="6" ry="3" fill="#d8997b66" />
      <path
        d="M135 76l-3-10m6 9l2-10m-3 10l9-6"
        fill="none"
        stroke="#b89a69"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
export const TOUR_STEPS = [
  {
    route: "/",
    selector: ".culture-hero",
    title: "Dein Dashboard",
    body: "Hier siehst du deine aktive Kultur, ihren Fortschritt und die simulierten Messwerte auf einen Blick.",
  },
  {
    route: "/pilze",
    selector: ".search-field",
    title: "Finde deinen Pilz",
    body: "Suche nach einem Namen und kombiniere Suche und Schwierigkeitsfilter. Alle 15 Einträge haben eine eigene Detailseite.",
  },
  {
    route: "/pilze/austernseitling",
    selector: ".conditions-panel",
    title: "Die Bedingungen verstehen",
    body: "Hier findest du phasenabhängige Kulturbedingungen. Vorläufige Daten und geprüfte Studienwerte sind gekennzeichnet.",
  },
  {
    route: "/pilze/austernseitling",
    selector: ".detail-intro > .button",
    title: "Eine Kultur vorbereiten",
    body: "Diese Aktion öffnet eine Vorschau. Erst deine Bestätigung ersetzt die laufende Kultur. Im Tutorial wird nichts automatisch ersetzt.",
  },
  {
    route: "/growbox",
    selector: ".mode-row",
    title: "Deine Growbox steuern",
    body: "Wähle Automatik oder Manuell. Änderungen wirken erst mit „Einstellungen übernehmen“. Licht und Belüftung sind nur im manuellen Modus schaltbar.",
  },
  {
    route: "/growbox",
    selector: ".sensor-grid",
    title: "Vier Zustände, klar erklärt",
    body: "Grün: im vorgesehenen Bereich. Gelb: leichte Abweichung. Rot: starke Abweichung. Grau: Datenprüfung erforderlich. Die Farben sagen nichts über die Genießbarkeit aus.",
  },
  {
    route: "/growbox",
    selector: ".notification-trigger",
    title: "Hinweise an einem Ort",
    body: "Die Glocke öffnet dein Benachrichtigungscenter. Wasser nachfüllen und Wasser wechseln sind zwei verschiedene Erinnerungen.",
  },
  {
    route: "/wachstum",
    selector: ".phase-timeline",
    title: "Wachstum nachvollziehen",
    body: "Klicke eine Phase an, um mehr zu lesen. Das verändert die Kultur nicht. Mit den Demo-Aktionen kannst du Zeit vorspulen.",
  },
  {
    route: "/einstellungen",
    selector: ".language-setting",
    title: "So passt MycoBox zu dir",
    body: "Wähle Deutsch, Englisch oder Persisch. Hier stellst du auch Schriftgröße, Kontrast, einfache Sprache und die Vorlesefunktion ein.",
  },
] as const;
// Kept outside persistence: an interrupted tour never resumes without a request.
let requestTour: (() => void) | undefined;
export const requestChampTour = () => requestTour?.();
export function ChampGuide() {
  const tx = useT();
  const { experience, setPreferences, welcome } = useExperience();
  const { notify } = useGrowbox();
  const navigate = useNavigate();
  const location = useLocation();
  const [startupOffer,setStartupOffer]=useState(()=>{try{return experience.preferences.welcomeAnswered&&!sessionStorage.getItem('mycobox.tutorial.offered');}catch{return experience.preferences.welcomeAnswered;}});
  useEffect(()=>{try{sessionStorage.setItem('mycobox.tutorial.offered','true');}catch{/* In-memory offer remains usable. */}},[]);
  const [step, setStep] = useState<number | null>(null);
  const [welcomeStep, setWelcomeStep] = useState<"tour" | "audio">("tour");
  const [wantsTour, setWantsTour] = useState(false);
  const [position, setPosition] = useState({ top: 120, left: 20 });
  const popover = useRef<HTMLElement>(null);
  const markerId=useId().replace(/:/g,'');
  const [arrow,setArrow]=useState<{x1:number;y1:number;x2:number;y2:number}|null>(null);
  const finish = () => {
    setStep(null);
    notify(
      tx(
        "Tutorial abgeschlossen. Du kannst Champ jederzeit unter Hilfe wieder öffnen.",
      ),
    );
  };
  useEffect(() => {
    requestTour = () => {
      setStartupOffer(false);
      setStep(0);
      setPreferences({ champReminder: false, welcomeAnswered: true });
    };
    return () => {
      requestTour = undefined;
    };
  }, []);
  useEffect(() => {
    if (step !== null) {
      navigate(TOUR_STEPS[step].route);
    }
  }, [step]);
  useEffect(() => {
    if (step === null) return;
    let highlighted: Element | null = null;
    let stopped = false;
    const update = () => {
      if (stopped) return;
      const target = document.querySelector(TOUR_STEPS[step].selector);
      if (target !== highlighted) {
        highlighted?.classList.remove("tour-highlight");
        highlighted = target;
        target?.classList.add("tour-highlight");
      }
      if (!target) {
        setArrow(null);
        setPosition({
          top: Math.max(80, window.innerHeight - 300),
          left: Math.max(12, (window.innerWidth - 350) / 2),
        });
        return;
      }
      const rect = target.getBoundingClientRect();
      const height = popover.current?.offsetHeight ?? 250;
      const width = Math.min(popover.current?.offsetWidth ?? 350, window.innerWidth - 24);
      const left = Math.max(
        12,
        Math.min(window.innerWidth - width - 12, rect.left),
      );
      const top =
        rect.bottom + 12 + height < window.innerHeight - 20
          ? rect.bottom + 12
          : rect.top - height - 12 > 75
            ? rect.top - height - 12
            : Math.max(82, window.innerHeight - height - 60);
      setPosition({ top:Math.max(12,top), left });
      const panel=popover.current?.getBoundingClientRect();
      if(panel&&rect.width&&rect.height&&(rect.bottom<panel.top||rect.top>panel.bottom)){
        const x=Math.max(rect.left+8,Math.min(rect.right-8,panel.left+panel.width/2));
        setArrow({x1:Math.max(panel.left+16,Math.min(panel.right-16,x)),y1:rect.bottom<panel.top?panel.top:panel.bottom,x2:x,y2:rect.bottom<panel.top?rect.bottom:rect.top});
      }else setArrow(null);
    };
    const frame = requestAnimationFrame(() => {
      document.querySelector(TOUR_STEPS[step].selector)?.scrollIntoView({
        block: "center",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      update();
    });
    const timer = setInterval(update, 250);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
      clearInterval(timer);
      highlighted?.classList.remove("tour-highlight");
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step, location.pathname]);
  const answer = (reader: boolean) => {
    welcome(wantsTour, reader);
    if (wantsTour) setStep(0);
  };
  if (!experience.preferences.welcomeAnswered)
    return (
      <Modal
        title={tx(
          welcomeStep === "tour"
            ? "Hallo! Ich bin Champ 🍄"
            : "Soll ich dir etwas vorlesen?",
        )}
        onClose={() => welcome(false, false)}
        footer={
          welcomeStep === "tour" ? (
            <>
              <button
                className="button button-outline"
                onClick={() => {
                  setWantsTour(false);
                  setWelcomeStep("audio");
                }}
              >
                {tx("Nein, danke")}
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  setWantsTour(true);
                  setWelcomeStep("audio");
                }}
               aria-label={tx("Ja, zeig es mir!")} title={tx("Ja, zeig es mir!")}>
                {tx("Ja, zeig es mir!")}
                <ArrowRight size={17}  aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <button
                className="button button-outline"
                onClick={() => answer(false)}
              >
                {tx("Nein, danke")}
              </button>
              <button
                className="button button-primary"
                onClick={() => answer(true)}
               aria-label={tx("Ja, bitte vorlesen")} title={tx("Ja, bitte vorlesen")}>
                <Volume2 size={17}  aria-hidden="true" />
                {tx("Ja, bitte vorlesen")}
              </button>
            </>
          )
        }
      >
        <div className="champ-welcome">
          <ChampArt />
          <p>
            {tx(
              welcomeStep === "tour"
                ? "Hallo! Ich bin Champ 🍄, dein kleiner Begleiter bei MycoBox! Möchtest du, dass ich dir zeige, wie unsere Website funktioniert?"
                : "Möchtest du, dass dir die Inhalte der Website vorgelesen werden? Du kannst Vorlesen jederzeit starten, pausieren oder ausschalten.",
            )}
          </p>
        </div>
        <p className="welcome-step">
          {tx("Einmal kurz einstellen")} ·{" "}
          {welcomeStep === "tour" ? "1 / 2" : "2 / 2"}
        </p>
      </Modal>
    );
  if(startupOffer) return <Modal title={tx('Möchtest du eine kurze Einführung?')} onClose={()=>setStartupOffer(false)} footer={<><button className="button button-outline" onClick={()=>setStartupOffer(false)}>{tx('Ohne Tutorial fortfahren')}</button><button className="button button-primary" onClick={()=>{setStartupOffer(false);requestChampTour();}}>{tx('Tutorial starten')}</button></>}><p>{tx('Champ zeigt dir die wichtigsten Funktionen. Deine Growboxen und Einstellungen werden dabei nicht verändert.')}</p><p>{tx('Du kannst die Einführung jederzeit überspringen oder unter Hilfe erneut starten.')}</p></Modal>;
  return (
    <>
      {step!==null&&arrow&&<svg className="champ-arrow" aria-hidden="true"><defs><marker id={markerId} markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#245740"/></marker></defs><line {...arrow} x1={arrow.x1} y1={arrow.y1} x2={arrow.x2} y2={arrow.y2} stroke="#245740" strokeWidth="4" markerEnd={`url(#${markerId})`}/></svg>}
      {step !== null && (
        <aside
          className="tour-popover"
          ref={popover}
          style={{ top: position.top, left: position.left }}
          role="dialog"
          aria-modal="false"
          aria-labelledby="champ-tour-title"
        >
          <div className="tour-head">
            <ChampArt small />
            <div>
              <span>{tx("CHAMP ZEIGT DIR MYCOBOX")}</span>
              <h2 id="champ-tour-title">{tx(TOUR_STEPS[step].title)}</h2>
            </div>
            <button
              className="icon-button"
              aria-label={tx("Tutorial überspringen")}
              onClick={() => setStep(null)}
             title={tx("Tutorial überspringen")}>
              <X size={17}  aria-hidden="true" />
            </button>
          </div>
          <p className="tour-step-label">{tx("Schritt")} {step+1} / {TOUR_STEPS.length}</p>
          <p>{tx(TOUR_STEPS[step].body)}</p>
          <div
            className="tour-progress"
            role="progressbar"
            aria-label={tx("Tutorial-Fortschritt")}
            aria-valuenow={step + 1}
            aria-valuemax={9}
            aria-valuemin={1}
          >
            {TOUR_STEPS.map((_, i) => (
              <i key={i} className={i <= step ? "done" : ""} />
            ))}
          </div>
          <div className="tour-actions">
            <span>{step + 1} / 9</span>
            <button className="text-button" onClick={() => setStep(null)}>
              {tx("Tutorial überspringen")}
            </button>
            <button
              className="icon-button"
              aria-label={tx("Zurück")}
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
             title={tx("Zurück")}>
              <ArrowLeft size={17}  aria-hidden="true" />
            </button>
            <button
              className="button button-primary"
              onClick={() => (step === 8 ? finish() : setStep(step + 1))}
             aria-label={tx(step === 8 ? "Fertig" : "Weiter")} title={tx(step === 8 ? "Fertig" : "Weiter")}>
              {tx(step === 8 ? "Fertig" : "Weiter")}
              {step === 8 ? <Check size={16}  aria-hidden="true" /> : <ArrowRight size={16}  aria-hidden="true" />}
            </button>
          </div>
        </aside>
      )}
      {step === null && experience.preferences.champReminder && (
        <div className="champ-reminder">
          <button className="champ-start" onClick={() => requestChampTour()}>
            <ChampArt small />
            <span>
              <strong>{tx("Doch ein Tutorial?")}</strong>
              <small>{tx("Champ zeigt dir den Weg.")}</small>
            </span>
          </button>
          <button
            className="icon-button"
            aria-label={tx("Champ-Erinnerung schließen")}
            onClick={(event) => {
              event.stopPropagation();
              setPreferences({ champReminder: false });
            }}
           title={tx("Champ-Erinnerung schließen")}>
            <X size={17}  aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}
