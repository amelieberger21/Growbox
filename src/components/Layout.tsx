import { useEffect, useState } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  LayoutDashboard,
  Leaf,
  Menu,
  SlidersHorizontal,
  Sprout,
  X,
  CircleHelp,
  Clock3,
  WifiOff,
  Settings2,
  Volume2,
} from "lucide-react";
import { translationNotice } from "../i18n/coverage";
import { BoxContext, GrowboxManager } from "./GrowboxManager";
import { HelpButton } from "./HelpButton";
import { Logo } from "./ui";
import { useGrowbox } from "../state/GrowboxProvider";
import { cultureDay, demoTime, formatTime } from "../simulation/engine";
import { getEntry } from "../data/catalog";
import { useT, currentLocale } from "../i18n";
import { LanguageSelect } from "../pages/SettingsPage";
import { NotificationCenter } from "../experience/Monitoring";
import { ChampGuide } from "../experience/Champ";
import { SpeechPanel, useSpeech } from "../experience/Speech";
import { useExperience } from "../experience/ExperienceProvider";
import { VoiceAssistant } from "../experience/VoiceAssistant";
const NAV = [
  { path: "/", name: "Dashboard", icon: LayoutDashboard },
  { path: "/pilze", name: "Pilzbibliothek", icon: BookOpen },
  { path: "/growbox", name: "Meine Growbox", icon: SlidersHorizontal },
  { path: "/wachstum", name: "Wachstumsverlauf", icon: Sprout },
  { path: "/einstellungen", name: "Einstellungen", icon: Settings2 },
  { path: "/hilfe", name: "Hilfe & Champ", icon: CircleHelp },
];
function SystemClock() {
  const tx = useT();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <time className="system-clock" dateTime={now.toISOString()} aria-live="off">
      <Clock3 size={13} />
      <span>
        {new Intl.DateTimeFormat(currentLocale(), {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(now)}{" "}
        <span className="date-divider">|</span>{" "}
        <b>
          {new Intl.DateTimeFormat(currentLocale(), {
            hour: "2-digit",
            minute: "2-digit",
          }).format(now)}
        </b>
      </span>
      <span className="sr-only">{tx("Aktuelle Gerätezeit")}</span>
    </time>
  );
}
export function Layout() {
  const tx = useT();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { state, selectedBox } = useGrowbox();
  const { experience, setPreferences } = useExperience();
  const speech = useSpeech();
  const activeLocale = currentLocale();
  const page =
    location.pathname === "/wachstum/klima"
      ? "Klimaverlauf"
      : (NAV.find((item) =>
          item.path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.path),
        )?.name ??
        (location.pathname === "/projekt"
          ? "Über das Projekt"
          : "Seite nicht gefunden"));
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    if (speech.status !== "idle") speech.stop();
  }, [location.pathname]);
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) {
        const details = target.closest("details");
        if (details) details.open = true;
        target.scrollIntoView?.({ block: "start" });
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }
  }, [location.pathname, location.hash, location.key]);
  useEffect(() => {
    document.title = `${tx(page)} · MycoBox`;
  }, [page, activeLocale]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {tx("Zum Inhalt springen")}
      </a>
      {open && (
        <button
          className="menu-scrim"
          aria-label={tx("Menü schließen")}
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`sidebar ${open ? "open" : ""}`}
        aria-label={tx("Hauptnavigation")}
      >
        <Link to="/" aria-label={tx("MycoBox Dashboard")}>
          <Logo />
        </Link>
        <p className="brand-tagline">{tx("Natürlich wachsen.")}</p>
        <button
          className="mobile-close icon-button"
          onClick={() => setOpen(false)}
          aria-label={tx("Menü schließen")}
        >
          <X />
        </button>
        <p className="nav-label">{tx("DEIN PILZLABOR")}</p>
        <nav>
          {NAV.map(({ path, name, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{tx(name)}</span>
              {path === "/pilze" && <span className="nav-count">15</span>}
              {path === "/" && <span className="nav-active-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-grow">
            <div className="sidebar-grow-icon">
              <Leaf size={20} />
              <span
                className={`tiny-dot ${state.cycle?.status === "Läuft" ? "" : "quiet"}`}
              />
            </div>
            <div>
              <strong>
                {tx("Ein bisschen Natur.")}
                <br />
                {tx("Mitten in deinem Alltag.")}
              </strong>
              <p>{tx("Entdecken. Verstehen. Wachsen.")}</p>
            </div>
          </div>
          <NavLink
            to="/projekt"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <CircleHelp size={18} />
            {tx("Über das Projekt")}
            <ArrowUpRight className="ml-auto" size={16} />
          </NavLink>
          <div className="sidebar-footer">
            <span>MYCOBOX</span>
            <span>{tx("PROTOTYP V2.1")}</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="header-left">
            <div className="breadcrumb">
              <button
                className="mobile-menu icon-button"
                aria-label={tx("Navigationsmenü öffnen")}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
              >
                <Menu size={22} />
              </button>
              <span className="breadcrumb-root">{tx("Mein Pilzlabor")}</span>
              <ChevronRight size={14} />
              <strong>{tx(page)}</strong>
            </div>
            <SystemClock />
          </div>
          <div className="topbar-right">
            <LanguageSelect />
            <button
              className={`icon-button reader-trigger ${experience.preferences.readerEnabled ? "active" : ""}`}
              aria-label={tx(
                experience.preferences.readerEnabled
                  ? "Vorlesefunktion deaktivieren"
                  : "Vorlesen aktivieren",
              )}
              onClick={() =>
                setPreferences({
                  readerEnabled: !experience.preferences.readerEnabled,
                })
              }
            >
              <Volume2 size={19} />
            </button>
            <NotificationCenter />
            <Link
              to="/einstellungen"
              className="icon-button"
              aria-label={tx("Einstellungen")}
            >
              <Settings2 size={19} />
            </Link>
          </div>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="demo-banner">
            <div>
              <span className="demo-pip" />
              <strong>{tx("Demo-Modus")}</strong>
              <span className="banner-divider" />
              <span>
                {tx(
                  "Keine echte Hardware verbunden. Alle Werte und Aktionen sind simuliert.",
                )}
              </span>
            </div>
            <Link to="/projekt#demo-erklaerung">
              {tx("Mehr erfahren")}
              <ArrowUpRight size={14} />
            </Link>
          </div>
          {experience.preferences.language!=="de"&&<p className="translation-notice" role="status" lang={experience.preferences.language}>{translationNotice[experience.preferences.language]}</p>}
          <BoxContext />
          <div className="page-help"><HelpButton topic={location.pathname.startsWith("/pilze")?"library":location.pathname.startsWith("/einstellungen")?"accessibility":location.pathname.includes("klima")?"chart":location.pathname.startsWith("/wachstum")?"growth":"settings"}/></div>
          {!selectedBox.hasData && !["/einstellungen","/hilfe","/projekt"].includes(location.pathname) && !location.pathname.startsWith("/pilze") ? <div className="page"><GrowboxManager/><p role="status">{tx("Keine Messdaten vorhanden")}</p></div> : <Outlet key={selectedBox.id} />}
        </main>
        <footer className="app-footer">
          <span>
            <Logo compact />
            {tx("Mit Neugier kultiviert.")}
            <span className="footer-small">
              {tx("MycoBox · Hochschulprojekt")}
            </span>
          </span>
          <span>
            <WifiOff size={13} />
            {tx("Lokale Demo · Daten auf diesem Gerät")}
          </span>
        </footer>
      </div>
      <div
        className="simulation-clock"
        title={tx("Die Simulationsuhr zeigt ausschließlich Demo-Zeit.")}
      >
        <Clock3 size={14} />
        <span>{tx("Demo-Zeit")}</span>
        <strong>
          {tx("Tag")} {cultureDay(state)} · {formatTime(demoTime(state))}
        </strong>
        <span className="clock-rate">{tx("5 s = 1 Demo-Std.")}</span>
        {state.cycle?.status !== "Läuft" && (
          <b>{tx(state.cycle?.status ?? "Keine Kultur")}</b>
        )}
      </div>
      {state.cycle && (
        <span className="sr-only">
          {tx("Aktive Kultur:")} {tx(getEntry(state.cycle.slug)?.name)}
        </span>
      )}
      <ChampGuide />
      <SpeechPanel />
      <VoiceAssistant />
    </div>
  );
}
