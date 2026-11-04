import { HelpButton } from "./HelpButton";
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
  const { state, dispatch, notify, canControl } = useGrowbox();
  const enabled = canControl && state.cycle?.status === "Läuft";
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
      <summary aria-label={tx("Demo-Szenarien")} title={tx("Demo-Szenarien")}>
        <span className="icon-tile">
          <FlaskConical size={18}  aria-hidden="true" />
        </span>
        <span>
          <strong>{tx("Demo-Szenarien")}</strong>
          <small>
            {tx("Einmal ausprobieren. Zusammenh\u00E4nge verstehen.")}
          </small>
        </span>
        <ChevronDown size={18}  aria-hidden="true" />
      </summary>
      <div className="scenario-content"><HelpButton topic="scenarios"/>
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
           aria-label={tx("Normalbetrieb")} title={tx("Normalbetrieb")}>
            <Check size={16}  aria-hidden="true" />
            {tx("Normalbetrieb")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("humidity")}
           aria-label={tx("Luftfeuchtigkeit zu niedrig")} title={tx("Luftfeuchtigkeit zu niedrig")}>
            <Droplets size={16}  aria-hidden="true" />
            {tx("Luftfeuchtigkeit zu niedrig")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("temperature")}
           aria-label={tx("Temperatur zu hoch")} title={tx("Temperatur zu hoch")}>
            <Thermometer size={16}  aria-hidden="true" />
            {tx("Temperatur zu hoch")}
          </button>
          <button
            className="button button-outline"
            disabled={!enabled}
            onClick={() => activate("co2")}
           aria-label={tx("CO\u2082 erh\u00F6ht")} title={tx("CO\u2082 erh\u00F6ht")}>
            <Wind size={16}  aria-hidden="true" />
            {tx("CO\u2082 erh\u00F6ht")}
          </button>
          <button
            className="button button-primary"
            disabled={!enabled}
            onClick={() => {
              dispatch({ type: "TICK", hours: 24 });
              notify("Ein Demo-Tag wurde vorgespult.");
            }}
           aria-label={tx("Einen Demo-Tag vorspulen")} title={tx("Einen Demo-Tag vorspulen")}>
            <FastForward size={16}  aria-hidden="true" />
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
