import { StepButtons } from "./StepButtons";
import { Fan, Wind, Lightbulb } from "lucide-react";
import { useGrowbox } from "../state/GrowboxProvider";
import { useT } from "../i18n";
import {
  deviceState,
  demoDeviceProfile,
  FAN_LABELS,
} from "../simulation/hardware";
import { formatNumber } from "../simulation/engine";
import { Toggle } from "./ui";
import type { AppliedSettings, FanSpeed } from "../types";
export type DeviceDraft = Pick<
  AppliedSettings,
  | "circulation"
  | "freshAir"
  | "light"
  | "brightness"
  | "lightStart"
  | "lightEnd"
  | "mode"
>;
export function DeviceSettings({
  draft,
  onChange,
  errors,
}: {
  draft: DeviceDraft;
  onChange: (patch: Partial<DeviceDraft>) => void;
  errors: string[];
}) {
  const tx = useT();
  const { state } = useGrowbox();
  const actual = deviceState(state);
  const { canControl } = useGrowbox();
  const auto = draft.mode === "Automatik";
  const shown = auto ? { ...draft, ...demoDeviceProfile(actual.phase) } : draft;
  return (
    <div className="device-settings">
      <details className="device-settings-group" open id="air-settings">
        <summary>{tx("Luftzirkulation")}</summary>
        <p>
          {tx(
            "Gerätestatus zeigt die aktuell ausgeführte Aktion. Bedienelemente darunter ändern zunächst nur den Entwurf.",
          )}
        </p>
        <div className="air-device-grid">
          {(
            [
              {
                key: "circulation",
                title: "Umluft",
                description: "Luftbewegung innerhalb der Growbox",
                icon: Fan,
              },
              {
                key: "freshAir",
                title: "Frischluft",
                description: "Luftaustausch mit der Umgebung",
                icon: Wind,
              },
            ] as const
          ).map(({ key, title, description, icon: Icon }) => (
            <div className="air-device" key={key}>
              <Icon size={22} />
              <h3>{tx(title)}</h3>
              <p>{tx(description)}</p>
              <span className="device-status-label">
                {tx(canControl ? "Gerät · aktuell" : "Offline: zuletzt bekannter Gerätestatus")}:{" "}
                <strong>{tx(FAN_LABELS[actual[key]])}</strong>
              </span>
              <label htmlFor={`${key}-setting`}>
                {tx(title)} · {tx("Entwurf")}
              </label>
              <select
                id={`${key}-setting`}
                disabled={auto}
                value={shown[key]}
                onChange={(e) =>
                  onChange({ [key]: Number(e.target.value) as FanSpeed })
                }
              >
                {FAN_LABELS.map((label, speed) => (
                  <option key={label} value={speed}>
                    {tx(label)}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {auto && (
          <p className="verification-note">
            {tx(
              "Manuelle Bedienung deaktiviert: Im Automatikmodus übernimmt das Demo-Profil Umluft und Frischluft. Bei erhöhtem CO₂ wird der Frischluftaustausch verstärkt.",
            )}
          </p>
        )}
        <p className="verification-note">
          {tx(
            "Vereinfachtes Demo-Modell: Frischluft beeinflusst CO₂, Umluft die Annäherung der Temperatur. Es wird keine physikalisch exakte Simulation behauptet.",
          )}
        </p>
      </details>
      <details className="device-settings-group" open id="light-settings">
        <summary>{tx("Beleuchtung – sichtbares Licht")}</summary>
        <div className="light-status">
          <Lightbulb size={23} />
          <div>
            <strong>
              {tx(canControl ? "Gerät · aktuell" : "Offline: zuletzt bekannter Gerätestatus")}: {tx(actual.lightOn ? "An" : "Aus")} ·{" "}
              {formatNumber(actual.brightness)} %
            </strong>
            <p>
              {tx("Übernommener Zeitraum")}: {actual.lightStart}–
              {actual.lightEnd} · {tx("Demo-Zeit")}
            </p>
          </div>
        </div>
        <fieldset disabled={auto} className="light-draft">
          <legend>{tx("Licht · Entwurf")}</legend>
          <div className="light-toggle-row">
            <span>{tx("Beleuchtung einschalten")}</span>
            <Toggle
              label={tx("Beleuchtung einschalten")}
              checked={shown.light}
              onChange={() => onChange({ light: !draft.light })}
              disabled={auto}
            />
          </div>
          <label htmlFor="brightness-setting">
            {tx("Helligkeit")}: {formatNumber(shown.brightness)} %
          </label>
          <input
            id="brightness-setting"
            type="range"
            min="0"
            max="100"
            step="1"
            value={shown.brightness}
            onChange={(e) => onChange({ brightness: Number(e.target.value) })}
          />
          <StepButtons label="Helligkeit" value={shown.brightness} min={0} max={100} step={1} unit="%" disabled={auto} onChange={brightness => onChange({ brightness })} />
          <div className="light-time-fields">
            <label htmlFor="light-start">
              {tx("Beginn")}
              <input
                id="light-start"
                type="time"
                value={shown.lightStart}
                aria-invalid={errors.some((e) => e.startsWith("Lichtzeit"))}
                aria-describedby="light-time-feedback"
                onChange={(e) => onChange({ lightStart: e.target.value })}
              />
            </label>
            <label htmlFor="light-end">
              {tx("Ende")}
              <input
                id="light-end"
                type="time"
                value={shown.lightEnd}
                aria-invalid={errors.some((e) => e.startsWith("Lichtzeit"))}
                aria-describedby="light-time-feedback"
                onChange={(e) => onChange({ lightEnd: e.target.value })}
              />
            </label>
          </div>
        </fieldset>
        <div id="light-time-feedback">
          {errors
            .filter(
              (e) => e.startsWith("Lichtzeit") || e.startsWith("Beleuchtung"),
            )
            .map((e) => (
              <p role="alert" key={e} className="field-error">
                {tx(e)}
              </p>
            ))}
        </div>
        <p className="verification-note">
          {tx(
            auto
              ? "Das aktuelle Demo-Phasenprofil steuert Licht, Helligkeit und Zeitraum. Manuelle Lichtfelder sind deaktiviert."
              : "Zeiträume über Mitternacht sind möglich, zum Beispiel 20:00–08:00. Licht ist nur innerhalb des Zeitraums und bei Helligkeit über 0 % an. Erst Übernehmen aktiviert den Entwurf.",
          )}
        </p>
        {!actual.running && (
          <p className="verification-note">
            {tx(
              "Die Simulation läuft gerade nicht. Geräte und Wasserförderung führen keine Aktion aus.",
            )}
          </p>
        )}
      </details>
    </div>
  );
}
