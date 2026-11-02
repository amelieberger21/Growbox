import {
  deviceState,
  TANK_LABELS,
  HARDWARE_DEMO,
} from "../simulation/hardware";
import {
  Bell,
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
import { CULTIVATION, phaseRange, type Assessment, type Metric } from "./model";
import { PHASES } from "../data/catalog";
import {
  demoTime,
  formatDate,
  formatNumber,
  formatTime,
  phaseAt,
  percent,
} from "../simulation/engine";
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
  const { state } = useGrowbox();
  const info = CULTIVATION[entry.speciesId];
  const phase = state.cycle?.slug === entry.slug ? phaseAt(percent(state)) : 3;
  const [expanded, setExpanded] = useState(false);
  return (
    <section className="panel conditions-panel">
      <div className="section-title">
        <div>
          <p className="eyebrow">{tx("BEDINGUNGEN VERSTEHEN")}</p>
          <h2>{tx("Kulturbedingungen nach Phase")}</h2>
        </div>
        <span className="muted-tag">
          {tx(
            info.verified
              ? "Studienbezogen geprüft"
              : "Vorläufig · noch zu validieren",
          )}
        </span>
      </div>
      <p>
        {tx(
          "Die Angaben beziehen sich auf konkrete Phasen. Sie sind keine universellen Sicherheitsgrenzen oder Ernteversprechen.",
        )}
      </p>
      <div className="conditions-values">
        {(["temperature", "humidity"] as const).map((metric) => {
          const data = phaseRange(entry, phase, metric);
          return (
            <div key={metric}>
              <span>{tx(METRIC_LABELS[metric])}</span>
              <strong>
                {data.range
                  ? `${formatNumber(data.range[0])}–${formatNumber(data.range[1])} ${metric === "temperature" ? "°C" : "%"}`
                  : tx("Nicht verifiziert")}
              </strong>
              <small>{tx(PHASES[phase].name)}</small>
            </div>
          );
        })}
      </div>
      <button
        className="text-button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        {tx("Alle Phasen & Prüfstand")}
        <ChevronDown size={15} />
      </button>
      {expanded && (
        <div className="conditions-expanded">
          <table>
            <thead>
              <tr>
                <th>{tx("Phase")}</th>
                <th>{tx("Temperatur")}</th>
                <th>{tx("Luftfeuchtigkeit")}</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2].map((phaseId) => (
                <tr key={phaseId}>
                  <td>
                    {tx(
                      phaseId === 1
                        ? "Besiedlung des Substrats"
                        : "Fruchtungsphase",
                    )}
                  </td>
                  {(["temperature", "humidity"] as const).map((metric) => {
                    const r = phaseRange(entry, phaseId, metric).range;
                    return (
                      <td key={metric}>
                        {r
                          ? `${formatNumber(r[0])}–${formatNumber(r[1])} ${metric === "temperature" ? "°C" : "%"}`
                          : tx("Nicht verifiziert")}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p>{tx(info.note)}</p>
          {entry.speciesId === "shimeji" && (
            <p>
              {tx(
                "Im zitierten Shimeji-Protokoll: CO₂ bei Besiedlung 2.500–4.000 ppm, bei Fruchtung 1.000–2.000 ppm; Licht an Fruchtungstagen 1–7: 50–100 lux, an Tagen 8–20: 200–300 lux. Diese Studienwerte werden nicht als Hardware-Grenzen übernommen.",
              )}
            </p>
          )}
          <p>
            {tx(
              "CO₂-Zielbereich, numerischer Lichtbedarf und reale Growbox-Eignung für unsere Hardware sind nicht verifiziert. Studienbezogene Angaben sind gegebenenfalls separat aufgeführt. Kulturdauern bleiben synthetische Demo-Werte.",
            )}
          </p>
          {info.sourceUrl && (
            <a
              className="text-link"
              href={info.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {tx("Quelle und Geltungsbereich")}
              <ExternalLink size={13} />
            </a>
          )}
        </div>
      )}
    </section>
  );
}
export function WaterMaintenance() {
  const tx = useT();
  const { state } = useGrowbox();
  const { experience, waterAction } = useExperience();
  const { preferences } = experience;
  const { water } = state;
  const devices = deviceState(state);
  const due = water.lastChanged + preferences.waterIntervalDays * 86400000;
  return (
    <section className="panel water-panel" id="water-maintenance">
      <div className="section-title">
        <h2>
          <Droplets size={18} />
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
            <Check size={16} />
          ) : (
            <TriangleAlert size={16} />
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
        <Droplets size={16} />
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
          onClick={() => waterAction("refilled")}
        >
          {tx("Wasser nachgefüllt")}
        </button>
        <button
          className="button button-primary"
          onClick={() => waterAction("changed")}
        >
          <Check size={15} />
          {tx("Wasser gewechselt")}
        </button>
      </div>
    </section>
  );
}
export function NotificationCenter() {
  const tx = useT();
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
          setOpen(true);
        }}
      >
        <Bell size={19} />
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
              {experience.notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notice-${n.severity} ${n.read ? "read" : ""}`}
                >
                  <span>
                    {n.severity === "info" ? (
                      <Info size={18} />
                    ) : (
                      <TriangleAlert size={18} />
                    )}
                  </span>
                  <div>
                    <p>{notificationText(n.key, n.params, tx)}</p>
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
                </li>
              ))}
            </ol>
          ) : (
            <div className="notification-empty">
              <Check size={25} />
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
