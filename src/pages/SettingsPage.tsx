import { useState } from "react";
import {
  Accessibility,
  Bell,
  BookOpen,
  Check,
  Contrast,
  Globe2,
  Type,
  Volume2,
} from "lucide-react";
import { PageHeader, Toggle, InfoNote } from "../components/ui";
import { useExperience } from "../experience/ExperienceProvider";
import { useSpeech } from "../experience/Speech";
import { requestChampTour } from "../experience/Champ";
import { useGrowbox } from "../state/GrowboxProvider";
import { useT } from "../i18n";
import type { Language, WarningConfig } from "../experience/model";
export function LanguageSelect({ id = "header-language" }: { id?: string }) {
  const tx = useT();
  const { experience, setPreferences } = useExperience();
  return (
    <label className="language-select" htmlFor={id}>
      <Globe2 size={16} />
      <span className="sr-only">{tx("Sprache")}</span>
      <select
        id={id}
        value={experience.preferences.language}
        onChange={(event) =>
          setPreferences({ language: event.target.value as Language })
        }
      >
        <option value="de">Deutsch</option>
        <option value="en">English</option>
        <option value="fa">فارسی</option>
      </select>
    </label>
  );
}
export function SettingsPage() {
  const tx = useT();
  const { experience, setPreferences } = useExperience();
  const { notify } = useGrowbox();
  const speech = useSpeech();
  const p = experience.preferences;
  const [warning, setWarning] = useState<WarningConfig>({ ...p.warning });
  const [interval, setIntervalDraft] = useState(String(p.waterIntervalDays));
  const warningValid =
    Number.isFinite(warning.temperatureCritical) &&
    warning.temperatureCritical >= 0.5 &&
    warning.temperatureCritical <= 10 &&
    Number.isFinite(warning.humidityCritical) &&
    warning.humidityCritical >= 2 &&
    warning.humidityCritical <= 20 &&
    Number.isFinite(warning.co2Limit) &&
    warning.co2Limit >= 500 &&
    warning.co2Limit <= 5000 &&
    Number.isFinite(warning.co2Critical) &&
    warning.co2Critical >= 100 &&
    warning.co2Critical <= 2000;
  const intervalValid =
    Number.isInteger(Number(interval)) &&
    Number(interval) >= 1 &&
    Number(interval) <= 30;
  const change = (patch: Parameters<typeof setPreferences>[0]) => {
    setPreferences(patch);
    notify("Einstellungen gespeichert.");
  };
  return (
    <div className="page preferences-page">
      <PageHeader
        eyebrow={tx("DEINE MYCOBOX. DEINE BEDIENUNG.")}
        title={tx("Einstellungen")}
        description={tx(
          "Passe Sprache, Darstellung und die simulierten Hinweise an deine Bedürfnisse an.",
        )}
        action={
          <span className="draft-badge">
            <Check size={14} />
            {tx("Auf diesem Gerät gespeichert")}
          </span>
        }
      />
      <section className="panel language-setting">
        <div className="settings-section-heading">
          <span className="icon-tile">
            <Globe2 size={22} />
          </span>
          <div>
            <h2>{tx("Sprache & Leserichtung")}</h2>
            <p>
              {tx(
                "Deutsch, Englisch oder Persisch. Persisch wird von rechts nach links dargestellt.",
              )}
            </p>
          </div>
        </div>
        <LanguageSelect id="settings-language" />
      </section>
      <section className="panel">
        <div className="settings-section-heading">
          <span className="icon-tile">
            <Accessibility size={22} />
          </span>
          <div>
            <h2>{tx("Gut lesbar. Leicht bedienbar.")}</h2>
            <p>
              {tx(
                "Alle Optionen wirken sofort und bleiben auf diesem Gerät gespeichert.",
              )}
            </p>
          </div>
        </div>
        <div className="preference-row">
          <div>
            <strong>
              <Type size={17} />
              {tx("Schriftgröße")}
            </strong>
            <p>{tx("Vergrößere Texte, ohne Inhalte auszublenden.")}</p>
          </div>
          <div className="segmented">
            {[1, 1.15, 1.3].map((scale) => (
              <button
                key={scale}
                aria-pressed={p.fontScale === scale}
                className={p.fontScale === scale ? "selected" : ""}
                onClick={() => change({ fontScale: scale })}
              >
                {scale === 1
                  ? tx("Standard")
                  : scale === 1.15
                    ? tx("Groß")
                    : tx("Sehr groß")}
              </button>
            ))}
          </div>
        </div>
        <div className="preference-row">
          <div>
            <strong>
              <Contrast size={17} />
              {tx("Hoher Kontrast")}
            </strong>
            <p>
              {tx(
                "Stärkere Kontraste, klare Konturen und gut sichtbare Zustände.",
              )}
            </p>
          </div>
          <Toggle
            label={tx("Hoher Kontrast")}
            checked={p.highContrast}
            onChange={() => change({ highContrast: !p.highContrast })}
          />
        </div>
        <div className="preference-row">
          <div>
            <strong>
              <BookOpen size={17} />
              {tx("Einfache Sprache")}
            </strong>
            <p>
              {tx(
                "Kürzere Erklärungen, größere Schaltflächen und weniger Ablenkung.",
              )}
            </p>
          </div>
          <Toggle
            label={tx("Einfache Sprache")}
            checked={p.easyLanguage}
            onChange={() => change({ easyLanguage: !p.easyLanguage })}
          />
        </div>
      </section>
      <section className="panel speech-setting">
        <div className="settings-section-heading">
          <span className="icon-tile">
            <Volume2 size={22} />
          </span>
          <div>
            <h2>{tx("Vorlesefunktion")}</h2>
            <p>
              {tx(
                "Eine zusätzliche Hilfe. Tastatur und Screenreader bleiben unabhängig nutzbar.",
              )}
            </p>
          </div>
        </div>
        <div className="preference-row">
          <div>
            <strong>{tx("Vorlesen aktivieren")}</strong>
            <p>
              {tx(
                "Die Vorleseleiste bietet Start, Pause, Fortsetzen, Stopp und Wiederholen.",
              )}
            </p>
          </div>
          <Toggle
            label={tx("Vorlesen aktivieren")}
            checked={p.readerEnabled}
            onChange={() => change({ readerEnabled: !p.readerEnabled })}
          />
        </div>
        <div className="preference-row">
          <label htmlFor="speech-rate">{tx("Vorlesegeschwindigkeit")}</label>
          <select
            id="speech-rate"
            className="setting-select"
            value={p.speechRate}
            onChange={(event) => {
              speech.stop();
              change({ speechRate: Number(event.target.value) });
            }}
          >
            {[0.6, 0.8, 1, 1.2, 1.4, 1.6].map((rate) => (
              <option key={rate} value={rate}>
                {rate}×
              </option>
            ))}
          </select>
        </div>
        <InfoNote>
          {tx(
            speech.supported
              ? "Die Sprachausgabe verwendet verfügbare Gerätestimmen. Wenn Wortgrenzen fehlen, wird der aktuelle Abschnitt markiert. Stimmen und Sprachunterstützung hängen vom Browser und Gerät ab."
              : "Dein Browser unterstützt die Vorlesefunktion nicht. Tastatur und Screenreader bleiben nutzbar.",
          )}
        </InfoNote>
        <button
          className="button button-outline"
          disabled={!p.readerEnabled || !speech.supported}
          onClick={speech.start}
        >
          <Volume2 size={16} />
          {tx("Vorlesefunktion testen")}
        </button>
      </section>
      <section className="panel">
        <div className="settings-section-heading">
          <span className="icon-tile">
            <Bell size={22} />
          </span>
          <div>
            <h2>{tx("Benachrichtigungen & Wasser")}</h2>
            <p>
              {tx(
                "Interne Meldungen für simulierte Ereignisse. Es werden keine Browser-Berechtigungen angefordert.",
              )}
            </p>
          </div>
        </div>
        <div className="preference-row">
          <div>
            <strong>{tx("Benachrichtigungen aktivieren")}</strong>
            <p>
              {tx(
                "Wenn deaktiviert, werden keine neuen Meldungen gesammelt. Vorhandene bleiben lesbar.",
              )}
            </p>
          </div>
          <Toggle
            label={tx("Benachrichtigungen aktivieren")}
            checked={p.notificationsEnabled}
            onChange={() =>
              change({ notificationsEnabled: !p.notificationsEnabled })
            }
          />
        </div>
        <div className="preference-row">
          <div>
            <label htmlFor="water-interval">
              {tx("Wasserwechselintervall in Demo-Tagen")}
            </label>
            <p>
              {tx(
                "Ein frei konfigurierbares Demo-Intervall, keine Empfehlung für echte Systeme.",
              )}
            </p>
          </div>
          <input
            id="water-interval"
            className="setting-number"
            type="number"
            min="1"
            max="30"
            step="1"
            value={interval}
            onChange={(e) => setIntervalDraft(e.target.value)}
            aria-invalid={!intervalValid}
          />
        </div>
        {!intervalValid && (
          <p className="field-error">
            {tx("Bitte gib eine ganze Zahl von 1 bis 30 Tagen ein.")}
          </p>
        )}
        <button
          className="button button-outline"
          disabled={!intervalValid || Number(interval) === p.waterIntervalDays}
          onClick={() => change({ waterIntervalDays: Number(interval) })}
        >
          {tx("Intervall speichern")}
        </button>
      </section>
      <section className="panel warning-settings">
        <h2>{tx("Warnschwellen im Demo-Modell")}</h2>
        <p>
          {tx(
            "Gelb beginnt außerhalb des vorgesehenen Bereichs. Rot beginnt ab der hier eingestellten zusätzlichen Abweichung. Diese Schwellen sind keine Hardware-Sicherheitsgrenzen.",
          )}
        </p>
        <div className="preference-row">
          <div>
            <strong>{tx("Vorläufige Bereiche als Demo vergleichen")}</strong>
            <p>
              {tx(
                "Ausgeschaltet bleiben ungeprüfte Bereiche grau. Ohne Daten gibt es auch im Demo-Modus keine grüne Bewertung.",
              )}
            </p>
          </div>
          <Toggle
            label={tx("Vorläufige Bereiche als Demo vergleichen")}
            checked={warning.provisionalDemo}
            onChange={() =>
              setWarning({
                ...warning,
                provisionalDemo: !warning.provisionalDemo,
              })
            }
          />
        </div>
        <div className="warning-inputs">
          {(
            [
              {
                key: "temperatureCritical",
                label: "Starke Temperaturabweichung ab (°C)",
                min: 0.5,
                max: 10,
                step: 0.5,
              },
              {
                key: "humidityCritical",
                label: "Starke Feuchteabweichung ab (Prozentpunkte)",
                min: 2,
                max: 20,
                step: 1,
              },
              {
                key: "co2Limit",
                label: "CO₂-Hinweisgrenze (ppm)",
                min: 500,
                max: 5000,
                step: 50,
              },
              {
                key: "co2Critical",
                label: "Starke CO₂-Abweichung über der Grenze (ppm)",
                min: 100,
                max: 2000,
                step: 50,
              },
            ] as const
          ).map((field) => (
            <label key={field.key} htmlFor={`warning-${field.key}`}>
              <span>{tx(field.label)}</span>
              <input
                id={`warning-${field.key}`}
                type="number"
                value={
                  Number.isFinite(warning[field.key]) ? warning[field.key] : ""
                }
                min={field.min}
                max={field.max}
                step={field.step}
                onChange={(event) =>
                  setWarning({
                    ...warning,
                    [field.key]: event.target.value.trim()
                      ? Number(event.target.value)
                      : NaN,
                  })
                }
              />
              <small>
                {field.min}–{field.max}
              </small>
            </label>
          ))}
        </div>
        {!warningValid && (
          <p className="field-error">
            {tx(
              "Bitte halte die angezeigten Bereiche ein. Leere oder ungültige Werte können nicht gespeichert werden.",
            )}
          </p>
        )}
        <button
          className="button button-primary"
          disabled={
            !warningValid ||
            JSON.stringify(warning) === JSON.stringify(p.warning)
          }
          onClick={() => change({ warning: { ...warning } })}
        >
          {tx("Warnschwellen speichern")}
        </button>
        <p className="verification-note">
          {tx(
            "Eine kleine Hysterese verhindert schnelle Farbwechsel an den Bereichsgrenzen.",
          )}
        </p>
      </section>
      <section className="reset-panel">
        <div>
          <h2>{tx("Champ ist für dich da.")}</h2>
          <p>{tx("Du kannst die Einführung jederzeit erneut starten.")}</p>
        </div>
        <button className="button button-primary" onClick={requestChampTour}>
          {tx("Tutorial mit Champ starten")}
        </button>
      </section>
    </div>
  );
}
