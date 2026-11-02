import { DeviceSettings } from "../components/DeviceSettings";
import { ClimateHints, UvDetails } from "../components/Technology";
import { PhaseSuggestion } from "../experience/PhaseSuggestion";
import { demoDeviceProfile } from "../simulation/hardware";
import { WaterMaintenance } from "../experience/Monitoring";
import { useT } from "../i18n";
import { useEffect, useState } from "react";
import { Link, useBlocker } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CircleStop,
  Droplets,
  Leaf,
  Pause,
  Play,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Thermometer,
  WandSparkles,
} from "lucide-react";
import { getEntry, getProfile } from "../data/catalog";
import { useGrowbox } from "../state/GrowboxProvider";
import {
  percent,
  phaseAt,
  profileSettings,
  validateSettings,
} from "../simulation/engine";
import type { AppliedSettings } from "../types";
import { InfoNote, Modal, PageHeader, StatusBadge } from "../components/ui";
import { MushroomArt } from "../components/MushroomArt";
import { Alerts, EventLog, SensorCards } from "../components/Telemetry";
import { DemoScenarios } from "../components/DemoScenarios";
interface Draft extends Omit<AppliedSettings, "temperature" | "humidity"> {
  temperature: string;
  humidity: string;
}
const asDraft = (settings: AppliedSettings): Draft => ({
  ...settings,
  temperature: String(settings.temperature),
  humidity: String(settings.humidity),
});
const asSettings = (draft: Draft): AppliedSettings => ({
  ...draft,
  temperature: draft.temperature.trim() ? Number(draft.temperature) : NaN,
  humidity: draft.humidity.trim() ? Number(draft.humidity) : NaN,
});
export function GrowboxPage() {
  const tx = useT();
  const { state, dispatch, notify } = useGrowbox();
  const [draft, setDraft] = useState(() => asDraft(state.settings));
  const [ending, setEnding] = useState(false);
  const dirty =
    JSON.stringify(draft) !== JSON.stringify(asDraft(state.settings));
  const errors = validateSettings(asSettings(draft));
  const blocker = useBlocker(dirty);
  useEffect(() => {
    setDraft(asDraft(state.settings));
  }, [state.settings]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [dirty]);
  const entry = state.cycle ? getEntry(state.cycle.slug) : undefined;
  const editable =
    state.cycle && !["Beendet", "Abgeschlossen"].includes(state.cycle.status);
  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }));
  const apply = () => {
    if (!errors.length && dirty) {
      dispatch({ type: "APPLY", settings: asSettings(draft) });
      notify("Demo-Einstellungen übernommen.");
    }
  };
  return (
    <div className="page growbox-page">
      <PageHeader
        eyebrow={tx("DEIN KLEINES \u00D6KOSYSTEM")}
        title={tx("Meine Growbox")}
        description={tx(
          "Beobachte, probiere aus und finde heraus, wie deine virtuelle Kultur reagiert.",
        )}
        action={
          <span className="library-count">
            <SlidersHorizontal size={16} />
            {tx(state.settings.mode)}
          </span>
        }
      />
      <Alerts />
      {tx(
        entry ? (
          <>
            <section className="panel growbox-culture">
              <div className="growbox-culture-info">
                <div
                  className="mini-mushroom"
                  style={{ background: entry.background }}
                >
                  <MushroomArt entry={entry} />
                </div>
                <div>
                  <span className="eyebrow">{tx("AKTUELLE KULTUR")}</span>
                  <h2>
                    {tx(entry.name)}
                    <Link
                      to={`/pilze/${entry.slug}`}
                      aria-label={tx(`${entry.name}: Details`)}
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </h2>
                  <span className="culture-caption">
                    {tx("Beispielprofil \u00B7 ")}
                    {tx(getProfile(entry).days)}
                    {tx(" simulierte Tage")}
                  </span>
                </div>
                <StatusBadge status={state.cycle?.status} />
              </div>
              <div className="culture-actions">
                {tx(
                  state.cycle?.status === "Bereit" && (
                    <button
                      className="button button-primary"
                      onClick={() => {
                        dispatch({ type: "STATUS", status: "Läuft" });
                        notify(
                          "Demo gestartet. Zeitraffer: 5 Sekunden = 1 Demo-Stunde.",
                        );
                      }}
                    >
                      <Play size={16} />
                      {tx("Demo starten")}
                    </button>
                  ),
                )}
                {tx(
                  state.cycle?.status === "Läuft" && (
                    <button
                      className="button button-primary"
                      onClick={() =>
                        dispatch({ type: "STATUS", status: "Pausiert" })
                      }
                    >
                      <Pause size={16} />
                      {tx("Pausieren")}
                    </button>
                  ),
                )}
                {tx(
                  state.cycle?.status === "Pausiert" && (
                    <button
                      className="button button-primary"
                      onClick={() =>
                        dispatch({ type: "STATUS", status: "Läuft" })
                      }
                    >
                      <Play size={16} />
                      {tx("Fortsetzen")}
                    </button>
                  ),
                )}
                {tx(
                  editable && (
                    <button
                      className="button button-outline"
                      onClick={(event) => {
                        event.currentTarget.focus();
                        setEnding(true);
                      }}
                    >
                      <CircleStop size={16} />
                      {tx("Kultur beenden")}
                    </button>
                  ),
                )}
                <Link className="text-link" to="/pilze">
                  {tx("Neue Kultur ausw\u00E4hlen")}
                  <ArrowRight size={15} />
                </Link>
              </div>
            </section>
            <SensorCards />
            <section className="panel settings-panel" id="climate-settings">
              <div className="section-title">
                <div>
                  <h2>{tx("Ein Klima, das du verstehst.")}</h2>
                  <p className="section-description">
                    {tx(
                      "Bearbeite dein Beispielprofil und \u00FCbernimm die \u00C4nderungen bewusst.",
                    )}
                  </p>
                </div>
                <span className={`draft-badge ${dirty ? "dirty" : ""}`}>
                  {tx(
                    dirty ? (
                      "Nicht übernommene Änderungen"
                    ) : (
                      <>
                        <Check size={13} />
                        {tx("Alles \u00FCbernommen")}
                      </>
                    ),
                  )}
                </span>
              </div>
              <fieldset disabled={!editable} className="settings-fieldset">
                <legend className="sr-only">{tx("Demo-Einstellungen")}</legend>
                <div className="mode-row">
                  <div>
                    <strong>
                      <WandSparkles size={17} />
                      {tx("Dein Steuerungsmodus")}
                    </strong>
                    <p>
                      {tx(
                        draft.mode === "Automatik"
                          ? "Das Demo-Profil regelt Klima, Umluft, Frischluft und sichtbares Licht automatisch."
                          : "Du entwirfst Geräteeinstellungen selbst. Erst Übernehmen aktiviert deine Änderungen.",
                      )}
                    </p>
                  </div>
                  <div className="segmented mode-segment">
                    {tx(
                      (["Automatik", "Manuell"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          aria-pressed={draft.mode === mode}
                          onClick={() =>
                            setDraft((previous) => ({
                              ...previous,
                              mode,
                              ...(mode === "Automatik"
                                ? demoDeviceProfile(phaseAt(percent(state)))
                                : {}),
                            }))
                          }
                          className={draft.mode === mode ? "selected" : ""}
                        >
                          {tx(
                            mode === "Automatik" ? (
                              <WandSparkles size={14} />
                            ) : (
                              <SlidersHorizontal size={14} />
                            ),
                          )}
                          {tx(" ")}
                          {tx(mode)}
                        </button>
                      )),
                    )}
                  </div>
                </div>
                <PhaseSuggestion
                  onLoad={(settings) => setDraft(asDraft(settings))}
                />
                <div className="settings-grid">
                  <div className="setting-control">
                    <label htmlFor="temperature-number">
                      <span className="sensor-icon peach">
                        <Thermometer size={20} />
                      </span>
                      <span>
                        <strong>{tx("Demo-Solltemperatur")}</strong>
                        <small>{tx("Bedienbereich 10\u201330 \u00B0C")}</small>
                      </span>
                    </label>
                    <div className="number-field">
                      <input
                        id="temperature-number"
                        type="number"
                        min="10"
                        max="30"
                        step="0.5"
                        value={draft.temperature}
                        aria-invalid={errors.some((error) =>
                          error.startsWith("Temperatur"),
                        )}
                        aria-describedby={
                          errors.some((error) => error.startsWith("Temperatur"))
                            ? "temperature-error"
                            : undefined
                        }
                        onChange={(event) =>
                          setField("temperature", event.target.value)
                        }
                      />
                      <span>{tx("\u00B0C")}</span>
                    </div>
                    <input
                      aria-label={tx("Demo-Solltemperatur per Slider")}
                      className="slider peach-slider"
                      type="range"
                      min="10"
                      max="30"
                      step="0.5"
                      value={Number(draft.temperature) || 10}
                      onChange={(event) =>
                        setField("temperature", event.target.value)
                      }
                    />
                    <div className="range-labels">
                      <span>{tx("10 \u00B0C")}</span>
                      <span>{tx("30 \u00B0C")}</span>
                    </div>
                    {tx(
                      errors
                        .filter((error) => error.startsWith("Temperatur"))
                        .map((error) => (
                          <p
                            id="temperature-error"
                            className="field-error"
                            key={error}
                          >
                            {tx(error)}
                          </p>
                        )),
                    )}
                  </div>
                  <div className="setting-control">
                    <label htmlFor="humidity-number">
                      <span className="sensor-icon blue">
                        <Droplets size={20} />
                      </span>
                      <span>
                        <strong>{tx("Demo-Sollluftfeuchtigkeit")}</strong>
                        <small>{tx("Bedienbereich 60\u201395 %")}</small>
                      </span>
                    </label>
                    <div className="number-field">
                      <input
                        id="humidity-number"
                        type="number"
                        min="60"
                        max="95"
                        step="1"
                        value={draft.humidity}
                        aria-invalid={errors.some((error) =>
                          error.startsWith("Luftfeuchtigkeit"),
                        )}
                        aria-describedby={
                          errors.some((error) =>
                            error.startsWith("Luftfeuchtigkeit"),
                          )
                            ? "humidity-error"
                            : undefined
                        }
                        onChange={(event) =>
                          setField("humidity", event.target.value)
                        }
                      />
                      <span>{tx("%")}</span>
                    </div>
                    <input
                      aria-label={tx("Demo-Sollluftfeuchtigkeit per Slider")}
                      className="slider blue-slider"
                      type="range"
                      min="60"
                      max="95"
                      step="1"
                      value={Number(draft.humidity) || 60}
                      onChange={(event) =>
                        setField("humidity", event.target.value)
                      }
                    />
                    <div className="range-labels">
                      <span>{tx("60 %")}</span>
                      <span>{tx("95 %")}</span>
                    </div>
                    {tx(
                      errors
                        .filter((error) => error.startsWith("Luftfeuchtigkeit"))
                        .map((error) => (
                          <p
                            id="humidity-error"
                            className="field-error"
                            key={error}
                          >
                            {tx(error)}
                          </p>
                        )),
                    )}
                  </div>
                </div>
                <DeviceSettings
                  draft={draft}
                  errors={errors}
                  onChange={(patch) =>
                    setDraft((previous) => ({ ...previous, ...patch }))
                  }
                />
                <div className="settings-footer">
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setDraft(asDraft(profileSettings(entry.slug)));
                      notify(
                        "Pilzprofil in den Entwurf geladen. Zum Anwenden bitte übernehmen.",
                      );
                    }}
                  >
                    <RotateCcw size={15} />
                    {tx("Pilzprofil laden")}
                  </button>
                  <div>
                    <button
                      type="button"
                      className="button button-outline"
                      disabled={!dirty}
                      onClick={() => setDraft(asDraft(state.settings))}
                    >
                      {tx("\u00C4nderungen verwerfen")}
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      disabled={!dirty || errors.length > 0}
                      onClick={apply}
                    >
                      <Save size={16} />
                      {tx("Einstellungen \u00FCbernehmen")}
                    </button>
                  </div>
                </div>
              </fieldset>
              {tx(
                !editable && (
                  <InfoNote>
                    {tx("Diese Kultur ist ")}
                    {tx(state.cycle?.status?.toLowerCase())}
                    {tx(
                      ". W\u00E4hle eine neue Kultur, um weitere Einstellungen zu testen.",
                    )}
                  </InfoNote>
                ),
              )}
            </section>
            <InfoNote>
              {tx(
                "Bediengrenzen und Vergleichsbereiche sind synthetisch und keine Anbauempfehlung. Im Automatikmodell bewegen sich die Messwerte schrittweise auf die \u00FCbernommenen Sollwerte zu.",
              )}
            </InfoNote>
            <WaterMaintenance />
            <ClimateHints />
            <UvDetails />
            <DemoScenarios />
            <EventLog />
          </>
        ) : (
          <div className="empty-state">
            <Leaf size={35} />
            <h2>{tx("Deine Growbox wartet auf den ersten Pilz.")}</h2>
            <p>
              {tx(
                "W\u00E4hle ein Beispielprofil und bereite deine virtuelle Kultur vor.",
              )}
            </p>
            <Link to="/pilze" className="button button-primary">
              {tx("Pilz ausw\u00E4hlen")}
              <ArrowRight size={16} />
            </Link>
          </div>
        ),
      )}
      {tx(
        ending && (
          <Modal
            title={tx("Kultur wirklich beenden?")}
            onClose={() => setEnding(false)}
            footer={
              <>
                <button
                  className="button button-outline"
                  onClick={() => setEnding(false)}
                >
                  {tx("Abbrechen")}
                </button>
                <button
                  className="button button-danger"
                  onClick={() => {
                    dispatch({ type: "STATUS", status: "Beendet" });
                    setEnding(false);
                    setDraft(asDraft(state.settings));
                    notify(
                      "Kultur beendet. Die letzten Demo-Werte bleiben sichtbar.",
                    );
                  }}
                >
                  {tx("Kultur beenden")}
                </button>
              </>
            }
          >
            <p>
              {tx(
                "Die Simulation stoppt. Deine letzten Werte und Ereignisse bleiben erhalten. Du kannst anschlie\u00DFend eine neue Kultur ausw\u00E4hlen.",
              )}
            </p>
          </Modal>
        ),
      )}
      {tx(
        blocker.state === "blocked" && (
          <Modal
            title={tx("Du hast noch einen Entwurf.")}
            onClose={() => blocker.reset()}
            footer={
              <>
                <button
                  className="button button-outline"
                  onClick={() => blocker.reset()}
                >
                  {tx("Weiter bearbeiten")}
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setDraft(asDraft(state.settings));
                    blocker.proceed();
                  }}
                >
                  {tx("\u00C4nderungen verwerfen")}
                  <ArrowRight size={16} />
                </button>
              </>
            }
          >
            <p>
              {tx(
                "Deine \u00C4nderungen wurden noch nicht \u00FCbernommen. M\u00F6chtest du sie weiter bearbeiten oder verwerfen und die Seite verlassen?",
              )}
            </p>
          </Modal>
        ),
      )}
    </div>
  );
}
