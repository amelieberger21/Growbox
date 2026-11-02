import { StepButtons } from "../components/StepButtons";
import { useState } from "react";
import {
  ArrowRight,
  FlaskConical,
  RotateCcw,
  TriangleAlert,
} from "lucide-react";
import { useExperience } from "./ExperienceProvider";
import { useGrowbox } from "../state/GrowboxProvider";
import { useT } from "../i18n";
import { Modal } from "../components/ui";
import { requestChampTour } from "./Champ";
import { formatNumber } from "../simulation/engine";
export function PresentationTools() {
  const tx = useT();
  const { state, dispatch, notify, canControl } = useGrowbox();
  const { experience, waterAction, resetDemo } = useExperience();
  const [reset, setReset] = useState(false);
  const enabled = canControl && state.cycle?.status === "Läuft";
  const range = experience.assessments.temperature.range;
  return (
    <div className="presentation-tools">
      <div className="presentation-heading">
        <FlaskConical size={18} />
        <strong>{tx("Präsentationswerkzeuge")}</strong>
        <span>{tx("Alles simuliert")}</span>
      </div>
      <p>
        {tx(
          "Zeige Statuswechsel, Wasserhinweise und Champ. Die laufende Kultur bleibt unter deiner Kontrolle.",
        )}
      </p>
      <div className="demo-measurements">
        {(
          [
            {
              metric: "temperature",
              label: "Isttemperatur simulieren",
              min: 5,
              max: 40,
              step: 0.5,
              unit: "°C",
            },
            {
              metric: "humidity",
              label: "Istluftfeuchtigkeit simulieren",
              min: 30,
              max: 100,
              step: 1,
              unit: "%",
            },
            {
              metric: "co2",
              label: "CO₂ simulieren",
              min: 350,
              max: 3500,
              step: 50,
              unit: "ppm",
            },
          ] as const
        ).map((item) => (
          <div key={item.metric} className="demo-measurement">
            <span>
              {tx(item.label)}
              <strong>
                {formatNumber(
                  state.reading[item.metric],
                  item.metric === "temperature" ? 1 : 0,
                )}{" "}
                {item.unit}
              </strong>
            </span>
            <input
              aria-label={tx(item.label)}
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              disabled={!enabled}
              value={state.reading[item.metric]}
              onChange={(e) =>
                dispatch({
                  type: "SENSOR",
                  metric: item.metric,
                  value: Number(e.target.value),
                })
              }
            />
            <StepButtons label={item.label} value={state.reading[item.metric]} min={item.min} max={item.max} step={item.step} unit={item.unit} disabled={!enabled} onChange={value => dispatch({ type: "SENSOR", metric: item.metric, value })} />
            <small>
              {item.min}–{item.max} {item.unit}
            </small>
          </div>
        ))}
      </div>
      <div className="scenario-buttons">
        <button
          className="button button-outline"
          disabled={!enabled}
          onClick={() => {
            dispatch({ type: "DEMO_FRUITING" });
            notify("Fruchtungsphase im Demo-Modell erreicht.");
          }}
        >
          {tx("Fruchtungsphase demonstrieren")}
          <ArrowRight size={15} />
        </button>
        <button
          className="button button-outline warning-demo"
          disabled={!enabled || !range}
          onClick={() =>
            dispatch({
              type: "SENSOR",
              metric: "temperature",
              value: Math.min(
                45,
                range![1] +
                  Math.min(
                    experience.preferences.warning.temperatureCritical / 2,
                    1,
                  ),
              ),
            })
          }
        >
          <TriangleAlert size={15} />
          {tx("Gelben Zustand zeigen")}
        </button>
        <button
          className="button button-outline critical-demo"
          disabled={!enabled || !range}
          onClick={() =>
            dispatch({
              type: "SENSOR",
              metric: "temperature",
              value: Math.min(
                45,
                range![1] +
                  experience.preferences.warning.temperatureCritical +
                  2,
              ),
            })
          }
        >
          <TriangleAlert size={15} />
          {tx("Roten Zustand zeigen")}
        </button>
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("low")}
        >
          {tx("Wassermangel simulieren")}
        </button>
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("due")}
        >
          {tx("Wasserwechsel fällig")}
        </button>
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("empty")}
        >
          {tx("Leeren Tank simulieren")}
        </button>
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("unavailable")}
        >
          {tx("Füllstandsensor-Ausfall simulieren")}
        </button>
        <button
          className="button button-outline"
          disabled={!canControl} onClick={() => waterAction("restored")}
        >
          {tx("Füllstandsensor wiederherstellen")}
        </button>
        <button className="button button-outline" onClick={requestChampTour}>
          {tx("Tutorial mit Champ starten")}
        </button>
        <button
          className="button button-outline"
          onClick={(event) => {
            event.currentTarget.focus();
            setReset(true);
          }}
        >
          <RotateCcw size={15} />
          {tx("Betriebszustand zurücksetzen")}
        </button>
      </div>
      {!range && (
        <p className="verification-note">
          {tx(
            "Für Farbzustände benötigst du hinterlegte Bereiche. Starte eine Kultur und zeige die Fruchtungsphase. Stockschwämmchen bleibt mangels Daten grau.",
          )}
        </p>
      )}
      {reset && (
        <Modal
          title={tx("Betriebszustand zurücksetzen?")}
          onClose={() => setReset(false)}
          footer={
            <>
              <button
                className="button button-outline"
                onClick={() => setReset(false)}
              >
                {tx("Abbrechen")}
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  dispatch({ type: "RESET" });
                  resetDemo();
                  setReset(false);
                  notify("Die Ausgangsdemo wurde wiederhergestellt.");
                }}
              >
                {tx("Demo zurücksetzen")}
              </button>
            </>
          }
        >
          <p>
            {tx(
              "Deine aktive Kultur und ihr Verlauf werden durch die Ausgangsdemo ersetzt. Sprache und Barrierefreiheit bleiben erhalten.",
            )}
          </p>
        </Modal>
      )}
    </div>
  );
}
