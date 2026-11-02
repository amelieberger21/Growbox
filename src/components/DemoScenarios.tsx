import { PresentationTools } from "../experience/Presentation";
import { useT } from "../i18n";
import {
  ChevronDown,
  FastForward,
  FlaskConical,
  Thermometer,
  Droplets,
  Wind,
  Check,
} from "lucide-react";
import { useGrowbox } from "../state/GrowboxProvider";
import type { Scenario } from "../simulation/engine";
export function DemoScenarios() {
  const tx = useT();
  const { state, dispatch, notify } = useGrowbox();
  const enabled = state.cycle?.status === "Läuft";
  const activate = (scenario: Scenario) => {
    dispatch({ type: "SCENARIO", scenario });
    notify(
      scenario === "normal"
        ? "Normalbetrieb wiederhergestellt."
        : "Simulierte Abweichung aktiviert. Der Hinweis ist jetzt sichtbar.",
    );
  };
  return (
    <details className="demo-scenarios panel">
      <summary>
        <span className="icon-tile">
          <FlaskConical size={18} />
        </span>
        <span>
          <strong>{tx("Demo-Szenarien")}</strong>
          <small>
            {tx("Einmal ausprobieren. Zusammenh\u00E4nge verstehen.")}
          </small>
        </span>
        <ChevronDown size={18} />
      </summary>
      <div className="scenario-content">
        <p>
          {tx(
            "Erzeuge bewusst eine simulierte Abweichung. Alle \u00C4nderungen betreffen nur die virtuelle Growbox.",
          )}
        </p>
        <PresentationTools />
        <div className="scenario-buttons">
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("normal")}
          >
            <Check size={16} />
            {tx("Normalbetrieb")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("humidity")}
          >
            <Droplets size={16} />
            {tx("Luftfeuchtigkeit zu niedrig")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("temperature")}
          >
            <Thermometer size={16} />
            {tx("Temperatur zu hoch")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("co2")}
          >
            <Wind size={16} />
            {tx("CO\u2082 erh\u00F6ht")}
          </button>
          <button
            className="button button-primary"
            disabled={!enabled}
            onClick={() => {
              dispatch({ type: "TICK", hours: 24 });
              notify("Ein Demo-Tag wurde vorgespult.");
            }}
          >
            <FastForward size={16} />
            {tx("Einen Demo-Tag vorspulen")}
          </button>
        </div>
        {tx(
          !enabled && (
            <p className="verification-note">
              {tx(
                "Starte die Demo oder setze sie fort, um Szenarien und Zeitraffer zu nutzen.",
              )}
            </p>
          ),
        )}
      </div>
    </details>
  );
}
