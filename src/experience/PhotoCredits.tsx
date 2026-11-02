import { ExternalLink } from "lucide-react";
import { mushroomPhotos } from "../data/mushroomPhotos";
import { entries } from "../data/catalog";
import { useT } from "../i18n";
export function PhotoCredits() {
  const tx = useT();
  return (
    <section className="panel photo-credits">
      <h2>{tx("Echte Pilze. Lokale Fotos.")}</h2>
      <p>
        {tx(
          "Alle 15 Einträge besitzen eigene lokale Bilddateien mit geprüften Quellen- und Lizenzangaben. Die Fotos haben ihre ursprünglichen Hintergründe; es werden keine künstlichen Freisteller vorgetäuscht.",
        )}
      </p>
      <p>
        {tx(
          "Enoki zeigt ausdrücklich die natürliche braune Form von Flammulina filiformis. Nameko und Goldkäppchen teilen dasselbe korrekt zugeordnete Motiv über getrennte Dateipfade. Fotografien sind keine Bestimmungshilfe.",
        )}
      </p>
      <details>
        <summary>{tx("Bildnachweise für alle 15 Einträge")}</summary>
        <div className="photo-license-list">
          {entries.map((entry) => {
            const photo = mushroomPhotos[entry.slug];
            return (
              <div key={entry.slug}>
                <strong>{tx(entry.name)}</strong>
                <span>{photo.author}</span>
                <a href={photo.sourceUrl} target="_blank" rel="noreferrer">
                  {tx("Originalquelle")}
                  <ExternalLink size={12} />
                </a>
                <a href={photo.licenseUrl} target="_blank" rel="noreferrer">
                  {photo.license}
                  <ExternalLink size={12} />
                </a>
              </div>
            );
          })}
        </div>
      </details>
      <p className="verification-note">
        {tx(
          "Champ und das Wortzeichen sind eigene SVG-Grafiken. Schriftarten werden lokal gebündelt; Lizenznachweise stehen in ASSETS.md.",
        )}
      </p>
    </section>
  );
}
