import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Droplets,
  Container,
  Fan,
  Lightbulb,
  TriangleAlert,
  Wind,
  ShieldQuestion,
  ArrowRight,
} from "lucide-react";
import { useGrowbox } from "../state/GrowboxProvider";
import { useExperience } from "../experience/ExperienceProvider";
import { deviceState, FAN_LABELS, TANK_LABELS } from "../simulation/hardware";
import { demoTime, formatNumber } from "../simulation/engine";
import { useT } from "../i18n";
import { InfoNote, Modal } from "./ui";

export function TechnologySummary() {
  const tx = useT();
  const { state, canControl } = useGrowbox();
  const { experience } = useExperience();
  const devices = deviceState(state);
  const active =
    experience.activeConditions.length +
    (state.observation && state.observation.acknowledgedAt === null ? 1 : 0);
  const cards = [
    {
      name: "Umluft",
      value: tx(FAN_LABELS[devices.circulation]),
      icon: Fan,
      target: "air-settings",
    },
    {
      name: "Frischluft",
      value: tx(FAN_LABELS[devices.freshAir]),
      icon: Wind,
      target: "air-settings",
    },
    {
      name: "Beleuchtung",
      value: `${tx(devices.lightOn ? "An" : "Aus")} · ${formatNumber(devices.brightness)} %`,
      icon: Lightbulb,
      target: "light-settings",
    },
    {
      name: "Tankfüllstand",
      value: `${state.water.level === null ? "–" : `${formatNumber(state.water.level)} %`} · ${tx(TANK_LABELS[devices.water])}`,
      icon: Container,
      target: "water-maintenance",
    },
    {
      name: "Aktive Hinweise",
      value: String(active),
      icon: active ? TriangleAlert : Check,
      target: "climate-hints",
    },
  ];
  return (
    <section
      className="technology-summary"
      aria-label={tx("Technik im Überblick")}
    >
      <div className="section-title">
        <h2>{tx("Technik im Überblick")}</h2>
        <span className="muted-tag">{tx(canControl?"Simulierte Geräte":"Offline: zuletzt bekannter Gerätestatus")}</span>
      </div>
      <div className="technology-grid">
        {cards.map(({ name, value, icon: Icon, target }) => (
          <Link
            className="technology-card"
            key={name}
            to={`/growbox#${target}`}
            aria-label={`${tx(name)}: ${value}`}
            title={`${tx(name)}: ${value}`}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{tx(name)}</span>
            <strong>{value}</strong>
            <ArrowRight size={14}  aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
export function ClimateHints() {
  const tx = useT();
  const { state, dispatch, notify, canControl } = useGrowbox();
  const { experience } = useExperience();
  const [report, setReport] = useState(false);
  const devices = deviceState(state);
  const humidity = experience.assessments.humidity;
  const co2 = experience.assessments.co2;
  const temperature = experience.assessments.temperature;
  const waterDue =
    demoTime(state) - state.water.lastChanged >=
    experience.preferences.waterIntervalDays * 86400000;
  const humidityAlert = ["warning", "critical"].includes(humidity.level);
  const airAlert = ["warning", "critical"].includes(co2.level);
  return (
    <section className="panel climate-hints" id="climate-hints">
      <div className="section-title">
        <h2>
          <ShieldQuestion size={20}  aria-hidden="true" />
          {tx("Schimmelvorsorge & Klimahinweise")}
        </h2>
        <span className="muted-tag">{tx("Demo-Regeln")}</span>
      </div>
      {["warning", "critical"].includes(temperature.level) && (
        <div className="technical-hint">
          <TriangleAlert size={19}  aria-hidden="true" />
          <div>
            <strong>{tx("Temperatur außerhalb des Demo-Bereichs")}</strong>
            <p>
              {tx(
                temperature.direction === "low"
                  ? "Wert zu niedrig"
                  : "Wert zu hoch",
              )}
            </p>
            <Link to="/growbox#climate-settings" className="text-link" aria-label={tx("Demo-Solltemperatur")} title={tx("Demo-Solltemperatur")}>
              {tx("Demo-Solltemperatur")}
              <ArrowRight size={15}  aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
      {(devices.water !== "sufficient" || waterDue) && (
        <div className="technical-hint">
          <Droplets size={19}  aria-hidden="true" />
          <div>
            <strong>{tx("Wasserwartung")}</strong>
            <p>
              {tx(TANK_LABELS[devices.water])}
              {waterDue && <> · {tx("Fällig")}</>}
            </p>
            <Link className="text-link" to="/growbox#water-maintenance" aria-label={tx("Wasserwartung")} title={tx("Wasserwartung")}>
              {tx("Wasserwartung")}
              <ArrowRight size={15}  aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
      {humidityAlert && (
        <div className="technical-hint">
          <TriangleAlert size={19}  aria-hidden="true" />
          <div>
            <strong>
              {tx("Luftfeuchtigkeit außerhalb des Demo-Bereichs")}
            </strong>
            <p>
              {tx(
                humidity.direction === "low"
                  ? "Die simulierte Luftfeuchtigkeit ist zu niedrig."
                  : "Die simulierte Luftfeuchtigkeit ist zu hoch.",
              )}
            </p>
            <Link to="/growbox#climate-settings" className="text-link" aria-label={tx("Feuchtigkeit einstellen")} title={tx("Feuchtigkeit einstellen")}>
              {tx("Feuchtigkeit einstellen")}
              <ArrowRight size={15}  aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
      {airAlert && (
        <div className="technical-hint">
          <TriangleAlert size={19}  aria-hidden="true" />
          <div>
            <strong>{tx("Luftaustausch prüfen")}</strong>
            <p>
              {tx(
                "CO₂ liegt außerhalb des eingestellten Demo-Bereichs. Prüfe die Frischluftzufuhr.",
              )}
            </p>
            <Link to="/growbox#air-settings" className="text-link" aria-label={tx("Frischluft einstellen")} title={tx("Frischluft einstellen")}>
              {tx("Frischluft einstellen")}
              <ArrowRight size={15}  aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
      {!humidityAlert && !airAlert && (
        <p>
          <Check size={16}  aria-hidden="true" />{" "}
          {tx(
            "Aktuell keine Feuchtigkeits- oder CO₂-Abweichung nach den verfügbaren Demo-Regeln.",
          )}
        </p>
      )}
      {(humidity.level === "unknown" || co2.level === "unknown") && (
        <p className="verification-note">
          {tx("Fehlende Vergleichsdaten erlauben keine Bewertung.")}
        </p>
      )}
      {devices.automatic && (
        <div className="auto-action">
          <strong>{tx(canControl ? "Aktuelle automatische Regelaktion" : "Offline: zuletzt bekannter Gerätestatus")}</strong>
          <p>
            {tx("Frischluft")}: {tx(FAN_LABELS[devices.freshAir])} ·{" "}
            {tx("Wasserförderung")}:{" "}
            {tx(
              devices.pumpBlocked ? "Gesperrt" : devices.pumpOn ? "An" : "Aus",
            )}
          </p>
          <small>
            {tx(
              "Bei CO₂ über 1.500 ppm erhöht das Demo-Profil die Frischluft auf Hoch. Unterhalb des Feuchtigkeits-Sollwerts fordert es Wasser an, sofern ein verfügbarer Füllstand über 0 % vorliegt.",
            )}
          </small>
        </div>
      )}
      <InfoNote>
        {tx(
          "Temperatur, Luftfeuchtigkeit, CO₂ und Kamera-Beispielbilder können weder Schimmel nachweisen noch ausschließen. Es findet keine automatische Bilddiagnose statt.",
        )}
      </InfoNote>
      {state.observation && (
        <div className="technical-hint observation-warning">
          <TriangleAlert size={19}  aria-hidden="true" />
          <div>
            <strong>{tx("Manuelle Beobachtung dokumentiert")}</strong>
            <p>
              {tx(
                "Prüfe die Kultur und hole bei unklaren Veränderungen fachlichen Rat ein.",
              )}
            </p>
            <button
              className="text-button"
              disabled={state.observation.acknowledgedAt !== null}
              onClick={() => {
                dispatch({ type: "ACK_OBSERVATION" });
                notify(
                  "Beobachtung quittiert. Bestehende Ursachen bleiben sichtbar.",
                );
              }}
            >
              {tx(
                state.observation.acknowledgedAt !== null
                  ? "Quittiert · im Ereignisverlauf erhalten"
                  : "Hinweis quittieren",
              )}
            </button>
          </div>
        </div>
      )}
      <button
        className="button button-outline"
        disabled={!canControl} onClick={(e) => {
          e.currentTarget.focus();
          setReport(true);
        }}
       aria-label={tx("Verdächtige Veränderung melden")} title={tx("Verdächtige Veränderung melden")}>
        <TriangleAlert size={16}  aria-hidden="true" />
        {tx("Verdächtige Veränderung melden")}
      </button>
      {report && (
        <Modal
          title={tx("Verdächtige Veränderung melden")}
          onClose={() => setReport(false)}
          footer={
            <>
              <button
                className="button button-outline"
                onClick={() => setReport(false)}
              >
                {tx("Abbrechen")}
              </button>
              <button
                className="button button-primary"
                onClick={() => {
                  dispatch({ type: "REPORT_OBSERVATION" });
                  setReport(false);
                  notify(
                    "Manuelle Beobachtung im Ereignisverlauf dokumentiert.",
                  );
                }}
              >
                {tx("Beobachtung dokumentieren")}
              </button>
            </>
          }
        >
          <p>
            {tx(
              "Prüfe die Kultur und hole bei unklaren Veränderungen fachlichen Rat ein.",
            )}
          </p>
          <p>
            {tx(
              "Die Meldung dokumentiert deine Beobachtung. Sie ist keine Diagnose und verändert keine Messwerte.",
            )}
          </p>
        </Modal>
      )}
    </section>
  );
}
export function UvDetails() {
  const tx = useT();
  const { state } = useGrowbox();
  const uv = deviceState(state).uv;
  return (
    <details className="panel technical-details" data-uv-status={uv.status}>
      <summary>{tx("Technikdetails · UV-Modul")}</summary>
      <div className="technical-details-body">
        <h3>{tx("UV-Modul")}</h3>
        <span className="muted-tag">{tx("Nicht angebunden")}</span>
        <p>
          {tx(
            "UV ist von der normalen Beleuchtung mit sichtbarem Licht getrennt. In diesem Prototyp gibt es kein angeschlossenes UV-Gerät und keinen UV-Sensor; deshalb werden weder Intensität noch Wirkung angezeigt.",
          )}
        </p>
        <p>
          {tx(
            "Eine spätere reale UV-Funktion benötigt ein gesondertes Schutzkonzept.",
          )}
        </p>
      </div>
    </details>
  );
}
