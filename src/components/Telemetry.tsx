import { HelpButton } from "./HelpButton";
import { Link } from "react-router-dom";
import { useExperience } from "../experience/ExperienceProvider";
import {
  MetricAssessment,
  METRIC_LABELS,
  LEVEL_LABELS,
  notificationText,
} from "../experience/Monitoring";
import { useT } from "../i18n";
import { useState, useEffect } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDown,
  Check,
  ChevronDown,
  Droplets,
  Table2,
  Thermometer,
  Gauge,
  X,
  TriangleAlert,
} from "lucide-react";
import { useGrowbox } from "../state/GrowboxProvider";
import {
  CONFIG,
  demoTime,
  formatDate,
  formatNumber,
  formatTime,
} from "../simulation/engine";
import { SectionTitle } from "./ui";
import type { SensorReading } from "../types";
export function SensorCards() {
  const tx = useT();
  const { state, selectedBox } = useGrowbox();
  const { experience } = useExperience();
  const sensors = [
    {
      key: "temperature",
      name: "Temperatur",
      unit: "°C",
      icon: Thermometer,
      color: "peach",
      digits: 1,
    },
    {
      key: "humidity",
      name: "Luftfeuchtigkeit",
      unit: "%",
      icon: Droplets,
      color: "blue",
      digits: 0,
    },
    {
      key: "co2",
      name: "CO₂-Gehalt",
      unit: "ppm",
      icon: Gauge,
      color: "sage",
      digits: 0,
    },
  ] as const;
  return (
    <>
      <div className="sensor-grid">
        {sensors.map(({ key, name, unit, icon: Icon, color, digits }) => (
          <section
            className={`sensor-card sensor-${experience.assessments[key].level}`}
            key={key}
          >
            <div className="sensor-top">
              <span>{tx(name)}</span><HelpButton topic={key === "temperature" ? "temperature" : key === "humidity" ? "humidity" : "co2"}/>
              <span className={`sensor-icon ${color}`}>
                <Icon size={19} />
              </span>
            </div>
            <div className="sensor-value">
              {selectedBox.hasData ? formatNumber(state.reading[key], digits) : "–"}
              <span>{unit}</span>
              <span
                className={`sensor-spark spark-${color}`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 90 30">
                  <path
                    d="M0 23L9 18L18 21L27 12L36 16L45 9L54 14L63 7L72 12L81 5L90 9"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>
            </div>
            <p className="sensor-target">
              {tx(key === "co2" ? "Demo-Hinweisgrenze:" : "Demo-Sollwert:")}{" "}
              {formatNumber(
                key === "temperature"
                  ? state.settings.temperature
                  : key === "humidity"
                    ? state.settings.humidity
                    : experience.preferences.warning.co2Limit,
                key === "temperature" ? 1 : 0,
              )}{" "}
              {unit}
            </p>
            <MetricAssessment metric={key} />
            <div className="sensor-updated">
              {tx("Letzte Aktualisierung")}: {formatTime(state.reading.time)} ·{" "}
              {tx("simuliert")}
            </div>
          </section>
        ))}
      </div>
      <p className="monitoring-note">
        {tx(
          "Farben bewerten Kulturbedingungen im Modell, nicht Genießbarkeit oder Gesundheit. Unbekannte Phasen bleiben grau.",
        )}
      </p>
    </>
  );
}
export function Alerts() {
  const tx = useT();
  const {selectedBox}=useGrowbox();
  const [hidden,setHidden]=useState<string[]>([]);
  const { experience } = useExperience();
  const active = (["temperature", "humidity", "co2"] as const).filter(
    (metric) =>
      ["warning", "critical"].includes(experience.assessments[metric].level),
  );
  const issueKey=(metric: typeof active[number])=>`${selectedBox.id}:${metric}:${experience.assessments[metric].level}:${experience.assessments[metric].direction}`;
  const signature=active.map(issueKey).join('|');
  useEffect(()=>{setHidden(previous=>previous.filter(key=>signature.split('|').includes(key)));},[signature]);
  return active.length ? (
    <div className="alert-stack">
      {active.filter(metric=>!hidden.includes(issueKey(metric))).map((metric) => (
        <div
          key={metric}
          className={`alert-banner alert-${experience.assessments[metric].level}`}
        >
          <TriangleAlert size={19} />
          <div>
            <strong>
              {metric === "co2" &&
              experience.preferences.warning.co2Limit === 1500 ? (
                tx("CO₂ über der Demo-Hinweisgrenze von 1.500 ppm")
              ) : (
                <>
                  {tx(METRIC_LABELS[metric])}:{" "}
                  {tx(LEVEL_LABELS[experience.assessments[metric].level])}
                </>
              )}
            </strong>
            <p>
              {tx(
                metric==='co2'?'Simulierter CO₂-Wert erhöht. Prüfe die Frischluft-Einstellung und den Klimaverlauf. Die tatsächliche Geräteaktion steht unter Luftzirkulation.':'Simulierter Klimawert außerhalb des Vergleichsbereichs. Prüfe Sollwert und Phasenprofil. Das ist kein Nachweis für Schimmel.',
              )}
            </p>
            <Link className="button button-outline" to={metric==='co2'?'/growbox#air-settings':'/growbox#climate-settings'}>{tx(metric==='co2'?'Frischluft prüfen':'Klimaeinstellungen prüfen')}</Link>
          </div>
          <button type="button" className="icon-button close-notice" aria-label={`${tx('Meldung schließen')}: ${tx(METRIC_LABELS[metric])}`} onClick={()=>setHidden(previous=>[...previous,issueKey(metric)])}><X aria-hidden="true"/></button>
        </div>
      ))}
      {hidden.length>0&&<div className="hidden-alerts" role="status"><span>{tx('Hinweis ausgeblendet. Die Abweichung bleibt in den Messwerten sichtbar; Schließen behebt keine Ursache.')}</span><button className="button button-outline" onClick={()=>setHidden([])}>{tx('Hinweise wieder anzeigen')}</button></div>}
    </div>
  ) : null;
}
const metrics = {
  temperature: {
    name: "Temperatur",
    unit: "°C",
    color: "#4c775b",
    target: "targetTemperature",
    domain: [10, 35],
  },
  humidity: {
    name: "Luftfeuchtigkeit",
    unit: "%",
    color: "#608b9e",
    target: "targetHumidity",
    domain: [50, 100],
  },
  co2: {
    name: "CO₂",
    unit: "ppm",
    color: "#b78951",
    target: undefined,
    domain: [350, "auto"],
  },
} as const;
export function TelemetryChart({ full = false }: { full?: boolean }) {
  const tx = useT();
  const { state } = useGrowbox();
  const [metric, setMetric] = useState<"temperature" | "humidity" | "co2">(
    "temperature",
  );
  const [period, setPeriod] = useState("24");
  const [table, setTable] = useState(false);
  const data = state.history.filter(
    (point) => point.time > demoTime(state) - Number(period) * 3600000,
  );
  const spec = metrics[metric];
  const targetKey = spec.target;
  return (
    <section className={`panel chart-panel ${full ? "chart-full" : ""}`}>
      <SectionTitle title={tx("Klimaverlauf")}><HelpButton topic="chart"/>
        <label className="period-select">
          <span className="sr-only">{tx("Diagrammzeitraum")}</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
          >
            <option value="24">{tx("Letzte 24 Demo-Stunden")}</option>
            <option value="168">{tx("Letzte 7 Demo-Tage")}</option>
          </select>
          <ChevronDown size={13} />
        </label>
      </SectionTitle>
      <div className="chart-subheader">
        <div className="segmented metric-tabs">
          {tx(
            (Object.keys(metrics) as (keyof typeof metrics)[]).map((key) => (
              <button
                key={key}
                aria-pressed={metric === key}
                className={metric === key ? "selected" : ""}
                onClick={() => setMetric(key)}
              >
                {tx(metrics[key].name)}
              </button>
            )),
          )}
        </div>
        <span className="chart-unit">
          {tx(spec.unit)}
          {tx(" \u00B7 simuliert")}
        </span>
      </div>
      {tx(
        data.length ? (
          <div
            className="chart-area"
            aria-label={tx(`Simulierter Verlauf: ${spec.name} in ${spec.unit}`)}
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart
                data={data}
                margin={{ top: 8, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`chart-fill-${metric}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0"
                      stopColor={spec.color}
                      stopOpacity={0.14}
                    />
                    <stop offset="1" stopColor={spec.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  vertical={false}
                  stroke="#e9ede5"
                  strokeDasharray="3 4"
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) =>
                    period === "24"
                      ? formatTime(Number(time))
                      : formatDate(Number(time))
                  }
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{ fontSize: 10, fill: "#65715e" }}
                />
                <YAxis
                  domain={
                    metric === "temperature"
                      ? ["dataMin - 2", "dataMax + 2"]
                      : [...spec.domain]
                  }
                  tickFormatter={(value) => formatNumber(Number(value))}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: "#65715e" }}
                  width={60}
                />
                <Tooltip
                  labelFormatter={(label) =>
                    `Demo ${formatDate(Number(label))} · ${formatTime(Number(label))}`
                  }
                  formatter={(value, name) => [
                    `${formatNumber(Number(value), metric === "co2" ? 0 : 1)} ${spec.unit}`,
                    name === targetKey
                      ? "Damals gültiger Demo-Sollwert"
                      : spec.name,
                  ]}
                  contentStyle={{
                    border: "1px solid #e2e7dc",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={metric}
                  stroke={spec.color}
                  strokeWidth={2.2}
                  fill={`url(#chart-fill-${metric})`}
                  isAnimationActive={false}
                />
                {tx(
                  targetKey && (
                    <Line
                      type="stepAfter"
                      dataKey={targetKey}
                      stroke="#b3b9a2"
                      strokeDasharray="5 5"
                      dot={false}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  ),
                )}
                {tx(" ")}
                {tx(
                  metric === "co2" && (
                    <ReferenceLine
                      y={CONFIG.co2Limit}
                      stroke="#bb8539"
                      strokeDasharray="5 5"
                    />
                  ),
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="chart-empty">
            <SproutIcon />
            {tx(
              "Nach dem Demo-Start erscheint hier deine erste Messwertreihe.",
            )}
          </div>
        ),
      )}
      <div className="chart-footer">
        {!full && (
          <Link className="text-link" to="/wachstum/klima">
            {tx("Gesamten Klimaverlauf öffnen")}
          </Link>
        )}
        <div className="chart-legend">
          <span>
            <i style={{ background: spec.color }} />
            {tx("Demo-Istwert")}
          </span>
          <span>
            <i className="legend-target" />
            {tx(metric === "co2" ? "Demo-Hinweisgrenze" : "Demo-Sollwert")}
          </span>
        </div>
        <button
          className="text-button"
          onClick={() => setTable(!table)}
          aria-expanded={table}
        >
          <Table2 size={14} />
          {tx(table ? "Tabelle schließen" : "Datentabelle")}
        </button>
      </div>
      {tx(
        table && (
          <div className="table-scroll">
            <table>
              <caption>
                {tx("Dieselben ")}
                {tx(data.length)}
                {tx(" simulierten Messwerte wie im Diagramm")}
              </caption>
              <thead>
                <tr>
                  <th>{tx("Demo-Zeit")}</th>
                  <th>
                    {tx(spec.name)}
                    {tx(" (")}
                    {tx(spec.unit)}
                    {tx(")")}
                  </th>
                  {tx(
                    targetKey && (
                      <th>
                        {tx("Damals g\u00FCltiger Sollwert (")}
                        {tx(spec.unit)}
                        {tx(")")}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {tx(
                  data.map((point: SensorReading) => (
                    <tr key={`${point.time}`}>
                      <td>
                        {tx(formatDate(point.time))}
                        {tx(" \u00B7 ")}
                        {tx(formatTime(point.time))}
                      </td>
                      <td>
                        {tx(
                          formatNumber(point[metric], metric === "co2" ? 0 : 1),
                        )}
                      </td>
                      {tx(
                        targetKey && (
                          <td>{tx(formatNumber(point[targetKey], 1))}</td>
                        ),
                      )}
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        ),
      )}
    </section>
  );
}
function SproutIcon() {
  return <ArrowDown size={20} />;
}
export function EventLog({ full = false }: { full?: boolean }) {
  const tx = useT();
  const { state } = useGrowbox();
  const { experience } = useExperience();
  const [expanded, setExpanded] = useState(full);
  const allEvents = [
    ...state.events.filter(
      (event) => event.type !== "warning" && event.type !== "resolved",
    ),
    ...experience.notifications
      .filter((n) => n.kind !== "phase" && n.kind !== "complete")
      .map((n) => ({
        id: `notice-${n.id}`,
        time: n.demoTime,
        type: n.severity === "info" ? "phase" : "warning",
        text: notificationText(n.key, n.params, tx),
      })),
  ]
    .sort((a, b) => b.time - a.time)
    .slice(0, 200);
  const events = expanded ? allEvents : allEvents.slice(0, 3);
  return (
    <section className="panel event-panel">
      <SectionTitle title={tx("Was gerade passiert")}>
        <span className="muted-tag">{tx("Demo-Protokoll")}</span>
      </SectionTitle>
      <ol className="event-list">
        {tx(
          events.map((event) => (
            <li key={event.id}>
              <span className={`event-dot event-${event.type}`}>
                {tx(
                  event.type === "warning" ? (
                    <TriangleAlert size={13} />
                  ) : (
                    <Check size={12} />
                  ),
                )}
              </span>
              <div>
                <p>{tx(event.text)}</p>
                <span>
                  {tx(formatDate(event.time))}
                  {tx(" \u00B7 ")}
                  {tx(formatTime(event.time))}
                  {tx(" Demo-Zeit")}
                </span>
              </div>
            </li>
          )),
        )}
      </ol>
      {tx(
        !full && allEvents.length > 3 && (
          <button
            className="text-button event-expand"
            onClick={() => setExpanded(!expanded)}
          >
            {tx(expanded ? "Weniger anzeigen" : "Alle Ereignisse ansehen")}
            <ChevronDown size={15} />
          </button>
        ),
      )}
    </section>
  );
}
