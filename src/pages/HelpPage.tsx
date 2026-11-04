import { Link } from "react-router-dom";
import { ArrowRight, LifeBuoy, Volume2 } from "lucide-react";
import { PageHeader } from "../components/ui";
import { ChampArt, requestChampTour } from "../experience/Champ";
import { useT } from "../i18n";
export function HelpPage() {
  const tx = useT();
  return (
    <div className="page help-page">
      <PageHeader
        eyebrow={tx("DU MUSST NICHT ALLES SCHON WISSEN.")}
        title={tx("Hilfe & Champ")}
        description={tx(
          "Einfach ausprobieren. Und bei Fragen einen kleinen Begleiter fragen.",
        )}
      />
      <section className="panel help-champ">
        <ChampArt />
        <div>
          <h2>{tx("Hallo, ich bin Champ!")}</h2>
          <p>
            {tx(
              "Ich zeige dir in neun Schritten, wie MycoBox funktioniert. Du kannst jederzeit zurückgehen oder aufhören. Deine Kultur wird dabei nicht verändert.",
            )}
          </p>
          <button className="button button-primary" onClick={requestChampTour} aria-label={tx("Tutorial mit Champ starten")} title={tx("Tutorial mit Champ starten")}>
            {tx("Tutorial mit Champ starten")}
            <ArrowRight size={16}  aria-hidden="true" />
          </button>
        </div>
      </section>
      <div className="project-grid">
        <section className="panel">
          <LifeBuoy size={24}  aria-hidden="true" />
          <h2>{tx("Was bedeuten die Farben?")}</h2>
          <p>
            {tx(
              "Grün: im vorgesehenen Bereich. Gelb: leichte Abweichung. Rot: starke Abweichung. Grau: Datenprüfung erforderlich. Die Farben sagen nichts über die Genießbarkeit aus.",
            )}
          </p>
        </section>
        <section className="panel">
          <Volume2 size={24}  aria-hidden="true" />
          <h2>{tx("In deinem Tempo lesen")}</h2>
          <p>
            {tx(
              "Aktiviere Vorlesen, einfache Sprache oder größere Texte in den Einstellungen. Stimmen und Wortmarkierungen hängen vom Browser ab.",
            )}
          </p>
          <Link className="text-link" to="/einstellungen" aria-label={tx("Zu den Einstellungen")} title={tx("Zu den Einstellungen")}>
            {tx("Zu den Einstellungen")}
            <ArrowRight size={15}  aria-hidden="true" />
          </Link>
        </section>
      </div>
      <section className="panel help-faq">
        <h2>{tx("Häufige Fragen")}</h2>
        {[
          [
            "Sind die Messwerte echt?",
            "Nein. Alle Geräteaktionen, Messwerte und Wachstumszeiten sind simuliert. Es ist keine Hardware verbunden.",
          ],
          [
            "Warum ist eine Anzeige grau?",
            "Für diese Art oder Wachstumsphase fehlen bestätigte Bereiche. Im Demo-Modus werden nur vorhandene, klar gekennzeichnete Beispielbereiche verglichen.",
          ],
          [
            "Ist ein roter Status gefährlich?",
            "Rot bedeutet eine starke Abweichung im Modell. Es ist keine Aussage über Lebensmittelsicherheit, Giftigkeit oder die Genießbarkeit von Pilzen.",
          ],
          [
            "Was ist der Unterschied zwischen Nachfüllen und Wechseln?",
            "Nachfüllen erhöht den Tankfüllstand. Ein Wasserwechsel setzt zusätzlich die Wechsel-Erinnerung zurück.",
          ],
          [
            "Wo sind meine Daten?",
            "Die Demo speichert ihren Zustand nur im lokalen Speicher dieses Browsers. Ohne Speicher bleibt sie im Arbeitsspeicher nutzbar.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>{tx(q)}</summary>
            <p>{tx(a)}</p>
          </details>
        ))}
      </section>
    </div>
  );
}
