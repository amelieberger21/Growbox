import { useExperience } from "../experience/ExperienceProvider";
import { PhotoCredits } from "../experience/PhotoCredits";
import { useT } from "../i18n";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Clock3,
  Code2,
  Database,
  ExternalLink,
  FlaskConical,
  Leaf,
  Monitor,
  RotateCcw,
} from "lucide-react";
import { SOURCES } from "../data/catalog";
import { useGrowbox } from "../state/GrowboxProvider";
import { InfoNote, Logo, Modal, PageHeader } from "../components/ui";
export function ProjectPage() {
  const tx = useT();
  const [reset, setReset] = useState(false);
  const { dispatch, notify } = useGrowbox();
  const { resetDemo } = useExperience();
  return (
    <div className="page project-page">
      <PageHeader
        eyebrow={tx("NATUR VERSTEHEN. TECHNIK ERLEBEN.")}
        title={tx("Die Idee hinter MycoBox")}
        description={tx(
          "Ein Hochschulprojekt, das die faszinierende Welt der Pilze erlebbar macht.",
        )}
      />
      <section className="panel project-scope" id="demo-erklaerung">
        <h2>{tx("Was du mit MycoBox ausprobieren kannst")}</h2>
        <p>
          {tx(
            "MycoBox ist ein interaktiver Lern- und Bedienprototyp für eine einzelne Pilz-Growbox. Du kannst eine Pilzkultur auswählen, Wachstumsphasen nachvollziehen, simulierte Klimawerte beobachten und Geräteeinstellungen ausprobieren. Rezeptideen ergänzen die Informationen zur jeweiligen Pilzart. In diesem Projektstand sind keine echten Sensoren, Geräte oder Kameras angeschlossen.",
          )}
        </p>
        <dl>
          {[
            {
              name: "Dashboard",
              text: "Aktueller Zustand und wichtigste Hinweise.",
              to: "/",
            },
            {
              name: "Meine Growbox",
              text: "Klima, Geräte und Wasserwartung.",
              to: "/growbox",
            },
            {
              name: "Pilzdetails",
              text: "Informationen zur Pilzart und Rezeptideen.",
              to: "/pilze",
            },
            {
              name: "Wachstumsverlauf",
              text: "Entwicklungsphasen und Kamera-Beispielbilder.",
              to: "/wachstum",
            },
            {
              name: "Klimaverlauf",
              text: "Historische simulierte Messwerte.",
              to: "/wachstum/klima",
            },
          ].map((item) => (
            <div key={item.name}>
              <dt>
                <Link className="text-link" to={item.to}>
                  {tx(item.name)}
                </Link>
              </dt>
              <dd>{tx(item.text)}</dd>
            </div>
          ))}
        </dl>
        <p className="verification-note">
          {tx(
            "Eine aktive Pilzkultur pro Growbox. Keine automatische Bestimmung von Pilzarten, Schimmel oder Essbarkeit. Demo-Szenarien sind Präsentationswerkzeuge.",
          )}
        </p>
      </section>
      <section className="project-hero">
        <Logo />
        <h2>
          {tx("Ein bisschen Neugier.")}
          <br />
          {tx("Eine ganze Welt darunter.")}
        </h2>
        <p>
          {tx(
            "MycoBox verbindet eine Pilzbibliothek mit einer virtuellen Growbox. Du lernst Pilze kennen, probierst Einstellungen aus und begleitest eine Kultur durch f\u00FCnf verst\u00E4ndliche Wachstumsphasen.",
          )}
        </p>
        <span>
          <FlaskConical size={16}  aria-hidden="true" />
          {tx("Klickbarer Hochschulprototyp · Version 2.1")}
        </span>
      </section>
      <div className="project-grid">
        {tx(
          [
            {
              icon: Monitor,
              title: "Eine virtuelle Growbox",
              text: "Sensoren, Beleuchtung und Belüftung sind vollständig simuliert. Es besteht keine Verbindung zu echter Hardware. Es ist genau eine Kultur gleichzeitig aktiv.",
            },
            {
              icon: Clock3,
              title: "Zeit zum Ausprobieren",
              text: "5 reale Sekunden entsprechen einer Demo-Stunde. Die Simulation läuft nur bei geöffneter Anwendung und Status „Läuft“. Nach einer Abwesenheit wird keine Zeit nachberechnet.",
            },
            {
              icon: Leaf,
              title: "Ein Modell zum Lernen",
              text: "Kulturdauern und Warnschwellen bleiben synthetisch. Vorläufige Kulturbedingungen und einzelne geprüfte Studienprotokolle sind nach Phase getrennt. Fehlende Phasendaten bleiben unbekannt. Die festen Phasen sind keine biologische Prognose.",
            },
            {
              icon: Database,
              title: "Deine Demo bleibt bei dir",
              text: "Dein Zustand wird versioniert unter „mycobox.demo.v1“ im lokalen Browserspeicher gesichert. Ohne verfügbaren Speicher funktioniert die Demo im Arbeitsspeicher weiter. Entwürfe werden nicht gespeichert.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <section className="panel" key={title}>
              <span className="icon-tile">
                <Icon size={21} />
              </span>
              <h2>{tx(title)}</h2>
              <p>{tx(text)}</p>
            </section>
          )),
        )}
      </div>
      <InfoNote warning>
        {tx(
          "Die reale Growbox-Eignung und artspezifischen Pflegeangaben sind noch nicht gepr\u00FCft. Die Demo ist kein Bestimmungswerkzeug und liefert keine verl\u00E4sslichen Ernteprognosen. Verwende ihre Zahlen nicht als Anbauanleitung.",
        )}
      </InfoNote>
      <section className="panel project-model">
        <h2>{tx("Wie die Simulation funktioniert")}</h2>
        <p>
          {tx(
            "Ein gesetzter Zufallsstartwert erzeugt reproduzierbare, begrenzte Schwankungen. In der Automatik bewegen sich Temperatur und Feuchtigkeit schrittweise auf die Sollwerte zu. Die manuelle Regelung reagiert langsamer; ausgeschaltete Bel\u00FCftung erh\u00F6ht im Modell CO\u2082.",
          )}
        </p>
        <dl>
          <div>
            <dt>{tx("Temperatur-Warnschwelle")}</dt>
            <dd>{tx("Einstellbar in den Einstellungen")}</dd>
          </div>
          <div>
            <dt>{tx("Feuchtigkeits-Warnschwelle")}</dt>
            <dd>{tx("Einstellbar in den Einstellungen")}</dd>
          </div>
          <div>
            <dt>{tx("CO\u2082-Hinweisgrenze")}</dt>
            <dd>{tx("Konfigurierbarer Demo-Wert")}</dd>
          </div>
          <div>
            <dt>{tx("Gespeicherter Verlauf")}</dt>
            <dd>
              {tx("Bis zu 168 st\u00FCndliche Messwerte & 200 Ereignisse")}
            </dd>
          </div>
        </dl>
        <p>
          {tx(
            "Das Diagramm speichert den zu jedem Messpunkt g\u00FCltigen Sollwert. Neue Einstellungen ver\u00E4ndern die Vergangenheit nicht. Abweichungen und ihre Behebung werden einmal pro zusammenh\u00E4ngender Abweichung protokolliert.",
          )}
        </p>
      </section>
      <section className="panel">
        <div className="section-title">
          <h2>{tx("Quellen & fachlicher Pr\u00FCfstand")}</h2>
          <span className="muted-tag">{tx("Gepr\u00FCft am 29.10.2026")}</span>
        </div>
        <p>
          {tx(
            "Quellen belegen ausschlie\u00DFlich die jeweils genannten Aussagen. Sie sind kein Beleg f\u00FCr die synthetischen Demo-Profile.",
          )}
        </p>
        <div className="project-sources">
          {tx(
            SOURCES.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <div>
                  <strong>
                    {tx(source.name)}
                    <ExternalLink size={14}  aria-hidden="true" />
                  </strong>
                  <p>{tx(source.topic)}</p>
                </div>
                <span
                  className={`source-status ${source.checked ? "" : "pending"}`}
                >
                  {tx(source.checked ? "Quelle geprüft" : "Noch zu prüfen")}
                </span>
              </a>
            )),
          )}
        </div>
        <p className="verification-note">
          {tx(
            "Beschreibungen, Artzuordnungen und Pflegeeinordnungen stammen aus dem Projektkonzept und m\u00FCssen vor realem Einsatz artspezifisch gepr\u00FCft werden. Die Beziehung Nameko/Goldk\u00E4ppchen und der Warnhinweis zum Stockschw\u00E4mmchen wurden mit den verlinkten Quellen abgeglichen.",
          )}
        </p>
      </section>
      <PhotoCredits />
      <section className="panel assets-panel legacy-assets-note">
        <Code2 size={25}  aria-hidden="true" />
        <div>
          <h2>{tx("Eigene Formen. Lokale Assets.")}</h2>
          <p>
            {tx(
              "Alle Pilzillustrationen und das MycoBox-Wortzeichen wurden als eigene SVG-Grafiken f\u00FCr diesen Prototyp erstellt. Sie sind stilisiert und keine Artbestimmungsbilder. Schriften: DM Sans und Manrope (SIL Open Font License). Icons: Lucide (ISC). Alle Assets sind lokal verf\u00FCgbar.",
            )}
          </p>
        </div>
      </section>
      <section className="reset-panel">
        <div>
          <h2>{tx("Noch einmal von vorn?")}</h2>
          <p>
            {tx(
              "Stelle die Ausgangsdemo mit Austernseitling, Tag 20 und der Beispielhistorie wieder her.",
            )}
          </p>
        </div>
        <button
          className="button button-outline"
          onClick={(event) => {
            event.currentTarget.focus();
            setReset(true);
          }}
         aria-label={tx("Demo vollst\u00E4ndig zur\u00FCcksetzen")} title={tx("Demo vollst\u00E4ndig zur\u00FCcksetzen")}>
          <RotateCcw size={16}  aria-hidden="true" />
          {tx("Demo vollst\u00E4ndig zur\u00FCcksetzen")}
        </button>
      </section>
      {tx(
        reset && (
          <Modal
            title={tx("Demo vollst\u00E4ndig zur\u00FCcksetzen?")}
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
                 aria-label={tx("Demo zur\u00FCcksetzen")} title={tx("Demo zur\u00FCcksetzen")}>
                  {tx("Demo zur\u00FCcksetzen")}
                  <RotateCcw size={15}  aria-hidden="true" />
                </button>
              </>
            }
          >
            <p>
              {tx(
                "Deine aktuelle Kultur, Messwerte und Ereignisse werden durch die initiale Austernseitling-Demo ersetzt. Diese startet bei Tag 20 von 28 mit etwa 68 % Fortschritt.",
              )}
            </p>
          </Modal>
        ),
      )}
    </div>
  );
}
