import { HelpButton } from "../components/HelpButton";
import {
  deviceState,
  TANK_LABELS,
  HARDWARE_DEMO,
} from "../simulation/hardware";
import {
  Thermometer,
  Bell,
  X,
  Check,
  ChevronDown,
  Droplets,
  ExternalLink,
  Info,
  TriangleAlert,
  HelpCircle,
} from "lucide-react";
import { useState } from "react";
import { useGrowbox } from "../state/GrowboxProvider";
import { useExperience } from "./ExperienceProvider";
import { type Assessment, type Metric } from "./model";
import { CULTIVATION_GUIDES } from "../data/cultivationGuides";
import { PHASES } from "../data/catalog";
import {
  demoTime,
  formatDate,
  formatNumber,
  formatTime,
} from "../simulation/engine";
import { Link } from "react-router-dom";
import { Modal } from "../components/ui";
import { useT } from "../i18n";
import i18n from "../i18n";
import type { MushroomEntry } from "../types";
export const LEVEL_LABELS = {
  optimal: "Optimal",
  warning: "Leichte Abweichung",
  critical: "Starke Abweichung",
  unknown: "Datenprüfung erforderlich",
} as const;
export const METRIC_LABELS = {
  temperature: "Temperatur",
  humidity: "Luftfeuchtigkeit",
  co2: "CO₂",
} as const;
export function AssessmentBadge({ assessment }: { assessment: Assessment }) {
  const tx = useT();
  const Icon =
    assessment.level === "optimal"
      ? Check
      : assessment.level === "unknown"
        ? HelpCircle
        : TriangleAlert;
  return (
    <span className={`assessment assessment-${assessment.level}`}>
      <Icon size={14} />
      {tx(LEVEL_LABELS[assessment.level])}
    </span>
  );
}
export function MetricAssessment({ metric }: { metric: Metric }) {
  const tx = useT();
  const { experience } = useExperience();
  const item = experience.assessments[metric];
  return (
    <div className="metric-assessment">
      <AssessmentBadge assessment={item} />
      <span>
        {item.range ? (
          <>
            {formatNumber(item.range[0])}–{formatNumber(item.range[1])}{" "}
            {metric === "temperature"
              ? "°C"
              : metric === "humidity"
                ? "%"
                : "ppm"}{" "}
            ·{" "}
            {tx(item.basis === "study" ? "Studienprotokoll" : "Demo-Bewertung")}
          </>
        ) : (
          tx("Keine bestätigten Daten für diese Phase")
        )}
      </span>
      {item.level !== "optimal" && item.level !== "unknown" && (
        <span>
          {tx(item.direction === "low" ? "Wert zu niedrig" : "Wert zu hoch")}
        </span>
      )}
    </div>
  );
}
export function ConditionsPanel({ entry }: { entry: MushroomEntry }) {
  const tx = useT();
  const info = CULTIVATION_GUIDES[entry.speciesId];
  const [expanded, setExpanded] = useState(false);
  const rangeLabel = (range: readonly [number, number], unit: string) =>
    `${formatNumber(range[0])}${range[0] === range[1] ? "" : `–${formatNumber(range[1])}`} ${unit}`;
  return (
    <section className="panel conditions-panel">
      <div className="section-title">
        <div><p className="eyebrow">{tx("BEDINGUNGEN VERSTEHEN")}</p>
          <h2><Thermometer aria-hidden="true"/>{tx("Kulturbedingungen nach Phase")}</h2></div>
        <span className="muted-tag">{tx(info.evidence)}</span>
      </div>
      <p>{tx("Orientierungswerte für Fruchtung und Wachstum auf bereits besiedeltem Substrat. Je nach Zuchtstamm und Kulturverfahren unterscheiden sich die idealen Bedingungen.")}</p>
      <div className="conditions-values">
        <div><span><Thermometer aria-hidden="true"/> {tx("Temperatur")}</span><strong>{rangeLabel(info.fruiting.temperature, "°C")}</strong><small>{tx(info.fruiting.name)}</small></div>
        <div><span><Droplets aria-hidden="true"/> {tx("Relative Luftfeuchtigkeit")}</span><strong>{rangeLabel(info.fruiting.humidity, "% RH")}</strong><small>{tx(info.fruiting.name)}</small></div>
      </div>
      <p className="cultivation-context">{tx(info.note)}</p>
      <button className="text-button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-label={tx("Phasen und Quellen ansehen")} title={tx("Phasen und Quellen ansehen")}>
        {tx("Phasen und Quellen ansehen")} <ChevronDown aria-hidden="true"/>
      </button>
      {expanded && <div className="conditions-expanded">
        <div className="cultivation-table-scroll"><table><caption>{tx("Dokumentierte Kulturbedingungen")}</caption>
          <thead><tr><th>{tx("Phase")}</th><th>{tx("Temperatur")}</th><th>{tx("Relative Luftfeuchtigkeit")}</th></tr></thead>
          <tbody>{info.stages.map(stage => <tr key={stage.name}><td>{tx(stage.name)}</td><td>{rangeLabel(stage.temperature, "°C")}</td><td>{rangeLabel(stage.humidity, "% RH")}</td></tr>)}</tbody>
        </table></div>
        {entry.speciesId === "shimeji" && <p>{tx("Im zitierten Shimeji-Protokoll: CO₂ bei Besiedlung 2.500–4.000 ppm, bei Fruchtung 1.000–2.000 ppm; Licht an Fruchtungstagen 1–7: 50–100 lux, an Tagen 8–20: 200–300 lux. Diese Studienwerte werden nicht als Hardware-Grenzen übernommen.")}</p>}
        <p>{tx("Luftfeuchte bezeichnet die relative Feuchte der Umgebungsluft, nicht den Wassergehalt des Substrats. Für die Vorbereitung gelten die Hygiene- und Substratanweisungen des jeweiligen Zuchtsets.")}</p>
        <p>{tx("Diese recherchierten Kulturangaben ändern keine Demo-Sollwerte. Die Eignung der realen Growbox ist noch nicht erprobt.")}</p>
      </div>}
      <a className="text-link cultivation-source" href={info.source.url} target="_blank" rel="noreferrer">{info.source.title} <ExternalLink aria-hidden="true"/></a>
      <small className="cultivation-reviewed">{tx("Quellen geprüft am 04.11.2026")}</small>
    </section>
  );
}
export function WaterMaintenance() {
  const tx = useT();
  const { state, canControl } = useGrowbox();
  const { experience, waterAction } = useExperience();
  const { preferences } = experience;
  const { water } = state;
  const devices = deviceState(state);
  const due = water.lastChanged + preferences.waterIntervalDays * 86400000;
  return (
    <section className="panel water-panel" id="water-maintenance"><HelpButton topic="water"/>
      <div className="section-title">
        <h2>
          <Droplets size={18}  aria-hidden="true" />
          {tx("Wasserwartung")}
        </h2>
        <span className="muted-tag">{tx("Simulierter Tank")}</span>
      </div>
      <div className={`water-meter water-${devices.water}`}>
        <div
          role={water.level === null ? "img" : "meter"}
          aria-label={tx(
            water.level === null
              ? "Füllstand unbekannt · Sensor nicht verfügbar"
              : "Simulierter Tankfüllstand",
          )}
          aria-valuenow={water.level ?? undefined}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${water.level ?? 0}%` }} />
        </div>
        <strong>
          {water.level === null ? "–" : `${formatNumber(water.level)} %`}
        </strong>
        <span className={`tank-status tank-${devices.water}`}>
          {devices.water === "sufficient" ? (
            <Check size={16}  aria-hidden="true" />
          ) : (
            <TriangleAlert size={16}  aria-hidden="true" />
          )}
          {tx(TANK_LABELS[devices.water])}
        </span>
      </div>
      <p className="verification-note">
        {tx("Demo-Schwellen")}: {tx("Niedrig")} ≤ {HARDWARE_DEMO.tankLow} % ·{" "}
        {tx("Leer")} = {HARDWARE_DEMO.tankEmpty} %
      </p>
      {water.level === null && (
        <p>
          {tx(
            "Der Füllstandsensor liefert keinen Wert. „–“ bedeutet unbekannt und nicht 0 Prozent. Nachfüllen stellt den Sensor nicht wieder her.",
          )}
        </p>
      )}
      <p className="pump-state">
        <Droplets size={16}  aria-hidden="true" />
        {tx("Wasserförderung")}:{" "}
        <strong>
          {tx(devices.pumpBlocked ? "Gesperrt" : devices.pumpOn ? "An" : "Aus")}
        </strong>
        {devices.pumpBlocked && (
          <span>
            {tx(
              water.level === null
                ? "Kein verfügbarer Sensorwert – keine erfolgreiche Wasserförderung."
                : "Tank leer – keine Wasserförderung.",
            )}
          </span>
        )}
      </p>
      <dl>
        <div>
          <dt>{tx("Letzter Wasserwechsel")}</dt>
          <dd>
            {formatDate(water.lastChanged)} · {formatTime(water.lastChanged)}{" "}
            {tx("Demo-Zeit")}
          </dd>
        </div>
        <div>
          <dt>{tx("Nächste Erinnerung")}</dt>
          <dd>
            {formatDate(due)} · {formatTime(due)}{" "}
            {tx(due <= demoTime(state) ? "Fällig" : "Demo-Zeit")}
          </dd>
        </div>
      </dl>
      <p>
        {tx(
          "Nachfüllen erhöht bei verfügbarem Sensor den simulierten Füllstand. „Wasser gewechselt“ setzt separat nur die Wechsel-Erinnerung zurück. Beide Aktionen werden protokolliert.",
        )}
      </p>
      <div className="water-actions">
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("refilled")}
        >
          {tx("Wasser nachgefüllt")}
        </button>
        <button
          className="button button-primary"
          disabled={!canControl} onClick={() => waterAction("changed")}
         aria-label={tx("Wasser gewechselt")} title={tx("Wasser gewechselt")}>
          <Check size={15}  aria-hidden="true" />
          {tx("Wasser gewechselt")}
        </button>
      </div>
    </section>
  );
}
export function NotificationCenter() {
  const tx = useT();
  const [hiddenNotices,setHiddenNotices]=useState<number[]>([]);
  const { experience, markRead } = useExperience();
  const [open, setOpen] = useState(false);
  const unread = experience.notifications.filter((n) => !n.read).length;
  return (
    <>
      <button
        className="icon-button notification-trigger"
        aria-label={`${tx("Benachrichtigungen")} (${unread})`}
        onClick={(event) => {
          event.currentTarget.focus();
          setHiddenNotices([]);
          setOpen(true);
        }}
       title={`${tx("Benachrichtigungen")} (${unread})`}>
        <Bell size={19}  aria-hidden="true" />
        {unread > 0 && (
          <span className="notification-count">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open && (
        <Modal
          title={tx("Benachrichtigungen")}
          onClose={() => setOpen(false)}
          footer={
            <>
              <button
                className="button button-outline"
                disabled={!unread}
                onClick={() => markRead()}
              >
                {tx("Alle als gelesen markieren")}
              </button>
              <button
                className="button button-primary"
                onClick={() => setOpen(false)}
              >
                {tx("Schließen")}
              </button>
            </>
          }
        >
          <p className="notification-disclaimer">
            {tx(
              "Nur simulierte Meldungen bei geöffneter Anwendung. Keine permanente Hardwareüberwachung.",
            )}
          </p>
          {!experience.preferences.notificationsEnabled && (
            <p className="info-note">
              {tx(
                "Benachrichtigungen sind deaktiviert. Vorhandene Meldungen bleiben lesbar.",
              )}
            </p>
          )}
          {experience.notifications.length ? (
            <ol className="notification-list">
              {experience.notifications.filter(n=>!hiddenNotices.includes(n.id)).map((n) => (
                <li
                  key={n.id}
                  className={`notice-${n.severity} ${n.read ? "read" : ""}`}
                >
                  <span>
                    {n.severity === "info" ? (
                      <Info size={18}  aria-hidden="true" />
                    ) : (
                      <TriangleAlert size={18}  aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <p>{notificationText(n.key, n.params, tx)}</p>
                    {/water-(empty|low)/.test(n.kind)&&<p>{tx('Fülle den Tank auf und bestätige unter Wasserwartung mit Wasser nachgefüllt. Wasser gewechselt ist eine separate Wartungsaktion.')}</p>}
                    {n.kind==='water-unavailable'&&<p>{tx('Prüfe den Sensorstatus. Nachfüllen allein stellt einen fehlenden Sensorwert nicht wieder her.')}</p>}
                    {n.kind.startsWith('water-')&&<Link className="button button-outline" to="/growbox#water-maintenance" onClick={()=>setOpen(false)}>{tx('Wasserwartung öffnen')}</Link>}
                    <small>
                      {formatDate(n.demoTime)} · {formatTime(n.demoTime)}{" "}
                      {tx("Demo-Zeit")}
                    </small>
                    <button
                      className="text-button"
                      disabled={n.read}
                      onClick={() => markRead(n.id)}
                    >
                      {tx(n.read ? "Gelesen" : "Als gelesen markieren")}
                    </button>
                  </div>
                  <button type="button" className="icon-button close-notice" aria-label={`${tx('Benachrichtigung ausblenden')}: ${notificationText(n.key,n.params,tx)}`} onClick={()=>setHiddenNotices(previous=>[...previous,n.id])} title={`${tx('Benachrichtigung ausblenden')}: ${notificationText(n.key,n.params,tx)}`}><X aria-hidden="true"/></button>
                </li>
              ))}
              {hiddenNotices.length>0&&<li><p>{tx('Ausblenden behebt keine Ursache und markiert die Meldung nicht als gelesen.')}</p><button className="button button-outline" onClick={()=>setHiddenNotices([])}>{tx('Ausgeblendete Meldungen anzeigen')}</button></li>}
            </ol>
          ) : (
            <div className="notification-empty">
              <Check size={25}  aria-hidden="true" />
              <strong>{tx("Alles im Blick. Noch keine Meldungen.")}</strong>
              <p>
                {tx("Du kannst neue Hinweise unter „Demo-Szenarien“ erzeugen.")}
              </p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
export function notificationText(
  key: string,
  params: Record<string, string | number> | undefined,
  tx: ReturnType<typeof useT>,
) {
  if (key === "notification.recovered")
    return `${tx(METRIC_LABELS[params?.metric as Metric] ?? "")}: ${tx("Wieder im vorgesehenen Bereich")}`;
  if (key === "notification.condition" && params) {
    const metric = params.metric as Metric;
    const unit =
      metric === "temperature" ? "°C" : metric === "humidity" ? "%" : "ppm";
    return `${tx(METRIC_LABELS[metric])}: ${tx(params.direction === "low" ? "Wert zu niedrig" : "Wert zu hoch")} · ${tx(params.level === "critical" ? "Starke Abweichung" : "Leichte Abweichung")} (${formatNumber(Number(params.value), metric === "co2" ? 0 : 1)} ${unit})`;
  }
  if (key === "notification.phase")
    return `${tx("Neue Wachstumsphase")}: ${tx(PHASES[Number(params?.phase)]?.name ?? "")}`;
  return tx(
    (
      {
        "notification.waterUnavailable":
          "Füllstandsensor nicht verfügbar. Wasserförderung bleibt gesperrt.",
        "notification.waterEmpty":
          "Tank leer. Simulierte Wasserförderung gesperrt.",
        "notification.waterLow":
          "Wasser im Tank nachfüllen. Der simulierte Füllstand ist niedrig.",
        "notification.waterChange":
          "Wasserwechsel-Erinnerung fällig. Bitte den simulierten Wechsel bestätigen.",
        "notification.harvest":
          "Demo-Erntephase erreicht. Dies ist keine Bestätigung echter Erntereife.",
        "notification.complete":
          "Demo-Zyklus abgeschlossen. Reale Erntereife wurde nicht geprüft.",
      } as Record<string, string>
    )[key] ?? String(i18n.t(key)),
  );
}
