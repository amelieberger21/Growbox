import { growthLearning } from "../data/growthLearning";
import { useT } from "../i18n";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  CircleDot,
  Camera,
  Expand,
  Package,
  Network,
  Sprout,
  TrendingUp,
  Flag,
  FastForward,
  Pause,
  Play,
} from "lucide-react";
import { getEntry, PHASES } from "../data/catalog";
import {
  cultureDay,
  formatNumber,
  percent,
  phaseAt,
  profileSettings,
} from "../simulation/engine";
import { demoDeviceProfile, FAN_LABELS } from "../simulation/hardware";
import { phaseRange } from "../experience/model";
import { useGrowbox } from "../state/GrowboxProvider";
import {
  InfoNote,
  Modal,
  PageHeader,
  Progress,
  StatusBadge,
} from "../components/ui";
import { PhaseVisual, exampleFrame } from "../components/GrowthVisual";
import { Alerts, EventLog, TelemetryChart } from "../components/Telemetry";
import { DemoScenarios } from "../components/DemoScenarios";

const PHASE_ICONS = [Package, Network, Sprout, TrendingUp, Flag];
export function GrowthTabs({ climate = false }: { climate?: boolean }) {
  const tx = useT();
  return (
    <nav className="view-tabs" aria-label={tx("Verlauf wählen")}>
      <Link to="/wachstum" aria-current={!climate ? "page" : undefined}>
        {tx("Wachstumsverlauf")}
      </Link>
      <Link to="/wachstum/klima" aria-current={climate ? "page" : undefined}>
        {tx("Klimaverlauf")}
      </Link>
    </nav>
  );
}
export function GrowthPage() {
  const { state } = useGrowbox();
  return <GrowthContent key={`${state.cycle?.slug}:${state.cycle?.origin}`} />;
}
function GrowthContent() {
  const tx = useT();
  const { state, dispatch, notify, canControl } = useGrowbox();
  const progress = percent(state),
    active = phaseAt(progress);
  const [selected, setSelected] = useState<number | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const entry = state.cycle ? getEntry(state.cycle.slug) : undefined;
  if (!entry || !state.cycle)
    return (
      <div className="page">
        <PageHeader
          title={tx("Wachstumsverlauf")}
          eyebrow={tx("WISSEN ZUM WACHSEN")}
          description={tx(
            "Entwicklungsphasen und Kamera-Beispiele deiner aktiven Kultur.",
          )}
        />
        <div className="empty-state">
          <Sprout size={38} />
          <h2>{tx("Eine neue Geschichte wartet.")}</h2>
          <Link className="button button-primary" to="/pilze">
            {tx("Pilz auswählen")}
          </Link>
        </div>
      </div>
    );
  const frame = exampleFrame(entry, active);
  const detailIndex = selected ?? active;
  const phase = PHASES[detailIndex];
  const profile = profileSettings(entry.slug);
  const temp = phaseRange(entry, detailIndex, "temperature"),
    humidity = phaseRange(entry, detailIndex, "humidity");
  const devices = demoDeviceProfile(detailIndex);
  const dayRange = (index: number) => {
    const total = state.cycle!.totalDays;
    const start = Math.min(
      total,
      Math.floor(Math.ceil((total * 24 * PHASES[index].threshold) / 100) / 24) +
        1,
    );
    const end = Math.min(
      total,
      Math.floor(
        (Math.ceil((total * 24 * (PHASES[index + 1]?.threshold ?? 100)) / 100) -
          1) /
          24,
      ) + 1,
    );
    return `${formatNumber(start)}–${formatNumber(end)}`;
  };
  return (
    <div className="page growth-page">
      <PageHeader
        eyebrow={tx("JEDER TAG EIN KLEINES STÜCK WEITER")}
        title={tx("Wachstumsverlauf")}
        description={tx(
          "Entwicklungsphasen und Kamera-Beispiele deiner aktiven Kultur.",
        )}
        action={<StatusBadge status={state.cycle.status} />}
      />
      <GrowthTabs />
      <Alerts />
      <section className="panel visual-growth-overview">
        <PhaseVisual frame={frame} />
        <div className="growth-summary">
          <p className="eyebrow">{tx(entry.name)}</p>
          <div className="growth-head">
            <h2>{tx(PHASES[active].name)}</h2>
            <strong>
              {formatNumber(progress)}
              <small>%</small>
            </strong>
          </div>
          <p>{tx(PHASES[active].description)}</p>
          <Progress value={progress} />
          <p className="growth-meta">
            {tx("Tag")} {formatNumber(cultureDay(state))} {tx("von")}{" "}
            {formatNumber(state.cycle.totalDays)} · {tx("Demo-Zeit")}
          </p>
          <div className="growth-actions">
            <Link className="button button-outline" to={`/pilze/${entry.slug}`}>
              {tx("Zum Pilzprofil")}
              <ArrowRight size={16} />
            </Link>
            <Link className="text-link" to={`/pilze/${entry.slug}#rezeptideen`}>
              {tx("Rezeptideen")}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="panel growth-journey" id="phasen">
        <div className="section-title">
          <h2>{tx("Fünf Phasen. Ein kleines Wunder.")}</h2>
          <span className="muted-tag">{tx("Vereinfachtes Lernmodell")}</span>
        </div>
        <div
          className="visual-phase-grid"
          aria-label={tx("Wachstumsphasen zur Informationsansicht")}
        >
          {PHASES.map((item, index) => {
            const Icon = PHASE_ICONS[index];
            const StatusIcon =
              index < active ? Check : index === active ? CircleDot : Circle;
            return (
              <button
                key={item.name}
                className={`visual-phase-card ${index === active ? "current" : ""}`}
                aria-label={`${tx(item.name)} · ${tx(index < active ? "Abgeschlossen" : index === active ? "Aktuelle Phase" : "Kommende Phase")}`}
                onClick={(e) => {
                  e.currentTarget.focus();
                  setSelected(index);
                }}
              >
                <PhaseVisual frame={exampleFrame(entry, index)} compact />
                <span className="phase-card-name">
                  <Icon size={18} />
                  <strong>{tx(item.short)}</strong>
                </span>
                <span>
                  <StatusIcon size={14} />
                  {tx(
                    index < active
                      ? "Abgeschlossen"
                      : index === active
                        ? "Aktuelle Phase"
                        : "Kommende Phase",
                  )}
                </span>
                <small>
                  {tx("Demo-Tag")} {dayRange(index)}
                </small>
              </button>
            );
          })}
        </div>
        <p className="verification-note">
          {tx(
            "Das Ansehen einer Phase verändert weder Kultur noch Einstellungen. Tagesangaben und Bilder sind Beispiele, keine Vorhersage für reale Kulturen.",
          )}
        </p>
      </section>
      <section className="panel camera-preview">
        <div className="section-title">
          <div>
            <p className="eyebrow">{tx("BEISPIELANSICHT")}</p>
            <h2>
              <Camera size={20} />
              {tx("Blick in die Growbox")}
            </h2>
          </div>
          <span className="camera-label">
            {tx("Kamera-Vorschau · simuliertes Beispielbild")}
          </span>
        </div>
        <div className="camera-preview-grid">
          <PhaseVisual frame={frame} />
          <div>
            <h3>
              {tx(entry.name)} · {tx(PHASES[active].name)}
            </h3>
            <p>
              {tx(
                "Vorschau einer später eingebauten Kamera. Hier siehst du eine lokale schematische Illustration zur aktiven Pilzart und Demo-Phase.",
              )}
            </p>
            <p className="verification-note">
              {tx(
                "Keine echte Aufnahme, keine Live-Verbindung und keine automatische Bilddiagnose.",
              )}
            </p>
            <button
              className="button button-outline"
              onClick={(e) => {
                e.currentTarget.focus();
                setCameraOpen(true);
              }}
            >
              <Expand size={17} />
              {tx("Kamera-Vorschau vergrößern")}
            </button>
          </div>
        </div>
      </section>
      <InfoNote>
        {tx(
          "Zeitraffer: 5 Sekunden = 1 Demo-Stunde. Die festen Phasengrenzen und Restzeiten sind eine UX-Vereinfachung, kein biologisches Prognosemodell. Bei Pause steht auch die Demo-Zeit still.",
        )}
      </InfoNote>
      {state.cycle.status === "Abgeschlossen" && (
        <InfoNote>
          <strong>{tx("Demo-Zyklus abgeschlossen.")}</strong>{" "}
          {tx(
            "Dies ist keine Aussage über Essbarkeit oder echte Erntereife. Informationen und Rezepte bleiben erreichbar.",
          )}{" "}
          <Link className="text-link" to="/pilze">
            {tx("Neue Kultur auswählen")}
            <ArrowRight size={15} />
          </Link>
        </InfoNote>
      )}
      <details className="panel demo-growth-controls">
        <summary>{tx("Demo-Zeitsteuerung · Präsentation")}</summary>
        <div className="growth-actions">
          <button
            className="button button-primary"
            disabled={!canControl || state.cycle.status !== "Läuft"}
            onClick={() => {
              dispatch({ type: "NEXT_PHASE" });
              notify(
                "Die nächste Phasengrenze wurde im Demo-Modell simuliert.",
              );
            }}
          >
            <FastForward size={16} />
            {tx(
              active === 4
                ? "Demo-Zyklus abschließen"
                : "Nächste Phase simulieren",
            )}
          </button>
          {["Läuft", "Pausiert"].includes(state.cycle.status) && (
            <button
              className="button button-outline"
              onClick={() =>
                dispatch({
                  type: "STATUS",
                  status:
                    state.cycle?.status === "Läuft" ? "Pausiert" : "Läuft",
                })
              }
            >
              {state.cycle.status === "Läuft" ? (
                <Pause size={16} />
              ) : (
                <Play size={16} />
              )}
              {tx(
                state.cycle.status === "Läuft"
                  ? "Demo pausieren"
                  : "Demo fortsetzen",
              )}
            </button>
          )}
          {state.cycle.status === "Bereit" && (
            <Link to="/growbox" className="button button-outline">
              {tx("Zur Steuerung")}
            </Link>
          )}
        </div>
      </details>
      <DemoScenarios />
      {selected !== null && (
        <Modal
          title={tx(phase.name)}
          onClose={() => setSelected(null)}
          footer={
            <>
              <button
                className="button button-outline"
                onClick={() => setSelected(null)}
              >
                <ArrowLeft size={15} />
                {tx("Zurück zum Wachstumsverlauf")}
              </button>
              <Link
                to="/growbox#climate-settings"
                className="button button-primary"
                onClick={() => setSelected(null)}
              >
                {tx("Phasenprofil bewusst prüfen")}
                <ArrowRight size={16} />
              </Link>
            </>
          }
        >
          <nav className="growth-phase-navigation" aria-label={tx("Phasen durchblättern")}>
            <button type="button" className="button button-outline" disabled={detailIndex === 0}
              onClick={() => setSelected(detailIndex - 1)}>
              <ArrowLeft aria-hidden="true" /> {tx("Vorherige Phase")}
            </button>
            <span aria-live="polite">{tx("Phase")} {detailIndex + 1} / {PHASES.length} · {tx(phase.short)}</span>
            <button type="button" className="button button-primary" disabled={detailIndex === PHASES.length - 1}
              onClick={() => setSelected(detailIndex + 1)}>
              {tx("Nächste Phase")} <ArrowRight aria-hidden="true" />
            </button>
          </nav>
          <PhaseVisual frame={exampleFrame(entry, detailIndex)} />
          <p className="eyebrow">
            {tx("Demo-Tag")} {dayRange(detailIndex)}
          </p>
          <p>{tx(phase.description)}</p>
          <div className="growth-phase-learning">
            <section><h3>{tx("Was du beobachten kannst")}</h3><p>{tx(growthLearning[detailIndex].observe)}</p></section>
            <section><h3>{tx("Praktischer Tipp")}</h3><p>{tx(growthLearning[detailIndex].tip)}</p></section>
            <section><h3>{tx("Worauf du achten solltest")}</h3><p>{tx(growthLearning[detailIndex].caution)}</p></section>
          </div>
          <p><a href="https://smallfarms.cornell.edu/resources/methods-of-commercial-mushroom-cultivation-in-the-northeastern-united-states/2-seven-stages-of-cultivation/" target="_blank" rel="noreferrer">{tx("Fachquelle zu den Anbauphasen")} · Cornell Small Farms</a></p>
          <h3>{tx("Zugehöriges Demo-Profil")}</h3>
          <div className="phase-profile-values">
            <span>
              {tx("Temperatur")}:{" "}
              {formatNumber(
                temp.range
                  ? (temp.range[0] + temp.range[1]) / 2
                  : profile.temperature,
                1,
              )}{" "}
              °C
            </span>
            <span>
              {tx("Luftfeuchtigkeit")}:{" "}
              {formatNumber(
                humidity.range
                  ? (humidity.range[0] + humidity.range[1]) / 2
                  : profile.humidity,
              )}{" "}
              %
            </span>
            <span>
              {tx("Umluft")}: {tx(FAN_LABELS[devices.circulation])}
            </span>
            <span>
              {tx("Frischluft")}: {tx(FAN_LABELS[devices.freshAir])}
            </span>
            <span>
              {tx("Beleuchtung")}: {devices.brightness} % · {devices.lightStart}
              –{devices.lightEnd}
            </span>
            <span>{tx("Demo-Hinweisgrenze")}: CO₂ 1.500 ppm</span>
          </div>
          <p className="verification-note">
            {tx(
              "Diese Profilansicht zeigt Beispielwerte und ändert keine übernommenen Einstellungen. Der bestehende Phasenprofil-Vorschlag auf „Meine Growbox“ bezieht sich auf die tatsächlich aktive Phase.",
            )}
          </p>
          <h3>{tx("Was als Nächstes sichtbar werden könnte")}</h3>
          <p>
            {tx(
              PHASES[detailIndex + 1]?.description ??
                "Nach dem Demo-Abschluss bleibt der Verlauf zum Nachlesen erhalten. Reale Erntereife wird nicht beurteilt.",
            )}
          </p>
        </Modal>
      )}
      {cameraOpen && (
        <Modal
          title={tx("Blick in die Growbox")}
          onClose={() => setCameraOpen(false)}
          footer={
            <button
              className="button button-primary"
              onClick={() => setCameraOpen(false)}
            >
              {tx("Zurück zum Wachstumsverlauf")}
            </button>
          }
        >
          <p className="camera-label">
            {tx("Kamera-Vorschau · simuliertes Beispielbild")}
          </p>
          <PhaseVisual frame={frame} />
          <p>
            {tx(entry.name)} · {tx(PHASES[active].name)} · {tx("Tag")}{" "}
            {cultureDay(state)}
          </p>
          <p>
            {tx(
              "Keine echte Aufnahme, keine Live-Verbindung und keine automatische Bilddiagnose.",
            )}
          </p>
        </Modal>
      )}
    </div>
  );
}
export function ClimatePage() {
  const tx = useT();
  return (
    <div className="page">
      <PageHeader
        eyebrow={tx("SIMULIERTE MESSWERTE")}
        title={tx("Klimaverlauf")}
        description={tx(
          "Historische Temperatur-, Feuchtigkeits- und CO₂-Werte. Entwicklungsphasen findest du im Wachstumsverlauf.",
        )}
      />
      <GrowthTabs climate />
      <TelemetryChart full />
      <EventLog full />
    </div>
  );
}
